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
} from '@chakra-ui/react';
import { useSettings } from '@/client/hooks/use-settings';
import { useUpdateSettings } from '@/client/hooks/use-update-settings';
import { useState, useEffect } from 'react';
import { validateUsername } from '@/client/utils/settings-pure';

export function ProfileSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating, error: updateError } = useUpdateSettings();

  const [username, setUsername] = useState(settings?.username || '');
  const [fullName, setFullName] = useState(settings?.fullName || '');
  const [website, setWebsite] = useState(settings?.website || '');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      setUsername(settings.username || '');
      setFullName(settings.fullName || '');
      setWebsite(settings.website || '');
    }
  }, [settings]);

  const handleSave = async () => {
    // Validate username
    const usernameValidation = validateUsername(username || null);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      return;
    }
    setUsernameError(null);

    await updateSettings({
      username: username || undefined,
      fullName: fullName || undefined,
      website: website || undefined,
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
    <VStack gap={6} align="stretch" p={6}>
      <Heading color="text.neon" fontFamily="heading" mb={2}>
        Profile Information
      </Heading>

      <FieldRoot>
        <FieldLabel>Username</FieldLabel>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          borderColor={usernameError ? 'red.500' : undefined}
        />
        {usernameError && (
          <Text mt={1} fontSize="xs" color="red.500" fontFamily="mono">
            {usernameError}
          </Text>
        )}
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Full Name</FieldLabel>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter full name"
        />
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Website</FieldLabel>
        <Input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
      </FieldRoot>

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
