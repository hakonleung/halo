'use client';

import { useMemo } from 'react';
import type { TimelineItem } from '@/components/shared/timeline-view';
import { RecordTimelineCard } from '@/components/history/record-timeline-card';
import { FilterTimelineCard } from '@/components/log/filter-timeline-card';
import { RecordFilters, type RecordFiltersType } from '@/components/history/record-filters';
import { useBehaviorRecords } from '@/hooks/use-behavior-records';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';

interface UseRecordTimelineItemsProps {
  timelineStart: Date;
  timelineEnd: Date;
  recordFilters: RecordFiltersType;
  onFilterChange: (newFilters: Partial<RecordFiltersType>) => void;
  onRecordClick: (recordId: string) => void;
  blockOffset?: number;
  includeFilter?: boolean;
}

export function useRecordTimelineItems({
  timelineStart,
  timelineEnd,
  recordFilters,
  onFilterChange,
  onRecordClick,
  blockOffset = 0,
  includeFilter = true,
}: UseRecordTimelineItemsProps): TimelineItem[] {
  const { records } = useBehaviorRecords(100, 0);

  const filteredRecords = useMemo(() => {
    return records.filter((record: BehaviorRecordWithDefinition) => {
      if (recordFilters.category && recordFilters.category !== 'all') {
        if (record.behaviorDefinitions.category !== recordFilters.category) return false;
      }
      if (recordFilters.search) {
        const query = recordFilters.search.toLowerCase();
        if (!record.behaviorDefinitions.name.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [records, recordFilters]);

  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = [];

    // Filter as first item if needed
    if (includeFilter) {
      result.push({
        Renderer: ({ w, h, scrollContainerRef }) => (
          <FilterTimelineCard width={w} height={h} scrollContainerRef={scrollContainerRef}>
            <RecordFilters
              filters={recordFilters}
              onFilterChange={onFilterChange}
              hideDatePickers={true}
            />
          </FilterTimelineCard>
        ),
        h: 60,
        w: 400,
        start: timelineStart,
        end: timelineEnd,
        blockOffset,
      });
    }

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
    includeFilter,
  ]);

  return items;
}
