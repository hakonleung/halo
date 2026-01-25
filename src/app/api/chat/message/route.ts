import { getSupabaseClient } from '@/lib/supabase-server';
import { settingsService } from '@/lib/settings-service';
import { chatService } from '@/lib/chat-service';
import { createLLM } from '@/lib/agents/factory';
import { createChatTools } from '@/lib/agents/tools';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';

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

    const { content, conversationId } = await request.json();
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    // 1. Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const conv = await chatService.createConversation(supabase, user.id);
      if (conv.error || !conv.data) throw new Error(conv.error || 'Failed to create conversation');
      currentConversationId = conv.data.id;
    }

    // 2. Save user message
    await chatService.saveMessage(supabase, user.id, {
      conversationId: currentConversationId,
      role: 'user',
      content,
    });

    // 3. Get chat history
    const historyRes = await chatService.getMessages(supabase, user.id, currentConversationId);
    const history = historyRes.data || [];

    // 4. Initialize LLM and Tools
    const settingsRes = await settingsService.getSettings(supabase, user.id);
    if (!settingsRes.settings) throw new Error('Settings not found');
    
    const llm = await createLLM(settingsRes.settings);
    const tools = createChatTools(supabase, user.id);

    // 5. Setup Agent
    const systemPrompt = `You are NEO-LOG AI, an intelligent personal life tracking assistant with a cyberpunk aesthetic.
Your goal is to help the user record behaviors, query trends, and provide insights.
Always respond in a helpful, concise, and futuristic manner.
Use tools when needed to interact with the database.
If you need more information to record a behavior, ask the user.
Current user ID: ${user.id}
`;

    const agent = createReactAgent({
      llm,
      tools,
      messageModifier: systemPrompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Convert history to LangChain messages
          const messages = history.map((m) => {
            if (m.role === 'user') return new HumanMessage(m.content);
            if (m.role === 'assistant') return new AIMessage(m.content);
            return new SystemMessage(m.content);
          });

          // Add the latest user message if not already in history (though we just saved it)
          // messages.push(new HumanMessage(content));

          let fullAiResponse = '';

          // Execute agent with streaming
          const agentStream = await agent.stream(
            { messages },
            { streamMode: 'messages' }
          );

          for await (const [message, metadata] of agentStream) {
            // Only stream back the assistant's tokens/messages
            if (message instanceof AIMessage && metadata.langgraph_node === 'agent') {
              const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
              
              // Only send if it's not empty (sometimes we get tool call messages)
              if (content && !message.tool_calls?.length) {
                fullAiResponse += content;
                controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ content })}\n\n`));
              }
            } else if (metadata.langgraph_node === 'tools') {
              // Optionally send tool execution status
              controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ status: 'Executing tool...' })}\n\n`));
            }
          }

          // 6. Save AI response
          if (fullAiResponse) {
            await chatService.saveMessage(supabase, user.id, {
              conversationId: currentConversationId,
              role: 'assistant',
              content: fullAiResponse,
            });
          }

          controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ conversationId: currentConversationId })}\n\n`));
          controller.close();
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred during streaming';
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}

