'use client';

import { Box } from '@chakra-ui/react';
import { EditorContent } from '@tiptap/react';

import type { Editor } from '@tiptap/react';

interface RichTextEditorProps {
  editor: Editor | null;
}

export function RichTextEditor({ editor }: RichTextEditorProps) {
  if (!editor) return null;

  return (
    <Box
      flex={1}
      overflow="auto"
      p={4}
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="md"
      css={{
        '& .tiptap-editor': {
          color: 'var(--chakra-colors-text-primary)',
          fontFamily: 'var(--chakra-fonts-body)',
          fontSize: 'sm',
          lineHeight: '1.6',
          minHeight: '100%',
          '& p': {
            marginBottom: '8px',
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            color: 'var(--chakra-colors-brand-matrix)',
            fontWeight: 'bold',
            marginTop: '16px',
            marginBottom: '8px',
          },
          '& h1': { fontSize: '2xl' },
          '& h2': { fontSize: 'xl' },
          '& h3': { fontSize: 'lg' },
          '& code': {
            backgroundColor: 'var(--chakra-colors-bg-dark)',
            color: 'var(--chakra-colors-brand-matrix)',
            padding: '2px 4px',
            borderRadius: '4px',
            fontFamily: 'mono',
            fontSize: 'sm',
          },
          '& pre': {
            backgroundColor: 'var(--chakra-colors-bg-dark)',
            padding: '12px',
            borderRadius: '8px',
            overflow: 'auto',
            borderWidth: '1px',
            borderColor: 'var(--chakra-colors-border-subtle)',
            '& code': {
              backgroundColor: 'transparent',
              padding: 0,
            },
          },
          '& blockquote': {
            borderLeft: '3px solid',
            borderColor: 'var(--chakra-colors-brand-matrix)',
            paddingLeft: '16px',
            color: 'var(--chakra-colors-text-mist)',
            fontStyle: 'italic',
          },
          '& ul, & ol': {
            paddingLeft: '24px',
            marginBottom: '8px',
          },
          '& li': {
            marginBottom: '4px',
          },
          '& a': {
            color: 'var(--chakra-colors-brand-cyber)',
            textDecoration: 'underline',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '4px',
          },
          '& ul[data-type="taskList"]': {
            listStyle: 'none',
            padding: 0,
            '& li': {
              display: 'flex',
            },
            '& li > label': {
              flex: '0 0 auto',
              marginRight: '8px',
              userSelect: 'none',
            },
            '& li > div': {
              flex: '1 1 auto',
            },
          },
          '& table': {
            borderCollapse: 'collapse',
            margin: '16px 0',
            tableLayout: 'fixed',
            width: '100%',
          },
          '& td, & th': {
            border: '1px solid var(--chakra-colors-border-subtle)',
            boxSizing: 'border-box',
            minWidth: '1em',
            padding: '8px',
            position: 'relative',
            verticalAlign: 'top',
            '& > *': {
              marginBottom: 0,
            },
          },
          '& th': {
            backgroundColor: 'var(--chakra-colors-bg-dark)',
            color: 'var(--chakra-colors-brand-matrix)',
            fontWeight: 'bold',
            textAlign: 'left',
          },
          '& .selectedCell:after': {
            zIndex: 2,
            position: 'absolute',
            content: '""',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: 'var(--chakra-colors-matrix-10)',
            pointerEvents: 'none',
          },
          '& .column-resize-handle': {
            position: 'absolute',
            right: '-2px',
            top: 0,
            bottom: '-2px',
            width: '4px',
            backgroundColor: 'var(--chakra-colors-brand-matrix)',
            pointerEvents: 'none',
          },
          '& .is-empty::before': {
            content: 'attr(data-placeholder)',
            float: 'left',
            color: 'var(--chakra-colors-text-dim)',
            pointerEvents: 'none',
            height: 0,
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
}
