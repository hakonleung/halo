"""
utils.py — Shared utilities for the equity bridge.

Provides:
  - emit()              Thread-safe NDJSON output to stdout
  - _normalize_date()   Accept YYYY-MM-DD or YYYYMMDD, return YYYYMMDD
  - _fetch_kline_data() Fetch daily kline records (东方财富 → 新浪 → baostock fallback)
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


def _yyyymmdd_to_dash(d: str) -> str:
    """Convert YYYYMMDD to YYYY-MM-DD."""
    return f"{d[:4]}-{d[4:6]}-{d[6:]}"


def _is_rate_limited(e: Exception) -> bool:
    return "57014" in str(e)


def _fetch_kline_em(code: str, start_yyyymmdd: str, end_yyyymmdd: str) -> list:
    """Primary source: 东方财富 (East Money)."""
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


def _fetch_kline_sina(code: str, start_yyyymmdd: str, end_yyyymmdd: str) -> list:
    """Fallback source: 新浪财经 (Sina Finance)."""
    prefix = "sh" if code.startswith("6") else "sz"
    df = ak.stock_zh_a_daily(
        symbol=f"{prefix}{code}",
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
            "trade_date": str(row["date"]),
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": int(row["volume"]),
            "amount": None,
            "amplitude": None,
            "change_pct": None,
            "change_amount": None,
            "turnover_rate": None,
        })
    return records


_BS_MAX_RETRIES = 3


def _bs_relogin():
    """(Re)login to baostock, creating a fresh TCP connection."""
    import baostock as bs

    try:
        bs.logout()
    except Exception:
        pass
    lg = bs.login()
    if lg.error_code != "0":
        raise Exception(f"baostock login failed: {lg.error_msg}")
    print("[bridge] baostock 登录成功", file=sys.stderr)


_bs_initialized = False


def _ensure_bs_login():
    global _bs_initialized
    if not _bs_initialized:
        import atexit
        import baostock as bs
        _bs_relogin()
        def _logout():
            bs.logout()
            print("[bridge] baostock 已登出", file=sys.stderr)
        atexit.register(_logout)
        _bs_initialized = True


def _fetch_kline_bs(code: str, start_yyyymmdd: str, end_yyyymmdd: str) -> list:
    """Primary source: baostock. Retries with re-login on 10001001 errors."""
    import baostock as bs

    _ensure_bs_login()

    prefix = "sh" if code.startswith("6") else "sz"
    bs_code = f"{prefix}.{code}"
    start = _yyyymmdd_to_dash(start_yyyymmdd)
    end = _yyyymmdd_to_dash(end_yyyymmdd)

    rs = None
    for attempt in range(_BS_MAX_RETRIES):
        rs = bs.query_history_k_data_plus(
            bs_code,
            "date,open,high,low,close,volume,amount,turn,pctChg",
            start_date=start,
            end_date=end,
            frequency="d",
            adjustflag="2",
        )
        if rs.error_code == "0":
            break
        print(f"[bridge] baostock 查询失败({rs.error_code}: {rs.error_msg})，重新登录重试 {attempt + 1}/{_BS_MAX_RETRIES}: {code}", file=sys.stderr)
        _bs_relogin()
    if rs.error_code != "0":
        raise Exception(f"baostock query failed after {_BS_MAX_RETRIES} retries: {rs.error_msg}")

    def _col(row: list, i: int) -> str:
        return row[i] if i < len(row) else ""

    records = []
    while rs.error_code == "0" and rs.next():
        row = rs.get_row_data()
        records.append({
            "code": code,
            "trade_date": _col(row, 0),
            "open": float(_col(row, 1)) if _col(row, 1) else 0.0,
            "high": float(_col(row, 2)) if _col(row, 2) else 0.0,
            "low": float(_col(row, 3)) if _col(row, 3) else 0.0,
            "close": float(_col(row, 4)) if _col(row, 4) else 0.0,
            "volume": int(float(_col(row, 5))) if _col(row, 5) else 0,
            "amount": float(_col(row, 6)) if _col(row, 6) else None,
            "amplitude": None,
            "change_pct": float(_col(row, 8)) if _col(row, 8) else None,
            "change_amount": None,
            "turnover_rate": float(_col(row, 7)) if _col(row, 7) else None,
        })
    return records


def _fetch_kline_data(code: str, start_yyyymmdd: str, end_yyyymmdd: str) -> list:
    return _fetch_kline_bs(code, start_yyyymmdd, end_yyyymmdd)
