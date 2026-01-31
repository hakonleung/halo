'use client';

import { useState } from 'react';
import {
  Drawer,
  Portal,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Skeleton,
  Box,
} from '@chakra-ui/react';
import { useNotes, useDeleteNote } from '@/hooks/use-notes';
import { NoteForm } from './note-form';

interface NoteDetailDrawerProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteDetailDrawer({ noteId, isOpen, onClose }: NoteDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const { data: notes, isLoading } = useNotes();
  const { mutateAsync: deleteNote, isPending: isDeleting } = useDeleteNote();

  const note = notes?.find((n) => n.id === noteId);

  const handleDelete = async () => {
    if (!note) return;
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(note.id);
      onClose();
    }
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => (e.open ? undefined : onClose())}
      placement="end"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content width={{ base: 'full', md: '600px' }}>
            <Drawer.Header>
              <Drawer.Title>NOTE DETAILS</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              {activeTab === 'edit' && note ? (
                <NoteForm
                  initialData={note}
                  onSuccess={() => {
                    setActiveTab('view');
                    onClose();
                  }}
                  onCancel={() => setActiveTab('view')}
                />
              ) : (
                <>
                  {isLoading ? (
                    <VStack gap={4}>
                      <Skeleton height="200px" w="full" />
                    </VStack>
                  ) : !note ? (
                    <Box textAlign="center" p={8}>
                      <Text color="text.mist" fontFamily="mono">
                        Note Not Found
                      </Text>
                    </Box>
                  ) : (
                    <VStack gap={6} align="stretch">
                      {/* Note Info */}
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

                      {/* Actions */}
                      <HStack gap={2} pt={4}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('edit')}
                          flex={1}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={handleDelete}
                          loading={isDeleting}
                          flex={1}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </VStack>
                  )}
                </>
              )}
            </Drawer.Body>

            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
