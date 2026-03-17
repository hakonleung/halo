"""
strategies/find_multi_timeframe.py — Multi-timeframe indicator resonance scanner.

Requires daily, weekly, and monthly timeframes to emit the same directional signal
simultaneously across MA cross, MACD, and RSI, reducing false positives from
single-timeframe noise.

stdin:
  {
    "stocks": [{"code": str, "dates": [str], "closes": [float], "volumes": [float]}],
    "signal_direction": "bullish"|"bearish"|"both",  // default "both"
    "required_timeframes": int,   // timeframes that must agree, default 3 (all)
    "indicators": ["ma_cross", "macd", "rsi"]  // default all three
  }

NDJSON output:
  {"type": "match", "code", "direction", "resonanceScore",
   "timeframeScores": {"daily", "weekly", "monthly"},
   "signals": {"daily": {...}, "weekly": {...}, "monthly": {...}},
   "latestDate"}
  {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys

import numpy as np

from utils import emit

MIN_RESONANCE = 0.6          # each timeframe must score ≥ this to count
WEIGHTS = {"daily": 0.4, "weekly": 0.35, "monthly": 0.25}
WEEKLY_BARS = 5
MONTHLY_BARS = 21
MIN_DAILY_BARS = 300         # enough history for monthly MA warm-up


# ── indicator helpers ──────────────────────────────────────────────────────────

def _ema(arr: np.ndarray, period: int) -> np.ndarray:
    alpha = 2.0 / (period + 1)
    out = np.empty_like(arr)
    out[0] = arr[0]
    for i in range(1, len(arr)):
        out[i] = alpha * arr[i] + (1 - alpha) * out[i - 1]
    return out


def _rsi(closes: np.ndarray, period: int = 14) -> float:
    if len(closes) < period + 1:
        return 50.0
    deltas = np.diff(closes[-(period + 1):])
    gains = deltas[deltas > 0].mean() if (deltas > 0).any() else 0.0
    losses = -deltas[deltas < 0].mean() if (deltas < 0).any() else 0.0
    if losses == 0:
        return 100.0
    return float(100 - 100 / (1 + gains / losses))


def _resample(closes: np.ndarray, period: int) -> np.ndarray:
    """Resample to coarser timeframe by taking the last close of each group."""
    n = len(closes)
    # Align from end so the most recent bar is always in its own group
    indices = list(range(period - 1, n, period))
    if not indices or indices[-1] != n - 1:
        indices.append(n - 1)
    return closes[indices]


def _signal_ma(closes: np.ndarray) -> str:
    if len(closes) < 60:
        return "neutral"
    ma5 = closes[-5:].mean()
    ma20 = closes[-20:].mean()
    ma60 = closes[-60:].mean()
    if ma5 > ma20 > ma60:
        return "bullish"
    if ma5 < ma20 < ma60:
        return "bearish"
    return "neutral"


def _signal_macd(closes: np.ndarray) -> str:
    if len(closes) < 26:
        return "neutral"
    ema12 = _ema(closes, 12)
    ema26 = _ema(closes, 26)
    dif = ema12 - ema26
    dea = _ema(dif, 9)
    hist = dif[-1] - dea[-1]
    if dif[-1] > dea[-1] and hist > 0:
        return "bullish"
    if dif[-1] < dea[-1] and hist < 0:
        return "bearish"
    return "neutral"


def _signal_rsi(closes: np.ndarray) -> str:
    rsi = _rsi(closes)
    if rsi < 30:
        return "bullish"
    if rsi > 70:
        return "bearish"
    return "neutral"


_SIGNAL_FNS = {
    "ma_cross": _signal_ma,
    "macd": _signal_macd,
    "rsi": _signal_rsi,
}


def _compute_signals(closes: np.ndarray, indicators: list[str]) -> dict[str, str]:
    return {ind: _SIGNAL_FNS[ind](closes) for ind in indicators if ind in _SIGNAL_FNS}


def _resonance_score(signals: dict[str, str], direction: str) -> float:
    if not signals:
        return 0.0
    matching = sum(1 for s in signals.values() if s == direction)
    return matching / len(signals)


def _analyze(stock: dict, signal_direction: str, required_timeframes: int,
             indicators: list[str]) -> dict | None:
    closes = np.array(stock["closes"], dtype=float)
    n = len(closes)
    if n < 30:
        return None

    weekly = _resample(closes, WEEKLY_BARS)
    monthly = _resample(closes, MONTHLY_BARS)

    timeframes = {
        "daily": closes,
        "weekly": weekly,
        "monthly": monthly,
    }

    all_signals: dict[str, dict[str, str]] = {}
    tf_scores: dict[str, float] = {}

    # Determine direction to test
    directions = ["bullish", "bearish"] if signal_direction == "both" else [signal_direction]

    best_direction: str | None = None
    best_total_score = -1.0
    best_tf_scores: dict[str, float] = {}
    best_signals: dict[str, dict[str, str]] = {}

    for direction in directions:
        tf_scores_try: dict[str, float] = {}
        signals_try: dict[str, dict[str, str]] = {}
        for tf_name, tf_closes in timeframes.items():
            sigs = _compute_signals(tf_closes, indicators)
            score = _resonance_score(sigs, direction)
            tf_scores_try[tf_name] = round(score, 3)
            signals_try[tf_name] = sigs

        qualifying = sum(1 for s in tf_scores_try.values() if s >= MIN_RESONANCE)
        if qualifying < required_timeframes:
            continue

        total = sum(WEIGHTS[tf] * tf_scores_try[tf] for tf in WEIGHTS)
        if total > best_total_score:
            best_total_score = total
            best_direction = direction
            best_tf_scores = tf_scores_try
            best_signals = signals_try

    if best_direction is None:
        return None

    return {
        "direction": best_direction,
        "resonanceScore": round(best_total_score, 3),
        "timeframeScores": best_tf_scores,
        "signals": best_signals,
        "latestDate": stock["dates"][-1],
    }


def run():
    data = json.loads(sys.stdin.read())
    stocks = data.get("stocks", [])
    signal_direction = data.get("signal_direction", "both")
    required_timeframes = int(data.get("required_timeframes", 3))
    indicators = data.get("indicators", ["ma_cross", "macd", "rsi"])

    results = []
    for stock in stocks:
        result = _analyze(stock, signal_direction, required_timeframes, indicators)
        if result is None:
            continue
        match = {"type": "match", "code": stock["code"], **result}
        results.append(match)
        emit(match)

    results.sort(key=lambda x: -x["resonanceScore"])
    emit({"type": "done", "total": len(results), "topMatches": results})
