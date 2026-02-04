import type { Lane, PositionedItem, TimelineItem, TimeUnit } from '@/types/timeline';

/**
 * Calculate the appropriate time unit based on the time range
 */
export function calculateTimeUnit(start: Date, end: Date): TimeUnit {
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffWeeks = diffDays / 7;

  if (diffHours <= 7 * 24) {
    return 'hour';
  } else if (diffDays <= 120) {
    return 'day';
  } else if (diffWeeks <= 52) {
    return 'week';
  } else {
    return 'month';
  }
}

const DURATION_BY_TIME_UNIT = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

const formatSpanLabel = (date: Date, timeUnit: TimeUnit): string => {
  switch (timeUnit) {
    case 'hour':
      return date.toLocaleString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'day':
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    case 'week': {
      const weekStart = new Date(date);
      const dayOfWeek = weekStart.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(weekStart.getDate() + diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const startWeekday = weekStart.toLocaleDateString('en-US', { weekday: 'short' });
      const endWeekday = weekEnd.toLocaleDateString('en-US', { weekday: 'short' });
      return `${startWeekday} - ${endWeekday}`;
    }
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
};

/**
 * Generate timeline lanes based on start/end dates and time unit
 */
export function generateLanes(start: Date, end: Date, timeUnit: TimeUnit): Lane[] {
  const result: Lane[] = [];
  const current = new Date(start);

  while (current <= end) {
    result.push({
      time: new Date(current),
      spanLabel: formatSpanLabel(current, timeUnit),
    });
    current.setTime(current.getTime() + DURATION_BY_TIME_UNIT[timeUnit]);
  }
  return result;
}

/**
 * Calculate x position for a given time
 */
const getXPosition = (time: Date, lanes: Lane[], timeUnit: TimeUnit, laneWidth: number): number => {
  const laneIndex = lanes.findIndex(
    (lane) =>
      time >= lane.time && time < new Date(lane.time.getTime() + DURATION_BY_TIME_UNIT[timeUnit]),
  );
  if (laneIndex === -1) {
    return (lanes.length - 1) * laneWidth;
  }
  const positionInLane =
    (time.getTime() - lanes[laneIndex].time.getTime()) / DURATION_BY_TIME_UNIT[timeUnit];
  return laneIndex * laneWidth + positionInLane * laneWidth;
};

/**
 * Calculate width for a time span
 */
export function calculateItemWidth(
  itemStart: Date,
  itemEnd: Date,
  minWidth: number,
  lanes: Lane[],
  timeUnit: TimeUnit,
  laneWidth: number,
): number {
  const startX = getXPosition(itemStart, lanes, timeUnit, laneWidth);
  const endX = getXPosition(itemEnd, lanes, timeUnit, laneWidth);
  const width = endX - startX;
  return Math.max(width, minWidth);
}

/**
 * Calculate positioned items with overlap detection
 */
export function calculatePositionedItems(
  items: TimelineItem[],
  lanes: Lane[],
  timeUnit: TimeUnit,
  laneWidth: number,
  minItemWidth: number,
): PositionedItem[] {
  const itemsByBlock = new Map<number, TimelineItem[]>();
  items.forEach((item) => {
    const blockOffset = item.blockOffset || 0;
    if (!itemsByBlock.has(blockOffset)) {
      itemsByBlock.set(blockOffset, []);
    }
    itemsByBlock.get(blockOffset)?.push(item);
  });

  const result: PositionedItem[] = [];
  const sortedBlocks = Array.from(itemsByBlock.entries()).sort((a, b) => a[0] - b[0]);
  let cumulativeYOffset = 0;

  for (const [, blockItems] of sortedBlocks) {
    const sorted = [...blockItems].sort((a, b) => a.start.getTime() - b.start.getTime());
    const itemLanes: PositionedItem[][] = [];

    for (const item of sorted) {
      const x = getXPosition(item.start, lanes, timeUnit, laneWidth);
      const minWidth = item.w || minItemWidth;
      const calculatedWidth = calculateItemWidth(
        item.start,
        item.end,
        minWidth,
        lanes,
        timeUnit,
        laneWidth,
      );

      let laneIndex = 0;
      let foundLane = false;

      while (!foundLane) {
        if (laneIndex >= itemLanes.length) {
          itemLanes.push([]);
          foundLane = true;
        } else {
          const overlaps = itemLanes[laneIndex].some((existing) => {
            const existingEnd = existing.x + existing.calculatedWidth;
            const itemEnd = x + calculatedWidth;
            return !(itemEnd <= existing.x || x >= existingEnd);
          });

          if (!overlaps) {
            foundLane = true;
          } else {
            laneIndex++;
          }
        }
      }

      const y = cumulativeYOffset + laneIndex;
      const positionedItem: PositionedItem = {
        ...item,
        x,
        y,
        calculatedWidth,
      };

      itemLanes[laneIndex].push(positionedItem);
      result.push(positionedItem);
    }

    const maxLaneIndex = itemLanes.length > 0 ? itemLanes.length - 1 : 0;
    cumulativeYOffset += maxLaneIndex + 1 + 1;
  }

  return result;
}
