'use client';

import { VStack, Heading, Box, Text, Flex } from '@chakra-ui/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DetailItem {
  key: string;
  label: string;
  value?: string | number | null | undefined;
  description?: string;
  fields?: Array<{ label: string; value: string | number }>;
  // For definition mode
  type?: string;
  required?: boolean;
  // For criteria mode
  codeBlock?: string;
}

type DetailSectionMode = 'definition' | 'record' | 'criteria';

export function DetailSection({
  title,
  items,
  mode = 'record',
}: {
  title: string;
  items: DetailItem[];
  mode?: DetailSectionMode;
}) {
  if (!items || items.length === 0) return null;

  return (
    <VStack align="flex-start" gap={2}>
      <Heading fontSize="md" color="text.neon" fontFamily="mono">
        {title}
      </Heading>
      <VStack align="flex-start" w="full" bg="bg.carbon" p={2} borderRadius="4px">
        {items.map((item) => {
          if (mode === 'definition' || mode === 'record') {
            return (
              <Box key={item.key} w="full">
                <Text fontSize="sm" color="text.mist" fontFamily="mono">
                  {item.label}
                  <Text as="span" color="brand.matrix">
                    [
                    {mode === 'record'
                      ? item.value !== undefined && item.value !== null
                        ? String(item.value)
                        : '-'
                      : item.type}
                    ]
                  </Text>
                  {item.required && (
                    <Text as="span" color="brand.alert">
                      [required]
                    </Text>
                  )}
                </Text>
              </Box>
            );
          }

          if (mode === 'criteria') {
            // Criteria mode: desc [codeBlock]
            return (
              <Box key={item.key} w="full">
                <Flex alignItems="center" gap={2}>
                  <Text color="brand.matrix">[DESC]</Text>
                  <Text color="text.neon">{item.description ?? '-'}</Text>
                </Flex>
                {item.codeBlock && (
                  <Flex alignItems="center" gap={2}>
                    <Text color="brand.matrix">[OP]</Text>
                    <SyntaxHighlighter
                      language="typescript"
                      style={oneDark}
                      customStyle={{
                        padding: 0,
                        margin: 0,
                        fontSize: 'sm',
                        fontFamily: 'mono',
                        backgroundColor: 'transparent',
                      }}
                      codeTagProps={{
                        style: {
                          color: 'var(--chakra-colors-brand-matrix)',
                        },
                      }}
                    >
                      {item.codeBlock}
                    </SyntaxHighlighter>
                  </Flex>
                )}
              </Box>
            );
          }

          return null;
        })}
      </VStack>
    </VStack>
  );
}
