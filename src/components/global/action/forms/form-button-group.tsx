'use client';

import { HStack, Button } from '@chakra-ui/react';

export function FormButtonGroup({
  onCancel,
  onSubmit,
  isLoading = false,
  disabled = false,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) {
  return (
    <HStack gap={4} pt={4}>
      <Button variant="ghost" flex={1} onClick={onCancel}>
        CANCEL
      </Button>
      <Button variant="primary" flex={1} onClick={onSubmit} loading={isLoading} disabled={disabled}>
        SAVE
      </Button>
    </HStack>
  );
}
