'use client';

import { VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { useCreateNote, useUpdateNote } from '@/client/hooks/use-notes';

import { EditorField } from '../fields/editor-field';
import { InputField } from '../fields/input-field';

import { FormButtonGroup } from './form-button-group';

import type { Note } from '@/client/types/note-client';

export function NoteForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Note;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { mutateAsync: createNote, isPending: creating } = useCreateNote();
  const { mutateAsync: updateNote, isPending: updating } = useUpdateNote();

  const isEditing = !!initialData;
  const saving = creating || updating;

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const tagsArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    try {
      if (isEditing && initialData) {
        await updateNote({
          id: initialData.id,
          updates: {
            title: title.trim() || undefined,
            content: content.trim(),
            tags: tagsArray.length > 0 ? tagsArray : undefined,
          },
        });
      } else {
        await createNote({
          title: title.trim() || undefined,
          content: content.trim(),
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        });
      }
      if (onSuccess) onSuccess();
    } catch {
      // Error handled by hook
    }
  };

  const isFormValid = content.trim().length > 0;

  return (
    <VStack gap={6} align="stretch" w="full">
      <InputField
        label="Title"
        value={title}
        onChange={(value) => setTitle(typeof value === 'string' ? value : '')}
        type="text"
        placeholder="Note title..."
      />

      <EditorField
        label="Content"
        value={content}
        onChange={setContent}
        placeholder="Write your note here..."
        title="NOTE EDITOR"
        rows={8}
        required
        invalid={!content.trim()}
      />

      <InputField
        label="Tags"
        value={tags}
        onChange={(value) => setTags(typeof value === 'string' ? value : '')}
        type="text"
        placeholder="tag1, tag2, tag3"
      />

      <FormButtonGroup
        onCancel={onCancel || (() => {})}
        onSubmit={handleSubmit}
        isLoading={saving}
        disabled={!isFormValid}
      />
    </VStack>
  );
}
