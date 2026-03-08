/**
 * Character Settings Panel
 *
 * UI for customizing character appearance in 3D chat scene.
 */

import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  IconButton,
  Drawer,
  Flex,
  Separator,
} from '@chakra-ui/react';
import { X, Save, Palette, User } from 'lucide-react';
import { useState } from 'react';

import { useUpdateSettings } from '@/client/hooks/use-update-settings';
import { useChat3DStore } from '@/client/store/chat-3d-store';
import { CharacterPreset } from '@/client/types/chat-3d-client';

import type { CharacterCustomization, MaterialType } from '@/client/types/chat-3d-client';

interface CharacterSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterSettingsPanel({ isOpen, onClose }: CharacterSettingsPanelProps) {
  const { selectedCharacter, characterCustomization, setCharacter, setCustomization } =
    useChat3DStore();
  const { updateSettings } = useUpdateSettings();

  // Local state for editing (before save)
  const [localCharacter, setLocalCharacter] = useState(selectedCharacter);
  const [localCustomization, setLocalCustomization] =
    useState<CharacterCustomization>(characterCustomization);
  const [saving, setSaving] = useState(false);

  // Character preset options
  const characterOptions: { value: CharacterPreset; label: string; description: string }[] = [
    { value: CharacterPreset.GUGUGAGA, label: 'Gugugaga', description: 'Cute character' },
    { value: CharacterPreset.HACKER, label: 'Hacker', description: 'Cyberpunk hacker' },
    { value: CharacterPreset.ANDROID, label: 'Android', description: 'AI robot' },
    { value: CharacterPreset.CYBORG, label: 'Cyborg', description: 'Half-mechanical' },
    { value: CharacterPreset.RUNNER, label: 'Runner', description: 'Parkour expert' },
    { value: CharacterPreset.NETIZEN, label: 'Netizen', description: 'Digital citizen' },
  ];

  // Material type options
  const materialOptions: { value: MaterialType; label: string; description: string }[] = [
    { value: 'glossy', label: 'Glossy', description: 'Shiny, reflective' },
    { value: 'matte', label: 'Matte', description: 'Flat, non-reflective' },
    { value: 'metallic', label: 'Metallic', description: 'Metal surface' },
  ];

  // Preset color schemes
  const colorPresets = [
    { name: 'Matrix', primary: '#00FF41', secondary: '#00D4FF' },
    { name: 'Fire', primary: '#FF6B35', secondary: '#FFD700' },
    { name: 'Ice', primary: '#00D4FF', secondary: '#E0E0E0' },
    { name: 'Purple', primary: '#9D4EDD', secondary: '#F72585' },
    { name: 'Neon', primary: '#39FF14', secondary: '#FF006E' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Apply to store immediately
      setCharacter(localCharacter);
      setCustomization(localCustomization);

      // Save to database
      await updateSettings({
        chat3DSettings: {
          enabled: true,
          selectedCharacter: localCharacter,
          customization: localCustomization,
        },
      });

      onClose();
    } catch (error) {
      console.error('Failed to save character settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalCharacter(selectedCharacter);
    setLocalCustomization(characterCustomization);
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : undefined)} size="md">
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header borderBottom="1px solid" borderColor="rgba(0, 255, 65, 0.2)">
            <HStack justify="space-between" w="full">
              <HStack gap={2}>
                <User size={20} color="#00FF41" />
                <Heading size="md" color="brand.matrix" fontFamily="heading">
                  CHARACTER SETTINGS
                </Heading>
              </HStack>
              <IconButton
                aria-label="Close"
                variant="ghost"
                onClick={onClose}
                color="text.mist"
                _hover={{ color: 'brand.matrix' }}
              >
                <X size={18} />
              </IconButton>
            </HStack>
          </Drawer.Header>

          <Drawer.Body p={6}>
            <VStack gap={6} align="stretch">
              {/* Character Preset Selection */}
              <Box>
                <HStack mb={3}>
                  <User size={16} color="#00D4FF" />
                  <Text fontWeight="bold" color="brand.cyber">
                    Character Model
                  </Text>
                </HStack>
                <VStack gap={2} align="stretch">
                  {characterOptions.map((option) => (
                    <Box
                      key={option.value}
                      p={3}
                      borderWidth="1px"
                      borderColor={
                        localCharacter === option.value ? 'brand.matrix' : 'rgba(0, 255, 65, 0.2)'
                      }
                      borderRadius="md"
                      bg={
                        localCharacter === option.value ? 'rgba(0, 255, 65, 0.05)' : 'transparent'
                      }
                      cursor="pointer"
                      onClick={() => setLocalCharacter(option.value)}
                      _hover={{
                        borderColor: 'brand.matrix',
                        bg: 'rgba(0, 255, 65, 0.03)',
                      }}
                    >
                      <HStack justify="space-between">
                        <Box>
                          <Text fontWeight="medium" color="text.neon">
                            {option.label}
                          </Text>
                          <Text fontSize="sm" color="text.mist">
                            {option.description}
                          </Text>
                        </Box>
                        {localCharacter === option.value && (
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

              <Separator />

              {/* Color Customization */}
              <Box>
                <HStack mb={3}>
                  <Palette size={16} color="#00D4FF" />
                  <Text fontWeight="bold" color="brand.cyber">
                    Colors
                  </Text>
                </HStack>

                {/* Color Presets */}
                <Box mb={3}>
                  <Text fontSize="sm" color="text.mist" mb={2}>
                    Quick Presets
                  </Text>
                  <HStack gap={2} flexWrap="wrap">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setLocalCustomization({
                            ...localCustomization,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary,
                          })
                        }
                        borderColor="rgba(0, 255, 65, 0.2)"
                        _hover={{ borderColor: 'brand.matrix' }}
                      >
                        <HStack gap={2}>
                          <Box w={3} h={3} borderRadius="sm" bg={preset.primary} />
                          <Box w={3} h={3} borderRadius="sm" bg={preset.secondary} />
                          <Text fontSize="xs">{preset.name}</Text>
                        </HStack>
                      </Button>
                    ))}
                  </HStack>
                </Box>

                {/* Custom Colors */}
                <VStack gap={3} align="stretch">
                  <Box>
                    <Text fontSize="sm" color="text.mist" mb={2}>
                      Primary Color
                    </Text>
                    <HStack gap={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="md"
                        bg={localCustomization.primaryColor}
                        borderWidth="2px"
                        borderColor="rgba(0, 255, 65, 0.3)"
                      />
                      <input
                        type="color"
                        value={localCustomization.primaryColor}
                        onChange={(e) =>
                          setLocalCustomization({
                            ...localCustomization,
                            primaryColor: e.target.value,
                          })
                        }
                        style={{
                          width: '100%',
                          height: '48px',
                          border: '1px solid rgba(0, 255, 65, 0.3)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                    </HStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="text.mist" mb={2}>
                      Secondary Color (Emissive)
                    </Text>
                    <HStack gap={3}>
                      <Box
                        w={12}
                        h={12}
                        borderRadius="md"
                        bg={localCustomization.secondaryColor}
                        borderWidth="2px"
                        borderColor="rgba(0, 255, 65, 0.3)"
                        boxShadow={`0 0 10px ${localCustomization.secondaryColor}`}
                      />
                      <input
                        type="color"
                        value={localCustomization.secondaryColor}
                        onChange={(e) =>
                          setLocalCustomization({
                            ...localCustomization,
                            secondaryColor: e.target.value,
                          })
                        }
                        style={{
                          width: '100%',
                          height: '48px',
                          border: '1px solid rgba(0, 255, 65, 0.3)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              <Separator />

              {/* Material Type */}
              <Box>
                <Text fontWeight="bold" color="brand.cyber" mb={3}>
                  Material
                </Text>
                <HStack gap={2}>
                  {materialOptions.map((option) => (
                    <Button
                      key={option.value}
                      size="sm"
                      variant={
                        localCustomization.materialType === option.value ? 'solid' : 'outline'
                      }
                      onClick={() =>
                        setLocalCustomization({
                          ...localCustomization,
                          materialType: option.value,
                        })
                      }
                      flex={1}
                    >
                      <VStack gap={1}>
                        <Text fontSize="xs" fontWeight="medium">
                          {option.label}
                        </Text>
                        <Text fontSize="xs" opacity={0.7}>
                          {option.description}
                        </Text>
                      </VStack>
                    </Button>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </Drawer.Body>

          <Drawer.Footer borderTop="1px solid" borderColor="rgba(0, 255, 65, 0.2)">
            <Flex justify="space-between" w="full">
              <Button variant="ghost" onClick={handleReset} disabled={saving}>
                Reset
              </Button>
              <HStack gap={2}>
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  <HStack gap={2}>
                    <Save size={16} />
                    <Text>Save</Text>
                  </HStack>
                </Button>
              </HStack>
            </Flex>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
