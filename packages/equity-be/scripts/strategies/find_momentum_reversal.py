"""
strategies/find_momentum_reversal.py — Trend momentum reversal scanner.

Finds stocks in a strong directional trend that are now showing multiple
reversal signals simultaneously (RSI extreme, volume shrink, long shadow,
price divergence, close retreat).

stdin:
  {
    "stocks": [{"code": str, "bars": [{"trade_date": str, "open": float, "high": float,
                                       "low": float, "close": float, "volume": float, ...}]}],
    "lookback_days": int,        // trend observation window, default 20
    "momentum_threshold": float, // min |trend_score| to qualify, default 0.3
    "reversal_window": int       // days to scan for reversal signals, default 3
  }

NDJSON output:
  {"type": "match", "code", "direction": "top"|"bottom",
   "trendScore", "signalCount", "signals": [...], "latestDate"}
  {"type": "done", "total", "topMatches": [...]}
"""

import json
import sys

import numpy as np

from utils import emit

LOOKBACK_DAYS = 20
MOMENTUM_THRESHOLD = 0.3
REVERSAL_WINDOW = 3


def _trend_score(closes: np.ndarray) -> float:
    """Linear regression slope × R² on the lookback window (normalised by mean price)."""
    n = len(closes)
    x = np.arange(n, dtype=float)
    coeffs = np.polyfit(x, closes, 1)
    slope = coeffs[0]
    y_pred = np.polyval(coeffs, x)
    ss_res = float(np.sum((closes - y_pred) ** 2))
    ss_tot = float(np.sum((closes - closes.mean()) ** 2))
    r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0
    # Normalise slope by mean price so scores are comparable across stocks
    norm_slope = slope / (closes.mean() + 1e-9)
    return float(norm_slope * r2)


def _rsi(closes: np.ndarray, period: int = 14) -> float:
    if len(closes) < period + 1:
        return 50.0
    deltas = np.diff(closes[-(period + 1):])
    gains = deltas[deltas > 0].mean() if (deltas > 0).any() else 0.0
    losses = -deltas[deltas < 0].mean() if (deltas < 0).any() else 0.0
    if losses == 0:
        return 100.0
    return float(100 - 100 / (1 + gains / losses))


def _detect_signals(bars: list, lookback: int, reversal_window: int,
                    direction: str) -> list[str]:
    """Return list of triggered reversal signal names."""
    signals: list[str] = []

    trend_bars = bars[-lookback:]
    rev_bars = bars[-reversal_window:]

    # 1. RSI extreme — needs numpy
    closes = np.array([b["close"] for b in bars], dtype=float)
    rsi = _rsi(closes, 14)
    if direction == "top" and rsi > 75:
        signals.append("rsi_overbought")
    elif direction == "bottom" and rsi < 25:
        signals.append("rsi_oversold")

    # 2. Volume shrink: recent 3-day avg < trend avg * 0.6 — needs numpy
    trend_vols = np.array([b["volume"] for b in trend_bars], dtype=float)
    avg_trend_vol = trend_vols.mean() if trend_vols.mean() > 0 else 1.0
    avg_rev_vol = np.array([b["volume"] for b in bars[-3:]], dtype=float).mean()
    if avg_rev_vol < avg_trend_vol * 0.6:
        signals.append("volume_shrink")

    # 3. Long shadow candle in reversal window — direct field access
    for bar in rev_bars:
        amplitude = bar["high"] - bar["low"]
        if amplitude <= 0:
            continue
        if direction == "top":
            upper_shadow = bar["high"] - max(bar["open"], bar["close"])
            if upper_shadow > amplitude * 0.6:
                signals.append("long_upper_shadow")
                break
        else:
            lower_shadow = min(bar["open"], bar["close"]) - bar["low"]
            if lower_shadow > amplitude * 0.6:
                signals.append("long_lower_shadow")
                break

    # 4. Price divergence: new extreme but with diminished momentum — needs numpy
    trend_closes = np.array([b["close"] for b in trend_bars], dtype=float)
    if len(trend_closes) >= 4:
        half = len(trend_closes) // 2
        if direction == "top":
            prev_peak = trend_closes[:half].max()
            curr_peak = trend_closes[half:].max()
            if curr_peak > prev_peak:
                prev_gain = (prev_peak - trend_closes[0]) / (trend_closes[0] + 1e-9)
                curr_gain = (curr_peak - trend_closes[half]) / (trend_closes[half] + 1e-9)
                if curr_gain < prev_gain * 0.5:
                    signals.append("price_divergence")
        else:
            prev_trough = trend_closes[:half].min()
            curr_trough = trend_closes[half:].min()
            if curr_trough < prev_trough:
                prev_drop = (trend_closes[0] - prev_trough) / (trend_closes[0] + 1e-9)
                curr_drop = (trend_closes[half] - curr_trough) / (trend_closes[half] + 1e-9)
                if curr_drop < prev_drop * 0.5:
                    signals.append("price_divergence")

    # 5. Close retreat from intraday extreme — direct field access
    for bar in rev_bars:
        if direction == "top":
            if bar["high"] > 0 and (bar["high"] - bar["close"]) / bar["high"] > 0.015:
                signals.append("close_retreat")
                break
        else:
            if bar["close"] > 0 and (bar["close"] - bar["low"]) / bar["close"] > 0.015:
                signals.append("close_retreat")
                break

    return signals


def _analyze(stock: dict, lookback: int, threshold: float,
             reversal_window: int) -> dict | None:
    bars = stock["bars"]
    n = len(bars)

    if n < lookback + reversal_window:
        return None

    closes = np.array([b["close"] for b in bars[-lookback:]], dtype=float)
    score = _trend_score(closes)
    if abs(score) < threshold:
        return None

    direction = "top" if score > 0 else "bottom"
    signals = _detect_signals(bars, lookback, reversal_window, direction)

    if len(signals) < 3:
        return None

    return {
        "direction": direction,
        "trendScore": round(score, 6),
        "signalCount": len(signals),
        "signals": signals,
        "latestDate": bars[-1]["trade_date"],
    }


def run():
    data = json.loads(sys.stdin.read())
    stocks = data.get("stocks", [])
    lookback = int(data.get("lookback_days", LOOKBACK_DAYS))
    threshold = float(data.get("momentum_threshold", MOMENTUM_THRESHOLD))
    reversal_window = int(data.get("reversal_window", REVERSAL_WINDOW))

    results = []
    for stock in stocks:
        result = _analyze(stock, lookback, threshold, reversal_window)
        if result is None:
            continue
        match = {"type": "match", "code": stock["code"], **result}
        results.append(match)
        emit(match)

    results.sort(key=lambda x: -(abs(x["trendScore"]) * x["signalCount"]))
    emit({"type": "done", "total": len(results), "topMatches": results})
