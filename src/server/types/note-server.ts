import type { neologNotes } from '@neo-log/be-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Server-side types for notes (Inferred from Drizzle Entity)
export type Note = InferSelectModel<typeof neologNotes>;

export type NoteCreateRequest = Partial<InferInsertModel<typeof neologNotes>> & {
  content: string;
};
