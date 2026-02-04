'use client';

import { useMemo, useState } from 'react';
import { Box, HStack, Spinner, VStack } from '@chakra-ui/react';
import type { TimeRange } from '@/client/types/dashboard-client';
import { timeRangeToDateRange } from '@/client/utils/time-range';
import { TimelineView } from '@/client/components/shared/timeline';
import { useGoalTimelineItems } from '@/client/components/log/use-goal-timeline-items';
import { useRecordTimelineItems } from '@/client/components/log/use-record-timeline-items';
import { useNoteTimelineItems } from '@/client/components/log/use-note-timeline-items';
import { useGoals } from '@/client/hooks/use-goals';
import { useBehaviorRecords } from '@/client/hooks/use-behavior-records';
import { useNotes } from '@/client/hooks/use-notes';
import type { FilterGroup } from '@/client/types/filter';
import type { GoalCategory, GoalStatus } from '@/client/types/goal-client';
import type { BehaviorCategory } from '@/server/types/behavior-server';
import { FilterGroups } from '@/client/components/shared/filter-groups';
import { DateRangePicker } from '../shared/date-range-picker';

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function MergeLogTimeline() {
  // Initialize with last 7 days
  const initialTimeRange = useMemo<TimeRange>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return {
      type: 'custom',
      start: formatDate(sevenDaysAgo),
      end: formatDate(today),
    };
  }, []);

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  // Global Consolidated State
  const [activeFilters, setActiveFilters] = useState<{
    search: string;
    dataType: 'all' | 'goal' | 'record' | 'note';
    goalStatus: 'all' | GoalStatus;
    goalCategory: 'all' | GoalCategory;
    recordCategory: 'all' | BehaviorCategory;
    noteTag: 'all' | string;
  }>({
    search: '',
    dataType: 'all',
    goalStatus: 'all',
    goalCategory: 'all',
    recordCategory: 'all',
    noteTag: 'all',
  });

  // Convert timeRange to startDate/endDate
  const { startDate: globalStartDate, endDate: globalEndDate } = useMemo(
    () => timeRangeToDateRange(timeRange),
    [timeRange],
  );

  // Fetch data
  const { isLoading: goalsLoading } = useGoals({});
  const { isLoading: recordsLoading } = useBehaviorRecords(100, 0);
  const { data: notesData, isLoading: notesLoading } = useNotes();
  const allNotes = notesData || [];

  // Get all unique tags from notes
  const allTags = useMemo(
    () => Array.from(new Set(allNotes.flatMap((note) => note.tags || []))).sort(),
    [allNotes],
  );

  // Filter Groups Config
  const filterGroups = useMemo<FilterGroup[]>(() => {
    return [
      {
        id: 'general',
        label: 'General',
        filters: [
          {
            type: 'search',
            id: 'search',
            label: 'Search',
          },
          {
            type: 'select',
            id: 'dataType',
            label: 'Data Type',
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Goals', value: 'goal' },
              { label: 'Records', value: 'record' },
              { label: 'Notes', value: 'note' },
            ],
          },
        ],
      },
      {
        id: 'goals',
        label: 'Goals',
        filters: [
          {
            type: 'select',
            id: 'goalStatus',
            label: 'Status',
            options: [
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Completed', value: 'completed' },
              { label: 'Abandoned', value: 'abandoned' },
            ],
          },
          {
            type: 'select',
            id: 'goalCategory',
            label: 'Category',
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Health', value: 'health' },
              { label: 'Finance', value: 'finance' },
              { label: 'Habit', value: 'habit' },
              { label: 'Learning', value: 'learning' },
              { label: 'Other', value: 'other' },
            ],
          },
        ],
      },
      {
        id: 'records',
        label: 'Records',
        filters: [
          {
            type: 'select',
            id: 'recordCategory',
            label: 'Category',
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Health', value: 'health' },
              { label: 'Expense', value: 'expense' },
              { label: 'Income', value: 'income' },
              { label: 'Habit', value: 'habit' },
              { label: 'Other', value: 'other' },
            ],
          },
        ],
      },
      {
        id: 'notes',
        label: 'Notes',
        filters: [
          {
            type: 'select',
            id: 'noteTag',
            label: 'Tag',
            options: [
              { label: 'All Tags', value: 'all' },
              ...allTags.map((tag) => ({ label: `#${tag}`, value: tag })),
            ],
          },
        ],
      },
    ];
  }, [allTags]);

  // Handlers
  const handleFilterChange = (id: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleItemClick = (type: 'goal' | 'record' | 'note', id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(type, id);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('popstate'));
  };

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

  // Map filters to specific item hooks
  const goalItems = useGoalTimelineItems({
    timelineStart,
    timelineEnd,
    goalFilters: {
      status: activeFilters.goalStatus === 'all' ? undefined : activeFilters.goalStatus,
      category: activeFilters.goalCategory === 'all' ? undefined : activeFilters.goalCategory,
    },
    goalSearchQuery: activeFilters.search,
    onFilterChange: () => {}, // Handled globally
    onGoalClick: (id) => handleItemClick('goal', id),
    blockOffset: 0,
  });

  const recordItems = useRecordTimelineItems({
    timelineStart,
    timelineEnd,
    recordFilters: {
      category: activeFilters.recordCategory === 'all' ? undefined : activeFilters.recordCategory,
      search: activeFilters.search,
    },
    onFilterChange: () => {}, // Handled globally
    onRecordClick: (id) => handleItemClick('record', id),
    blockOffset: 0,
  });

  const noteItems = useNoteTimelineItems({
    timelineStart,
    timelineEnd,
    globalStartDate,
    globalEndDate,
    noteSearchQuery: activeFilters.search,
    noteTagFilter: activeFilters.noteTag,
    allTags,
    onFilterChange: () => {}, // Handled globally
    onNoteClick: (id) => handleItemClick('note', id),
    blockOffset: 0,
  });

  // Combine and filter by Data Type
  const timelineItems = useMemo(() => {
    let items = [...goalItems, ...recordItems, ...noteItems];

    if (activeFilters.dataType !== 'all') {
      items = items.filter((item) => {
        if (activeFilters.dataType === 'goal') return item.type === 'goal';
        if (activeFilters.dataType === 'record') return item.type === 'record';
        if (activeFilters.dataType === 'note') return item.type === 'note';
        return true;
      });
    }

    return items;
  }, [goalItems, recordItems, noteItems, activeFilters.dataType]);

  const isLoading = goalsLoading || recordsLoading || notesLoading;

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner color="brand.matrix" />
      </Box>
    );
  }

  return (
    <VStack gap={2} align="stretch" flex={1} overflow="hidden">
      <Box flexShrink={0}>
        <HStack flexWrap="wrap">
          <DateRangePicker value={timeRange} onChange={setTimeRange} />
          <FilterGroups
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            groups={filterGroups}
          />
        </HStack>
      </Box>
      <TimelineView
        items={timelineItems}
        start={timelineStart}
        end={timelineEnd}
        laneHeight={80}
        minItemWidth={100}
      />
    </VStack>
  );
}
