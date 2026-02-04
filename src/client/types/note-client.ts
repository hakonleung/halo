// Client-side types for notes
export interface Note {
  id: string;
  userId: string;
  title?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteCreateRequest {
  title?: string;
  content: string;
  tags?: string[];
}
