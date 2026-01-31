'use client';

import { useState } from 'react';
import { VStack, HStack, Text, Input, Button, Field, Textarea } from '@chakra-ui/react';
import { useCreateNote, useUpdateNote } from '@/hooks/use-notes';
import type { Note } from '@/types/note-client';
import { useEditorModalStore } from '@/store/editor-modal-store';

interface NoteFormProps {
  initialData?: Note;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NoteForm({ initialData, onSuccess, onCancel }: NoteFormProps) {
  const { mutateAsync: createNote, isPending: creating } = useCreateNote();
  const { mutateAsync: updateNote, isPending: updating } = useUpdateNote();

  const isEditing = !!initialData;
  const saving = creating || updating;

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const { openModal } = useEditorModalStore();

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
      <Field.Root>
        <Field.Label color="text.mist">Title (Optional)</Field.Label>
        <Input
          variant="outline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
        />
      </Field.Root>

      <Field.Root required invalid={!content.trim()}>
        <Field.Label color="text.mist">Content</Field.Label>
        <Textarea
          variant="outline"
          rows={8}
          value={content}
          readOnly
          onClick={() => {
            openModal({
              value: content,
              onChange: setContent,
              onSave: (value) => {
                setContent(value);
              },
              placeholder: 'Write your note here...',
              title: 'NOTE EDITOR',
            });
          }}
          placeholder="Click to edit in fullscreen editor..."
          cursor="pointer"
          _hover={{
            borderColor: 'brand.matrix',
          }}
        />
      </Field.Root>

      <Field.Root>
        <Field.Label color="text.mist">Tags (Optional)</Field.Label>
        <Input
          variant="outline"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
        <Text fontSize="xs" color="text.dim" mt={1}>
          Separate tags with commas
        </Text>
      </Field.Root>

      <HStack gap={4} pt={4}>
        <Button variant="ghost" flex={1} onClick={onCancel}>
          CANCEL
        </Button>
        <Button
          variant="primary"
          flex={1}
          onClick={handleSubmit}
          loading={saving}
          disabled={!isFormValid}
        >
          {isEditing ? 'SAVE CHANGES' : 'CREATE NOTE'}
        </Button>
      </HStack>
    </VStack>
  );
}
