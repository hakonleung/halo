import { HStack, IconButton, Heading } from '@chakra-ui/react';
import { ArrowLeft, Box, MonitorSmartphone } from 'lucide-react';

import { useChat3DStore } from '@/client/store/chat-3d-store';

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  const { is3DMode, toggle3DMode } = useChat3DStore();

  return (
    <HStack justify="space-between" align="center" w="full">
      <HStack gap={3}>
        <IconButton
          aria-label="Back"
          variant="ghost"
          onClick={onClose}
          color="text.mist"
          _hover={{ color: 'brand.matrix' }}
        >
          <ArrowLeft size={18} />
        </IconButton>
        <Heading color="brand.matrix" fontFamily="heading">
          CHAT
        </Heading>
      </HStack>
      <IconButton
        aria-label={is3DMode ? 'Switch to 2D view' : 'Switch to 3D view'}
        variant="ghost"
        onClick={toggle3DMode}
        color={is3DMode ? 'brand.cyber' : 'text.mist'}
        _hover={{ color: 'brand.matrix' }}
      >
        {is3DMode ? <Box size={18} /> : <MonitorSmartphone size={18} />}
      </IconButton>
    </HStack>
  );
}
