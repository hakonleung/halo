import { HStack, IconButton, Heading } from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  title: string;
  mobileMenuTrigger?: React.ReactNode;
}

export function ChatHeader({ onClose, title, mobileMenuTrigger }: ChatHeaderProps) {
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
          {title}
        </Heading>
      </HStack>

      {/* Mobile hamburger menu trigger */}
      {mobileMenuTrigger}
    </HStack>
  );
}
