"""
strategies/find_breakout.py — Bollinger Band squeeze breakout scanner.

Identifies stocks where volatility has compressed to a historical low (squeeze)
and are now breaking out (or about to) in a direction confirmed by volume.

stdin:
  {
    "stocks": [{"code": str, "bars": [{"trade_date": str, "open": float, "high": float,
                                       "low": float, "close": float, "volume": float, ...}]}],
    "bb_period": int,             // default 20
    "squeeze_percentile": float,  // bandwidth must be ≤ this historical percentile, default 10
    "squeeze_min_days": int,      // consecutive squeeze days required, default 5
  }

NDJSON output:
  {"type": "match", "code", "squeezeStartDate", "squeezeDays",
   "breakoutDirection": "up"|"down"|"pending",
   "breakoutDate": str|null, "currentBandwidth", "bandwidthPercentile",
   "volumeRatio", "confidence": "high"|"medium"|"low"}
  {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys

import numpy as np

from utils import emit

BB_PERIOD = 20
SQUEEZE_PERCENTILE = 10.0
SQUEEZE_MIN_DAYS = 5


def _rolling_stats(arr: np.ndarray, period: int):
    """Vectorised rolling mean and std; first (period-1) slots are nan."""
    n = len(arr)
    if n < period:
        return np.full(n, np.nan), np.full(n, np.nan)
    shape = (n - period + 1, period)
    strides = (arr.strides[0], arr.strides[0])
    windows = np.lib.stride_tricks.as_strided(arr, shape=shape, strides=strides)
    means = windows.mean(axis=1)
    stds = windows.std(axis=1)
    pad = np.full(period - 1, np.nan)
    return np.concatenate([pad, means]), np.concatenate([pad, stds])


def _analyze(stock: dict, bb_period: int, squeeze_percentile: float,
             squeeze_min_days: int) -> dict | None:
    bars = stock["bars"]
    closes = np.array([b["close"] for b in bars], dtype=float)
    volumes = np.array([b["volume"] for b in bars], dtype=float)
    dates = [b["trade_date"] for b in bars]
    n = len(bars)
    has_volumes = len(volumes) == n

    if n < bb_period + squeeze_min_days + 1:
        return None

    means, stds = _rolling_stats(closes, bb_period)

    # Relative bandwidth = 4σ / μ  (eliminates price scale)
    with np.errstate(invalid="ignore", divide="ignore"):
        bandwidth = np.where(means > 0, 4 * stds / means, np.nan)

    valid_bw = bandwidth[~np.isnan(bandwidth)]
    if len(valid_bw) < bb_period + 1:
        return None

    threshold = float(np.percentile(valid_bw, squeeze_percentile))

    # Count consecutive squeeze days from the end
    squeeze_days = 0
    squeeze_start_idx = n - 1
    for i in range(n - 1, -1, -1):
        if not np.isnan(bandwidth[i]) and bandwidth[i] <= threshold:
            squeeze_days += 1
            squeeze_start_idx = i
        else:
            break

    if squeeze_days < squeeze_min_days:
        return None

    current_bw = bandwidth[-1]
    if np.isnan(current_bw):
        return None

    bw_percentile = float(np.mean(valid_bw <= current_bw) * 100)

    upper = means[-1] + 2 * stds[-1]
    lower = means[-1] - 2 * stds[-1]
    latest = closes[-1]

    if latest > upper:
        direction, breakout_date = "up", dates[-1]
    elif latest < lower:
        direction, breakout_date = "down", dates[-1]
    else:
        direction, breakout_date = "pending", None

    # Volume ratio: latest bar vs average during squeeze
    volume_ratio = 1.0
    if has_volumes and squeeze_start_idx < n - 1:
        squeeze_vols = volumes[squeeze_start_idx : n - 1]
        avg = squeeze_vols.mean()
        if avg > 0:
            volume_ratio = float(volumes[-1] / avg)

    if volume_ratio > 2.0 and direction != "pending":
        confidence = "high"
    elif volume_ratio > 1.5 and direction != "pending":
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "squeezeStartDate": dates[squeeze_start_idx],
        "squeezeDays": squeeze_days,
        "breakoutDirection": direction,
        "breakoutDate": breakout_date,
        "currentBandwidth": round(float(current_bw), 6),
        "bandwidthPercentile": round(bw_percentile, 1),
        "volumeRatio": round(volume_ratio, 2),
        "confidence": confidence,
    }


def run():
    data = json.loads(sys.stdin.read())
    stocks = data.get("stocks", [])
    bb_period = int(data.get("bb_period", BB_PERIOD))
    squeeze_percentile = float(data.get("squeeze_percentile", SQUEEZE_PERCENTILE))
    squeeze_min_days = int(data.get("squeeze_min_days", SQUEEZE_MIN_DAYS))

    results = []
    for stock in stocks:
        result = _analyze(stock, bb_period, squeeze_percentile, squeeze_min_days)
        if result is None:
            continue
        match = {"type": "match", "code": stock["code"], **result}
        results.append(match)
        emit(match)

    conf_rank = {"high": 0, "medium": 1, "low": 2}
    results.sort(key=lambda x: (conf_rank[x["confidence"]], -x["squeezeDays"]))
    emit({"type": "done", "total": len(results), "topMatches": results})
