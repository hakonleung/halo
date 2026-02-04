'use client';

import { useMemo } from 'react';

import { GoalTimelineCard } from '@/client/components/log/goal-timeline-card';
import { useGoals, type GetGoalsParams } from '@/client/hooks/use-goals';

import type { TimelineItem } from '@/client/types/timeline';

interface UseGoalTimelineItemsProps {
  timelineStart: Date;
  timelineEnd: Date;
  goalFilters: Partial<GetGoalsParams>;
  goalSearchQuery: string;
  onFilterChange: (key: string, value: string) => void;
  onGoalClick: (goalId: string) => void;
  blockOffset?: number;
}

export function useGoalTimelineItems({
  timelineStart,
  timelineEnd,
  goalFilters,
  goalSearchQuery,
  onFilterChange,
  onGoalClick,
  blockOffset = 0,
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
          type: 'goal',
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
  ]);

  return items;
}
