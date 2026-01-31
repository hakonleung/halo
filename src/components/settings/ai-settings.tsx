'use client';

import {
  Box,
  VStack,
  Heading,
  Input,
  Text,
  Button,
  HStack,
  FieldRoot,
  FieldLabel,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';
import { useUpdateSettings } from '@/hooks/use-update-settings';
import { useState, useEffect } from 'react';
import type { AISettings } from '@/types/settings-client';
import { AIProvider } from '@/types/settings-server';

const providerOptions = createListCollection({
  items: [
    { label: 'OpenAI', value: AIProvider.OpenAI },
    { label: 'Anthropic', value: AIProvider.Anthropic },
    { label: 'Google', value: AIProvider.Google },
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
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating, error: updateError } = useUpdateSettings();

  const [aiSettings, setAiSettings] = useState<AISettings>({
    useDefaultKey: true,
    selectedProvider: AIProvider.OpenAI,
    selectedModel: 'gpt-4o',
    temperature: 0.7,
    streamEnabled: true,
    customKeys: [],
  });

  // Sync form values when settings load
  useEffect(() => {
    if (settings?.aiSettings) {
      const parsed =
        typeof settings.aiSettings === 'string'
          ? JSON.parse(settings.aiSettings)
          : settings.aiSettings;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      setAiSettings(parsed as AISettings);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      aiSettings: aiSettings,
    });
  };

  const handleAddCustomKey = () => {
    setAiSettings((prev) => ({
      ...prev,
      customKeys: [...prev.customKeys, { provider: prev.selectedProvider, hasKey: false }],
    }));
  };

  const handleUpdateCustomKey = (index: number, provider: string, hasKey: boolean) => {
    setAiSettings((prev) => {
      const newKeys = [...prev.customKeys];
      newKeys[index] = { provider, hasKey };
      return { ...prev, customKeys: newKeys };
    });
  };

  const handleRemoveCustomKey = (index: number) => {
    setAiSettings((prev) => ({
      ...prev,
      customKeys: prev.customKeys.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Text color="text.mist" fontFamily="mono">
          [ LOADING... ]
        </Text>
      </Box>
    );
  }

  const currentModelOptions =
    modelOptions[aiSettings.selectedProvider] || modelOptions[AIProvider.OpenAI];

  return (
    <VStack gap={6} align="stretch" p={6}>
      <Heading size="md" color="text.neon" fontFamily="heading" mb={2}>
        AI Configuration
      </Heading>

      <FieldRoot>
        <FieldLabel>Use Default API Key</FieldLabel>
        <HStack justify="space-between">
          <Text color="text.mist" fontFamily="mono" fontSize="sm">
            Use Default API Key
          </Text>
          <Button
            size="sm"
            variant={aiSettings.useDefaultKey ? 'toggle-active' : 'toggle'}
            onClick={() =>
              setAiSettings((prev) => ({ ...prev, useDefaultKey: !prev.useDefaultKey }))
            }
            minW="60px"
          >
            {aiSettings.useDefaultKey ? 'ON' : 'OFF'}
          </Button>
        </HStack>
        <Text mt={1} fontSize="xs" color="text.mist" fontFamily="mono">
          When enabled, uses the default API key configured on the server
        </Text>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>AI Provider</FieldLabel>
        <Select.Root
          collection={providerOptions}
          value={[aiSettings.selectedProvider]}
          onValueChange={(e) => {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            const provider = e.value[0] as AIProvider;
            if (provider) {
              const defaultModel = modelOptions[provider]?.items[0]?.value || 'gpt-4o';
              setAiSettings((prev) => ({
                ...prev,
                selectedProvider: provider,
                selectedModel: defaultModel,
              }));
            }
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.Content>
            {providerOptions.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Model</FieldLabel>
        <Select.Root
          collection={currentModelOptions}
          value={[aiSettings.selectedModel]}
          onValueChange={(e) => {
            const model = e.value[0];
            if (typeof model === 'string') {
              setAiSettings((prev) => ({ ...prev, selectedModel: model }));
            }
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Select.Content>
            {currentModelOptions.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Temperature</FieldLabel>
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
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Stream Responses</FieldLabel>
        <HStack justify="space-between">
          <Text color="text.mist" fontFamily="mono" fontSize="sm">
            Stream Responses
          </Text>
          <Button
            size="sm"
            variant={aiSettings.streamEnabled ? 'toggle-active' : 'toggle'}
            onClick={() =>
              setAiSettings((prev) => ({ ...prev, streamEnabled: !prev.streamEnabled }))
            }
            minW="60px"
          >
            {aiSettings.streamEnabled ? 'ON' : 'OFF'}
          </Button>
        </HStack>
        <Text mt={1} fontSize="xs" color="text.mist" fontFamily="mono">
          Enable streaming for real-time response generation
        </Text>
      </FieldRoot>

      {!aiSettings.useDefaultKey && (
        <VStack gap={4} align="stretch">
          <HStack justify="space-between">
            <Heading size="sm" color="text.neon" fontFamily="heading">
              Custom API Keys
            </Heading>
            <Button size="xs" onClick={handleAddCustomKey}>
              + Add Key
            </Button>
          </HStack>

          {aiSettings.customKeys.map((key, index) => (
            <HStack key={index} gap={2}>
              <Select.Root
                collection={providerOptions}
                value={[key.provider]}
                onValueChange={(e) => {
                  const providerValue = e.value[0];
                  if (
                    providerValue &&
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    Object.values(AIProvider).includes(providerValue as AIProvider)
                  ) {
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    const provider = providerValue as AIProvider;
                    handleUpdateCustomKey(index, provider, key.hasKey);
                  }
                }}
              >
                <Select.Trigger>
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {providerOptions.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Input
                type="password"
                placeholder="API Key"
                size="sm"
                value={key.hasKey ? '••••••••' : ''}
                onChange={(e) =>
                  handleUpdateCustomKey(index, key.provider, e.target.value.length > 0)
                }
              />
              <Button size="xs" variant="ghost" onClick={() => handleRemoveCustomKey(index)}>
                Remove
              </Button>
            </HStack>
          ))}
        </VStack>
      )}

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
        <Button onClick={handleSave} loading={isUpdating} disabled={isUpdating} variant="primary">
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
