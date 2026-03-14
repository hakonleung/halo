#!/usr/bin/env python3
"""
equity_bridge.py — Python bridge (NO database access).

Node.js handles all DB reads/writes. This script only:
  1. Fetches market data via akshare
  2. Runs numpy computations (pattern similarity)

All output is newline-delimited JSON (NDJSON) to stdout.
stderr is for debug logs.

Subcommands:
  fetch_kline <code> <start_date> <end_date>
      → JSON array of bar records (dates as YYYYMMDD or YYYY-MM-DD)
  fetch_all_klines
      stdin: {"stocks": [{"code": str, "start_date": str}]}
      → NDJSON: {"type": "result", "code": str, "bars": [...]}
               {"type": "error",  "code": str, "message": str}
               {"type": "done"}
  fetch_list
      → JSON array of {"code", "name", "market", "secid"}
  latest_trading_day
      → JSON {"date": str | null}
  find_similar
      stdin: {"window_len": int, "query_closes": [float],
              "stocks": [{"code": str, "dates": [str], "closes": [float]}]}
      Two-phase algorithm:
        Phase 1 — Z-score Pearson sliding window across all stocks → top 100 by similarity
        Phase 2 — Total Return filter: discard candidates whose window return
                  differs from the query return by more than 20 percentage points
      → NDJSON: {"type": "match", "code", "startDate", "endDate",
                  "similarity", "totalReturn", "queryTotalReturn"}
                {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

import akshare as ak
import numpy as np

_emit_lock = threading.Lock()


def emit(obj: dict):
    """Write one JSON event line to stdout (flushed, thread-safe)."""
    with _emit_lock:
        print(json.dumps(obj, ensure_ascii=False), flush=True)


# ── helpers ────────────────────────────────────────────────────────────────

def _normalize_date(d: str) -> str:
    """Accept YYYY-MM-DD or YYYYMMDD, return YYYYMMDD."""
    return d.replace("-", "")


def _fetch_kline_data(code: str, start_yyyymmdd: str, end_yyyymmdd: str) -> list:
    df = ak.stock_zh_a_hist(
        symbol=code,
        period="daily",
        start_date=start_yyyymmdd,
        end_date=end_yyyymmdd,
        adjust="qfq",
    )
    if df is None or df.empty:
        return []
    records = []
    for _, row in df.iterrows():
        records.append({
            "code": code,
            "trade_date": str(row["日期"]),
            "open": float(row["开盘"]),
            "high": float(row["最高"]),
            "low": float(row["最低"]),
            "close": float(row["收盘"]),
            "volume": int(row["成交量"]),
            "amount": float(row["成交额"]) if row["成交额"] else None,
            "amplitude": float(row["振幅"]) if row["振幅"] else None,
            "change_pct": float(row["涨跌幅"]) if row["涨跌幅"] else None,
            "change_amount": float(row["涨跌额"]) if row["涨跌额"] else None,
            "turnover_rate": float(row["换手率"]) if row["换手率"] else None,
        })
    return records


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
                print(f"[bridge] fetch error {code} (attempt {attempt}/{FETCH_RETRIES}): {e}, retrying in {delay}s", file=sys.stderr)
                time.sleep(delay)
                delay *= 2
            else:
                raise


def cmd_fetch_all_klines():
    import os as _os
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
            # os._exit bypasses thread cleanup and terminates immediately —
            # sys.exit / raise would still wait for shutdown(wait=True).
            emit({"type": "error", "message": str(e), "resume_from": done})
            sys.stderr.write(f"[bridge] fatal: {e}\n")
            sys.stderr.flush()
            _os._exit(1)
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


# ── latest_trading_day ─────────────────────────────────────────────────────

def cmd_latest_trading_day():
    try:
        today = datetime.today()
        week_ago = (today - timedelta(days=7)).strftime("%Y%m%d")
        df = ak.stock_zh_a_hist(
            symbol="000001", period="daily",
            start_date=week_ago, end_date=today.strftime("%Y%m%d"), adjust="",
        )
        if df is not None and not df.empty:
            print(json.dumps({"date": str(df["日期"].iloc[-1])}, ensure_ascii=False), flush=True)
            return
    except Exception as e:
        print(f"[bridge] latest_trading_day error: {e}", file=sys.stderr)
    print(json.dumps({"date": None}, ensure_ascii=False), flush=True)


# ── find_similar ───────────────────────────────────────────────────────────

def _zscore(arr: np.ndarray) -> np.ndarray:
    std = arr.std()
    if std == 0:
        return np.zeros_like(arr)
    return (arr - arr.mean()) / std


def _sliding_pearson(closes: np.ndarray, query_norm: np.ndarray, window_len: int):
    n = len(closes)
    if n < window_len:
        return -1, -1.0
    shape = (n - window_len + 1, window_len)
    strides = (closes.strides[0], closes.strides[0])
    windows = np.lib.stride_tricks.as_strided(closes, shape=shape, strides=strides)
    means = windows.mean(axis=1, keepdims=True)
    stds = windows.std(axis=1, keepdims=True)
    stds[stds == 0] = 1.0
    windows_norm = (windows - means) / stds
    correlations = windows_norm @ query_norm / window_len
    best_idx = int(np.argmax(correlations))
    return best_idx, float(correlations[best_idx])


SHAPE_CANDIDATES = 100   # Phase 1: keep top N by Pearson similarity
RETURN_THRESHOLD = 20.0  # Phase 2: max allowed total-return divergence (pp)


def _total_return_pct(closes: np.ndarray, start_idx: int, length: int) -> float:
    """Percentage return of a window: (end - start) / start * 100."""
    start_price = closes[start_idx]
    if start_price == 0:
        return 0.0
    return float((closes[start_idx + length - 1] - start_price) / start_price * 100)


def cmd_find_similar():
    data = json.loads(sys.stdin.read())
    window_len: int = data["window_len"]
    query_closes_raw = np.array(data["query_closes"], dtype=float)
    query_norm = _zscore(query_closes_raw)
    stocks: list = data["stocks"]

    if window_len < 2:
        emit({"type": "done", "total": 0, "topMatches": []})
        return

    query_total_return = round(_total_return_pct(query_closes_raw, 0, window_len), 2)

    # ── Phase 1: shape similarity (Pearson on z-score windows) ────────────────
    # Collect (similarity, code, best_idx, dates, closes) for all stocks.
    candidates = []
    for stock in stocks:
        closes = np.array(stock["closes"], dtype=float)
        best_idx, best_r = _sliding_pearson(closes, query_norm, window_len)
        if best_idx < 0:
            continue
        candidates.append((best_r, stock["code"], best_idx, stock["dates"], closes))

    # Keep top SHAPE_CANDIDATES by Pearson similarity
    candidates.sort(key=lambda x: -x[0])
    top_shape = candidates[:SHAPE_CANDIDATES]

    # ── Phase 2: total-return filter ──────────────────────────────────────────
    results = []
    for best_r, code, best_idx, dates, closes in top_shape:
        candidate_return = round(_total_return_pct(closes, best_idx, window_len), 2)
        if abs(candidate_return - query_total_return) > RETURN_THRESHOLD:
            continue
        match = {
            "type": "match",
            "code": code,
            "startDate": dates[best_idx],
            "endDate": dates[best_idx + window_len - 1],
            "similarity": round(best_r, 4),
            "totalReturn": candidate_return,
            "queryTotalReturn": query_total_return,
        }
        results.append(match)
        emit(match)

    results.sort(key=lambda x: -x["similarity"])
    emit({
        "type": "done",
        "total": len(results),
        "queryTotalReturn": query_total_return,
        "topMatches": results,
    })


# ── entry point ────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        emit({"error": "usage: equity_bridge.py <command> [args]"})
        sys.exit(1)

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
        elif cmd == "latest_trading_day":
            cmd_latest_trading_day()
        elif cmd == "find_similar":
            cmd_find_similar()
        else:
            raise ValueError(f"unknown command: {cmd}")
    except Exception as e:
        print(f"[bridge] fatal: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
