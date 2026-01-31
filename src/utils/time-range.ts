import type { TimeRange } from '@/types/dashboard-client';
import { TimeRangePreset } from '@/types/dashboard-client';

/**
 * Convert TimeRange to startDate and endDate strings
 */
export function timeRangeToDateRange(timeRange: TimeRange): {
  startDate: string;
  endDate: string;
} {
  if (timeRange.type === 'custom') {
    return {
      startDate: timeRange.start,
      endDate: timeRange.end,
    };
  }

  // Handle preset ranges
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

  let startDate: Date;
  let endDate: Date = todayEnd;

  switch (timeRange.value) {
    case TimeRangePreset.Today:
      startDate = today;
      break;
    case TimeRangePreset.Last7Days:
      startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      break;
    case TimeRangePreset.Last30Days:
      startDate = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
      break;
    case TimeRangePreset.Last90Days:
      startDate = new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
