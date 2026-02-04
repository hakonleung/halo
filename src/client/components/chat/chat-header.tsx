import { HStack, IconButton, Heading } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
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
    </HStack>
  );
}
