"""
utils.py — Shared utilities for the equity bridge.

Provides:
  - emit()              Thread-safe NDJSON output to stdout
  - _normalize_date()   Accept YYYY-MM-DD or YYYYMMDD, return YYYYMMDD
  - _fetch_kline_data() Fetch daily kline records via akshare
"""

import json
import sys
import threading

import akshare as ak

_emit_lock = threading.Lock()


def emit(obj: dict):
    """Write one JSON event line to stdout (flushed, thread-safe)."""
    with _emit_lock:
        print(json.dumps(obj, ensure_ascii=False), flush=True)


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
