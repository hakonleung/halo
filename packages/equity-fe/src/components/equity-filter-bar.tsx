'use client';

import { HStack, Input, Text } from '@chakra-ui/react';

import type { EquityFilter, MarketFilter, PctPeriod } from '../types';

const PERIOD_COLS: { key: PctPeriod; label: string }[] = [
  { key: 'change_1d', label: '今日' },
  { key: 'change_5d', label: '5日' },
  { key: 'change_10d', label: '10日' },
  { key: 'change_20d', label: '20日' },
  { key: 'change_50d', label: '50日' },
  { key: 'change_120d', label: '120日' },
];

const MARKET_COLS: { key: MarketFilter; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'SH', label: '上海' },
  { key: 'SZ', label: '深圳' },
];

const inputStyle = {
  w: '58px',
  h: '22px',
  px: '6px',
  fontSize: '11px',
  fontFamily: 'mono',
  bg: 'transparent',
  border: '1px solid rgba(0,255,65,0.2)',
  borderRadius: '2px',
  color: '#ccc',
  _placeholder: { color: '#444' },
  _focus: { border: '1px solid rgba(0,255,65,0.5)', outline: 'none' },
} as const;

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Text
      px="6px"
      py="2px"
      borderRadius="2px"
      border="1px solid"
      borderColor={active ? 'rgba(0,255,65,0.5)' : 'rgba(0,255,65,0.12)'}
      color={active ? 'brand.matrix' : '#555'}
      cursor="pointer"
      userSelect="none"
      onClick={onClick}
      _hover={{ color: 'brand.matrix', borderColor: 'rgba(0,255,65,0.4)' }}
    >
      {label}
    </Text>
  );
}

function Divider() {
  return <Text color="rgba(0,255,65,0.15)">|</Text>;
}

interface Props {
  filter: EquityFilter;
  onChange: (f: EquityFilter) => void;
}

export function EquityFilterBar({ filter, onChange }: Props) {
  const set = (patch: Partial<EquityFilter>) => onChange({ ...filter, ...patch });

  const hasFilter =
    filter.pctMin !== '' ||
    filter.pctMax !== '' ||
    filter.turnoverMin !== '' ||
    filter.turnoverMax !== '' ||
    filter.market !== 'ALL' ||
    filter.excludeST;

  return (
    <HStack
      px={3}
      py="6px"
      gap={3}
      borderBottom="1px solid rgba(0,255,65,0.08)"
      fontSize="11px"
      fontFamily="mono"
      flexShrink={0}
      flexWrap="wrap"
    >
      {/* Exchange */}
      <HStack gap={1}>
        {MARKET_COLS.map(({ key, label }) => (
          <Chip
            key={key}
            active={filter.market === key}
            label={label}
            onClick={() => set({ market: key })}
          />
        ))}
      </HStack>

      <Divider />

      {/* ST toggle */}
      <Chip
        active={filter.excludeST}
        label="排除ST"
        onClick={() => set({ excludeST: !filter.excludeST })}
      />

      <Divider />

      {/* Change pct period + range */}
      <HStack gap={1}>
        <Text color="#444" mr={1}>
          涨跌幅
        </Text>
        {PERIOD_COLS.map(({ key, label }) => (
          <Chip
            key={key}
            active={filter.pctPeriod === key}
            label={label}
            onClick={() => set({ pctPeriod: key })}
          />
        ))}
        <Input
          {...inputStyle}
          placeholder="最小%"
          value={filter.pctMin}
          onChange={(e) => set({ pctMin: e.target.value })}
        />
        <Text color="#333">~</Text>
        <Input
          {...inputStyle}
          placeholder="最大%"
          value={filter.pctMax}
          onChange={(e) => set({ pctMax: e.target.value })}
        />
      </HStack>

      <Divider />

      {/* Turnover range */}
      <HStack gap={1}>
        <Text color="#444" mr={1}>
          换手率
        </Text>
        <Input
          {...inputStyle}
          placeholder="最小%"
          value={filter.turnoverMin}
          onChange={(e) => set({ turnoverMin: e.target.value })}
        />
        <Text color="#333">~</Text>
        <Input
          {...inputStyle}
          placeholder="最大%"
          value={filter.turnoverMax}
          onChange={(e) => set({ turnoverMax: e.target.value })}
        />
      </HStack>

      {/* Clear */}
      {hasFilter && (
        <>
          <Divider />
          <Text
            color="#555"
            cursor="pointer"
            _hover={{ color: '#FF4444' }}
            onClick={() =>
              onChange({
                pctPeriod: filter.pctPeriod,
                pctMin: '',
                pctMax: '',
                turnoverMin: '',
                turnoverMax: '',
                market: 'ALL',
                excludeST: false,
              })
            }
          >
            清除
          </Text>
        </>
      )}
    </HStack>
  );
}
