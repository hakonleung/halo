'use client';

import { Box, HStack, IconButton, Separator } from '@chakra-ui/react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Code,
  Undo,
  Redo,
  Palette,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
} from 'lucide-react';

interface RichTextToolbarProps {
  editor: Editor | null;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setImage = () => {
    const url = window.prompt('Image URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <Box
      p={1}
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="md"
      mb={2}
      display="flex"
      flexWrap="wrap"
      gap={0.5}
    >
      <HStack gap={0.5} flexWrap="wrap">
        {/* 撤销/重做 */}
        <IconButton
          aria-label="Undo"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          color="text.mist"
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Undo size={14} />
        </IconButton>
        <IconButton
          aria-label="Redo"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          color="text.mist"
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Redo size={14} />
        </IconButton>

        <Separator orientation="vertical" h={4} />

        {/* 文本格式 */}
        <IconButton
          aria-label="Bold"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          color={editor.isActive('bold') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('bold') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Bold size={14} />
        </IconButton>
        <IconButton
          aria-label="Italic"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          color={editor.isActive('italic') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('italic') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Italic size={14} />
        </IconButton>
        <IconButton
          aria-label="Code"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          color={editor.isActive('code') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('code') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Code size={14} />
        </IconButton>

        <Separator orientation="vertical" h={4} />

        {/* 标题 */}
        <IconButton
          aria-label="Heading 1"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          color={editor.isActive('heading', { level: 1 }) ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('heading', { level: 1 }) ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Heading1 size={14} />
        </IconButton>
        <IconButton
          aria-label="Heading 2"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          color={editor.isActive('heading', { level: 2 }) ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('heading', { level: 2 }) ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Heading2 size={14} />
        </IconButton>
        <IconButton
          aria-label="Heading 3"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          color={editor.isActive('heading', { level: 3 }) ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('heading', { level: 3 }) ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Heading3 size={14} />
        </IconButton>

        <Separator orientation="vertical" h={4} />

        {/* 列表 */}
        <IconButton
          aria-label="Bullet List"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive('bulletList') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('bulletList') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <List size={14} />
        </IconButton>
        <IconButton
          aria-label="Ordered List"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive('orderedList') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('orderedList') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <ListOrdered size={14} />
        </IconButton>
        <IconButton
          aria-label="Blockquote"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          color={editor.isActive('blockquote') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('blockquote') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <Quote size={14} />
        </IconButton>

        <Separator orientation="vertical" h={4} />

        {/* 对齐方式 */}
        <IconButton
          aria-label="Align Left"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          color={editor.isActive({ textAlign: 'left' }) ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive({ textAlign: 'left' }) ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <AlignLeft size={14} />
        </IconButton>
        <IconButton
          aria-label="Align Center"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          color={editor.isActive({ textAlign: 'center' }) ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive({ textAlign: 'center' }) ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <AlignCenter size={14} />
        </IconButton>
        <IconButton
          aria-label="Align Right"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          color={editor.isActive({ textAlign: 'right' }) ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive({ textAlign: 'right' }) ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <AlignRight size={14} />
        </IconButton>

        <Separator orientation="vertical" h={4} />

        {/* 链接和图片 */}
        <IconButton
          aria-label="Link"
          size="xs"
          variant="ghost"
          onClick={setLink}
          color={editor.isActive('link') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('link') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <LinkIcon size={14} />
        </IconButton>
        <IconButton
          aria-label="Image"
          size="xs"
          variant="ghost"
          onClick={setImage}
          color="text.mist"
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <ImageIcon size={14} />
        </IconButton>

        <Separator orientation="vertical" h={4} />

        {/* 颜色选择器 */}
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Text Color"
            size="xs"
            variant="ghost"
            color="text.mist"
            _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
            as="label"
            cursor="pointer"
            position="relative"
            p={1}
            minW="auto"
            h="auto"
          >
            <Palette size={14} />
            {editor.getAttributes('textStyle').color && (
              <Box
                position="absolute"
                bottom="1px"
                right="1px"
                width="6px"
                height="6px"
                borderRadius="full"
                bg={editor.getAttributes('textStyle').color}
                borderWidth="1px"
                borderColor="border.subtle"
              />
            )}
            <input
              type="color"
              style={{
                position: 'absolute',
                opacity: 0,
                width: 0,
                height: 0,
                pointerEvents: 'none',
              }}
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
              }}
              value={editor.getAttributes('textStyle').color || '#E0E0E0'}
            />
          </IconButton>
        </Box>

        {/* Todo List */}
        <IconButton
          aria-label="Task List"
          size="xs"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          color={editor.isActive('taskList') ? 'brand.matrix' : 'text.mist'}
          bg={editor.isActive('taskList') ? 'rgba(0, 255, 65, 0.1)' : 'transparent'}
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <CheckSquare size={14} />
        </IconButton>

        {/* 表格 */}
        <IconButton
          aria-label="Insert Table"
          size="xs"
          variant="ghost"
          onClick={() => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
          color="text.mist"
          p={1}
          minW="auto"
          h="auto"
          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
        >
          <TableIcon size={14} />
        </IconButton>
      </HStack>
    </Box>
  );
}
