'use client';

import { Box, Text, Skeleton, HStack, Tooltip, Card } from '@chakra-ui/react';
import type { HeatmapData } from '@/client/types/dashboard-client';

interface CalendarHeatmapProps {
  data: HeatmapData[] | undefined;
  loading?: boolean;
  onDayClick?: (date: string, count: number) => void;
}

const LEVEL_COLORS = [
  '#1A1A1A',
  'rgba(0, 255, 65, 0.2)',
  'rgba(0, 255, 65, 0.4)',
  'rgba(0, 255, 65, 0.6)',
  'rgba(0, 255, 65, 0.9)',
];

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function CalendarHeatmap({ data, loading, onDayClick }: CalendarHeatmapProps) {
  if (loading) {
    return (
      <Card.Root>
        <Card.Body>
          <Skeleton height="14px" width="100px" mb={2} />
          <Skeleton height="100px" />
        </Card.Body>
      </Card.Root>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card.Root borderStyle="dashed">
        <Card.Body h="160px" display="flex" alignItems="center" justifyContent="center">
          <Text color="text.mist" fontFamily="mono" fontSize="sm">
            No Activity Data
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Group data by month
  const monthsData: Array<{
    month: string;
    year: number;
    monthIndex: number;
    data: HeatmapData[];
  }> = [];

  let currentMonthData: HeatmapData[] = [];
  let currentMonth = -1;
  let currentYear = -1;

  for (const day of data) {
    if (day.date) {
      const date = new Date(day.date);
      const month = date.getMonth();
      const year = date.getFullYear();

      // If this is a new month, save previous month and start new one
      if (month !== currentMonth || year !== currentYear) {
        if (currentMonthData.length > 0) {
          monthsData.push({
            month: MONTH_ABBREVIATIONS[currentMonth],
            year: currentYear,
            monthIndex: currentMonth,
            data: [...currentMonthData],
          });
        }
        currentMonthData = [];
        currentMonth = month;
        currentYear = year;
      }
    }
    currentMonthData.push(day);
  }

  // Add last month
  if (currentMonthData.length > 0) {
    monthsData.push({
      month: MONTH_ABBREVIATIONS[currentMonth],
      year: currentYear,
      monthIndex: currentMonth,
      data: [...currentMonthData],
    });
  }

  // Function to group month data by week
  const groupMonthByWeek = (monthData: HeatmapData[]): HeatmapData[][] => {
    const weeks: HeatmapData[][] = [];
    let currentWeek: HeatmapData[] = [];

    // Fill in missing days at the start to align with Sunday
    if (monthData.length > 0 && monthData[0].date) {
      const firstDate = new Date(monthData[0].date);
      const firstDayOfWeek = firstDate.getDay();
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', count: 0, level: 0 });
      }
    }

    for (const day of monthData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, level: 0 });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  return (
    <Card.Root overflowX="auto">
      <Card.Body>
        <Text fontSize="sm" color="text.neon" fontFamily="mono" mb={2}>
          Activity Heatmap
        </Text>

        <HStack gap={1} align="flex-start">
          {/* Weekday labels */}
          <Box w="32px" flexShrink={0} pt="20px">
            {WEEKDAYS.map((day, i) => (
              <Box
                key={i}
                h="12px"
                fontSize="9px"
                color="text.mist"
                fontFamily="mono"
                lineHeight="12px"
                mb="2px"
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Heatmap grid with months */}
          <HStack gap="2px" overflowX="auto" align="flex-start">
            {monthsData.map((monthInfo, monthIdx) => {
              const weeks = groupMonthByWeek(monthInfo.data);
              return (
                <Box
                  key={`${monthInfo.year}-${monthInfo.monthIndex}`}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  {/* Month label - centered at top */}
                  <Text
                    fontSize="9px"
                    color="text.mist"
                    fontFamily="mono"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    whiteSpace="nowrap"
                    mb="2px"
                  >
                    {monthInfo.month} {monthInfo.year}
                  </Text>

                  {/* Weeks for this month */}
                  <HStack gap="2px">
                    {weeks.map((week, weekIndex) => (
                      <Box key={weekIndex} display="flex" flexDirection="column" gap="2px">
                        {week.map((day, dayIndex) => (
                          <Tooltip.Root
                            key={`${monthIdx}-${weekIndex}-${dayIndex}`}
                            disabled={!day.date}
                          >
                            <Tooltip.Trigger asChild>
                              <Box
                                w="12px"
                                h="12px"
                                borderRadius="2px"
                                bg={day.date ? LEVEL_COLORS[day.level] : 'transparent'}
                                border={
                                  day.date && day.level === 0
                                    ? '1px solid rgba(255, 255, 255, 0.1)'
                                    : 'none'
                                }
                                cursor={day.date && onDayClick ? 'pointer' : 'default'}
                                transition="all 0.15s ease"
                                _hover={
                                  day.date
                                    ? {
                                        transform: 'scale(1.3)',
                                        boxShadow: '0 0 8px #00FF41',
                                      }
                                    : undefined
                                }
                                onClick={() => day.date && onDayClick?.(day.date, day.count)}
                              />
                            </Tooltip.Trigger>
                            {day.date && (
                              <Tooltip.Positioner>
                                <Tooltip.Content>
                                  {`${new Date(day.date).toLocaleDateString('en-US')} - ${day.count} records`}
                                </Tooltip.Content>
                              </Tooltip.Positioner>
                            )}
                          </Tooltip.Root>
                        ))}
                      </Box>
                    ))}
                  </HStack>
                </Box>
              );
            })}
          </HStack>
        </HStack>

        {/* Legend */}
        <HStack gap={1.5} mt={2} justify="flex-end">
          <Text fontSize="xs" color="text.mist" fontFamily="mono">
            Less
          </Text>
          {LEVEL_COLORS.map((color, i) => (
            <Box
              key={i}
              w="10px"
              h="10px"
              borderRadius="2px"
              bg={color}
              border={i === 0 ? '1px solid #333' : 'none'}
            />
          ))}
          <Text fontSize="xs" color="text.mist" fontFamily="mono">
            More
          </Text>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
