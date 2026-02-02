'use client';

import { IconButton, Box } from '@chakra-ui/react';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatModal } from './chat-modal';
import { useSettings } from '@/hooks/use-settings';
import { AIProvider } from '@/types/settings-server';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();

  const hasApiKey = () => {
    if (!settings?.aiSettings) return false;
    const aiSettings = settings.aiSettings;

    // If using default key, API key is available
    if (aiSettings.useDefaultKey) {
      return true;
    }

    // For custom provider, both apiKey and baseUrl are required
    if (aiSettings.selectedProvider === AIProvider.Custom) {
      return (
        aiSettings.apiKey &&
        aiSettings.apiKey.trim() !== '' &&
        aiSettings.baseUrl &&
        aiSettings.baseUrl.trim() !== ''
      );
    }

    // For non-custom providers, apiKey is optional (will use env vars if not provided)
    // So we just need to check if model is set
    return aiSettings.selectedModel && aiSettings.selectedModel.trim() !== '';
  };

  const handleClick = () => {
    if (hasApiKey()) {
      setIsOpen(true);
    } else {
      router.push('/settings?tab=ai');
    }
  };

  return (
    <>
      <Box position="fixed" bottom={{ base: 20, md: 6 }} right={{ base: 4, md: 6 }} zIndex={100}>
        <IconButton
          aria-label="Open Chat"
          size="lg"
          borderRadius="full"
          bg="brand.matrix"
          color="bg.deep"
          boxShadow="0 0 20px rgba(0, 255, 65, 0.5)"
          _hover={{
            bg: '#00cc33',
            boxShadow: '0 0 30px rgba(0, 255, 65, 0.7)',
            transform: 'scale(1.1)',
          }}
          transition="all 0.2s"
          onClick={handleClick}
        >
          <MessageSquare size={24} />
        </IconButton>
      </Box>

      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
