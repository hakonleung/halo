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
  getAvailableThemes,
  getPresetAccentColors,
  getAvailableAnimationLevels,
  getAvailableFontSizes,
  validateAccentColor,
} from '@/utils/settings-pure';

export function AppearanceSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating } = useUpdateSettings();

  const [theme, setTheme] = useState<string>('dark');
  const [accentColor, setAccentColor] = useState('#00FF41');
  const [animationLevel, setAnimationLevel] = useState<string>('full');
  const [fontSize, setFontSize] = useState<string>('medium');
  const [codeFont, setCodeFont] = useState('JetBrains Mono');
  const [accentColorError, setAccentColorError] = useState<string | null>(null);

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      setTheme(settings.theme ?? 'dark');
      setAccentColor(settings.accentColor ?? '#00FF41');
      setAnimationLevel(settings.animationLevel ?? 'full');
      setFontSize(settings.fontSize ?? 'medium');
      setCodeFont(settings.codeFont ?? 'JetBrains Mono');
    }
  }, [settings]);

  const handleSave = async () => {
    // Validate accent color
    const colorValidation = validateAccentColor(accentColor);
    if (colorValidation) {
      setAccentColorError(colorValidation);
      return;
    }
    setAccentColorError(null);

    await updateSettings({
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      theme: theme as 'dark' | 'light' | 'system',
      accentColor: accentColor,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      animationLevel: animationLevel as 'full' | 'reduced' | 'none',
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      fontSize: fontSize as 'small' | 'medium' | 'large' | 'xlarge',
      codeFont: codeFont,
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

  const presetColors = getPresetAccentColors();
  const themes = getAvailableThemes();
  const animationLevels = getAvailableAnimationLevels();
  const fontSizes = getAvailableFontSizes();

  const themesCollection = createListCollection({ items: themes });
  const animationLevelsCollection = createListCollection({ items: animationLevels });
  const fontSizesCollection = createListCollection({ items: fontSizes });

  return (
    <VStack gap={6} align="stretch" p={6}>
      <Heading size="md" color="text.neon" fontFamily="heading" mb={2}>
        Appearance Settings
      </Heading>

      <FieldRoot>
        <FieldLabel>Theme Mode</FieldLabel>
        <Select.Root
          collection={themesCollection}
          value={[theme]}
          onValueChange={(e) => setTheme(e.value[0])}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {themes.map((t) => (
                  <Select.Item key={t.value} item={t.value}>
                    {t.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Accent Color</FieldLabel>
        <VStack gap={2} align="stretch">
          <HStack gap={2} flexWrap="wrap">
            {presetColors.map((preset) => (
              <Button
                key={preset.value}
                size="sm"
                bg={preset.value}
                border="2px solid"
                borderColor={accentColor === preset.value ? 'brand.matrix' : 'transparent'}
                _hover={{ opacity: 0.8 }}
                onClick={() => setAccentColor(preset.value)}
                aria-label={`Select ${preset.label}`}
                minW="60px"
                h="40px"
              />
            ))}
          </HStack>
          <HStack gap={2}>
            <Input
              id="accentColor"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              w="60px"
              h="40px"
              p={1}
              borderColor={accentColorError ? 'red.500' : undefined}
            />
            <Input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#00FF41"
              borderColor={accentColorError ? 'red.500' : undefined}
              flex={1}
            />
          </HStack>
          {accentColorError && (
            <Text fontSize="xs" color="red.500" fontFamily="mono">
              {accentColorError}
            </Text>
          )}
        </VStack>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Animation Level</FieldLabel>
        <Select.Root
          collection={animationLevelsCollection}
          value={[animationLevel]}
          onValueChange={(e) => setAnimationLevel(e.value[0])}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {animationLevels.map((level) => (
                  <Select.Item key={level.value} item={level.value}>
                    {level.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Font Size</FieldLabel>
        <Select.Root
          collection={fontSizesCollection}
          value={[fontSize]}
          onValueChange={(e) => setFontSize(e.value[0])}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {fontSizes.map((size) => (
                  <Select.Item key={size.value} item={size.value}>
                    {size.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Code Font</FieldLabel>
        <Input
          value={codeFont}
          onChange={(e) => setCodeFont(e.target.value)}
          placeholder="JetBrains Mono"
        />
      </FieldRoot>

      {accentColorError && (
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
          {accentColorError}
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
