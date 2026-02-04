import { createToaster } from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { internalApiService } from '@/client/internal-api';

import type { NoteCreateRequest } from '@/client/types/note-client';

const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
});

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: () => internalApiService.getNotes(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: NoteCreateRequest) => internalApiService.createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toaster.create({
        title: 'Note created',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Failed to create note',
        description: error.message,
        type: 'error',
      });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NoteCreateRequest> }) =>
      internalApiService.updateNote(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toaster.create({
        title: 'Note updated',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Failed to update note',
        description: error.message,
        type: 'error',
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => internalApiService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toaster.create({
        title: 'Note deleted',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Failed to delete note',
        description: error.message,
        type: 'error',
      });
    },
  });
}
