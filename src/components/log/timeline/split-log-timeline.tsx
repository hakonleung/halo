'use client';

import { useMemo, useState } from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import type { TimeRange } from '@/types/dashboard-client';
import { timeRangeToDateRange } from '@/utils/time-range';
import { TimelineView } from '@/components/shared/timeline-view';
import { useGoalTimelineItems } from '@/components/log/timeline/use-goal-timeline-items';
import { useRecordTimelineItems } from '@/components/log/timeline/use-record-timeline-items';
import { useNoteTimelineItems } from '@/components/log/timeline/use-note-timeline-items';
import { useGoals, type GetGoalsParams } from '@/hooks/use-goals';
import { useBehaviorRecords } from '@/hooks/use-behavior-records';
import { useNotes } from '@/hooks/use-notes';
import type { RecordFiltersType } from '@/components/log/record-filters';

interface SplitLogTimelineProps {
  timeRange: TimeRange;
}

// Block offsets for different sections (used for grouping, actual y position is calculated dynamically)
const GOALS_BLOCK_OFFSET = 0;
const RECORDS_BLOCK_OFFSET = 1;
const NOTES_BLOCK_OFFSET = 2;

export function SplitLogTimeline({ timeRange }: SplitLogTimelineProps) {
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

  // Get timeline items using hooks
  const goalItems = useGoalTimelineItems({
    timelineStart,
    timelineEnd,
    goalFilters,
    goalSearchQuery,
    onFilterChange: handleGoalFilterChange,
    onGoalClick: handleGoalClick,
    blockOffset: GOALS_BLOCK_OFFSET,
    includeFilter: true,
  });

  const recordItems = useRecordTimelineItems({
    timelineStart,
    timelineEnd,
    recordFilters,
    onFilterChange: (newFilters) => setRecordFilters((prev) => ({ ...prev, ...newFilters })),
    onRecordClick: handleRecordClick,
    blockOffset: RECORDS_BLOCK_OFFSET,
    includeFilter: true,
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
    blockOffset: NOTES_BLOCK_OFFSET,
    includeFilter: true,
  });

  // Combine all items
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
    <Box w="100%" h="100%">
      <TimelineView
        items={timelineItems}
        start={timelineStart}
        end={timelineEnd}
        laneHeight={80}
        minItemWidth={100}
      />
    </Box>
  );
}
