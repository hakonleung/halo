#!/usr/bin/env python3
"""
Equity data sync script using akshare.

Usage:
    python scripts/sync_equity.py                  # sync all tracked stocks
    python scripts/sync_equity.py --code 000001    # sync specific stock

Requirements:
    pip install akshare supabase python-dotenv

Environment variables (from .env.local):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_KEY  (service role key to bypass RLS)
"""

import argparse
import os
import sys
from datetime import datetime, timedelta

import akshare as ak
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def date_str(d: datetime) -> str:
    return d.strftime("%Y%m%d")


def get_latest_date(code: str) -> str | None:
    res = (
        supabase.table("neolog_equity_daily")
        .select("trade_date")
        .eq("code", code)
        .order("trade_date", desc=True)
        .limit(1)
        .execute()
    )
    rows = res.data
    return rows[0]["trade_date"] if rows else None


def sync_stock(code: str, secid: str) -> int:
    latest = get_latest_date(code)
    today = datetime.today()

    if latest:
        start_dt = datetime.strptime(latest, "%Y-%m-%d") + timedelta(days=1)
    else:
        start_dt = today - timedelta(days=365)

    if start_dt.date() > today.date():
        print(f"  {code}: already up to date")
        return 0

    start_str = date_str(start_dt)
    end_str = date_str(today)

    # Determine market prefix from secid (0=SZ, 1=SH)
    prefix = secid.split(".")[0]
    adjust_code = code
    period = "daily"
    adjust = "qfq"  # 前复权

    try:
        df = ak.stock_zh_a_hist(
            symbol=adjust_code,
            period=period,
            start_date=start_str,
            end_date=end_str,
            adjust=adjust,
        )
    except Exception as e:
        print(f"  {code}: fetch error — {e}")
        return 0

    if df is None or df.empty:
        print(f"  {code}: no new data")
        return 0

    rows = []
    for _, row in df.iterrows():
        rows.append({
            "code": code,
            "trade_date": str(row["日期"]),
            "open": float(row["开盘"]),
            "high": float(row["最高"]),
            "low": float(row["最低"]),
            "close": float(row["收盘"]),
            "volume": int(row["成交量"]),  # lots
            "amount": float(row["成交额"]) if row["成交额"] else None,
            "amplitude": float(row["振幅"]) if row["振幅"] else None,
            "change_pct": float(row["涨跌幅"]) if row["涨跌幅"] else None,
            "change_amount": float(row["涨跌额"]) if row["涨跌额"] else None,
            "turnover_rate": float(row["换手率"]) if row["换手率"] else None,
        })

    if not rows:
        return 0

    # Upsert in batches of 500
    batch_size = 500
    for i in range(0, len(rows), batch_size):
        batch = rows[i : i + batch_size]
        supabase.table("neolog_equity_daily").upsert(
            batch, on_conflict="code,trade_date"
        ).execute()

    # Update last_synced_at
    now = datetime.utcnow().isoformat()
    supabase.table("neolog_equity_list").update(
        {"last_synced_at": now, "updated_at": now}
    ).eq("code", code).execute()

    inserted = len(rows)
    print(f"  {code}: inserted {inserted} bars (up to {rows[-1]['trade_date']})")
    return inserted


def main():
    parser = argparse.ArgumentParser(description="Sync equity K-line data")
    parser.add_argument("--code", help="Specific stock code to sync")
    args = parser.parse_args()

    if args.code:
        res = (
            supabase.table("neolog_equity_list")
            .select("code,secid,name")
            .eq("code", args.code)
            .execute()
        )
        stocks = res.data
    else:
        res = supabase.table("neolog_equity_list").select("code,secid,name").execute()
        stocks = res.data

    if not stocks:
        print("No stocks found.")
        sys.exit(0)

    print(f"Syncing {len(stocks)} stock(s)...")
    total = 0
    for s in stocks:
        print(f"→ {s['name']} ({s['code']})")
        total += sync_stock(s["code"], s["secid"])

    print(f"\nDone. Total bars inserted: {total}")


if __name__ == "__main__":
    main()
