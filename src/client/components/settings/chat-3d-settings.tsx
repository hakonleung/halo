/**
 * 3D Chat Settings Component
 *
 * Settings page section for 3D chat preferences.
 */

import { VStack, HStack, Text, Box, Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

import { useSettings } from '@/client/hooks/use-settings';
import { useUpdateSettings } from '@/client/hooks/use-update-settings';
import { CharacterPreset, DEFAULT_3D_SETTINGS } from '@/client/types/chat-3d-client';

export function Chat3DSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating } = useUpdateSettings();

  const [selectedCharacter, setSelectedCharacter] = useState<CharacterPreset>(
    CharacterPreset.GUGUGAGA,
  );

  // Sync form values when settings load
  useEffect(() => {
    if (settings?.chat3DSettings) {
      setSelectedCharacter(settings.chat3DSettings.selectedCharacter);
    }
  }, [settings]);

  const characterOptions: { value: CharacterPreset; label: string }[] = [
    { value: CharacterPreset.GUGUGAGA, label: 'Gugugaga' },
    { value: CharacterPreset.HACKER, label: 'Hacker' },
    { value: CharacterPreset.ANDROID, label: 'Android' },
    { value: CharacterPreset.CYBORG, label: 'Cyborg' },
    { value: CharacterPreset.RUNNER, label: 'Runner' },
    { value: CharacterPreset.NETIZEN, label: 'Netizen' },
  ];

  const handleSave = async () => {
    const chat3DSettings = settings?.chat3DSettings ?? DEFAULT_3D_SETTINGS;
    await updateSettings({
      chat3DSettings: {
        ...chat3DSettings,
        selectedCharacter,
      },
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

  return (
    <VStack gap={6} align="stretch">
      {/* Default Character */}
      <Box>
        <Text fontWeight="medium" color="text.neon" mb={3}>
          Default Character
        </Text>
        <Text fontSize="sm" color="text.mist" mb={3}>
          Select your preferred character model for 3D chat
        </Text>
        <VStack gap={2} align="stretch">
          {characterOptions.map((option) => (
            <Box
              key={option.value}
              p={3}
              borderWidth="1px"
              borderColor={
                selectedCharacter === option.value ? 'brand.matrix' : 'rgba(0, 255, 65, 0.2)'
              }
              borderRadius="md"
              bg={selectedCharacter === option.value ? 'rgba(0, 255, 65, 0.05)' : 'transparent'}
              cursor="pointer"
              onClick={() => setSelectedCharacter(option.value)}
              _hover={{
                borderColor: 'brand.matrix',
                bg: 'rgba(0, 255, 65, 0.03)',
              }}
            >
              <HStack justify="space-between">
                <Text color="text.neon">{option.label}</Text>
                {selectedCharacter === option.value && (
                  <Box
                    w={3}
                    h={3}
                    borderRadius="full"
                    bg="brand.matrix"
                    boxShadow="0 0 8px rgba(0, 255, 65, 0.6)"
                  />
                )}
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Info Note */}
      <Box
        p={4}
        bg="rgba(0, 212, 255, 0.05)"
        borderRadius="md"
        borderWidth="1px"
        borderColor="rgba(0, 212, 255, 0.2)"
      >
        <Text fontSize="sm" color="brand.cyber">
          💡 <strong>Tip:</strong> You can customize character colors and materials in the 3D chat
          scene using the settings button.
        </Text>
      </Box>

      {/* Save Button */}
      <Box>
        <Button onClick={handleSave} loading={isUpdating} w="full">
          Save Changes
        </Button>
      </Box>
    </VStack>
  );
}
