'use client';

import { Box, HStack, Text } from '@chakra-ui/react';

import type { ChartBar } from './equity-kline-utils';

interface TooltipPayload {
  payload?: ChartBar;
}

export const KlineTooltip = ({ payload }: { payload?: TooltipPayload[] }) => {
  const d = payload?.[0]?.payload;
  if (!d) return null;
  const isGain = d.close >= d.open;
  const color = isGain ? '#FF4444' : '#00FF41';
  const fmt = (v: number | null) => (v != null ? v.toFixed(2) : '-');

  return (
    <Box bg="#1A1A1A" border="1px solid rgba(0,255,65,0.3)" p={3} borderRadius="4px" fontSize="xs">
      <Text color="gray.400" mb={1} fontFamily="mono">{d.trade_date}</Text>
      <HStack gap={4}>
        <Box><Text color="gray.500">开</Text><Text color={color}>{fmt(d.open)}</Text></Box>
        <Box><Text color="gray.500">高</Text><Text color={color}>{fmt(d.high)}</Text></Box>
        <Box><Text color="gray.500">低</Text><Text color={color}>{fmt(d.low)}</Text></Box>
        <Box><Text color="gray.500">收</Text><Text color={color}>{fmt(d.close)}</Text></Box>
      </HStack>
      <HStack gap={4} mt={1}>
        <Box>
          <Text color="gray.500">涨跌</Text>
          <Text color={color}>{d.change_pct != null ? `${d.change_pct.toFixed(2)}%` : '-'}</Text>
        </Box>
        <Box>
          <Text color="gray.500">换手</Text>
          <Text color="white">{d.turnover_rate != null ? `${d.turnover_rate.toFixed(2)}%` : '-'}</Text>
        </Box>
        <Box>
          <Text color="gray.500">量(手)</Text>
          <Text color="white">{d.volume.toLocaleString()}</Text>
        </Box>
      </HStack>
    </Box>
  );
};

export const VolumeTooltip = ({ payload }: { payload?: TooltipPayload[] }) => {
  const d = payload?.[0]?.payload;
  if (!d) return null;
  return (
    <Box bg="#1A1A1A" border="1px solid rgba(0,255,65,0.3)" p={2} borderRadius="4px" fontSize="xs">
      <Text color="gray.400" fontFamily="mono">{d.trade_date}</Text>
      <Text color="white">量: {d.volume.toLocaleString()} 手</Text>
      {d.turnover_rate != null && (
        <Text color="#00D4FF">换手: {d.turnover_rate.toFixed(2)}%</Text>
      )}
    </Box>
  );
};
