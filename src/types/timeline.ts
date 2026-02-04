import type React from 'react';

export interface TimelineItem {
  Renderer: React.ComponentType<{
    w: number;
    h: number;
    scrollContainerRef?: React.RefObject<HTMLElement | null>;
  }>;
  h: number; // height in pixels
  w: number; // width in pixels (minimum width, will be calculated based on time span)
  start: Date;
  end: Date;
  blockOffset?: number; // Optional block offset for grouping items into different blocks
  type?: string; // Type of item for filtering
}

export type TimeUnit = 'hour' | 'day' | 'week' | 'month';

export interface Lane {
  time: Date;
  spanLabel: string; // Label for the time span above the lane
}

export interface PositionedItem extends TimelineItem {
  x: number; // x position in pixels
  y: number; // y position (lane index)
  calculatedWidth: number; // calculated width based on time span
}
