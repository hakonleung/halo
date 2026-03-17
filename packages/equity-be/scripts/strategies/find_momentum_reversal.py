"""
strategies/find_momentum_reversal.py — Trend momentum reversal scanner.

Finds stocks in a strong directional trend that are now showing multiple
reversal signals simultaneously (RSI extreme, volume shrink, long shadow,
price divergence, close retreat).

stdin:
  {
    "stocks": [{"code": str, "dates": [str],
                "opens": [float], "highs": [float], "lows": [float],
                "closes": [float], "volumes": [float]}],
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


def _detect_signals(opens: np.ndarray, highs: np.ndarray, lows: np.ndarray,
                    closes: np.ndarray, volumes: np.ndarray,
                    lookback: int, reversal_window: int,
                    direction: str) -> list[str]:
    """Return list of triggered reversal signal names."""
    n = len(closes)
    signals: list[str] = []

    trend_closes = closes[-lookback:]
    trend_vols = volumes[-lookback:]
    rev_closes = closes[-reversal_window:]
    rev_highs = highs[-reversal_window:]
    rev_lows = lows[-reversal_window:]
    rev_opens = opens[-reversal_window:]

    # 1. RSI extreme
    rsi = _rsi(closes, 14)
    if direction == "top" and rsi > 75:
        signals.append("rsi_overbought")
    elif direction == "bottom" and rsi < 25:
        signals.append("rsi_oversold")

    # 2. Volume shrink: recent 3-day avg < trend avg * 0.6
    avg_trend_vol = trend_vols.mean() if trend_vols.mean() > 0 else 1.0
    avg_rev_vol = volumes[-3:].mean()
    if avg_rev_vol < avg_trend_vol * 0.6:
        signals.append("volume_shrink")

    # 3. Long shadow candle in reversal window
    for i in range(len(rev_closes)):
        amplitude = rev_highs[i] - rev_lows[i]
        if amplitude <= 0:
            continue
        if direction == "top":
            upper_shadow = rev_highs[i] - max(rev_opens[i], rev_closes[i])
            if upper_shadow > amplitude * 0.6:
                signals.append("long_upper_shadow")
                break
        else:
            lower_shadow = min(rev_opens[i], rev_closes[i]) - rev_lows[i]
            if lower_shadow > amplitude * 0.6:
                signals.append("long_lower_shadow")
                break

    # 4. Price divergence: new extreme but with diminished momentum
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

    # 5. Close retreat from intraday extreme
    for i in range(len(rev_closes)):
        if direction == "top":
            if rev_highs[i] > 0 and (rev_highs[i] - rev_closes[i]) / rev_highs[i] > 0.015:
                signals.append("close_retreat")
                break
        else:
            if rev_closes[i] > 0 and (rev_closes[i] - rev_lows[i]) / rev_closes[i] > 0.015:
                signals.append("close_retreat")
                break

    return signals


def _analyze(stock: dict, lookback: int, threshold: float,
             reversal_window: int) -> dict | None:
    closes = np.array(stock.get("closes", []), dtype=float)
    opens = np.array(stock.get("opens", []), dtype=float)
    highs = np.array(stock.get("highs", []), dtype=float)
    lows = np.array(stock.get("lows", []), dtype=float)
    volumes = np.array(stock.get("volumes", []), dtype=float)
    dates = stock["dates"]
    n = len(closes)

    if n < lookback + reversal_window:
        return None
    # Require OHLCV — gracefully degrade to closes-only if missing
    has_ohlcv = (len(opens) == n and len(highs) == n and
                 len(lows) == n and len(volumes) == n)
    if not has_ohlcv:
        opens = closes.copy()
        highs = closes.copy()
        lows = closes.copy()
        volumes = np.ones(n)

    score = _trend_score(closes[-lookback:])
    if abs(score) < threshold:
        return None

    direction = "top" if score > 0 else "bottom"
    signals = _detect_signals(opens, highs, lows, closes, volumes,
                               lookback, reversal_window, direction)

    if len(signals) < 3:
        return None

    return {
        "direction": direction,
        "trendScore": round(score, 6),
        "signalCount": len(signals),
        "signals": signals,
        "latestDate": dates[-1],
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
