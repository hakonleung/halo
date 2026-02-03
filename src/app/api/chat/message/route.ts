import { toUIMessageStream, toBaseMessages } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse, createUIMessageStream, type UIMessage } from 'ai';
import { createAgent } from 'langchain';

import { createLLM } from '@/server/agents/factory';
import { runProfileAgent } from '@/server/agents/profile-agent';
import { buildSystemPrompt } from '@/server/agents/system-prompt';
import { generateConversationTitle } from '@/server/agents/title-generator';
import { createChatTools } from '@/server/agents/tools';
import { chatService } from '@/server/services/chat-service';
import { profileService } from '@/server/services/profile-service';
import { settingsService } from '@/server/services/settings-service';
import { getSupabaseClient } from '@/server/services/supabase-server';
import { ChatRole } from '@/server/types/chat-server';

interface ChatRequestBody {
  messages: UIMessage[];
  conversationId?: string;
}

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    const body: ChatRequestBody = await request.json();
    const { messages: uiMessages, conversationId } = body;

    // Extract last user message text from parts
    const lastUserMsg = [...uiMessages].reverse().find((m) => m.role === 'user');
    const userText =
      lastUserMsg?.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '';

    if (!userText) {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    // 1. Initialize LLM, Tools, and load user profile (in parallel)
    const settings = await settingsService.getSettings(supabase, user.id);
    const [llm, profile] = await Promise.all([
      createLLM(settings),
      profileService.getOrCreateProfile(supabase, user.id),
    ]);
    const tools = createChatTools(supabase, user.id);

    // 2. Get or create conversation (frontend provides the ID)
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    // Check if conversation exists, if not create it
    const conversations = await chatService.getConversations(supabase, user.id);
    const conversationExists = conversations.some((c) => c.id === conversationId);

    if (!conversationExists) {
      // Generate title for new conversation using user's LLM settings
      const title = await generateConversationTitle(llm, userText);
      await chatService.createConversation(supabase, user.id, title, conversationId);
    }

    // 3. Save user message to DB
    await chatService.saveMessage(supabase, user.id, {
      conversationId,
      role: ChatRole.User,
      content: userText,
    });

    // 4. Load full history from DB (authoritative source)
    const history = await chatService.getMessages(supabase, user.id, conversationId);

    // 5. Setup Agent with profile-aware system prompt
    const systemPrompt = buildSystemPrompt(user.id, profile);

    const agent = createAgent({
      model: llm,
      tools,
      systemPrompt,
    });

    // 6. Convert DB history to LangChain messages
    const langchainMessages = await toBaseMessages(
      history.map((m) => ({
        id: m.id,
        role: m.role === ChatRole.Assistant ? ('assistant' as const) : ('user' as const),
        parts: [{ type: 'text' as const, text: m.content }],
      })),
    );

    // 7. Stream response using AI SDK
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const eventStream = agent.streamEvents({ messages: langchainMessages }, { version: 'v2' });
        writer.merge(toUIMessageStream(eventStream));
      },
      onFinish: async ({ responseMessage }) => {
        // Extract text from response message parts
        const aiText = responseMessage.parts
          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map((p) => p.text)
          .join('');

        if (aiText) {
          // Save assistant message to DB
          await chatService.saveMessage(supabase, user.id, {
            conversationId,
            role: ChatRole.Assistant,
            content: aiText,
          });

          // Run profile agent in background (non-blocking)
          // Updates user portrait, emotions, and behaviors based on the conversation
          runProfileAgent(llm, supabase, user.id, userText, aiText).catch((err) => {
            console.error('[ProfileAgent] Background error:', err);
          });
        }
      },
    });

    return createUIMessageStreamResponse({
      stream,
      headers: {
        'X-Conversation-Id': conversationId,
      },
    });
  } catch (error: unknown) {
    console.error('[Chat API Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
