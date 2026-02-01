'use client';

import { useMemo } from 'react';
import type { TimelineItem } from '@/components/shared/timeline-view';
import { GoalTimelineCard } from '@/components/goals/goal-timeline-card';
import { FilterTimelineCard } from '@/components/log/timeline/filter-timeline-card';
import { FilterBar } from '@/components/shared/filter-bar';
import { useGoals, type GetGoalsParams } from '@/hooks/use-goals';
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

interface UseGoalTimelineItemsProps {
  timelineStart: Date;
  timelineEnd: Date;
  goalFilters: Partial<GetGoalsParams>;
  goalSearchQuery: string;
  onFilterChange: (key: string, value: string) => void;
  onGoalClick: (goalId: string) => void;
  blockOffset?: number;
  includeFilter?: boolean;
}

export function useGoalTimelineItems({
  timelineStart,
  timelineEnd,
  goalFilters,
  goalSearchQuery,
  onFilterChange,
  onGoalClick,
  blockOffset = 0,
  includeFilter = true,
}: UseGoalTimelineItemsProps): TimelineItem[] {
  const { goals } = useGoals(goalFilters);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      if (goalSearchQuery) {
        const query = goalSearchQuery.toLowerCase();
        if (!goal.name.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [goals, goalSearchQuery]);

  const items = useMemo<TimelineItem[]>(() => {
    const result: TimelineItem[] = [];

    // Filter as first item if needed
    if (includeFilter) {
      result.push({
        Renderer: ({ w, h, scrollContainerRef }) => (
          <FilterTimelineCard width={w} height={h} scrollContainerRef={scrollContainerRef}>
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
              onChange={onFilterChange}
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

    // Goals items
    filteredGoals.forEach((goal) => {
      const goalStart = new Date(goal.startDate);
      const goalEnd = goal.endDate ? new Date(goal.endDate) : timelineEnd;
      const start = goalStart < timelineStart ? timelineStart : goalStart;
      const end = goalEnd > timelineEnd ? timelineEnd : goalEnd;

      if (goalStart <= timelineEnd && (goal.endDate ? goalEnd >= timelineStart : true)) {
        result.push({
          Renderer: ({ w, h, scrollContainerRef }) => (
            <GoalTimelineCard
              goal={goal}
              width={w}
              height={h}
              scrollContainerRef={scrollContainerRef}
              onClick={() => onGoalClick(goal.id)}
            />
          ),
          h: 60,
          w: 200,
          start,
          end,
          blockOffset,
        });
      }
    });

    return result;
  }, [
    filteredGoals,
    timelineStart,
    timelineEnd,
    goalFilters,
    goalSearchQuery,
    onFilterChange,
    onGoalClick,
    blockOffset,
    includeFilter,
  ]);

  return items;
}
