import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

import { AIProvider } from '@/server/types/settings-server';

import { convertAISettings } from '../../client/internal-api/settings';

import type { UserSettings } from '@/server/types/settings-server';

/**
 * Factory for creating LLM instances based on user settings
 */
export async function createLLM(settings: UserSettings) {
  const ai = convertAISettings(settings.ai_settings);

  // Use platform default if configured
  if (ai.useDefaultKey) {
    return new ChatOpenAI({
      modelName: 'gpt-4o',
      apiKey: process.env.OPENAI_API_KEY,
      temperature: ai.temperature ?? 0.7,
      streaming: ai.streamEnabled ?? true,
    });
  }

  // Check if settings are complete
  if (!ai.selectedProvider || !ai.selectedModel) {
    throw new Error('AI settings are incomplete: provider and model are required');
  }

  // For custom provider, check required fields
  if (ai.selectedProvider === AIProvider.Custom) {
    if (!ai.baseUrl || !ai.apiKey) {
      throw new Error('Custom provider requires baseUrl and apiKey');
    }
  }

  // Build configuration with optional baseUrl
  const baseConfig = ai.baseUrl
    ? {
        configuration: {
          baseURL: ai.baseUrl,
        },
      }
    : {};

  // Get API key (use from settings if provided, otherwise from env)
  let apiKey: string | undefined;
  if (ai.apiKey) {
    apiKey = ai.apiKey;
  } else {
    // Fallback to environment variables
    switch (ai.selectedProvider) {
      case AIProvider.OpenAI:
        apiKey = process.env.OPENAI_API_KEY;
        break;
      case AIProvider.Anthropic:
        apiKey = process.env.ANTHROPIC_API_KEY;
        break;
      case AIProvider.Google:
        apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        break;
      default:
        apiKey = process.env.OPENAI_API_KEY;
    }
  }

  if (!apiKey) {
    throw new Error(`API Key for ${ai.selectedProvider} is required`);
  }

  // Create LLM instance based on provider
  // Custom provider uses OpenAI-compatible API
  const provider =
    ai.selectedProvider === AIProvider.Custom ? AIProvider.OpenAI : ai.selectedProvider;

  switch (provider) {
    case AIProvider.OpenAI:
      return new ChatOpenAI({
        modelName: ai.selectedModel,
        apiKey: apiKey,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
        ...baseConfig,
      });
    case AIProvider.Anthropic:
      return new ChatAnthropic({
        modelName: ai.selectedModel,
        anthropicApiKey: apiKey,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
        ...baseConfig,
      });
    case AIProvider.Google:
      return new ChatGoogleGenerativeAI({
        model: ai.selectedModel,
        apiKey: apiKey,
        temperature: ai.temperature ?? 0.7,
        streaming: ai.streamEnabled ?? true,
        ...baseConfig,
      });
    default:
      throw new Error(`Unsupported provider: ${ai.selectedProvider}`);
  }
}
