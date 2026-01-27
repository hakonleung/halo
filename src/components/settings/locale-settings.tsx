'use client';

import {
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Box,
  Input,
  FieldRoot,
  FieldLabel,
  Select,
  createListCollection,
  Portal,
} from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';
import { useUpdateSettings } from '@/hooks/use-update-settings';
import { useState, useEffect } from 'react';
import {
  getAvailableLanguages,
  getAvailableDateFormats,
  formatTimezone,
} from '@/utils/settings-pure';

export function LocaleSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating } = useUpdateSettings();

  const [language, setLanguage] = useState<string>('en');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState<string>('YYYY-MM-DD');
  const [currency, setCurrency] = useState('CNY');

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      setLanguage(settings.language ?? 'en');
      setTimezone(settings.timezone ?? 'UTC');
      setDateFormat(settings.date_format ?? 'YYYY-MM-DD');
      setCurrency(settings.currency ?? 'CNY');
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      language: language as 'en' | 'zh-CN' | 'zh-TW',
      timezone: timezone,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      date_format: dateFormat as 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY',
      currency: currency,
    });
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

  const languages = getAvailableLanguages();
  const dateFormats = getAvailableDateFormats();

  const languagesCollection = createListCollection({ items: languages });
  const dateFormatsCollection = createListCollection({ items: dateFormats });

  return (
    <VStack gap={6} align="stretch" p={6}>
      <Heading size="md" color="text.neon" fontFamily="heading" mb={2}>
        Locale Settings
      </Heading>

      <FieldRoot>
        <FieldLabel>Interface Language</FieldLabel>
        <Select.Root
          collection={languagesCollection}
          value={[language]}
          onValueChange={(e) => setLanguage(e.value[0])}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {languages.map((lang) => (
                  <Select.Item key={lang.value} item={lang.value}>
                    {lang.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Timezone</FieldLabel>
        <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC" />
        <Text mt={1} fontSize="xs" color="text.dim" fontFamily="mono">
          Current: {formatTimezone(timezone)}
        </Text>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Date Format</FieldLabel>
        <Select.Root
          collection={dateFormatsCollection}
          value={[dateFormat]}
          onValueChange={(e) => setDateFormat(e.value[0])}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {dateFormats.map((format) => (
                  <Select.Item key={format.value} item={format.value}>
                    {format.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Currency</FieldLabel>
        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="CNY" />
      </FieldRoot>

      <HStack justify="flex-end" gap={4}>
        <Button onClick={handleSave} loading={isUpdating} disabled={isUpdating} variant="primary">
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
