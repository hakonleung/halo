'use client';

import { Box, HStack, Text } from '@chakra-ui/react';

import type { ChartBar } from './equity-kline-utils';

interface Props {
  hoveredBar:
    | (ChartBar & {
        ystClose: number;
      })
    | null;
  latestClose: number | null;
  tradingDaysToLatest: number | null;
}

function pctColor(v: number) {
  return v >= 0 ? '#FF4444' : '#00FF41';
}

export function KlineInfoPanel({ hoveredBar, latestClose, tradingDaysToLatest }: Props) {
  if (!hoveredBar) {
    return (
      <Box h="40px" mb={1} px={1}>
        <HStack gap={3} mb="2px">
          <Text fontFamily="mono" fontSize="10px" color="#555">
            ——
          </Text>
        </HStack>
        <HStack gap={3}>
          <Text fontFamily="mono" fontSize="10px" color="rgba(255,215,0,0.4)">
            MA5: —
          </Text>
          <Text fontFamily="mono" fontSize="10px" color="rgba(255,107,53,0.4)">
            MA10: —
          </Text>
          <Text fontFamily="mono" fontSize="10px" color="rgba(0,212,255,0.4)">
            MA20: —
          </Text>
        </HStack>
      </Box>
    );
  }

  const isUp = hoveredBar.close >= hoveredBar.open;
  const barColor = isUp ? '#FF4444' : '#00FF41';

  const fromToday =
    latestClose != null ? ((latestClose - hoveredBar.close) / hoveredBar.close) * 100 : null;

  return (
    <Box h="40px" mb={1} px={1}>
      {/* Row 1: date | OHLC | 涨跌 | 涨幅 | 距今 [N交易日] | 换手 */}
      <HStack gap={3} mb="2px" flexWrap="nowrap" overflow="hidden">
        <Text fontFamily="mono" fontSize="10px" color="#888" flexShrink={0}>
          {hoveredBar.trade_date}
        </Text>
        {hoveredBar.change_pct != null && (
          <Box flexShrink={0}>
            <Text as="span" fontFamily="mono" fontSize="10px" fontWeight="bold" color={barColor}>
              {hoveredBar.change_pct >= 0 ? '+' : ''}
              {hoveredBar.change_pct.toFixed(2)}%
            </Text>
          </Box>
        )}
        {fromToday != null && (
          <Box flexShrink={0}>
            {tradingDaysToLatest != null && tradingDaysToLatest > 0 && (
              <Text as="span" fontFamily="mono" fontSize="10px" color="#555">
                [{tradingDaysToLatest}交易日
                <Text as="span" fontFamily="mono" fontSize="10px" color={pctColor(fromToday)}>
                  {fromToday >= 0 ? '+' : ''}
                  {fromToday.toFixed(2)}%
                </Text>
                ]
              </Text>
            )}
          </Box>
        )}
        {hoveredBar.turnover_rate != null && (
          <Box flexShrink={0}>
            <Text as="span" fontFamily="mono" fontSize="9px" color="#555">
              换{' '}
            </Text>
            <Text as="span" fontFamily="mono" fontSize="10px" color="#aaa">
              {hoveredBar.turnover_rate.toFixed(2)}%
            </Text>
          </Box>
        )}
        {(
          [
            ['开', hoveredBar.open],
            ['高', hoveredBar.high],
            ['低', hoveredBar.low],
            ['收', hoveredBar.close],
          ] as [string, number][]
        ).map(([lbl, val]) => (
          <Box key={lbl} flexShrink={0}>
            <Text as="span" fontFamily="mono" fontSize="9px" color="#555">
              {lbl}{' '}
            </Text>
            <Text
              as="span"
              fontFamily="mono"
              fontSize="10px"
              color={pctColor(val - hoveredBar.ystClose)}
            >
              {val.toFixed(2)}
            </Text>
          </Box>
        ))}
        {hoveredBar.change_amount != null && (
          <Box flexShrink={0}>
            <Text as="span" fontFamily="mono" fontSize="9px" color="#555">
              涨跌{' '}
            </Text>
            <Text as="span" fontFamily="mono" fontSize="10px" color={barColor}>
              {hoveredBar.change_amount >= 0 ? '+' : ''}
              {hoveredBar.change_amount.toFixed(2)}
            </Text>
          </Box>
        )}
      </HStack>
      {/* Row 2: MA values */}
      <HStack gap={3}>
        <Text fontFamily="mono" fontSize="10px" color="rgba(255,215,0,0.85)">
          MA5: {hoveredBar.ma5 != null ? hoveredBar.ma5.toFixed(2) : '-'}
        </Text>
        <Text fontFamily="mono" fontSize="10px" color="rgba(255,107,53,0.85)">
          MA10: {hoveredBar.ma10 != null ? hoveredBar.ma10.toFixed(2) : '-'}
        </Text>
        <Text fontFamily="mono" fontSize="10px" color="rgba(0,212,255,0.85)">
          MA20: {hoveredBar.ma20 != null ? hoveredBar.ma20.toFixed(2) : '-'}
        </Text>
      </HStack>
    </Box>
  );
}
