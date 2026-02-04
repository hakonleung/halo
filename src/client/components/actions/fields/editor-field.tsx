'use client';

import { Textarea, Field } from '@chakra-ui/react';

import { useEditorModalStore } from '@/client/store/editor-modal-store';

export function EditorField({
  label,
  value,
  onChange,
  placeholder = 'Click to edit in fullscreen editor...',
  title = 'EDITOR',
  rows = 2,
  required,
  invalid,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  rows?: number;
  required?: boolean;
  invalid?: boolean;
}) {
  const { openModal } = useEditorModalStore();
  const handleClick = () => {
    openModal({
      value,
      onChange,
      onSave: onChange,
      placeholder,
      title,
    });
  };
  return (
    <Field.Root required={required} invalid={invalid}>
      <Field.Label color="text.mist">{label}</Field.Label>
      <Textarea
        variant="outline"
        rows={rows}
        value={value}
        readOnly
        onClick={handleClick}
        placeholder={placeholder}
        cursor="pointer"
        _hover={{
          borderColor: 'brand.matrix',
        }}
      />
    </Field.Root>
  );
}
