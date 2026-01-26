'use client';

import { Box, Table, Text, Badge, HStack, IconButton, Button, VStack } from '@chakra-ui/react';
import type { HistoryItem } from '@/types/history-client';
import { formatDistanceToNow } from 'date-fns';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-server';
import type { Goal } from '@/types/goal-server';
import type { Note } from '@/types/note-server';

interface HistoryListProps {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function HistoryList({ items, total, page, pageSize, onPageChange }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <Box
        py={20}
        textAlign="center"
        border="1px dashed"
        borderColor="border.subtle"
        borderRadius="4px"
      >
        <Text color="text.mist" fontFamily="mono">
          [ NO RECORDS FOUND ]
        </Text>
      </Box>
    );
  }

  const renderDataSummary = (item: HistoryItem) => {
    switch (item.type) {
      case 'behavior': {
        const record = item.data as BehaviorRecordWithDefinition;
        const def = record.behavior_definitions;
        return (
          <HStack gap={2}>
            <Text fontWeight="bold">{def?.name}</Text>
            <Text color="text.mist" fontSize="xs">
              {Object.entries(record.metadata)
                .map(([key, val]) => `${key}: ${val}`)
                .join(', ')}
            </Text>
          </HStack>
        );
      }
      case 'goal': {
        const goal = item.data as Goal;
        return (
          <VStack align="start" gap={0}>
            <Text fontWeight="bold">{goal.name}</Text>
            <Text color="text.mist" fontSize="xs" lineClamp={1}>
              {goal.description}
            </Text>
          </VStack>
        );
      }
      case 'note': {
        const note = item.data as Note;
        return (
          <VStack align="start" gap={0}>
            <Text fontWeight="bold">{note.title || 'Untitled Note'}</Text>
            <Text color="text.mist" fontSize="xs" lineClamp={1}>
              {note.content}
            </Text>
          </VStack>
        );
      }
      default:
        return null;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'behavior':
        return 'green';
      case 'goal':
        return 'blue';
      case 'note':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <VStack align="stretch" gap={4}>
      <Box overflowX="auto">
        <Table.Root size="sm" variant="line">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader color="text.mist" fontFamily="mono">
                TIME
              </Table.ColumnHeader>
              <Table.ColumnHeader color="text.mist" fontFamily="mono">
                TYPE
              </Table.ColumnHeader>
              <Table.ColumnHeader color="text.mist" fontFamily="mono">
                DETAILS
              </Table.ColumnHeader>
              <Table.ColumnHeader color="text.mist" fontFamily="mono" textAlign="right">
                ACTIONS
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={`${item.type}-${item.id}`} _hover={{ bg: 'rgba(0, 255, 65, 0.02)' }}>
                <Table.Cell whiteSpace="nowrap">
                  <Text fontSize="xs" fontFamily="mono">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={getBadgeColor(item.type)} variant="outline" size="sm">
                    {item.type.toUpperCase()}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{renderDataSummary(item)}</Table.Cell>
                <Table.Cell textAlign="right">
                  <HStack gap={2} justify="flex-end">
                    <IconButton variant="ghost" size="xs" aria-label="Edit">
                      <LuPencil />
                    </IconButton>
                    <IconButton variant="ghost" size="xs" aria-label="Delete" colorPalette="red">
                      <LuTrash2 />
                    </IconButton>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <HStack justify="space-between" mt={4}>
        <Text fontSize="xs" color="text.mist" fontFamily="mono">
          TOTAL: {total} RECORDS
        </Text>
        <HStack gap={2}>
          <Button
            size="xs"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            PREV
          </Button>
          <Text fontSize="xs" fontFamily="mono">
            PAGE {page}
          </Text>
          <Button
            size="xs"
            variant="outline"
            disabled={items.length < pageSize}
            onClick={() => onPageChange(page + 1)}
          >
            NEXT
          </Button>
        </HStack>
      </HStack>
    </VStack>
  );
}
