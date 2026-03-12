import { spawn } from 'child_process';
import path from 'path';

import type { PatternMatch } from '@/client/types/equity-client';
import type { Database } from '@/server/types/database';
import type {
  AddStockRequest,
  EastmoneySearchItem,
  SyncResult,
} from '@/server/types/equity-server';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Python bridge ──────────────────────────────────────────────────────────

const SCRIPT = path.resolve(process.cwd(), 'scripts/equity_bridge.py');

/** Run Python script with JSON args, return parsed stdout */
function runPython<T>(args: string[], accessToken = ''): Promise<T> {
  return new Promise((resolve, reject) => {
    console.log('[equity] runPython:', SCRIPT, args);
    const py = spawn('python3', [SCRIPT, ...args], {
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken },
    });

    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    py.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });

    py.on('close', (code) => {
      if (stderr) console.error('[equity] python stderr:', stderr);
      if (code !== 0) {
        reject(new Error(`Python script exited ${code}: ${stderr || stdout}`));
        return;
      }
      try {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        resolve(JSON.parse(stdout) as T);
      } catch {
        reject(new Error(`Python stdout not valid JSON: ${stdout}`));
      }
    });
  });
}

function runPythonSync(code: string, accessToken = ''): Promise<SyncResult> {
  return runPython<SyncResult>(['sync', code], accessToken);
}

function runPythonSearch(query: string, accessToken = ''): Promise<EastmoneySearchItem[]> {
  return runPython<EastmoneySearchItem[]>(['search', query], accessToken);
}

// ── Service ────────────────────────────────────────────────────────────────

export const equityService = {
  async getStocks(supabase: SupabaseClient<Database>) {
    console.log('[equity] getStocks');
    const { data, error } = await supabase
      .from('neolog_equity_list')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[equity] getStocks error:', error);
      throw new Error(error.message);
    }
    return data;
  },

  async addStock(supabase: SupabaseClient<Database>, req: AddStockRequest) {
    console.log('[equity] addStock:', req.code, req.name);
    const { data, error } = await supabase
      .from('neolog_equity_list')
      .upsert(
        {
          code: req.code,
          name: req.name,
          market: req.market,
          secid: req.secid,
          industry: req.industry ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'code' },
      )
      .select()
      .single();
    if (error) {
      console.error('[equity] addStock error:', error);
      throw new Error(error.message);
    }
    return data;
  },

  async deleteStock(supabase: SupabaseClient<Database>, code: string) {
    // Delete daily data first
    await supabase.from('neolog_equity_daily').delete().eq('code', code);
    const { error } = await supabase.from('neolog_equity_list').delete().eq('code', code);
    if (error) throw new Error(error.message);
  },

  async getDailyBars(supabase: SupabaseClient<Database>, code: string, limit = 365) {
    const { data, error } = await supabase
      .from('neolog_equity_daily')
      .select('*')
      .eq('code', code)
      .order('trade_date', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data;
  },

  /** Sync one stock via Python (called when adding a new stock). Python handles last_synced_at. */
  async syncStock(
    _supabase: SupabaseClient<Database>,
    stock: { code: string; secid: string; name: string },
    accessToken = '',
  ): Promise<SyncResult> {
    console.log('[equity] syncStock:', stock.code, stock.name);
    const result = await runPythonSync(stock.code, accessToken);
    console.log('[equity] syncStock result:', result);
    return result;
  },

  /** Search stocks via Python akshare script */
  async searchStocks(query: string, accessToken = ''): Promise<EastmoneySearchItem[]> {
    if (!query.trim()) return [];
    console.log('[equity] searchStocks:', query);
    return runPythonSearch(query, accessToken);
  },

  /** Find stocks with similar price pattern using sliding-window Pearson correlation */
  async findSimilarPatterns(
    code: string,
    startDate: string,
    endDate: string,
    accessToken = '',
  ): Promise<PatternMatch[]> {
    console.log('[equity] findSimilarPatterns:', code, startDate, endDate);
    return runPython<PatternMatch[]>(['find_similar', code, startDate, endDate], accessToken);
  },
};
