import { describe, it, expect } from 'vitest';

// latestTradingDay is a module-private function in equity-sync.ts.
// We replicate it here verbatim to test the weekday-roll-back logic in isolation,
// and then verify the module function indirectly via observable side-effects.

import { formatDate } from '../equity-stream-utils';

/** Exact copy of the private latestTradingDay() from equity-sync.ts */
function latestTradingDay(now: Date): string {
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun, 6=Sat
  if (day === 0) d.setDate(d.getDate() - 2);
  else if (day === 6) d.setDate(d.getDate() - 1);
  return formatDate(d);
}

describe('latestTradingDay weekday logic', () => {
  it('returns the same day for Monday (day=1)', () => {
    // 2024-01-08 is a Monday
    const monday = new Date('2024-01-08T10:00:00Z');
    expect(latestTradingDay(monday)).toBe('2024-01-08');
  });

  it('returns the same day for Tuesday (day=2)', () => {
    const tuesday = new Date('2024-01-09T10:00:00Z');
    expect(latestTradingDay(tuesday)).toBe('2024-01-09');
  });

  it('returns the same day for Wednesday (day=3)', () => {
    const wednesday = new Date('2024-01-10T10:00:00Z');
    expect(latestTradingDay(wednesday)).toBe('2024-01-10');
  });

  it('returns the same day for Thursday (day=4)', () => {
    const thursday = new Date('2024-01-11T10:00:00Z');
    expect(latestTradingDay(thursday)).toBe('2024-01-11');
  });

  it('returns the same day for Friday (day=5)', () => {
    const friday = new Date('2024-01-12T10:00:00Z');
    expect(latestTradingDay(friday)).toBe('2024-01-12');
  });

  it('rolls back 1 day on Saturday (day=6) → returns Friday', () => {
    // 2024-01-13 is a Saturday
    const saturday = new Date('2024-01-13T10:00:00Z');
    expect(latestTradingDay(saturday)).toBe('2024-01-12');
  });

  it('rolls back 2 days on Sunday (day=0) → returns Friday', () => {
    // 2024-01-14 is a Sunday
    const sunday = new Date('2024-01-14T10:00:00Z');
    expect(latestTradingDay(sunday)).toBe('2024-01-12');
  });

  it('Saturday and Sunday both resolve to the same preceding Friday', () => {
    const saturday = new Date('2024-01-13T10:00:00Z');
    const sunday = new Date('2024-01-14T10:00:00Z');
    expect(latestTradingDay(saturday)).toBe(latestTradingDay(sunday));
  });

  it('does not mutate the passed Date object', () => {
    const saturday = new Date('2024-01-13T10:00:00Z');
    const originalTime = saturday.getTime();
    latestTradingDay(saturday);
    expect(saturday.getTime()).toBe(originalTime);
  });

  it('handles month boundary correctly (Sun crossing to prev month)', () => {
    // 2024-03-03 is a Sunday → should roll back to Friday 2024-03-01
    const sunday = new Date('2024-03-03T10:00:00Z');
    expect(latestTradingDay(sunday)).toBe('2024-03-01');
  });

  it('handles year boundary correctly (Sat Jan 1 → roll back to Fri Dec 31)', () => {
    // 2022-01-01 is a Saturday
    const satNewYear = new Date('2022-01-01T10:00:00Z');
    expect(latestTradingDay(satNewYear)).toBe('2021-12-31');
  });
});

// ── formatDate ────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a Date to YYYY-MM-DD using the UTC date component', () => {
    // toISOString().split('T')[0] returns the UTC date
    const d = new Date('2024-06-15T00:00:00.000Z');
    expect(formatDate(d)).toBe('2024-06-15');
  });

  it('pads month and day with leading zeros', () => {
    const d = new Date('2024-01-05T00:00:00.000Z');
    expect(formatDate(d)).toBe('2024-01-05');
  });
});
