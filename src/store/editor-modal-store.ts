'use client';

import { create } from 'zustand';

interface EditorModalStore {
  isOpen: boolean;
  value: string;
  placeholder: string;
  title: string;
  onChange: ((value: string) => void) | null;
  onSave: ((value: string) => void) | null;
  openModal: (config: {
    value: string;
    onChange: (value: string) => void;
    onSave: (value: string) => void;
    placeholder?: string;
    title?: string;
  }) => void;
  closeModal: () => void;
}

export const useEditorModalStore = create<EditorModalStore>((set) => ({
  isOpen: false,
  value: '',
  placeholder: 'Start typing...',
  title: 'EDITOR',
  onChange: null,
  onSave: null,
  openModal: (config) =>
    set({
      isOpen: true,
      value: config.value,
      onChange: config.onChange,
      onSave: config.onSave,
      placeholder: config.placeholder || 'Start typing...',
      title: config.title || 'EDITOR',
    }),
  closeModal: () =>
    set({
      isOpen: false,
      value: '',
      onChange: null,
      onSave: null,
      placeholder: 'Start typing...',
      title: 'EDITOR',
    }),
}));
