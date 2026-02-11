'use client';

import { useMemo } from 'react';

import { RecordTimelineCard } from '@/client/components/log/record-timeline-card';
import { useBehaviorRecords } from '@/client/hooks/use-behavior-records';

import type {
  BehaviorCategory,
  BehaviorRecordWithDefinition,
} from '@/client/types/behavior-client';
import type { TimelineItem } from '@/client/types/timeline';

interface RecordFiltersType {
  category?: BehaviorCategory | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface UseRecordTimelineItemsProps {
  timelineStart: Date;
  timelineEnd: Date;
  recordFilters: RecordFiltersType;
  onFilterChange: (newFilters: Partial<RecordFiltersType>) => void;
  onRecordClick: (recordId: string) => void;
  blockOffset?: number;
}

export function useRecordTimelineItems({
  timelineStart,
  timelineEnd,
  recordFilters,
  onFilterChange,
  onRecordClick,
  blockOffset = 0,
}: UseRecordTimelineItemsProps): TimelineItem[] {
  const { records } = useBehaviorRecords(100, 0);

  const filteredRecords = useMemo(() => {
    return records.filter((record: BehaviorRecordWithDefinition) => {
      // Filter by time range
      const recordDate = new Date(record.recordedAt);
      if (recordDate < timelineStart || recordDate > timelineEnd) return false;

      // Filter by category
      if (recordFilters.category && recordFilters.category !== 'all') {
        if (record.behaviorDefinitions.category !== recordFilters.category) return false;
      }

      // Filter by search
      if (recordFilters.search) {
        const query = recordFilters.search.toLowerCase();
        if (!record.behaviorDefinitions.name.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [records, recordFilters, timelineStart, timelineEnd]);

  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = [];

    // Records items
    filteredRecords.forEach((record) => {
      const recordDate = new Date(record.recordedAt);
      const start = recordDate;
      const end = new Date(recordDate.getTime() + 60 * 60 * 1000);

      result.push({
        Renderer: ({ w, h, scrollContainerRef }) => (
          <RecordTimelineCard
            record={record}
            width={w}
            height={h}
            scrollContainerRef={scrollContainerRef}
            onClick={() => onRecordClick(record.id)}
          />
        ),
        h: 60,
        w: 150,
        start,
        end,
        blockOffset,
        type: 'record',
      });
    });

    return result;
  }, [
    filteredRecords,
    timelineStart,
    timelineEnd,
    recordFilters,
    onFilterChange,
    onRecordClick,
    blockOffset,
  ]);

  return items;
}
