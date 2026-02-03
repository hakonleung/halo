'use client';

import { Box, HStack, Input, IconButton } from '@chakra-ui/react';
import { Send, Image, Mic } from 'lucide-react';

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInputBar({ value, onChange, onSend, disabled }: ChatInputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      onSend();
    }
  };

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      p={6}
      bgGradient="linear(to-t, bg.deep, transparent)"
    >
      <Box maxW="1200px" mx="auto" w="full" position="relative">
        <HStack
          bg="bg.carbon"
          p={2}
          borderRadius="8px"
          border="1px solid"
          borderColor="brand.matrix"
          boxShadow="0 0 15px rgba(0, 255, 65, 0.1)"
          gap={2}
        >
          <IconButton
            aria-label="Upload image"
            variant="ghost"
            size="sm"
            color="text.mist"
            _hover={{ color: 'brand.cyber' }}
          >
            <Image size={20} />
          </IconButton>
          <IconButton
            aria-label="Voice input"
            variant="ghost"
            size="sm"
            color="text.mist"
            _hover={{ color: 'brand.cyber' }}
          >
            <Mic size={20} />
          </IconButton>
          <Input
            variant="subtle"
            placeholder="Type a message or use commands /record..."
            color="text.neon"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            border="none"
            _focus={{ ring: 'none' }}
          />
          <IconButton
            aria-label="Send message"
            bg="brand.matrix"
            color="bg.deep"
            size="sm"
            onClick={onSend}
            loading={disabled}
            _hover={{ bg: '#00cc33' }}
          >
            <Send size={18} />
          </IconButton>
        </HStack>
      </Box>
    </Box>
  );
}
