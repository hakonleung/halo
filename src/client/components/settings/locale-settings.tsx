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
import { useState, useEffect } from 'react';

import { useSettings } from '@/client/hooks/use-settings';
import { useUpdateSettings } from '@/client/hooks/use-update-settings';
import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_DATE_FORMATS,
  formatTimezone,
} from '@/client/utils/settings-pure';

export function LocaleSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating } = useUpdateSettings();

  const [language, setLanguage] = useState<'en' | 'zh-CN' | 'zh-TW'>('en');
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState<'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'>(
    'YYYY-MM-DD',
  );
  const [currency, setCurrency] = useState('CNY');

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      setLanguage(settings.language ?? 'en');
      setTimezone(settings.timezone ?? 'UTC');
      setDateFormat(settings.dateFormat ?? 'YYYY-MM-DD');
      setCurrency(settings.currency ?? 'CNY');
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      language: language,
      timezone: timezone,
      dateFormat: dateFormat,
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

  const languagesCollection = createListCollection({ items: AVAILABLE_LANGUAGES });
  const dateFormatsCollection = createListCollection({ items: AVAILABLE_DATE_FORMATS });

  return (
    <VStack gap={6} align="stretch" p={6}>
      <Heading color="text.neon" fontFamily="heading" mb={2}>
        Locale Settings
      </Heading>

      <FieldRoot>
        <FieldLabel>Interface Language</FieldLabel>
        <Select.Root
          collection={languagesCollection}
          value={[language]}
          onValueChange={(e) => {
            const v = AVAILABLE_LANGUAGES.find((l) => l.value === e.value[0])?.value;
            if (v) setLanguage(v);
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {AVAILABLE_LANGUAGES.map((lang) => (
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
          onValueChange={(e) => {
            const v = AVAILABLE_DATE_FORMATS.find((d) => d.value === e.value[0])?.value;
            if (v) setDateFormat(v);
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {AVAILABLE_DATE_FORMATS.map((format) => (
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
