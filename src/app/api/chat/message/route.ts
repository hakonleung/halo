import { toUIMessageStream, toBaseMessages } from '@ai-sdk/langchain';
import { createUIMessageStreamResponse, createUIMessageStream, type UIMessage } from 'ai';
import { createAgent } from 'langchain';

import { createLLM } from '@/server/agents/factory';
import { runProfileAgent } from '@/server/agents/profile-agent';
import { buildSystemPrompt } from '@/server/agents/system-prompt';
import { createChatTools } from '@/server/agents/tools';
import { chatService } from '@/server/services/chat-service';
import { profileService } from '@/server/services/profile-service';
import { settingsService } from '@/server/services/settings-service';
import { getSupabaseClient } from '@/server/services/supabase-server';
import { ChatRole } from '@/server/types/chat-server';

interface ChatRequestBody {
  messages: UIMessage[];
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
    const { messages: uiMessages } = body;

    // 2. Get or create the user's single conversation
    const conversation = await chatService.getOrCreateConversation(supabase, user.id);
    const conversationId = conversation.id;

    // Check if this is the first message (empty conversation)
    const existingMessages = await chatService.getMessages(supabase, user.id, conversationId);
    const isFirstMessage = existingMessages.length === 0;

    // Extract last user message text from parts
    const lastUserMsg = [...uiMessages].reverse().find((m) => m.role === 'user');
    const userText =
      lastUserMsg?.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '';

    // For first message, allow empty userText to trigger greeting
    if (!userText && !isFirstMessage) {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    // 1. Initialize LLM, Tools, and load user profile (in parallel)
    const settings = await settingsService.getSettings(supabase, user.id);
    const [llm, profile] = await Promise.all([
      createLLM(settings),
      profileService.getOrCreateProfile(supabase, user.id),
    ]);
    const tools = createChatTools(supabase, user.id);

    // 3. Save user message to DB (skip if first message with empty text)
    if (userText || !isFirstMessage) {
      await chatService.saveMessage(supabase, user.id, {
        conversationId,
        role: ChatRole.User,
        content: userText || '[首次打开聊天]',
      });
    }

    // 4. Load last 20 messages for context (to limit token usage)
    const history = await chatService.getMessages(supabase, user.id, conversationId, 20);

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
