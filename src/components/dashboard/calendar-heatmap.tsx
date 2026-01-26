'use client';

import { Box, Text, Skeleton, HStack, Tooltip } from '@chakra-ui/react';
import type { HeatmapData } from '@/types/dashboard-client';

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

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarHeatmap({ data, loading, onDayClick }: CalendarHeatmapProps) {
  if (loading) {
    return (
      <Box
        bg="bg.carbon"
        border="1px solid"
        borderColor="rgba(0, 255, 65, 0.3)"
        borderRadius="4px"
        p={4}
      >
        <Skeleton height="16px" width="100px" mb={4} />
        <Skeleton height="120px" />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box
        bg="bg.carbon"
        border="1px dashed"
        borderColor="rgba(0, 255, 65, 0.3)"
        borderRadius="4px"
        p={4}
        h="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="text.mist" fontFamily="mono">
          暂无活跃数据
        </Text>
      </Box>
    );
  }

  // Group data by week
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];

  // Fill in missing days at the start to align with Sunday
  const firstDate = new Date(data[0].date);
  const firstDayOfWeek = firstDate.getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: '', count: 0, level: 0 });
  }

  for (const day of data) {
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

  return (
    <Box
      bg="bg.carbon"
      border="1px solid"
      borderColor="rgba(0, 255, 65, 0.3)"
      borderRadius="4px"
      p={4}
      overflowX="auto"
    >
      <Text fontSize="md" color="text.neon" fontFamily="mono" mb={4}>
        活跃度热力图
      </Text>

      <HStack gap={1} align="flex-start">
        {/* Weekday labels */}
        <Box w="20px" flexShrink={0}>
          {WEEKDAYS.map((day, i) => (
            <Box
              key={day}
              h="14px"
              fontSize="10px"
              color="text.mist"
              fontFamily="mono"
              display={i % 2 === 1 ? 'block' : 'none'}
              lineHeight="14px"
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Heatmap grid */}
        <HStack gap="2px" overflowX="auto">
          {weeks.map((week, weekIndex) => (
            <Box key={weekIndex} display="flex" flexDirection="column" gap="2px">
              {week.map((day, dayIndex) => (
                <Tooltip.Root key={`${weekIndex}-${dayIndex}`} disabled={!day.date}>
                  <Tooltip.Trigger asChild>
                    <Box
                      w="12px"
                      h="12px"
                      borderRadius="2px"
                      bg={day.date ? LEVEL_COLORS[day.level] : 'transparent'}
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
                        {`${new Date(day.date).toLocaleDateString('zh-CN')} - ${day.count} 条记录`}
                      </Tooltip.Content>
                    </Tooltip.Positioner>
                  )}
                </Tooltip.Root>
              ))}
            </Box>
          ))}
        </HStack>
      </HStack>

      {/* Legend */}
      <HStack gap={2} mt={4} justify="flex-end">
        <Text fontSize="xs" color="text.mist" fontFamily="mono">
          少
        </Text>
        {LEVEL_COLORS.map((color, i) => (
          <Box
            key={i}
            w="12px"
            h="12px"
            borderRadius="2px"
            bg={color}
            border={i === 0 ? '1px solid #333' : 'none'}
          />
        ))}
        <Text fontSize="xs" color="text.mist" fontFamily="mono">
          多
        </Text>
      </HStack>
    </Box>
  );
}
