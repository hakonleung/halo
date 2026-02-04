import { useState, useCallback, useEffect } from 'react';
import type { TimeUnit } from '@/types/timeline';
import { calculateTimeUnit } from '@/utils/timeline';

const TIME_UNITS: TimeUnit[] = ['hour', 'day', 'week', 'month'];
const MIN_LANE_WIDTH = 10;
const MAX_LANE_WIDTH = 80;
const ZOOM_STEP = 5;

interface UseTimelineZoomProps {
  start: Date;
  end: Date;
  defaultLaneWidth: number;
}

export function useTimelineZoom({ start, end, defaultLaneWidth }: UseTimelineZoomProps) {
  const [currentLaneWidth, setCurrentLaneWidth] = useState(defaultLaneWidth);
  const [currentTimeUnit, setCurrentTimeUnit] = useState<TimeUnit>(() =>
    calculateTimeUnit(start, end),
  );

  useEffect(() => {
    setCurrentLaneWidth(defaultLaneWidth);
    setCurrentTimeUnit(calculateTimeUnit(start, end));
  }, [start, end, defaultLaneWidth]);

  const handleZoomIn = useCallback(() => {
    if (currentLaneWidth < MAX_LANE_WIDTH) {
      setCurrentLaneWidth((prev) => Math.min(MAX_LANE_WIDTH, prev + ZOOM_STEP));
    } else {
      const currentIndex = TIME_UNITS.indexOf(currentTimeUnit);
      if (currentIndex > 0) {
        setCurrentTimeUnit(TIME_UNITS[currentIndex - 1]);
        setCurrentLaneWidth(MIN_LANE_WIDTH);
      }
    }
  }, [currentLaneWidth, currentTimeUnit]);

  const handleZoomOut = useCallback(() => {
    if (currentLaneWidth > MIN_LANE_WIDTH) {
      setCurrentLaneWidth((prev) => Math.max(MIN_LANE_WIDTH, prev - ZOOM_STEP));
    } else {
      const currentIndex = TIME_UNITS.indexOf(currentTimeUnit);
      if (currentIndex < TIME_UNITS.length - 1) {
        setCurrentTimeUnit(TIME_UNITS[currentIndex + 1]);
        setCurrentLaneWidth(MAX_LANE_WIDTH);
      }
    }
  }, [currentLaneWidth, currentTimeUnit]);

  return {
    currentLaneWidth,
    currentTimeUnit,
    handleZoomIn,
    handleZoomOut,
    canZoomIn: !(currentTimeUnit === 'hour' && currentLaneWidth === MAX_LANE_WIDTH),
    canZoomOut: !(currentTimeUnit === 'month' && currentLaneWidth === MIN_LANE_WIDTH),
  };
}
