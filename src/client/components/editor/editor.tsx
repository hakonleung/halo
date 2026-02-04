'use client';

import { useEffect } from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { MarkdownEditor } from './markdown-editor';
import { RichTextEditor } from './richtext-editor';
import { RichTextToolbar } from './richtext-toolbar';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  mode?: 'markdown' | 'rich';
  onModeChange?: (mode: 'markdown' | 'rich') => void;
}

export function Editor({
  value,
  onChange,
  placeholder = 'Start typing...',
  mode = 'rich',
  onModeChange,
}: EditorProps) {
  // TipTap 富文本编辑器实例
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'editor-link',
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'editor-image',
          },
        }),
        Color,
        TextStyle,
        TaskList.configure({
          HTMLAttributes: {
            class: 'editor-task-list',
          },
        }),
        TaskItem.configure({
          nested: true,
          HTMLAttributes: {
            class: 'editor-task-item',
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        Table.configure({
          resizable: true,
          HTMLAttributes: {
            class: 'editor-table',
          },
        }),
        TableRow.configure({
          HTMLAttributes: {
            class: 'editor-table-row',
          },
        }),
        TableHeader.configure({
          HTMLAttributes: {
            class: 'editor-table-header',
          },
        }),
        TableCell.configure({
          HTMLAttributes: {
            class: 'editor-table-cell',
          },
        }),
      ],
      content: value || '',
      onUpdate: ({ editor }) => {
        if (mode === 'rich') {
          const html = editor.getHTML();
          onChange(html);
        }
      },
      editorProps: {
        attributes: {
          class: 'tiptap-editor',
          style: 'min-height: 100%; outline: none;',
        },
      },
      immediatelyRender: false,
    },
    [mode],
  );

  // 当模式切换到 rich 或 value 变化时更新编辑器内容
  useEffect(() => {
    if (editor && mode === 'rich') {
      const currentContent = editor.getHTML();
      // 只有当内容不同时才更新，避免循环更新
      if (currentContent !== value && value !== undefined) {
        editor.commands.setContent(value || '');
      }
    }
  }, [editor, mode, value]);

  return (
    <Box display="flex" flexDirection="column" h="full" gap={2}>
      {/* 模式切换 */}
      {onModeChange && (
        <HStack gap={2}>
          <Box
            as="button"
            px={2}
            py={1}
            fontSize="xs"
            borderRadius="sm"
            bg={mode === 'rich' ? 'brand.matrix' : 'transparent'}
            color={mode === 'rich' ? 'bg.deep' : 'text.mist'}
            borderWidth="1px"
            borderColor={mode === 'rich' ? 'brand.matrix' : 'border.subtle'}
            onClick={() => {
              onModeChange('rich');
            }}
            cursor="pointer"
            _hover={{
              bg: mode === 'rich' ? 'brand.matrix' : 'bg.dark',
              borderColor: 'brand.matrix',
            }}
          >
            Rich Text
          </Box>
          <Box
            as="button"
            px={2}
            py={1}
            fontSize="xs"
            borderRadius="sm"
            bg={mode === 'markdown' ? 'brand.matrix' : 'transparent'}
            color={mode === 'markdown' ? 'bg.deep' : 'text.mist'}
            borderWidth="1px"
            borderColor={mode === 'markdown' ? 'brand.matrix' : 'border.subtle'}
            onClick={() => onModeChange('markdown')}
            cursor="pointer"
            _hover={{
              bg: mode === 'markdown' ? 'brand.matrix' : 'bg.dark',
              borderColor: 'brand.matrix',
            }}
          >
            Markdown
          </Box>
        </HStack>
      )}

      {/* 编辑器内容 */}
      {mode === 'rich' ? (
        <>
          <RichTextToolbar editor={editor} />
          <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
            <RichTextEditor editor={editor} />
          </Box>
        </>
      ) : (
        <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
          <MarkdownEditor value={value} onChange={onChange} placeholder={placeholder} />
        </Box>
      )}
    </Box>
  );
}
