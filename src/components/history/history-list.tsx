'use client';

import {
  Box,
  Table,
  Text,
  Badge,
  HStack,
  IconButton,
  Button,
  VStack,
  Card,
} from '@chakra-ui/react';
import type { HistoryItem } from '@/types/history-client';
import { formatDistanceToNow } from 'date-fns';
import { LuPencil, LuTrash2 } from 'react-icons/lu';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';
import type { Goal } from '@/types/goal-client';
import type { Note } from '@/types/note-client';

interface HistoryListProps {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function HistoryList({ items, total, page, pageSize, onPageChange }: HistoryListProps) {
  // Safely format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  if (items.length === 0) {
    return (
      <Card.Root size="md" borderStyle="dashed" borderColor="border.subtle">
        <Card.Body py={20} textAlign="center">
          <Text color="text.mist" fontFamily="mono">
            [ NO RECORDS FOUND ]
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  const renderDataSummary = (item: HistoryItem) => {
    switch (item.type) {
      case 'behavior': {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const record = item.data as unknown as BehaviorRecordWithDefinition;
        const def = record.behaviorDefinitions;
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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const goal = item.data as unknown as Goal;
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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const note = item.data as unknown as Note;
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
    <VStack align="stretch" gap={3}>
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
                    {formatDate(item.createdAt)}
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
                    <IconButton
                      variant="ghost"
                      size="xs"
                      aria-label="Edit"
                      onClick={() => {
                        // Add query parameter based on item type
                        const url = new URL(window.location.href);
                        if (item.type === 'goal') {
                          url.searchParams.set('goal', item.id);
                        } else if (item.type === 'behavior') {
                          url.searchParams.set('record', item.id);
                        }
                        window.history.pushState({}, '', url.toString());
                        window.dispatchEvent(new Event('popstate'));
                      }}
                    >
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
