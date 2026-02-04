'use client';

import { HStack, IconButton } from '@chakra-ui/react';
import { X, Check, Pencil } from 'lucide-react';

export function FormButtonGroup({
  onCancel,
  onSubmit,
  isLoading = false,
  disabled = false,
  onEdit,
  showEdit = false,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  onEdit?: () => void;
  showEdit?: boolean;
}) {
  return (
    <HStack gap={2} pt={4} justify="flex-end">
      {showEdit && onEdit && (
        <IconButton
          aria-label="Edit"
          variant="ghost"
          onClick={onEdit}
          color="text.mist"
          _hover={{ color: 'brand.cyber' }}
        >
          <Pencil size={16} />
        </IconButton>
      )}
      <IconButton
        aria-label="Cancel"
        variant="ghost"
        onClick={onCancel}
        color="text.mist"
        _hover={{ color: 'brand.cyber' }}
      >
        <X size={16} />
      </IconButton>
      <IconButton
        aria-label="Save"
        variant="solid"
        colorScheme="green"
        onClick={onSubmit}
        loading={isLoading}
        disabled={disabled}
      >
        <Check size={16} />
      </IconButton>
    </HStack>
  );
}
