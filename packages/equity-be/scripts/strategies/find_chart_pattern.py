"""
strategies/find_chart_pattern.py — Classic chart pattern recogniser.

Detects head & shoulders (top/bottom), double top/bottom, and triangle
consolidations (ascending, descending, symmetrical) using pivot-point
detection and geometric constraint validation. Pure numpy, no scipy.

stdin:
  {
    "stocks": [{"code": str, "bars": [{"trade_date": str, "open": float, "high": float,
                                       "low": float, "close": float, "volume": float, ...}]}],
    "patterns": ["head_shoulders_top", "head_shoulders_bottom",
                 "double_top", "double_bottom",
                 "ascending_triangle", "descending_triangle",
                 "symmetrical_triangle"],  // default: all
    "lookback_days": int,   // window to search within, default 60
    "tolerance": float      // key-price equality tolerance (ratio), default 0.02
  }

NDJSON output:
  {"type": "match", "code", "pattern", "keyDates", "keyPrices",
   "neckline"|null, "breakoutTarget", "confidence", "status"}
  {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys

import numpy as np

from utils import emit

LOOKBACK_DAYS = 60
TOLERANCE = 0.02
ALL_PATTERNS = [
    "head_shoulders_top", "head_shoulders_bottom",
    "double_top", "double_bottom",
    "ascending_triangle", "descending_triangle", "symmetrical_triangle",
]
PIVOT_ORDER = 4   # each side must have this many bars confirming an extreme


# ── pivot detection ────────────────────────────────────────────────────────────

def _peaks(arr: np.ndarray, order: int = PIVOT_ORDER) -> np.ndarray:
    n = len(arr)
    out = []
    for i in range(order, n - order):
        window = arr[i - order: i + order + 1]
        if arr[i] == window.max():
            out.append(i)
    return np.array(out, dtype=int)


def _valleys(arr: np.ndarray, order: int = PIVOT_ORDER) -> np.ndarray:
    return _peaks(-arr, order)


# ── pattern checkers ───────────────────────────────────────────────────────────

def _head_shoulders(highs: np.ndarray, closes: np.ndarray, dates: list,
                    tolerance: float, is_top: bool) -> dict | None:
    """Head & shoulders top or bottom."""
    arr = highs if is_top else -np.array(closes)  # mirror for bottom
    raw_highs = np.array(highs) if is_top else np.array(closes)
    pk = _peaks(arr)
    vl = _valleys(arr)

    if len(pk) < 3:
        return None

    # Try last three peaks as (left shoulder, head, right shoulder)
    L_i, H_i, R_i = pk[-3], pk[-2], pk[-1]
    L, H, R = raw_highs[L_i], raw_highs[H_i], raw_highs[R_i]

    flip = 1 if is_top else -1
    # Head must be the most extreme
    if not (flip * H > flip * L and flip * H > flip * R):
        return None
    # Shoulders roughly equal
    if abs(L - R) / (abs(H) + 1e-9) > tolerance:
        return None

    # Neckline valleys between shoulders
    neck_vs = [v for v in vl if L_i < v < H_i or H_i < v < R_i]
    if len(neck_vs) < 2:
        return None
    neckline = float(np.mean([raw_highs[v] for v in neck_vs]))

    # Breakout target: mirror of head above/below neckline
    target = neckline - flip * abs(H - neckline)

    confidence = 70
    latest = float(closes[-1])
    if is_top and latest < neckline:
        status, confidence = "confirmed", 100
    elif not is_top and latest > neckline:
        status, confidence = "confirmed", 100
    else:
        status = "forming"

    return {
        "pattern": "head_shoulders_top" if is_top else "head_shoulders_bottom",
        "keyDates": [dates[L_i], dates[H_i], dates[R_i]],
        "keyPrices": [round(float(L), 3), round(float(H), 3), round(float(R), 3)],
        "neckline": round(neckline, 3),
        "breakoutTarget": round(float(target), 3),
        "confidence": confidence,
        "status": status,
    }


def _double_top_bottom(highs: np.ndarray, lows: np.ndarray, closes: np.ndarray,
                       dates: list, tolerance: float, is_top: bool) -> dict | None:
    """Double top or double bottom."""
    arr = highs if is_top else lows
    pk = _peaks(arr) if is_top else _valleys(arr)
    vl = _valleys(arr) if is_top else _peaks(arr)

    if len(pk) < 2:
        return None

    P1_i, P2_i = pk[-2], pk[-1]
    P1, P2 = float(arr[P1_i]), float(arr[P2_i])

    # Peaks/troughs roughly equal
    if abs(P1 - P2) / (max(abs(P1), abs(P2)) + 1e-9) > tolerance:
        return None
    # Separation: 10–50 bars
    sep = P2_i - P1_i
    if not (10 <= sep <= 50):
        return None

    # Neckline: deepest point between the two peaks
    between = arr[P1_i: P2_i + 1]
    neck_rel = int(np.argmin(between) if is_top else np.argmax(between))
    neck_i = P1_i + neck_rel
    neckline = float(arr[neck_i])

    # Target: distance from peak to neckline, projected opposite
    dist = abs(((P1 + P2) / 2) - neckline)
    target = neckline - dist if is_top else neckline + dist

    latest = float(closes[-1])
    if is_top and latest < neckline:
        status, confidence = "confirmed", 90
    elif not is_top and latest > neckline:
        status, confidence = "confirmed", 90
    else:
        status, confidence = "forming", 65

    return {
        "pattern": "double_top" if is_top else "double_bottom",
        "keyDates": [dates[P1_i], dates[neck_i], dates[P2_i]],
        "keyPrices": [round(P1, 3), round(neckline, 3), round(P2, 3)],
        "neckline": round(neckline, 3),
        "breakoutTarget": round(float(target), 3),
        "confidence": confidence,
        "status": status,
    }


def _triangle(highs: np.ndarray, lows: np.ndarray, closes: np.ndarray,
              dates: list, pattern: str) -> dict | None:
    """Ascending, descending, or symmetrical triangle."""
    pk = _peaks(highs)
    vl = _valleys(lows)

    if len(pk) < 2 or len(vl) < 2:
        return None

    x_pk = pk[-min(4, len(pk)):].astype(float)
    y_pk = highs[pk[-min(4, len(pk)):]].astype(float)
    x_vl = vl[-min(4, len(vl)):].astype(float)
    y_vl = lows[vl[-min(4, len(vl)):]].astype(float)

    if len(x_pk) < 2 or len(x_vl) < 2:
        return None

    upper_slope = float(np.polyfit(x_pk, y_pk, 1)[0])
    lower_slope = float(np.polyfit(x_vl, y_vl, 1)[0])

    flat = 1e-5  # near-zero slope threshold
    if pattern == "ascending_triangle":
        if not (abs(upper_slope) < flat * max(abs(y_pk.mean()), 1) and lower_slope > 0):
            return None
    elif pattern == "descending_triangle":
        if not (upper_slope < 0 and abs(lower_slope) < flat * max(abs(y_vl.mean()), 1)):
            return None
    elif pattern == "symmetrical_triangle":
        if not (upper_slope < 0 and lower_slope > 0):
            return None
        if abs(upper_slope + lower_slope) > abs(upper_slope - lower_slope) * 0.3:
            return None
    else:
        return None

    # Triangle height at start = range between upper and lower regression at first pivot
    x0 = min(float(x_pk[0]), float(x_vl[0]))
    upper_at_x0 = float(np.polyval(np.polyfit(x_pk, y_pk, 1), x0))
    lower_at_x0 = float(np.polyval(np.polyfit(x_vl, y_vl, 1), x0))
    height = abs(upper_at_x0 - lower_at_x0)

    latest = float(closes[-1])
    upper_now = float(np.polyval(np.polyfit(x_pk, y_pk, 1), len(closes) - 1))
    lower_now = float(np.polyval(np.polyfit(x_vl, y_vl, 1), len(closes) - 1))

    if latest > upper_now:
        status = "confirmed"
        target = latest + height
    elif latest < lower_now:
        status = "confirmed"
        target = latest - height
    else:
        status = "forming"
        target = upper_now + height  # provisional upside target

    key_dates = [dates[int(i)] for i in [x_pk[0], x_pk[-1], x_vl[0], x_vl[-1]]
                 if 0 <= int(i) < len(dates)]
    key_prices = [round(float(highs[int(i)]), 3) for i in x_pk[:2]] + \
                 [round(float(lows[int(i)]), 3) for i in x_vl[:2]]

    return {
        "pattern": pattern,
        "keyDates": key_dates,
        "keyPrices": key_prices,
        "neckline": None,
        "breakoutTarget": round(float(target), 3),
        "confidence": 80 if status == "confirmed" else 55,
        "status": status,
    }


# ── volume confidence bonus ────────────────────────────────────────────────────

def _volume_bonus(volumes: np.ndarray, pattern_end_idx: int) -> int:
    """+20 if consolidation shows shrinking volume, 0 otherwise."""
    if len(volumes) == 0:
        return 0
    pattern_vols = volumes[max(0, pattern_end_idx - 20): pattern_end_idx]
    if len(pattern_vols) < 5:
        return 0
    x = np.arange(len(pattern_vols), dtype=float)
    slope = float(np.polyfit(x, pattern_vols, 1)[0])
    return 20 if slope < 0 else 0


# ── per-stock entry point ──────────────────────────────────────────────────────

def _analyze_stock(stock: dict, patterns: list[str], lookback: int,
                   tolerance: float) -> list[dict]:
    bars = stock["bars"]
    closes = np.array([b["close"] for b in bars], dtype=float)
    highs = np.array([b["high"] for b in bars], dtype=float)[-lookback:]
    lows = np.array([b["low"] for b in bars], dtype=float)[-lookback:]
    closes_w = closes[-lookback:]
    dates_w = [b["trade_date"] for b in bars][-lookback:]
    volumes = np.array([b["volume"] for b in bars], dtype=float)

    if len(closes_w) < 20:
        return []

    found = []
    checkers = {
        "head_shoulders_top":    lambda: _head_shoulders(highs, closes_w, dates_w, tolerance, True),
        "head_shoulders_bottom": lambda: _head_shoulders(highs, closes_w, dates_w, tolerance, False),
        "double_top":            lambda: _double_top_bottom(highs, lows, closes_w, dates_w, tolerance, True),
        "double_bottom":         lambda: _double_top_bottom(highs, lows, closes_w, dates_w, tolerance, False),
        "ascending_triangle":    lambda: _triangle(highs, lows, closes_w, dates_w, "ascending_triangle"),
        "descending_triangle":   lambda: _triangle(highs, lows, closes_w, dates_w, "descending_triangle"),
        "symmetrical_triangle":  lambda: _triangle(highs, lows, closes_w, dates_w, "symmetrical_triangle"),
    }

    for pat in patterns:
        checker = checkers.get(pat)
        if checker is None:
            continue
        result = checker()
        if result is None:
            continue
        if len(volumes) > 0:
            result["confidence"] = min(100, result["confidence"] + _volume_bonus(volumes, lookback))
        found.append(result)

    return found


def run():
    data = json.loads(sys.stdin.read())
    stocks = data.get("stocks", [])
    patterns = data.get("patterns", ALL_PATTERNS)
    lookback = int(data.get("lookback_days", LOOKBACK_DAYS))
    tolerance = float(data.get("tolerance", TOLERANCE))

    results = []
    for stock in stocks:
        matches = _analyze_stock(stock, patterns, lookback, tolerance)
        for m in matches:
            match = {"type": "match", "code": stock["code"], **m}
            results.append(match)
            emit(match)

    results.sort(key=lambda x: -x["confidence"])
    emit({"type": "done", "total": len(results), "topMatches": results})
