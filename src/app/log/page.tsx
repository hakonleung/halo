'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Button,
  HStack,
  VStack,
  createListCollection,
  Card,
  Text,
  Spinner,
  Collapsible,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { GoalList } from '@/components/goals';
import { RecordFilters, type RecordFiltersType } from '@/components/history/record-filters';
import { RecordList } from '@/components/history/record-list';
import { FilterBar } from '@/components/shared/filter-bar';
import { useGoals } from '@/hooks/use-goals';
import { useBehaviorRecords } from '@/hooks/use-behavior-records';
import { useNotes } from '@/hooks/use-notes';
import type { Note } from '@/types/note-client';
import type { GetGoalsParams } from '@/hooks/use-goals';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';
import { useActionDrawerStore } from '@/store/action-drawer-store';
import { ActionDrawerTab } from '@/types/drawer';

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
  const { openDrawer } = useActionDrawerStore();

  // Collapse states
  const [goalsCollapsed, setGoalsCollapsed] = useState(false);
  const [recordsCollapsed, setRecordsCollapsed] = useState(false);
  const [notesCollapsed, setNotesCollapsed] = useState(false);

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

  // Records state
  const [recordFilters, setRecordFilters] = useState<RecordFiltersType>({
    category: 'all',
    search: '',
  });
  const { records, isLoading: recordsLoading, error: recordsError } = useBehaviorRecords(100, 0);

  // Filter records
  const filteredRecords = records.filter((record: BehaviorRecordWithDefinition) => {
    // Category filter
    if (recordFilters.category && recordFilters.category !== 'all') {
      if (record.behaviorDefinitions.category !== recordFilters.category) return false;
    }

    // Search filter
    if (recordFilters.search) {
      const searchLower = recordFilters.search.toLowerCase();
      const matchesName = record.behaviorDefinitions.name.toLowerCase().includes(searchLower);
      const matchesNote = record.note?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesNote) return false;
    }

    // Date filters
    if (recordFilters.startDate) {
      if (record.recordedAt < recordFilters.startDate) return false;
    }
    if (recordFilters.endDate) {
      if (record.recordedAt > recordFilters.endDate) return false;
    }

    return true;
  });

  // Notes state
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteTagFilter, setNoteTagFilter] = useState<string>('all');
  const { data: notesData, isLoading: notesLoading } = useNotes();
  const allNotes = notesData || [];

  // Get all unique tags from notes
  const allTags = Array.from(new Set(allNotes.flatMap((note) => note.tags || []))).sort();

  // Filter notes
  const filteredNotes = allNotes.filter((note) => {
    // Search filter
    if (noteSearchQuery) {
      const searchLower = noteSearchQuery.toLowerCase();
      const matchesTitle = note.title?.toLowerCase().includes(searchLower);
      const matchesContent = note.content.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesContent) return false;
    }

    // Tag filter
    if (noteTagFilter !== 'all') {
      if (!note.tags || !note.tags.includes(noteTagFilter)) return false;
    }

    return true;
  });

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

  const handleRecordFilterChange = (newFilters: Partial<RecordFiltersType>) => {
    setRecordFilters((prev: RecordFiltersType) => ({ ...prev, ...newFilters }));
  };

  return (
    <AuthenticatedLayout>
      <Container maxW="1400px" py={2} display="flex" flexDirection="column">
        <VStack gap={2} align="stretch" h="full" overflow="hidden">
          {/* Goals Section */}
          <Box flexShrink={0}>
            <Card.Root size="sm">
              <Card.Body p={2}>
                <HStack justify="space-between" align="center" mb={1}>
                  <HStack gap={2}>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      onClick={() => setGoalsCollapsed(!goalsCollapsed)}
                      aria-label={goalsCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {goalsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </IconButton>
                    <Text fontSize="sm" fontWeight="bold" color="text.neon" fontFamily="mono">
                      GOALS
                    </Text>
                  </HStack>
                  <Button
                    size="xs"
                    colorScheme="green"
                    onClick={() => openDrawer(ActionDrawerTab.Goal)}
                  >
                    + Add
                  </Button>
                </HStack>
                <Collapsible.Root open={!goalsCollapsed}>
                  <Collapsible.Content>
                    <Box mb={1}>
                      <FilterBar
                        filters={[
                          {
                            key: 'status',
                            type: 'select',
                            placeholder: 'Status',
                            options: statusOptions.items,
                            value: goalFilters.status || 'all',
                            minW: '100px',
                          },
                          {
                            key: 'category',
                            type: 'select',
                            placeholder: 'Category',
                            options: categoryOptions.items,
                            value: goalFilters.category || 'all',
                            minW: '100px',
                          },
                          {
                            key: 'search',
                            type: 'search',
                            placeholder: 'Search...',
                            value: goalSearchQuery,
                            maxW: '150px',
                          },
                        ]}
                        onChange={(key, value) => {
                          if (key === 'search') {
                            setGoalSearchQuery(value);
                          } else if (key === 'status' || key === 'category') {
                            handleGoalFilterChange(key, value);
                          }
                        }}
                        compact
                      />
                    </Box>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Body>
            </Card.Root>
          </Box>
          <Collapsible.Root open={!goalsCollapsed}>
            <Collapsible.Content>
              <Box
                as="section"
                flex={goalsCollapsed ? 0 : 1}
                minH={goalsCollapsed ? '120px' : 0}
                maxH={goalsCollapsed ? '120px' : 'none'}
                overflowY="auto"
              >
                <GoalList goals={filteredGoals} isLoading={goalsLoading} />
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Records Section */}
          <Box flexShrink={0}>
            <Card.Root size="sm">
              <Card.Body p={2}>
                <HStack justify="space-between" align="center" mb={1}>
                  <HStack gap={2}>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      onClick={() => setRecordsCollapsed(!recordsCollapsed)}
                      aria-label={recordsCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {recordsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </IconButton>
                    <Text fontSize="sm" fontWeight="bold" color="text.neon" fontFamily="mono">
                      RECORDS
                    </Text>
                  </HStack>
                  <Button
                    size="xs"
                    colorScheme="green"
                    onClick={() => openDrawer(ActionDrawerTab.Record)}
                  >
                    + Add
                  </Button>
                </HStack>
                <Collapsible.Root open={!recordsCollapsed}>
                  <Collapsible.Content>
                    <Box mb={1}>
                      <RecordFilters
                        filters={recordFilters}
                        onFilterChange={handleRecordFilterChange}
                      />
                    </Box>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Body>
            </Card.Root>
          </Box>
          <Collapsible.Root open={!recordsCollapsed}>
            <Collapsible.Content>
              <Box
                as="section"
                flex={recordsCollapsed ? 0 : 1}
                minH={recordsCollapsed ? '120px' : 0}
                maxH={recordsCollapsed ? '120px' : 'none'}
                overflowY="auto"
              >
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
                      Error: {recordsError || 'Unknown error'}
                    </Text>
                  </Box>
                ) : (
                  <RecordList records={filteredRecords} isLoading={recordsLoading} />
                )}
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Notes Section */}
          <Box flexShrink={0}>
            <Card.Root size="sm">
              <Card.Body p={2}>
                <HStack justify="space-between" align="center" mb={1}>
                  <HStack gap={2}>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      onClick={() => setNotesCollapsed(!notesCollapsed)}
                      aria-label={notesCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {notesCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </IconButton>
                    <Text fontSize="sm" fontWeight="bold" color="text.neon" fontFamily="mono">
                      NOTES
                    </Text>
                  </HStack>
                  <Button
                    size="xs"
                    colorScheme="green"
                    onClick={() => openDrawer(ActionDrawerTab.Note)}
                  >
                    + Add
                  </Button>
                </HStack>
                <Collapsible.Root open={!notesCollapsed}>
                  <Collapsible.Content>
                    <Box mb={1}>
                      <FilterBar
                        filters={[
                          {
                            key: 'tag',
                            type: 'select',
                            placeholder: 'Tag',
                            options: [
                              { label: 'All Tags', value: 'all' },
                              ...allTags.map((tag) => ({ label: `#${tag}`, value: tag })),
                            ],
                            value: noteTagFilter,
                            minW: '100px',
                          },
                          {
                            key: 'search',
                            type: 'search',
                            placeholder: 'Search...',
                            value: noteSearchQuery,
                            maxW: '150px',
                          },
                        ]}
                        onChange={(key, value) => {
                          if (key === 'search') {
                            setNoteSearchQuery(value);
                          } else if (key === 'tag') {
                            setNoteTagFilter(value);
                          }
                        }}
                        compact
                      />
                    </Box>
                  </Collapsible.Content>
                </Collapsible.Root>
              </Card.Body>
            </Card.Root>
          </Box>
          <Collapsible.Root open={!notesCollapsed}>
            <Collapsible.Content>
              <Box
                as="section"
                flex={notesCollapsed ? 0 : 1}
                minH={notesCollapsed ? '120px' : 0}
                maxH={notesCollapsed ? '120px' : 'none'}
                overflowY="auto"
              >
                {notesLoading ? (
                  <HStack justify="center" py={20}>
                    <Spinner size="xl" color="brand.matrix" />
                  </HStack>
                ) : allNotes.length === 0 ? (
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
                ) : filteredNotes.length === 0 ? (
                  <Card.Root size="lg" borderStyle="dashed">
                    <Card.Body textAlign="center">
                      <VStack gap={2}>
                        <Text color="text.mist" fontFamily="mono" fontSize="lg">
                          No Notes Found
                        </Text>
                        <Text color="brand.matrix" fontFamily="mono" fontSize="sm">
                          {noteSearchQuery || noteTagFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create Your First Note'}
                        </Text>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ) : (
                  <VStack gap={4} align="stretch">
                    {filteredNotes.map((note: Note) => (
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
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="text.neon"
                                fontFamily="mono"
                              >
                                {note.title}
                              </Text>
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
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}
