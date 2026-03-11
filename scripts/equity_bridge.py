#!/usr/bin/env python3
"""
equity_bridge.py — Python bridge called by the Next.js server via child_process.

Subcommands (output is always JSON to stdout):
  sync <code>     — sync one stock's daily K-line data into Supabase
  search <query>  — search stocks by code or name

Env vars (from .env.local):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_KEY
"""

import json
import os
import sys
from datetime import datetime, timedelta

import akshare as ak
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")


def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ── sync ───────────────────────────────────────────────────────────────────

def cmd_sync(code: str) -> dict:
    sb = get_supabase()

    # Get latest trade_date from DB
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

    print(f"[equity_bridge] sync {code}: {start_str} → {end_str}", file=sys.stderr)

    try:
        df = ak.stock_zh_a_hist(
            symbol=code,
            period="daily",
            start_date=start_str,
            end_date=end_str,
            adjust="qfq",
        )
    except Exception as e:
        print(f"[equity_bridge] akshare error: {e}", file=sys.stderr)
        raise

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

    # Upsert in batches of 500
    batch_size = 500
    for i in range(0, len(records), batch_size):
        sb.table("neolog_equity_daily").upsert(
            records[i: i + batch_size], on_conflict="code,trade_date"
        ).execute()

    latest_date = records[-1]["trade_date"] if records else latest
    print(f"[equity_bridge] inserted {len(records)} bars", file=sys.stderr)
    return {"code": code, "inserted": len(records), "latestDate": latest_date}


# ── search ─────────────────────────────────────────────────────────────────

def cmd_search(query: str) -> list:
    try:
        df = ak.stock_info_a_code_name()
    except Exception as e:
        print(f"[equity_bridge] search error: {e}", file=sys.stderr)
        return []

    q = query.strip().lower()
    mask = (
        df["code"].str.contains(q, case=False, na=False) |
        df["name"].str.contains(q, case=False, na=False)
    )
    matched = df[mask].head(20)

    results = []
    for _, row in matched.iterrows():
        code = str(row["code"])
        market: str = "SH" if code.startswith("6") else "SZ"
        mkt_prefix = "1" if market == "SH" else "0"
        results.append({
            "code": code,
            "name": str(row["name"]),
            "market": market,
            "secid": f"{mkt_prefix}.{code}",
        })
    return results


# ── entry point ────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: equity_bridge.py sync <code> | search <query>"}))
        sys.exit(1)

    cmd = sys.argv[1]

    try:
        if cmd == "sync":
            if len(sys.argv) < 3:
                raise ValueError("sync requires <code>")
            result = cmd_sync(sys.argv[2])
            print(json.dumps(result))

        elif cmd == "search":
            if len(sys.argv) < 3:
                raise ValueError("search requires <query>")
            result = cmd_search(sys.argv[2])
            print(json.dumps(result))

        else:
            raise ValueError(f"unknown command: {cmd}")

    except Exception as e:
        print(f"[equity_bridge] fatal: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
