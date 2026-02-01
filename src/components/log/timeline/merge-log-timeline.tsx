'use client';

import { useMemo, useState } from 'react';
import { Box, Spinner, VStack, Card, Text } from '@chakra-ui/react';
import type { TimeRange } from '@/types/dashboard-client';
import { timeRangeToDateRange } from '@/utils/time-range';
import { TimelineView } from '@/components/shared/timeline-view';
import { useGoalTimelineItems } from '@/hooks/use-goal-timeline-items';
import { useRecordTimelineItems } from '@/hooks/use-record-timeline-items';
import { useNoteTimelineItems } from '@/hooks/use-note-timeline-items';
import { useGoals, type GetGoalsParams } from '@/hooks/use-goals';
import { useBehaviorRecords } from '@/hooks/use-behavior-records';
import { useNotes } from '@/hooks/use-notes';
import type { RecordFiltersType } from '@/components/log/record-filters';
import { FilterBar } from '@/components/shared/filter-bar';
import { RecordFilters } from '@/components/log/record-filters';
import { createListCollection } from '@chakra-ui/react';

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

interface MergeLogTimelineProps {
  timeRange: TimeRange;
}

export function MergeLogTimeline({ timeRange }: MergeLogTimelineProps) {
  // Goals filters
  const [goalFilters, setGoalFilters] = useState<Partial<GetGoalsParams>>({});
  const [goalSearchQuery, setGoalSearchQuery] = useState('');

  // Records filters
  const [recordFilters, setRecordFilters] = useState<RecordFiltersType>({
    category: 'all',
    search: '',
  });

  // Notes filters
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteTagFilter, setNoteTagFilter] = useState<string>('all');

  // Convert timeRange to startDate/endDate
  const { startDate: globalStartDate, endDate: globalEndDate } = useMemo(
    () => timeRangeToDateRange(timeRange),
    [timeRange],
  );

  // Fetch data for loading state
  const { isLoading: goalsLoading } = useGoals(goalFilters);
  const { isLoading: recordsLoading } = useBehaviorRecords(100, 0);
  const { isLoading: notesLoading } = useNotes();
  const { data: notesData } = useNotes();
  const allNotes = notesData || [];

  // Get all unique tags from notes
  const allTags = useMemo(
    () => Array.from(new Set(allNotes.flatMap((note) => note.tags || []))).sort(),
    [allNotes],
  );

  const noteTagOptions = useMemo(
    () => [
      { label: 'All Tags', value: 'all' },
      ...allTags.map((tag) => ({ label: `#${tag}`, value: tag })),
    ],
    [allTags],
  );

  // Calculate timeline range
  const timelineStart = useMemo(() => {
    const start = new Date(globalStartDate);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [globalStartDate]);

  const timelineEnd = useMemo(() => {
    const end = new Date(globalEndDate);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [globalEndDate]);

  // Handlers
  const handleGoalFilterChange = (key: string, value: string) => {
    if (key === 'search') {
      setGoalSearchQuery(value);
    } else if (key === 'status' || key === 'category') {
      if (value === 'all') {
        setGoalFilters((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        setGoalFilters((prev) => ({ ...prev, [key]: value }));
      }
    }
  };

  const handleGoalClick = (goalId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('goal', goalId);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  };

  const handleRecordClick = (recordId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('record', recordId);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  };

  const handleNoteClick = (noteId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('note', noteId);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  };

  const handleNoteFilterChange = (key: string, value: string) => {
    if (key === 'search') {
      setNoteSearchQuery(value);
    } else if (key === 'tag') {
      setNoteTagFilter(value);
    }
  };

  // Get timeline items using hooks (without filters, no block offset)
  const goalItems = useGoalTimelineItems({
    timelineStart,
    timelineEnd,
    goalFilters,
    goalSearchQuery,
    onFilterChange: handleGoalFilterChange,
    onGoalClick: handleGoalClick,
    blockOffset: 0,
    includeFilter: false,
  });

  const recordItems = useRecordTimelineItems({
    timelineStart,
    timelineEnd,
    recordFilters,
    onFilterChange: (newFilters) => setRecordFilters((prev) => ({ ...prev, ...newFilters })),
    onRecordClick: handleRecordClick,
    blockOffset: 0,
    includeFilter: false,
  });

  const noteItems = useNoteTimelineItems({
    timelineStart,
    timelineEnd,
    globalStartDate,
    globalEndDate,
    noteSearchQuery,
    noteTagFilter,
    allTags,
    onFilterChange: handleNoteFilterChange,
    onNoteClick: handleNoteClick,
    blockOffset: 0,
    includeFilter: false,
  });

  // Combine all items (merged, no block separation)
  const timelineItems = useMemo(() => {
    return [...goalItems, ...recordItems, ...noteItems];
  }, [goalItems, recordItems, noteItems]);

  const isLoading = goalsLoading || recordsLoading || notesLoading;

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" color="brand.matrix" />
      </Box>
    );
  }

  return (
    <VStack gap={2} align="stretch" h="100%">
      {/* Filters at the top */}
      <Card.Root size="sm">
        <Card.Body p={2}>
          <VStack gap={3} align="stretch">
            <Box>
              <Text fontSize="xs" color="text.mist" fontFamily="mono" mb={1}>
                GOALS
              </Text>
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
                onChange={handleGoalFilterChange}
              />
            </Box>
            <Box>
              <Text fontSize="xs" color="text.mist" fontFamily="mono" mb={1}>
                RECORDS
              </Text>
              <RecordFilters
                filters={recordFilters}
                onFilterChange={(newFilters) =>
                  setRecordFilters((prev) => ({ ...prev, ...newFilters }))
                }
                hideDatePickers={true}
              />
            </Box>
            <Box>
              <Text fontSize="xs" color="text.mist" fontFamily="mono" mb={1}>
                NOTES
              </Text>
              <FilterBar
                filters={[
                  {
                    key: 'search',
                    type: 'search',
                    placeholder: 'Search...',
                    value: noteSearchQuery,
                    maxW: '150px',
                  },
                  {
                    key: 'tag',
                    type: 'select',
                    placeholder: 'Tag',
                    options: noteTagOptions,
                    value: noteTagFilter,
                    minW: '100px',
                  },
                ]}
                onChange={handleNoteFilterChange}
              />
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Merged timeline */}
      <Box flex={1} minH="400px" overflow="hidden">
        <TimelineView
          items={timelineItems}
          start={timelineStart}
          end={timelineEnd}
          laneHeight={80}
          minItemWidth={100}
        />
      </Box>
    </VStack>
  );
}
