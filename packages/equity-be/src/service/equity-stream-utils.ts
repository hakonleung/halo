import path from 'path';

import { createNdjsonResponse } from '@neo-log/be-core';

import { defaultCache, withCache } from './equity-cache';
import { EquityDb } from './equity-db';

import type { DailyBarRecord } from './equity-db';
import type { Database } from '@neo-log/be-edge';
import type { SupabaseClient } from '@supabase/supabase-js';

export const SCRIPT = path.resolve(process.cwd(), 'packages/equity-be/scripts/equity_bridge.py');

// ── date helpers ────────────────────────────────────────────────────────────

export function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

// ── bar grouping ─────────────────────────────────────────────────────────────

/**
 * Group a flat bar list by code, optionally excluding one code.
 * Returns Record<code, DailyBarRecord[]> preserving the original sort order.
 */
export function groupBarsByCode(
  bars: DailyBarRecord[],
  excludeCode?: string,
): Record<string, DailyBarRecord[]> {
  const map: Record<string, DailyBarRecord[]> = {};
  for (const bar of bars) {
    if (bar.code === excludeCode) continue;
    if (!map[bar.code]) map[bar.code] = [];
    map[bar.code].push(bar);
  }
  return map;
}

// ── stream helpers ───────────────────────────────────────────────────────────

export function makeEmit(controller: ReadableStreamDefaultController<Uint8Array>) {
  const enc = new TextEncoder();
  return (obj: object) => controller.enqueue(enc.encode(JSON.stringify(obj) + '\n'));
}

export function createDb(supabase: SupabaseClient<Database>) {
  return withCache(new EquityDb(supabase), defaultCache);
}

export function makeNdjsonStream(
  start: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void>,
): Response {
  const stream = new ReadableStream<Uint8Array>({ start });
  return createNdjsonResponse(stream);
}
