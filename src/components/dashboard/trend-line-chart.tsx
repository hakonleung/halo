'use client';

import { Box, Text, Skeleton, HStack, Flex, Card } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import type { TrendData } from '@/types/dashboard-client';

// Dynamic import for Recharts to avoid SSR issues
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);

interface TrendLineChartProps {
  data: TrendData | undefined;
  loading?: boolean;
  selectedTypes?: string[];
  onTypeToggle?: (typeId: string) => void;
}

export function TrendLineChart({
  data,
  loading,
  selectedTypes,
  onTypeToggle,
}: TrendLineChartProps) {
  if (loading) {
    return (
      <Card.Root size="sm">
        <Card.Body>
          <Skeleton height="14px" width="120px" mb={2} />
          <Skeleton height="200px" />
        </Card.Body>
      </Card.Root>
    );
  }

  if (!data || data.points.length === 0) {
    return (
      <Card.Root size="sm" borderStyle="dashed">
        <Card.Body h="240px" display="flex" alignItems="center" justifyContent="center">
          <Text color="text.mist" fontFamily="mono" fontSize="sm">
            No Trend Data
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Filter types to show
  const visibleTypes =
    selectedTypes && selectedTypes.length > 0
      ? data.types.filter((t) => selectedTypes.includes(t.id))
      : data.types;

  return (
    <Card.Root size="sm">
      <Card.Body>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="sm" color="text.neon" fontFamily="mono">
            Behavior Trend
          </Text>
          {data.types.length > 0 && (
            <HStack gap={1.5} flexWrap="wrap">
              {data.types.map((type) => {
                const isActive =
                  !selectedTypes || selectedTypes.length === 0 || selectedTypes.includes(type.id);
                return (
                  <Box
                    key={type.id}
                    px={1.5}
                    py={0.5}
                    borderRadius="4px"
                    border="1px solid"
                    borderColor={type.color}
                    bg={isActive ? `${type.color}20` : 'transparent'}
                    opacity={isActive ? 1 : 0.4}
                    cursor="pointer"
                    fontSize="xs"
                    fontFamily="mono"
                    color={type.color}
                    onClick={() => onTypeToggle?.(type.id)}
                    transition="all 0.15s ease"
                    _hover={{ opacity: 1 }}
                  >
                    {type.name}
                  </Box>
                );
              })}
            </HStack>
          )}
        </Flex>

        <Box h="200px">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.points} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#555"
                fontSize={11}
                fontFamily="JetBrains Mono"
              />
              <YAxis stroke="#555" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1A',
                  border: '1px solid #00FF41',
                  borderRadius: '4px',
                  fontFamily: 'JetBrains Mono',
                }}
                labelFormatter={(label) => {
                  if (typeof label === 'string' || typeof label === 'number')
                    return new Date(label).toLocaleDateString('en-US');
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#00FF41"
                strokeWidth={2}
                dot={{ fill: '#00FF41', r: 3 }}
                activeDot={{ r: 5, fill: '#00FF41' }}
              />
              {visibleTypes.map((type) => (
                <Line
                  key={type.id}
                  type="monotone"
                  dataKey={`byType.${type.id}`}
                  name={type.name}
                  stroke={type.color}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
