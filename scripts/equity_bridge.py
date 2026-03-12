#!/usr/bin/env python3
"""
equity_bridge.py — Python bridge called by the Next.js server via child_process.

All output is newline-delimited JSON (NDJSON) to stdout.
stderr is used for debug logs.

Subcommands:
  sync <code>   — sync one stock's K-line data into Supabase
  sync_all      — if list is empty: init_list first; else sync active stocks
  search <query>— search stocks by code or name

Event shapes (NDJSON, one per line):
  {"type": "status",         "message": str}
  {"type": "init_progress",  "batch": int, "total_batches": int}
  {"type": "init_done",      "total": int}
  {"type": "progress",       "code": str, "name": str, "inserted": int,
                              "latestDate": str|null, "index": int, "total": int}
  {"type": "done",           "synced": int}

Env vars (from .env.local):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_KEY
"""

import json
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone

import akshare as ak
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
ACCESS_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")


def get_supabase():
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise RuntimeError("NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set")
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    if ACCESS_TOKEN:
        # Authenticate postgrest requests with the user's JWT
        sb.postgrest.auth(ACCESS_TOKEN)
    return sb


# Thread-local storage so each worker thread gets its own Supabase client
_thread_local = threading.local()


def get_supabase_local():
    """Return a per-thread Supabase client (created once per thread)."""
    if not hasattr(_thread_local, "sb"):
        _thread_local.sb = get_supabase()
    return _thread_local.sb


_emit_lock = threading.Lock()


def emit(obj: dict):
    """Write one JSON event line to stdout (flushed immediately, thread-safe)."""
    with _emit_lock:
        print(json.dumps(obj, ensure_ascii=False), flush=True)


# ── sync (single stock) ────────────────────────────────────────────────────

def sync_stock(sb, code: str) -> dict:
    """Sync K-line for one stock. Returns result dict."""
    res = (
        sb.table("neolog_equity_daily")
        .select("trade_date")
        .eq("code", code)
        .order("trade_date", desc=True)
        .limit(1)
        .execute()
    )
    rows = res.data
    latest = rows[0]["trade_date"] if rows else None

    today = datetime.today()
    if latest:
        start_dt = datetime.strptime(latest, "%Y-%m-%d") + timedelta(days=1)
    else:
        start_dt = today - timedelta(days=365)

    if start_dt.date() > today.date():
        return {"code": code, "inserted": 0, "latestDate": latest}

    start_str = start_dt.strftime("%Y%m%d")
    end_str = today.strftime("%Y%m%d")
    print(f"[bridge] sync {code}: {start_str} → {end_str}", file=sys.stderr)

    df = ak.stock_zh_a_hist(
        symbol=code,
        period="daily",
        start_date=start_str,
        end_date=end_str,
        adjust="qfq",
    )

    if df is None or df.empty:
        return {"code": code, "inserted": 0, "latestDate": latest}

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

    for i in range(0, len(records), 500):
        sb.table("neolog_equity_daily").upsert(
            records[i: i + 500], on_conflict="code,trade_date"
        ).execute()

    # Update last_synced_at
    now = datetime.now(timezone.utc).isoformat()
    sb.table("neolog_equity_list").update(
        {"last_synced_at": now, "updated_at": now}
    ).eq("code", code).execute()

    latest_date = records[-1]["trade_date"] if records else latest
    return {"code": code, "inserted": len(records), "latestDate": latest_date}


def cmd_sync(code: str):
    """Single-stock sync (used when adding a new stock). Outputs single JSON line."""
    sb = get_supabase()
    result = sync_stock(sb, code)
    emit(result)


# ── init_list (populate stock catalog) ────────────────────────────────────

def do_init_list(sb) -> int:
    """Fetch all A-share stocks and upsert basic info into neolog_equity_list."""
    emit({"type": "status", "message": "正在从 akshare 获取 A 股列表..."})

    df = ak.stock_info_a_code_name()
    total = len(df)
    emit({"type": "status", "message": f"共 {total} 只股票，写入数据库中..."})

    records = []
    for _, row in df.iterrows():
        code = str(row["code"])
        market = "SH" if code.startswith("6") else "SZ"
        mkt_prefix = "1" if market == "SH" else "0"
        records.append({
            "code": code,
            "name": str(row["name"]),
            "market": market,
            "secid": f"{mkt_prefix}.{code}",
        })

    batch_size = 500
    total_batches = (len(records) + batch_size - 1) // batch_size
    for i, start in enumerate(range(0, len(records), batch_size)):
        sb.table("neolog_equity_list").upsert(
            records[start: start + batch_size], on_conflict="code"
        ).execute()
        emit({"type": "init_progress", "batch": i + 1, "total_batches": total_batches})

    emit({"type": "init_done", "total": total})
    return total


# ── sync_all ───────────────────────────────────────────────────────────────

SYNC_WORKERS = 10   # concurrent threads


def get_latest_trading_day() -> str | None:
    """Return the latest A-share trading day as YYYY-MM-DD using 000001 as reference."""
    try:
        today = datetime.today()
        week_ago = (today - timedelta(days=7)).strftime("%Y%m%d")
        df = ak.stock_zh_a_hist(
            symbol="000001", period="daily",
            start_date=week_ago, end_date=today.strftime("%Y%m%d"), adjust="",
        )
        if df is not None and not df.empty:
            return str(df["日期"].iloc[-1])
    except Exception as e:
        print(f"[bridge] get_latest_trading_day error: {e}", file=sys.stderr)
    return None


def get_up_to_date_codes(sb, latest_day: str) -> set:
    """Return set of stock codes that already have a row for latest_day."""
    codes: set = set()
    page_size = 1000
    offset = 0
    while True:
        res = (
            sb.table("neolog_equity_daily")
            .select("code")
            .eq("trade_date", latest_day)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = res.data or []
        for r in batch:
            codes.add(r["code"])
        if len(batch) < page_size:
            break
        offset += page_size
    return codes


def _sync_one(stock: dict) -> dict:
    """Worker: sync one stock using a thread-local Supabase client."""
    sb = get_supabase_local()
    try:
        result = sync_stock(sb, stock["code"])
        return {
            "code": stock["code"],
            "name": stock["name"],
            "inserted": result["inserted"],
            "latestDate": result.get("latestDate"),
            "error": None,
        }
    except Exception as e:
        print(f"[bridge] sync error {stock['code']}: {e}", file=sys.stderr)
        return {
            "code": stock["code"],
            "name": stock["name"],
            "inserted": 0,
            "latestDate": None,
            "error": str(e),
        }


def cmd_sync_all(start_offset: int = 0):
    sb = get_supabase()

    # Check if list is empty
    res = sb.table("neolog_equity_list").select("id", count="exact").limit(1).execute()
    count = res.count or 0

    if count == 0:
        emit({"type": "status", "message": "股票列表为空，开始初始化..."})
        do_init_list(sb)
        emit({"type": "done", "synced": 0})
        return

    # Paginate to bypass Supabase's default 1000-row limit
    all_stocks = []
    page_size = 1000
    pg_offset = 0
    while True:
        res = (
            sb.table("neolog_equity_list")
            .select("code,secid,name")
            .range(pg_offset, pg_offset + page_size - 1)
            .execute()
        )
        batch = res.data or []
        all_stocks.extend(batch)
        if len(batch) < page_size:
            break
        pg_offset += page_size

    total = len(all_stocks)

    # Filter: skip stocks that already have data for the latest trading day
    latest_day = get_latest_trading_day()
    if latest_day:
        emit({"type": "status", "message": f"最近交易日: {latest_day}，查询已同步股票..."})
        up_to_date = get_up_to_date_codes(sb, latest_day)
        candidate = [s for s in all_stocks[start_offset:] if s["code"] not in up_to_date]
        emit({"type": "status", "message": f"共 {total} 只，需同步 {len(candidate)} 只（跳过 {len(up_to_date)} 只）"})
    else:
        candidate = all_stocks[start_offset:]
        emit({"type": "status", "message": f"开始同步 {total} 只股票（从第 {start_offset + 1} 只），并发 {SYNC_WORKERS} 线程..."})

    stocks = candidate
    sync_total = len(stocks)

    done = 0
    with ThreadPoolExecutor(max_workers=SYNC_WORKERS) as executor:
        futures = {executor.submit(_sync_one, s): s for s in stocks}
        for future in as_completed(futures):
            result = future.result()
            done += 1

            # Always emit progress (for progress bar accuracy)
            emit({
                "type": "progress",
                "code": result["code"],
                "name": result["name"],
                "inserted": result["inserted"],
                "latestDate": result["latestDate"],
                "error": result["error"],
                "index": done,
                "total": sync_total,
            })

            if result["error"]:
                emit({
                    "type": "error",
                    "code": result["code"],
                    "message": result["error"],
                    "resume_from": done - 1,
                })
                os._exit(0)  # close stdout immediately, ending the stream

    emit({"type": "done", "synced": sync_total})


# ── search ─────────────────────────────────────────────────────────────────

def cmd_search(query: str):
    sb = get_supabase()
    q = query.strip().lower()

    # Try DB first (fast)
    res = (
        sb.table("neolog_equity_list")
        .select("code,name,market,secid")
        .or_(f"code.ilike.%{q}%,name.ilike.%{q}%")
        .limit(20)
        .execute()
    )
    if res.data:
        print(json.dumps(res.data, ensure_ascii=False), flush=True)
        return

    # Fallback: akshare stock list
    try:
        df = ak.stock_info_a_code_name()
    except Exception as e:
        print(f"[bridge] search fallback error: {e}", file=sys.stderr)
        print(json.dumps([]), flush=True)
        return

    mask = (
        df["code"].str.contains(q, case=False, na=False) |
        df["name"].str.contains(q, case=False, na=False)
    )
    matched = df[mask].head(20)

    results = []
    for _, row in matched.iterrows():
        code = str(row["code"])
        market = "SH" if code.startswith("6") else "SZ"
        mkt_prefix = "1" if market == "SH" else "0"
        results.append({
            "code": code,
            "name": str(row["name"]),
            "market": market,
            "secid": f"{mkt_prefix}.{code}",
        })
    print(json.dumps(results, ensure_ascii=False), flush=True)


# ── entry point ────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        emit({"error": "usage: equity_bridge.py sync <code> | sync_all | search <query>"})
        sys.exit(1)

    cmd = sys.argv[1]
    try:
        if cmd == "sync":
            if len(sys.argv) < 3:
                raise ValueError("sync requires <code>")
            cmd_sync(sys.argv[2])
        elif cmd == "sync_all":
            offset_arg = int(sys.argv[2]) if len(sys.argv) >= 3 else 0
            cmd_sync_all(offset_arg)
        elif cmd == "search":
            if len(sys.argv) < 3:
                raise ValueError("search requires <query>")
            cmd_search(sys.argv[2])
        else:
            raise ValueError(f"unknown command: {cmd}")
    except Exception as e:
        print(f"[bridge] fatal: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
