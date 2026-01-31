'use client';

import { IconButton, Box } from '@chakra-ui/react';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatModal } from './chat-modal';
import { useSettings } from '@/hooks/use-settings';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();

  const hasApiKey = () => {
    if (!settings?.aiSettings) return false;
    const aiSettings =
      typeof settings.aiSettings === 'string'
        ? JSON.parse(settings.aiSettings)
        : settings.aiSettings;
    return (
      aiSettings.useDefaultKey ||
      (aiSettings.customKeys && aiSettings.customKeys.some((k: { hasKey: boolean }) => k.hasKey))
    );
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
      <Box position="fixed" bottom={{ base: 20, md: 6 }} right={{ base: 4, md: 6 }} zIndex={1000}>
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
