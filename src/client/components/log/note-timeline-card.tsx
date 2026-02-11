'use client';

import { Text, HStack, VStack, Card, Box } from '@chakra-ui/react';

import { useViewportPosition } from '@/client/hooks/use-viewport-position';

import type { Note } from '@/client/types/note-client';
import type React from 'react';

interface NoteTimelineCardProps {
  note: Note;
  onClick?: () => void;
  width: number;
  height: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function NoteTimelineCard({
  note,
  onClick,
  width,
  height,
  scrollContainerRef,
}: NoteTimelineCardProps) {
  const { translateX, contentRef } = useViewportPosition(scrollContainerRef);

  return (
    <Card.Root
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      borderColor="cyber/30"
      w={`${width}px`}
      h={`${height}px`}
      _hover={{
        borderColor: 'brand.cyber',
        boxShadow: 'cyber',
      }}
    >
      <Card.Body h="100%" display="flex" alignItems="center" justifyContent="center">
        <Box
          ref={contentRef}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap={1}
          maxW="100%"
          w="auto"
          alignItems="center"
          transform={`translateX(${translateX}px)`}
          transition="transform 0.1s ease-out"
        >
          <VStack align="center" gap={0.5} flex={1} overflow="hidden" w="100%">
            {note.title ? (
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="text.neon"
                fontFamily="mono"
                lineClamp={1}
                w="100%"
              >
                {note.title}
              </Text>
            ) : (
              <Text
                fontSize="xs"
                fontWeight="bold"
                color="text.mist"
                fontFamily="mono"
                lineClamp={1}
                w="100%"
              >
                Untitled
              </Text>
            )}
            <Text
              fontSize="2xs"
              color="text.mist"
              lineClamp={2}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {note.content}
            </Text>
          </VStack>
          {note.tags && note.tags.length > 0 && (
            <HStack justify="center" align="center" gap={0.5} flexWrap="wrap">
              {note.tags.slice(0, 2).map((tag) => (
                <Text key={tag} fontSize="2xs" color="brand.cyber" fontFamily="mono">
                  #{tag}
                </Text>
              ))}
            </HStack>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
