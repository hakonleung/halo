'use client';

import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMarkdownProps {
  content: string;
}

const markdownStyles = {
  '& > *:first-of-type': {
    marginTop: 0,
  },
  '& > *:last-child': {
    marginBottom: 0,
  },
  '& p': {
    marginBottom: '8px',
    lineHeight: '1.6',
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
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'mono',
    fontSize: 'sm',
  },
  '& pre': {
    backgroundColor: 'var(--chakra-colors-bg-dark)',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    borderWidth: '1px',
    borderColor: 'var(--chakra-colors-border-subtle)',
    marginBottom: '8px',
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
    marginBottom: '8px',
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
  '& hr': {
    borderColor: 'var(--chakra-colors-border-subtle)',
    marginTop: '16px',
    marginBottom: '16px',
  },
  '& strong': {
    color: 'var(--chakra-colors-brand-matrix)',
  },
};

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <Box css={markdownStyles}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </Box>
  );
}
