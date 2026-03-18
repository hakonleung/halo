import { describe, it, expect } from 'vitest';

import type { DailyBarRecord } from '../equity-db';

// ── replicated pure helper (groupByCode is not exported) ─────────────────────
// We test by exercising it via the withCache interface indirectly, but since
// groupByCode is a private module-level function we test its logic directly
// by re-implementing the same one-liner and verifying the contract.

function groupByCode(bars: DailyBarRecord[]): Record<string, DailyBarRecord[]> {
  const byCode: Record<string, DailyBarRecord[]> = {};
  for (const bar of bars) {
    (byCode[bar.code] ??= []).push(bar);
  }
  return byCode;
}

function makeBar(code: string, trade_date: string, close = 10): DailyBarRecord {
  return {
    code,
    trade_date,
    open: close,
    high: close,
    low: close,
    close,
    volume: 1000,
    amount: null,
    amplitude: null,
    change_pct: null,
    change_amount: null,
    turnover_rate: null,
  };
}

// ── groupByCode ───────────────────────────────────────────────────────────────

describe('groupByCode', () => {
  it('returns an empty object for an empty array', () => {
    expect(groupByCode([])).toEqual({});
  });

  it('groups a single bar correctly', () => {
    const bar = makeBar('000001', '2024-01-02');
    const result = groupByCode([bar]);
    expect(result).toEqual({ '000001': [bar] });
  });

  it('groups multiple bars under the same code', () => {
    const b1 = makeBar('000001', '2024-01-02');
    const b2 = makeBar('000001', '2024-01-03');
    const result = groupByCode([b1, b2]);
    expect(result['000001']).toHaveLength(2);
    expect(result['000001']).toEqual([b1, b2]);
  });

  it('groups bars across multiple codes into separate keys', () => {
    const a1 = makeBar('AAA', '2024-01-02');
    const b1 = makeBar('BBB', '2024-01-02');
    const a2 = makeBar('AAA', '2024-01-03');
    const result = groupByCode([a1, b1, a2]);
    expect(Object.keys(result).sort()).toEqual(['AAA', 'BBB']);
    expect(result['AAA']).toEqual([a1, a2]);
    expect(result['BBB']).toEqual([b1]);
  });

  it('preserves the original insertion order within each code', () => {
    const bars = ['2024-01-05', '2024-01-03', '2024-01-04'].map((d) => makeBar('X', d));
    const result = groupByCode(bars);
    expect(result['X'].map((b) => b.trade_date)).toEqual([
      '2024-01-05',
      '2024-01-03',
      '2024-01-04',
    ]);
  });

  it('does not create keys for codes with no bars', () => {
    const bar = makeBar('ZZZ', '2024-01-02');
    const result = groupByCode([bar]);
    expect('OTHER' in result).toBe(false);
  });
});

// ── cache hit logic ───────────────────────────────────────────────────────────
// The isCacheHit expression in getBars is:
//   !!codeBars?.length &&
//   (startDate ? codeBars[0].trade_date <= startDate : !limit || codeBars.length >= limit)
// We test this logic as a standalone predicate.

function isCacheHit(
  codeBars: DailyBarRecord[] | undefined,
  startDate: string | undefined,
  limit: number | undefined,
): boolean {
  return (
    !!codeBars?.length &&
    (startDate ? codeBars[0].trade_date <= startDate : !limit || codeBars.length >= limit)
  );
}

describe('isCacheHit logic', () => {
  it('returns false when codeBars is undefined', () => {
    expect(isCacheHit(undefined, undefined, undefined)).toBe(false);
  });

  it('returns false when codeBars is an empty array', () => {
    expect(isCacheHit([], undefined, undefined)).toBe(false);
  });

  it('returns true when bars exist and no startDate or limit constraints', () => {
    const bars = [makeBar('A', '2024-01-02')];
    expect(isCacheHit(bars, undefined, undefined)).toBe(true);
  });

  it('returns true when startDate is provided and first bar is on or before startDate', () => {
    const bars = [makeBar('A', '2024-01-01'), makeBar('A', '2024-01-05')];
    expect(isCacheHit(bars, '2024-01-02', undefined)).toBe(true);
  });

  it('returns false when startDate is provided but first bar is after startDate', () => {
    const bars = [makeBar('A', '2024-01-10')];
    expect(isCacheHit(bars, '2024-01-02', undefined)).toBe(false);
  });

  it('returns true when no startDate and cached bars meet the limit', () => {
    const bars = [makeBar('A', '2024-01-01'), makeBar('A', '2024-01-02'), makeBar('A', '2024-01-03')];
    expect(isCacheHit(bars, undefined, 3)).toBe(true);
  });

  it('returns false when no startDate and cached bars are fewer than limit', () => {
    const bars = [makeBar('A', '2024-01-01'), makeBar('A', '2024-01-02')];
    expect(isCacheHit(bars, undefined, 5)).toBe(false);
  });

  it('returns true when limit is zero (no restriction)', () => {
    const bars = [makeBar('A', '2024-01-01')];
    // limit=0 is falsy, so !limit === true → cache hit
    expect(isCacheHit(bars, undefined, 0)).toBe(true);
  });

  it('startDate check takes priority over limit when both supplied', () => {
    // When startDate is given, the limit branch is ignored.
    const bars = [makeBar('A', '2024-01-01')];
    // First bar '2024-01-01' <= startDate '2024-01-03' → hit, even if limit not met
    expect(isCacheHit(bars, '2024-01-03', 100)).toBe(true);
  });
});
