'use client';

import { VStack, HStack, Text, Heading, Button, Skeleton, Box } from '@chakra-ui/react';
import { NoteForm } from './forms/note-form';
import { useNotes, useDeleteNote } from '@/hooks/use-notes';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import { useActionGuard } from '@/hooks/use-action-guard';
import { useUnifiedActionDrawerSync } from '@/hooks/use-unified-action-drawer-sync';

export function NoteActionDrawerContent({
  actionDataId,
  onClose,
}: {
  actionDataId: string;
  onClose: () => void;
}) {
  const { isEditMode, setEditMode } = useUnifiedActionDrawerStore();
  const { data: notes, isLoading } = useNotes();
  const { mutateAsync: deleteNote, isPending: isDeletingNote } = useDeleteNote();
  const { closeDrawer } = useUnifiedActionDrawerSync();
  const { guard } = useActionGuard();
  const note = notes?.find((n) => n.id === actionDataId);

  const handleDelete = guard({
    title: 'Delete Note',
    message: 'Are you sure you want to delete this note? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmColorScheme: 'red',
    isLoading: isDeletingNote,
    onConfirm: async () => {
      await deleteNote(actionDataId);
      closeDrawer();
    },
  });

  if (isEditMode) {
    if (!note) return null;
    return (
      <NoteForm
        initialData={note}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <VStack gap={4}>
        <Skeleton height="200px" w="full" />
      </VStack>
    );
  }

  if (!note) {
    return (
      <Box textAlign="center" p={8}>
        <Text color="text.mist" fontFamily="mono">
          Note Not Found
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      <VStack align="flex-start" gap={2}>
        {note.title && (
          <Heading fontSize="24px" color="text.neon" fontFamily="mono">
            {note.title}
          </Heading>
        )}
        <Box p={4} bg="bg.dark" borderRadius="4px" w="full" minH="200px">
          <Text color="text.mist" whiteSpace="pre-wrap">
            {note.content}
          </Text>
        </Box>
        {note.tags && note.tags.length > 0 && (
          <HStack gap={2} flexWrap="wrap" w="full">
            {note.tags.map((tag) => (
              <Text
                key={tag}
                fontSize="xs"
                color="brand.matrix"
                fontFamily="mono"
                px={2}
                py={1}
                bg="rgba(0, 255, 65, 0.1)"
                borderRadius="4px"
              >
                #{tag}
              </Text>
            ))}
          </HStack>
        )}
        <Text fontSize="sm" color="text.dim" fontFamily="mono">
          Created: {new Date(note.createdAt).toLocaleString('en-US')}
        </Text>
        {note.updatedAt !== note.createdAt && (
          <Text fontSize="sm" color="text.dim" fontFamily="mono">
            Updated: {new Date(note.updatedAt).toLocaleString('en-US')}
          </Text>
        )}
      </VStack>

      <HStack gap={2} pt={4}>
        <Button
          size="sm"
          colorScheme="red"
          onClick={handleDelete}
          loading={isDeletingNote}
          flex={1}
        >
          Delete
        </Button>
      </HStack>
    </VStack>
  );
}
