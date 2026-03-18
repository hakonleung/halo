import { describe, it, expect } from 'vitest';

import type { BarQueryOptions, DailyBarRecord } from '../equity-db';

// ── BarQueryOptions structural contract ───────────────────────────────────────
// BarQueryOptions is a pure interface; we verify its structural contract
// through TypeScript type assignments and runtime value checks.

describe('BarQueryOptions structure', () => {
  it('accepts an empty object (all fields optional)', () => {
    const opts: BarQueryOptions = {};
    expect(opts.startDate).toBeUndefined();
    expect(opts.endDate).toBeUndefined();
    expect(opts.limit).toBeUndefined();
  });

  it('accepts startDate alone', () => {
    const opts: BarQueryOptions = { startDate: '2024-01-01' };
    expect(opts.startDate).toBe('2024-01-01');
  });

  it('accepts endDate alone', () => {
    const opts: BarQueryOptions = { endDate: '2024-12-31' };
    expect(opts.endDate).toBe('2024-12-31');
  });

  it('accepts limit alone', () => {
    const opts: BarQueryOptions = { limit: 100 };
    expect(opts.limit).toBe(100);
  });

  it('accepts all three fields together', () => {
    const opts: BarQueryOptions = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      limit: 50,
    };
    expect(opts.startDate).toBe('2024-01-01');
    expect(opts.endDate).toBe('2024-12-31');
    expect(opts.limit).toBe(50);
  });
});

// ── DailyBarRecord structural contract ───────────────────────────────────────

describe('DailyBarRecord structure', () => {
  it('allows nullable fields to be null', () => {
    const bar: DailyBarRecord = {
      code: '000001',
      trade_date: '2024-01-02',
      open: 10,
      high: 11,
      low: 9,
      close: 10.5,
      volume: 100000,
      amount: null,
      amplitude: null,
      change_pct: null,
      change_amount: null,
      turnover_rate: null,
    };
    expect(bar.amount).toBeNull();
    expect(bar.amplitude).toBeNull();
    expect(bar.change_pct).toBeNull();
    expect(bar.change_amount).toBeNull();
    expect(bar.turnover_rate).toBeNull();
  });

  it('allows nullable fields to hold numeric values', () => {
    const bar: DailyBarRecord = {
      code: '600000',
      trade_date: '2024-06-01',
      open: 8.5,
      high: 9.2,
      low: 8.3,
      close: 9.0,
      volume: 500000,
      amount: 4500000,
      amplitude: 1.06,
      change_pct: 2.3,
      change_amount: 0.2,
      turnover_rate: 0.5,
    };
    expect(bar.amount).toBe(4500000);
    expect(bar.change_pct).toBe(2.3);
  });
});
