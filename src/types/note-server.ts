import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { neologNotes } from '@/db/schema';

// Server-side types for notes (Inferred from Drizzle Entity)
export type Note = InferSelectModel<typeof neologNotes>;

export type NoteCreateRequest = Partial<InferInsertModel<typeof neologNotes>> & {
  content: string;
};
