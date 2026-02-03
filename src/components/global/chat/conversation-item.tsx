'use client';

import { useState } from 'react';
import { Box, HStack, Text, Input, IconButton } from '@chakra-ui/react';
import { MessageSquare, Edit, Trash, Check, X } from 'lucide-react';
import type { Conversation } from '@/types/chat-client';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title || 'Untitled Chat');

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(conversation.id, editTitle);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(conversation.title || 'Untitled Chat');
    setIsEditing(false);
  };

  return (
    <Box
      p={3}
      borderRadius="4px"
      bg={isSelected ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
      cursor="pointer"
      _hover={{ bg: 'bg.carbon' }}
      border="1px solid"
      borderColor={isSelected ? 'brand.matrix' : 'transparent'}
    >
      {isEditing ? (
        <HStack gap={2}>
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            autoFocus
            size="sm"
            variant="subtle"
          />
          <IconButton
            aria-label="Save"
            size="xs"
            variant="ghost"
            onClick={handleSave}
            color="brand.matrix"
          >
            <Check size={14} />
          </IconButton>
          <IconButton
            aria-label="Cancel"
            size="xs"
            variant="ghost"
            onClick={handleCancel}
            color="text.mist"
          >
            <X size={14} />
          </IconButton>
        </HStack>
      ) : (
        <HStack gap={3} justify="space-between" onClick={() => onSelect(conversation.id)}>
          <HStack gap={3} flex={1} minW={0}>
            <MessageSquare size={16} color={isSelected ? '#00FF41' : '#888888'} />
            <Text color="text.neon" fontSize="sm" truncate flex={1}>
              {conversation.title || 'Untitled Chat'}
            </Text>
          </HStack>
          <HStack gap={1} _groupHover={{ display: 'flex' }}>
            <IconButton
              aria-label="Edit title"
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              color="text.mist"
              _hover={{ color: 'brand.cyber' }}
            >
              <Edit size={14} />
            </IconButton>
            <IconButton
              aria-label="Delete conversation"
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              color="text.mist"
              _hover={{ color: 'brand.alert' }}
            >
              <Trash size={14} />
            </IconButton>
          </HStack>
        </HStack>
      )}
    </Box>
  );
}
