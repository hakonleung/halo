'use client';

import { Box, VStack, Text, Button } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { ConversationItem } from './conversation-item';
import type { Conversation } from '@/types/chat-client';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  onUpdate,
  onDelete,
}: ConversationListProps) {
  return (
    <Box w="280px" borderRight="1px solid" borderColor="rgba(0, 255, 65, 0.2)" p={4}>
      <Button
        variant="outline"
        w="full"
        mb={6}
        borderColor="brand.matrix"
        color="brand.matrix"
        onClick={onNewChat}
        _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
      >
        <Plus size={18} style={{ marginRight: '8px' }} /> NEW CHAT
      </Button>

      <VStack gap={2} align="stretch" overflowY="auto" maxH="calc(100% - 100px)">
        <Text color="text.mist" fontSize="xs" fontWeight="bold" letterSpacing="widest" mb={2}>
          RECENT HISTORY
        </Text>
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedId === conv.id}
            onSelect={onSelect}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </VStack>
    </Box>
  );
}
