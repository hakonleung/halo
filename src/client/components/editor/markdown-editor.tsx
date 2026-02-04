'use client';

import { Box, Textarea, Tabs, Text } from '@chakra-ui/react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const previewStyles = {
    '& > *': {
      color: 'var(--chakra-colors-text-primary)',
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
    },
    '& pre code': {
      backgroundColor: 'transparent',
      padding: 0,
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
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '16px',
    },
    '& th, & td': {
      borderWidth: '1px',
      borderColor: 'var(--chakra-colors-border-subtle)',
      padding: '8px',
    },
    '& th': {
      backgroundColor: 'var(--chakra-colors-bg-dark)',
      color: 'var(--chakra-colors-brand-matrix)',
      fontWeight: 'bold',
    },
  };

  return (
    <Box display="flex" flexDirection="column" h="full" gap={2}>
      {/* Desktop: 左右分屏 (> 1024px) */}
      <Box display={{ base: 'none', lg: 'flex' }} flex={1} gap={4} h="full" overflow="hidden">
        {/* 编辑区 */}
        <Box flex={1} display="flex" flexDirection="column">
          <Text fontSize="xs" color="text.dim" mb={2}>
            EDITOR
          </Text>
          <Textarea
            variant="outline"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            flex={1}
            resize="none"
            fontFamily="mono"
            fontSize="sm"
            borderColor="border.subtle"
            _focus={{
              borderColor: 'brand.matrix',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-matrix)',
            }}
          />
        </Box>

        {/* 预览区 */}
        <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
          <Text fontSize="xs" color="text.dim" mb={2}>
            PREVIEW
          </Text>
          <Box
            flex={1}
            overflow="auto"
            p={4}
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="md"
          >
            <Box className="markdown-preview" css={previewStyles}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*No content*'}</ReactMarkdown>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Mobile: Tab 切换 (≤ 1024px) */}
      <Box display={{ base: 'flex', lg: 'none' }} flex={1} flexDirection="column" h="full">
        <Tabs.Root
          value={activeTab}
          onValueChange={(e) => {
            const value = e.value;
            if (value === 'edit' || value === 'preview') {
              setActiveTab(value);
            }
          }}
        >
          <Tabs.List>
            <Tabs.Trigger value="edit">EDIT</Tabs.Trigger>
            <Tabs.Trigger value="preview">PREVIEW</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content
            value="edit"
            flex={1}
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            <Textarea
              variant="outline"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              flex={1}
              resize="none"
              fontFamily="mono"
              fontSize="sm"
              borderColor="border.subtle"
              _focus={{
                borderColor: 'brand.matrix',
                boxShadow: '0 0 0 1px var(--chakra-colors-brand-matrix)',
              }}
            />
          </Tabs.Content>

          <Tabs.Content value="preview" flex={1} overflow="auto" p={4}>
            <Box className="markdown-preview" css={previewStyles}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*No content*'}</ReactMarkdown>
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Box>
  );
}
