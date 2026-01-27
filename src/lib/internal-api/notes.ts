/**
 * Notes API
 */

import { BaseApiService, type ApiResponse } from './base';
import type {
  Note as ServerNote,
  NoteCreateRequest as ServerNoteCreateRequest,
} from '@/types/note-server';
import type {
  Note as ClientNote,
  NoteCreateRequest as ClientNoteCreateRequest,
} from '@/types/note-client';

function convertNote(server: ServerNote): ClientNote {
  return {
    id: server.id,
    userId: server.user_id,
    title: server.title ?? undefined,
    content: server.content,
    tags: server.tags ?? [],
    createdAt: server.created_at ?? new Date().toISOString(),
    updatedAt: server.updated_at ?? new Date().toISOString(),
  };
}

export const notesApi = {
  /**
   * Get notes
   */
  async getNotes(): Promise<ClientNote[]> {
    const response = await BaseApiService.fetchApi<ApiResponse<ServerNote[]>>('/api/notes');

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch notes');
    }

    return response.data.map(convertNote);
  },

  /**
   * Create a note
   */
  async createNote(note: ClientNoteCreateRequest): Promise<ClientNote> {
    const serverRequest: ServerNoteCreateRequest = {
      title: note.title,
      content: note.content,
      tags: note.tags,
    };

    const response = await BaseApiService.fetchApi<ApiResponse<ServerNote>>('/api/notes', {
      method: 'POST',
      body: JSON.stringify(serverRequest),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to create note');
    }

    return convertNote(response.data);
  },

  /**
   * Update a note
   */
  async updateNote(id: string, updates: Partial<ClientNoteCreateRequest>): Promise<ClientNote> {
    const serverRequest: Partial<ServerNoteCreateRequest> = {};

    if (updates.title !== undefined) serverRequest.title = updates.title;
    if (updates.content !== undefined) serverRequest.content = updates.content;
    if (updates.tags !== undefined) serverRequest.tags = updates.tags;

    const response = await BaseApiService.fetchApi<ApiResponse<ServerNote>>(`/api/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(serverRequest),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to update note');
    }

    return convertNote(response.data);
  },

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    const response = await BaseApiService.fetchApi<ApiResponse<null>>(`/api/notes/${id}`, {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error);
    }
  },
};
