"""
strategies/find_volume_price_divergence.py — OBV/volume-price divergence scanner.

Detects mismatches between price movement and volume flow (OBV) within a rolling
window. A price rise with falling OBV signals distribution; a price fall with rising
OBV signals accumulation.

stdin:
  {
    "stocks": [{"code": str, "bars": [{"trade_date": str, "open": float, "high": float,
                                       "low": float, "close": float, "volume": float, ...}]}],
    "scan_window": int,          // default 20
    "divergence_min_gap": int,   // min days between pivot comparison points, default 5
  }

NDJSON output:
  {"type": "match", "code", "divergenceType", "priceChange", "obvChange",
   "divergenceStrength", "mfi"|null, "consecutiveShrinkDays", "latestDate"}
  {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys

import numpy as np

from utils import emit

SCAN_WINDOW = 20
DIVERGENCE_MIN_GAP = 5


def _compute_obv(closes: np.ndarray, volumes: np.ndarray) -> np.ndarray:
    n = len(closes)
    obv = np.zeros(n)
    for i in range(1, n):
        if closes[i] > closes[i - 1]:
            obv[i] = obv[i - 1] + volumes[i]
        elif closes[i] < closes[i - 1]:
            obv[i] = obv[i - 1] - volumes[i]
        else:
            obv[i] = obv[i - 1]
    return obv


def _compute_mfi(closes: np.ndarray, highs: np.ndarray, lows: np.ndarray,
                 volumes: np.ndarray, period: int = 14) -> float | None:
    n = len(closes)
    if n < period + 1:
        return None
    tp = (highs + lows + closes) / 3
    mf = tp * volumes
    pos = np.where(np.diff(tp) > 0, mf[1:], 0.0)
    neg = np.where(np.diff(tp) < 0, mf[1:], 0.0)
    pos_sum = pos[-(period):].sum()
    neg_sum = neg[-(period):].sum()
    if neg_sum == 0:
        return 100.0
    return float(100 - 100 / (1 + pos_sum / neg_sum))


def _analyze(stock: dict, scan_window: int) -> dict | None:
    bars = stock["bars"]
    closes = np.array([b["close"] for b in bars], dtype=float)
    volumes = np.array([b["volume"] for b in bars], dtype=float)
    n = len(bars)
    if n < scan_window + 5:
        return None

    obv = _compute_obv(closes, volumes)

    # Work within scan window
    wc = closes[-scan_window:]
    wo = obv[-scan_window:]
    x = np.arange(scan_window, dtype=float)

    price_slope = float(np.polyfit(x, wc, 1)[0])
    obv_slope = float(np.polyfit(x, wo, 1)[0])

    price_change_pct = float((wc[-1] - wc[0]) / (wc[0] + 1e-9) * 100)
    obv_denom = abs(float(wo[0])) if wo[0] != 0 else 1.0
    obv_change_pct = float((wo[-1] - wo[0]) / obv_denom * 100)

    # Divergence classification
    divergence_type: str | None = None
    if price_slope > 0 and obv_slope < 0:
        divergence_type = "bearish_classic"       # price up, OBV down → distribution
    elif price_slope < 0 and obv_slope > 0:
        divergence_type = "bullish_classic"       # price down, OBV up → accumulation
    elif price_slope <= 0 and obv_slope < 0 and abs(obv_slope) > abs(price_slope) * 1.5:
        divergence_type = "hidden_bearish"        # OBV falls faster than price → quiet exit
    else:
        # Volume exhaustion: price keeps rising but each rally is weaker while volume expands
        half = scan_window // 2
        gain_first = (wc[half] - wc[0]) / (wc[0] + 1e-9)
        gain_second = (wc[-1] - wc[half]) / (wc[half] + 1e-9)
        vol_first = volumes[-(scan_window):-half].mean() if half > 0 else 0
        vol_second = volumes[-half:].mean() if half > 0 else 0
        if gain_second < gain_first * 0.5 and vol_second > vol_first * 1.2:
            divergence_type = "volume_exhaustion"

    if divergence_type is None:
        return None

    denom = max(abs(price_change_pct), abs(obv_change_pct), 1e-9)
    divergence_strength = round(min(1.0, abs(price_change_pct - obv_change_pct) / denom), 3)

    # Consecutive shrink days
    avg_vol = volumes[-20:].mean() if n >= 20 else volumes.mean()
    shrink_thresh = avg_vol * 0.5
    consecutive_shrink = 0
    for i in range(n - 1, max(0, n - 20), -1):
        if volumes[i] < shrink_thresh:
            consecutive_shrink += 1
        else:
            break

    # MFI — highs and lows always present in DailyBarRecord
    highs = np.array([b["high"] for b in bars], dtype=float)
    lows = np.array([b["low"] for b in bars], dtype=float)
    mfi: float | None = _compute_mfi(closes, highs, lows, volumes)

    result: dict = {
        "divergenceType": divergence_type,
        "priceChange": round(price_change_pct, 2),
        "obvChange": round(obv_change_pct, 2),
        "divergenceStrength": divergence_strength,
        "consecutiveShrinkDays": consecutive_shrink,
        "latestDate": bars[-1]["trade_date"],
    }
    if mfi is not None:
        result["mfi"] = round(mfi, 1)
    return result


def run():
    data = json.loads(sys.stdin.read())
    stocks = data.get("stocks", [])
    scan_window = int(data.get("scan_window", SCAN_WINDOW))

    results = []
    for stock in stocks:
        result = _analyze(stock, scan_window)
        if result is None:
            continue
        match = {"type": "match", "code": stock["code"], **result}
        results.append(match)
        emit(match)

    results.sort(key=lambda x: -x["divergenceStrength"])
    emit({"type": "done", "total": len(results), "topMatches": results})
