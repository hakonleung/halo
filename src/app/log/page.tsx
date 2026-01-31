'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  VStack,
  Select,
  createListCollection,
  Input,
  Portal,
  Card,
  Tabs,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { GoalList } from '@/components/goals';
import { HistoryList } from '@/components/history/history-list';
import { HistoryFilters } from '@/components/history/history-filters';
import { useGoals } from '@/hooks/use-goals';
import { useHistory } from '@/hooks/use-history';
import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/types/note-client';
import type { GetGoalsParams } from '@/hooks/use-goals';
import type { HistoryListRequest } from '@/types/history-client';
import { SortOrder } from '@/types/history-server';
import { useActionDrawer } from '@/components/shared/action-drawer-context';

const statusOptions = createListCollection({
  items: [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Abandoned', value: 'abandoned' },
  ],
});

const categoryOptions = createListCollection({
  items: [
    { label: 'All Categories', value: 'all' },
    { label: 'Health', value: 'health' },
    { label: 'Finance', value: 'finance' },
    { label: 'Habit', value: 'habit' },
    { label: 'Learning', value: 'learning' },
    { label: 'Other', value: 'other' },
  ],
});

export default function LogPage() {
  const { openDrawer } = useActionDrawer();
  const [activeTab, setActiveTab] = useState<'goals' | 'records' | 'notes'>('goals');

  // Goals state
  const [goalFilters, setGoalFilters] = useState<GetGoalsParams>({
    sort: 'created_at',
    order: 'desc',
  });
  const [goalSearchQuery, setGoalSearchQuery] = useState('');
  const { goals, isLoading: goalsLoading } = useGoals(goalFilters);
  const filteredGoals = goalSearchQuery
    ? goals.filter((goal) => goal.name.toLowerCase().includes(goalSearchQuery.toLowerCase()))
    : goals;

  // Records state (from history)
  const [recordFilters, setRecordFilters] = useState<HistoryListRequest>({
    type: 'all',
    page: 1,
    pageSize: 20,
    sortOrder: SortOrder.Desc,
  });
  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
  } = useHistory(recordFilters);

  // Notes state
  const { data: notesData, isLoading: notesLoading } = useNotes();
  const notes = notesData || [];

  const handleGoalFilterChange = (key: keyof GetGoalsParams, value: string) => {
    if (value === 'all') {
      setGoalFilters((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setGoalFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleRecordFilterChange = (newFilters: Partial<HistoryListRequest>) => {
    setRecordFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleRecordPageChange = (newPage: number) => {
    setRecordFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <AuthenticatedLayout>
      <Container maxW="1400px" py={6}>
        <VStack gap={6} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between" align="center">
            <Heading fontSize="32px" color="text.neon" fontFamily="mono">
              LOG
            </Heading>
            <Button colorScheme="green" onClick={() => openDrawer('record')}>
              + Add Entry
            </Button>
          </HStack>

          {/* Tabs */}
          <Tabs.Root
            value={activeTab}
            onValueChange={(e) => {
              const value = e.value;
              if (value === 'goals' || value === 'records' || value === 'notes') {
                setActiveTab(value);
              }
            }}
          >
            <Tabs.List>
              <Tabs.Trigger value="goals">Goals</Tabs.Trigger>
              <Tabs.Trigger value="records">Records</Tabs.Trigger>
              <Tabs.Trigger value="notes">Notes</Tabs.Trigger>
            </Tabs.List>

            {/* Goals Tab */}
            <Tabs.Content value="goals">
              <VStack gap={6} align="stretch">
                {/* Filters */}
                <Card.Root size="md">
                  <Card.Body>
                    <HStack gap={4} wrap="wrap">
                      <Box minW="200px">
                        <Select.Root
                          collection={statusOptions}
                          value={[goalFilters.status || 'all']}
                          onValueChange={(e) => {
                            const value = e.value[0];
                            if (typeof value === 'string') {
                              handleGoalFilterChange('status', value);
                            }
                          }}
                        >
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select Status" />
                          </Select.Trigger>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                                {statusOptions.items.map((item) => (
                                  <Select.Item item={item} key={item.value}>
                                    {item.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      </Box>

                      <Box minW="200px">
                        <Select.Root
                          collection={categoryOptions}
                          value={[goalFilters.category || 'all']}
                          onValueChange={(e) => {
                            const value = e.value[0];
                            if (typeof value === 'string') {
                              handleGoalFilterChange('category', value);
                            }
                          }}
                        >
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select Category" />
                          </Select.Trigger>
                          <Portal>
                            <Select.Positioner>
                              <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                                {categoryOptions.items.map((item) => (
                                  <Select.Item item={item} key={item.value}>
                                    {item.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      </Box>

                      <Input
                        placeholder="Search goal name..."
                        value={goalSearchQuery}
                        onChange={(e) => setGoalSearchQuery(e.target.value)}
                        maxW="300px"
                      />
                    </HStack>
                  </Card.Body>
                </Card.Root>

                {/* Goal List */}
                <GoalList goals={filteredGoals} isLoading={goalsLoading} />
              </VStack>
            </Tabs.Content>

            {/* Records Tab */}
            <Tabs.Content value="records">
              <VStack gap={6} align="stretch">
                <HistoryFilters filters={recordFilters} onFilterChange={handleRecordFilterChange} />

                {recordsLoading ? (
                  <HStack justify="center" py={20}>
                    <Spinner size="xl" color="brand.matrix" />
                  </HStack>
                ) : recordsError ? (
                  <Box
                    p={4}
                    bg="rgba(255, 51, 102, 0.1)"
                    border="1px solid"
                    borderColor="red.500"
                    borderRadius="4px"
                  >
                    <Text color="red.500" fontFamily="mono">
                      Error:{' '}
                      {recordsError instanceof Error ? recordsError.message : String(recordsError)}
                    </Text>
                  </Box>
                ) : (
                  <HistoryList
                    items={recordsData?.items || []}
                    total={recordsData?.total || 0}
                    page={recordFilters.page || 1}
                    pageSize={recordFilters.pageSize || 20}
                    onPageChange={handleRecordPageChange}
                  />
                )}
              </VStack>
            </Tabs.Content>

            {/* Notes Tab */}
            <Tabs.Content value="notes">
              <VStack gap={6} align="stretch">
                {notesLoading ? (
                  <HStack justify="center" py={20}>
                    <Spinner size="xl" color="brand.matrix" />
                  </HStack>
                ) : !notes || notes.length === 0 ? (
                  <Card.Root size="lg" borderStyle="dashed">
                    <Card.Body textAlign="center">
                      <VStack gap={2}>
                        <Text color="text.mist" fontFamily="mono" fontSize="lg">
                          No Notes
                        </Text>
                        <Text color="brand.matrix" fontFamily="mono" fontSize="sm">
                          Create Your First Note
                        </Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ) : (
                  <VStack gap={4} align="stretch">
                    {notes.map((note: Note) => (
                      <Card.Root
                        key={note.id}
                        size="md"
                        cursor="pointer"
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.searchParams.set('note', note.id);
                          window.history.pushState({}, '', url.toString());
                          window.dispatchEvent(new Event('popstate'));
                        }}
                        _hover={{
                          borderColor: 'brand.matrix',
                          boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
                        }}
                      >
                        <Card.Body>
                          <VStack align="flex-start" gap={2}>
                            {note.title && (
                              <Heading fontSize="lg" color="text.neon" fontFamily="mono">
                                {note.title}
                              </Heading>
                            )}
                            <Text color="text.mist">{note.content}</Text>
                            {note.tags && note.tags.length > 0 && (
                              <HStack gap={2} flexWrap="wrap">
                                {note.tags.map((tag: string) => (
                                  <Text
                                    key={tag}
                                    fontSize="xs"
                                    color="brand.matrix"
                                    fontFamily="mono"
                                    px={2}
                                    py={1}
                                    bg="rgba(0, 255, 65, 0.1)"
                                    borderRadius="4px"
                                  >
                                    #{tag}
                                  </Text>
                                ))}
                              </HStack>
                            )}
                            <Text fontSize="xs" color="text.dim" fontFamily="mono">
                              {new Date(note.createdAt).toLocaleString('en-US')}
                            </Text>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}
