#!/usr/bin/env python3
"""
equity_bridge.py — Python bridge entry point (NO database access).

Node.js handles all DB reads/writes. This script only:
  1. Fetches market data via akshare
  2. Runs numpy computations (pattern strategies)

All output is newline-delimited JSON (NDJSON) to stdout.
stderr is for debug logs.

Subcommands:
  fetch_kline <code> <start_date> <end_date>
      → JSON array of bar records
  fetch_all_klines
      stdin: {"stocks": [{"code": str, "start_date": str}]}
      → NDJSON: {"type": "result", "code": str, "bars": [...]}
               {"type": "error",  "code": str, "message": str}
               {"type": "done"}
  fetch_list
      → JSON array of {"code", "name", "market", "secid"}
  find_similar
      stdin: {"window_len": int, "query_closes": [float],
              "stocks": [{"code": str, "dates": [str], "closes": [float]}]}
      → NDJSON: {"type": "match", "code", "startDate", "endDate",
                  "similarity", "totalReturn", "queryTotalReturn"}
                {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

import akshare as ak

from utils import emit, _normalize_date, _fetch_kline_data


# ── fetch_kline ────────────────────────────────────────────────────────────

def cmd_fetch_kline(code: str, start_date: str, end_date: str):
    bars = _fetch_kline_data(code, _normalize_date(start_date), _normalize_date(end_date))
    print(json.dumps(bars, ensure_ascii=False), flush=True)


# ── fetch_all_klines ────────────────────────────────────────────────────────

FETCH_WORKERS = 3
FETCH_RETRIES = 3
FETCH_RETRY_DELAY = 2.0  # seconds, doubles on each retry


def _fetch_one(stock: dict) -> dict:
    import time
    code = stock["code"]
    start = _normalize_date(stock["start_date"])
    today = datetime.today().strftime("%Y%m%d")
    delay = FETCH_RETRY_DELAY
    for attempt in range(1, FETCH_RETRIES + 1):
        try:
            bars = _fetch_kline_data(code, start, today)
            return {"type": "result", "code": code, "bars": bars}
        except Exception as e:
            if attempt < FETCH_RETRIES:
                print(
                    f"[bridge] fetch error {code} (attempt {attempt}/{FETCH_RETRIES}): {e}, retrying in {delay}s",
                    file=sys.stderr,
                )
                time.sleep(delay)
                delay *= 2
            else:
                raise


def cmd_fetch_all_klines():
    data = json.loads(sys.stdin.read())
    stocks = data.get("stocks", [])
    # Don't use `with` — ThreadPoolExecutor.__exit__ calls shutdown(wait=True),
    # which blocks until all threads finish even after an exception.
    executor = ThreadPoolExecutor(max_workers=FETCH_WORKERS)
    futures = {executor.submit(_fetch_one, s): s for s in stocks}
    done = 0
    for future in as_completed(futures):
        try:
            emit(future.result())
            done += 1
        except Exception as e:
            # Emit structured error so the frontend receives it before we die.
            # os._exit bypasses thread cleanup and terminates immediately.
            emit({"type": "error", "message": str(e), "resume_from": done})
            sys.stderr.write(f"[bridge] fatal: {e}\n")
            sys.stderr.flush()
            os._exit(1)
    executor.shutdown(wait=True)
    emit({"type": "done"})


# ── fetch_list ─────────────────────────────────────────────────────────────

def cmd_fetch_list():
    df = ak.stock_info_a_code_name()
    records = []
    for _, row in df.iterrows():
        code = str(row["code"])
        market = "SH" if code.startswith("6") else "BJ" if code.startswith("9") else "SZ"
        mkt_prefix = "1" if market == "SH" else "0"
        records.append({
            "code": code,
            "name": str(row["name"]),
            "market": market,
            "secid": f"{mkt_prefix}.{code}",
        })
    print(json.dumps(records, ensure_ascii=False), flush=True)


# ── entry point ────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        emit({"error": "usage: equity_bridge.py <command> [args]"})
        sys.exit(1)

    # Add scripts/ directory to path so strategies can import utils
    sys.path.insert(0, os.path.dirname(__file__))

    cmd = sys.argv[1]
    try:
        if cmd == "fetch_kline":
            if len(sys.argv) < 5:
                raise ValueError("fetch_kline requires <code> <start_date> <end_date>")
            cmd_fetch_kline(sys.argv[2], sys.argv[3], sys.argv[4])
        elif cmd == "fetch_all_klines":
            cmd_fetch_all_klines()
        elif cmd == "fetch_list":
            cmd_fetch_list()
        elif cmd == "find_similar":
            from strategies.find_similar import run as find_similar_run
            find_similar_run()
        elif cmd == "find_breakout":
            from strategies.find_breakout import run as find_breakout_run
            find_breakout_run()
        elif cmd == "find_volume_price_divergence":
            from strategies.find_volume_price_divergence import run as find_vpd_run
            find_vpd_run()
        elif cmd == "find_multi_timeframe":
            from strategies.find_multi_timeframe import run as find_mtf_run
            find_mtf_run()
        elif cmd == "find_momentum_reversal":
            from strategies.find_momentum_reversal import run as find_mr_run
            find_mr_run()
        elif cmd == "find_chart_pattern":
            from strategies.find_chart_pattern import run as find_cp_run
            find_cp_run()
        else:
            raise ValueError(f"unknown command: {cmd}")
    except Exception as e:
        print(f"[bridge] fatal: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
