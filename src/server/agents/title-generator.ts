import type { GenerateTitleParams } from '@/server/types/chat-server';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

/**
 * Generate a conversation title based on the first user message
 */
export async function generateConversationTitle(
  llm: BaseChatModel,
  messageContent: string,
  options?: Omit<GenerateTitleParams, 'messageContent'>,
): Promise<string> {
  const { maxLength = 30, language = 'zh-CN' } = options ?? {};
  // 1. Validate input
  if (!messageContent) {
    return 'New Conversation';
  }
  // 2. Build prompt
  const prompt =
    language === 'zh-CN'
      ? `根据以下用户消息，生成一个简洁的对话标题（10-${maxLength} 字符）。只返回标题，不要解释。\n\n用户消息：${messageContent.slice(0, 200)}`
      : `Generate a concise conversation title (10-${maxLength} characters) based on the user message below. Return only the title.\n\nUser message: ${messageContent.slice(0, 200)}`;

  try {
    // 3. Call LLM (use the passed llm instance with user's settings)
    const response = await llm.invoke(prompt);
    let title = response.content.toString().trim();

    // 4. Clean and validate
    title = title.replace(/^["']|["']$/g, ''); // Remove quotes
    if (title.length > maxLength) {
      title = title.slice(0, maxLength) + '...';
    }
    return title || 'New Conversation';
  } catch (error) {
    console.error('Failed to generate title:', error);
    return 'New Conversation';
  }
}
