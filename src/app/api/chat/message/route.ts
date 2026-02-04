import { createUIMessageStreamResponse, createUIMessageStream, type UIMessage } from 'ai';
import { toUIMessageStream, toBaseMessages } from '@ai-sdk/langchain';
import { getSupabaseClient } from '@/server/services/supabase-server';
import { settingsService } from '@/server/services/settings-service';
import { chatService } from '@/server/services/chat-service';
import { createLLM } from '@/server/agents/factory';
import { createChatTools } from '@/server/agents/tools';
import { generateConversationTitle } from '@/server/agents/title-generator';
import { ChatRole } from '@/server/types/chat-server';
import { createAgent } from 'langchain';

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

    // 1. Initialize LLM and Tools (before creating conversation)
    const settings = await settingsService.getSettings(supabase, user.id);
    const llm = await createLLM(settings);
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

    // 5. Setup Agent
    const systemPrompt = `You are NEO-LOG AI, an intelligent personal life tracking assistant with a cyberpunk aesthetic.
Your goal is to help the user record behaviors, query trends, and provide insights.
Always respond in a helpful, concise, and futuristic manner.
Use tools when needed to interact with the database.
If you need more information to record a behavior, ask the user.
Current user ID: ${user.id}
`;

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
          await chatService.saveMessage(supabase, user.id, {
            conversationId,
            role: ChatRole.Assistant,
            content: aiText,
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
