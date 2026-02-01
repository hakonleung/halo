import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { UserSettings } from '@/types/settings-server';
import { AIProvider } from '@/types/settings-server';
import { convertAISettings } from '../internal-api/settings';

/**
 * Factory for creating LLM instances based on user settings
 */
export async function createLLM(settings: UserSettings) {
  const ai = convertAISettings(settings.ai_settings);

  // Use platform default if configured
  if (ai.useDefaultKey) {
    // For now, we use server-side environment variables if user doesn't provide their own
    // In a real production app, you might have a dedicated service for this
    return new ChatOpenAI({
      modelName: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: ai.temperature ?? 0.7,
      streaming: ai.streamEnabled ?? true,
    });
  }

  // Use user's custom key
  const provider = ai.selectedProvider;
  const model = ai.selectedModel;
  const keyObj = ai.customKeys.find((k) => k.provider === provider);

  if (!keyObj || !keyObj.hasKey) {
    throw new Error(`API Key for ${provider} not found`);
  }

  // Note: We need to retrieve the actual key from a secure storage
  // For this exercise, we'll assume it's available or use a placeholder
  let actualKey: string | undefined;
  if (provider === AIProvider.OpenAI) {
    actualKey = process.env.OPENAI_API_KEY;
  } else if (provider === AIProvider.Anthropic) {
    actualKey = process.env.ANTHROPIC_API_KEY;
  } else if (provider === AIProvider.Google) {
    actualKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  switch (provider) {
    case AIProvider.OpenAI:
      return new ChatOpenAI({
        modelName: model,
        apiKey: actualKey,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
      });
    case AIProvider.Anthropic:
      return new ChatAnthropic({
        modelName: model,
        anthropicApiKey: actualKey,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
      });
    case AIProvider.Google:
      return new ChatGoogleGenerativeAI({
        model: model,
        apiKey: actualKey,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
      });
    default:
      return new ChatOpenAI({
        modelName: 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
      });
  }
}
