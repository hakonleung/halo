import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, NoteCreateRequest } from '@/types/note-client';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'top',
  pauseOnPageIdle: true,
});

export function useNotes() {
  return useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      const result = await res.json();
      return result.data;
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: NoteCreateRequest) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      if (!res.ok) throw new Error('Failed to create note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NoteCreateRequest> }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
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
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete note');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
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

