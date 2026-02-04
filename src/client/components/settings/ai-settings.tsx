'use client';

import {
  Box,
  VStack,
  Input,
  Text,
  Button,
  HStack,
  Select,
  createListCollection,
  Portal,
  Field,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { useSettings } from '@/client/hooks/use-settings';
import { useUpdateSettings } from '@/client/hooks/use-update-settings';
import { AIProvider } from '@/server/types/settings-server';

import type { AISettings } from '@/client/types/settings-client';

const providerOptions = createListCollection({
  items: [
    { label: 'OpenAI', value: AIProvider.OpenAI },
    { label: 'Anthropic', value: AIProvider.Anthropic },
    { label: 'Google', value: AIProvider.Google },
    { label: 'Custom', value: AIProvider.Custom },
  ],
});

const modelOptions = {
  [AIProvider.OpenAI]: createListCollection({
    items: [
      { label: 'GPT-4o', value: 'gpt-4o' },
      { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    ],
  }),
  [AIProvider.Anthropic]: createListCollection({
    items: [
      { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
      { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
      { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
    ],
  }),
  [AIProvider.Google]: createListCollection({
    items: [
      { label: 'Gemini Pro', value: 'gemini-pro' },
      { label: 'Gemini Ultra', value: 'gemini-ultra' },
    ],
  }),
};

export function AISettingsComponent() {
  const { settings } = useSettings();
  const { updateSettings, isLoading: isUpdating, error: updateError } = useUpdateSettings();

  const [aiSettings, setAiSettings] = useState<AISettings>({
    useDefaultKey: true,
    selectedProvider: AIProvider.OpenAI,
    selectedModel: 'gpt-4o',
    temperature: 0.7,
    streamEnabled: true,
    apiKey: null,
    baseUrl: null,
  });

  // Sync form values when settings load
  useEffect(() => {
    if (settings?.aiSettings) {
      setAiSettings(settings.aiSettings);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      aiSettings: aiSettings,
    });
  };

  const currentModelOptions =
    aiSettings.selectedProvider !== AIProvider.Custom
      ? modelOptions[aiSettings.selectedProvider]
      : undefined;

  // Check if form is valid and should be disabled
  const isFormDisabled = () => {
    // Model is always required
    if (!aiSettings.selectedModel || aiSettings.selectedModel.trim() === '') {
      return true;
    }

    // If using default key, no need to check apiKey/baseUrl
    if (aiSettings.useDefaultKey) {
      return false;
    }

    // For custom provider, baseUrl and apiKey are required
    if (!currentModelOptions) {
      if (!aiSettings.baseUrl || aiSettings.baseUrl.trim() === '') {
        return true;
      }
      if (!aiSettings.apiKey || aiSettings.apiKey.trim() === '') {
        return true;
      }
    }

    // For non-custom provider, apiKey is optional when not using default key
    // So we don't need to check it

    return false;
  };

  const isDisabled = isFormDisabled();

  return (
    <VStack gap={6} align="stretch" p={6}>
      <HStack justify="space-between">
        <Text color="text.mist" fontFamily="mono" fontSize="sm">
          Use Default API Key
        </Text>
        <Button
          variant={aiSettings.useDefaultKey ? 'toggle-active' : 'toggle'}
          onClick={() => setAiSettings((prev) => ({ ...prev, useDefaultKey: !prev.useDefaultKey }))}
          minW="60px"
        >
          {aiSettings.useDefaultKey ? 'ON' : 'OFF'}
        </Button>
      </HStack>

      <Field.Root>
        <Field.Label>AI Provider</Field.Label>
        <Select.Root
          collection={providerOptions}
          value={[aiSettings.selectedProvider]}
          onValueChange={(e) => {
            const provider = Object.values(AIProvider).find((p) => p === e.value[0]);
            if (provider) {
              const defaultModel =
                provider === AIProvider.Custom
                  ? ''
                  : modelOptions[provider]?.items[0]?.value || 'gpt-4o';
              setAiSettings((prev) => ({
                ...prev,
                selectedProvider: provider,
                selectedModel: defaultModel,
                // Clear apiKey and baseUrl when switching provider (except when switching to custom)
                apiKey: provider === AIProvider.Custom ? prev.apiKey : null,
                baseUrl: provider === AIProvider.Custom ? prev.baseUrl : null,
              }));
            }
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {providerOptions.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </Field.Root>

      <Field.Root required={!currentModelOptions}>
        <Field.Label>
          Model <Field.RequiredIndicator />
        </Field.Label>
        {!currentModelOptions ? (
          <Input
            type="text"
            placeholder="Enter model name"
            value={aiSettings.selectedModel}
            onChange={(e) => setAiSettings((prev) => ({ ...prev, selectedModel: e.target.value }))}
            required
          />
        ) : (
          <Select.Root
            key={aiSettings.selectedProvider}
            collection={currentModelOptions}
            value={aiSettings.selectedModel ? [aiSettings.selectedModel] : []}
            onValueChange={(e) => {
              const model = e.value[0];
              if (typeof model === 'string') {
                setAiSettings((prev) => ({ ...prev, selectedModel: model }));
              }
            }}
          >
            <Select.Trigger flex="1">
              <Select.ValueText />
            </Select.Trigger>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {currentModelOptions.items.map((item: { label: string; value: string }) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )}
      </Field.Root>

      {!currentModelOptions && (
        <Field.Root required>
          <Field.Label>
            Base URL
            <Field.RequiredIndicator></Field.RequiredIndicator>
          </Field.Label>
          <Input
            type="url"
            placeholder="https://api.example.com/v1"
            value={aiSettings.baseUrl || ''}
            onChange={(e) =>
              setAiSettings((prev) => ({ ...prev, baseUrl: e.target.value || null }))
            }
            required
          />
          <Text mt={1} fontSize="xs" color="text.mist" fontFamily="mono">
            Enter the base URL for your custom AI provider
          </Text>
        </Field.Root>
      )}

      <Field.Root required={!currentModelOptions}>
        <Field.Label>
          API Key
          <Field.RequiredIndicator></Field.RequiredIndicator>
        </Field.Label>
        <Input
          type="password"
          placeholder="Enter API key"
          value={aiSettings.apiKey || ''}
          onChange={(e) => setAiSettings((prev) => ({ ...prev, apiKey: e.target.value || null }))}
          required
        />
        <Text mt={1} fontSize="xs" color="text.mist" fontFamily="mono">
          Enter the API key for your custom provider
        </Text>
      </Field.Root>

      <Field.Root>
        <Field.Label>Temperature</Field.Label>
        <Input
          type="number"
          min="0"
          max="2"
          step="0.1"
          value={aiSettings.temperature}
          onChange={(e) =>
            setAiSettings((prev) => ({
              ...prev,
              temperature: parseFloat(e.target.value) || 0.7,
            }))
          }
        />
        <Text mt={1} fontSize="xs" color="text.mist" fontFamily="mono">
          Controls randomness (0.0 = deterministic, 2.0 = very creative)
        </Text>
      </Field.Root>

      <HStack justify="space-between">
        <Text color="text.mist" fontFamily="mono" fontSize="sm">
          Stream Responses
        </Text>
        <Button
          variant={aiSettings.streamEnabled ? 'toggle-active' : 'toggle'}
          onClick={() => setAiSettings((prev) => ({ ...prev, streamEnabled: !prev.streamEnabled }))}
          minW="60px"
        >
          {aiSettings.streamEnabled ? 'ON' : 'OFF'}
        </Button>
      </HStack>

      {updateError && (
        <Box
          p={3}
          bg="rgba(255, 51, 102, 0.1)"
          border="1px solid"
          borderColor="red.500"
          borderRadius="4px"
          color="red.500"
          fontSize="sm"
          fontFamily="mono"
        >
          {updateError}
        </Box>
      )}

      <HStack justify="flex-end" gap={4}>
        <Button
          onClick={handleSave}
          loading={isUpdating}
          disabled={isUpdating || isDisabled}
          variant="primary"
        >
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
