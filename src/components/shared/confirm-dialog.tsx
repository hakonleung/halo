'use client';

import { Dialog, Portal, HStack, Button, Text } from '@chakra-ui/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColorScheme?: 'red' | 'green' | 'blue';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColorScheme = 'red',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : undefined)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content bg="bg.carbon" borderColor="brand.matrix" maxW="400px">
            <Dialog.Header>
              <Dialog.Title color="text.neon" fontFamily="mono">
                {title}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text color="text.mist" fontFamily="mono" fontSize="sm">
                {message}
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap={2} w="full" justify="flex-end">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                  {cancelLabel}
                </Button>
                <Button
                  colorScheme={confirmColorScheme}
                  onClick={handleConfirm}
                  loading={isLoading}
                >
                  {confirmLabel}
                </Button>
              </HStack>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
