"""
strategies/find_similar.py — Pattern similarity search strategy.

Two-phase algorithm:
  Phase 1 — Z-score Pearson sliding window across all stocks → top N by similarity
  Phase 2 — Total Return filter: discard candidates whose window return
             differs from the query return by more than RETURN_THRESHOLD pp

stdin:
  {
    "window_len": int,
    "query_closes": [float],
    "stocks": [{"code": str, "dates": [str], "closes": [float]}]
  }

NDJSON output:
  {"type": "match", "code", "startDate", "endDate", "similarity", "totalReturn", "queryTotalReturn"}
  {"type": "done", "total", "topMatches": [...], "queryTotalReturn": float}
"""

import json
import sys

import numpy as np

from utils import emit

SHAPE_CANDIDATES = 100   # Phase 1: keep top N by Pearson similarity
RETURN_THRESHOLD = 20.0  # Phase 2: max allowed total-return divergence (pp)


# ── math helpers ──────────────────────────────────────────────────────────────

def _zscore(arr: np.ndarray) -> np.ndarray:
    std = arr.std()
    if std == 0:
        return np.zeros_like(arr)
    return (arr - arr.mean()) / std


def _sliding_pearson(closes: np.ndarray, query_norm: np.ndarray, window_len: int):
    """Return (best_start_idx, best_pearson_r) for the sliding window with highest correlation."""
    n = len(closes)
    if n < window_len:
        return -1, -1.0
    shape = (n - window_len + 1, window_len)
    strides = (closes.strides[0], closes.strides[0])
    windows = np.lib.stride_tricks.as_strided(closes, shape=shape, strides=strides)
    means = windows.mean(axis=1, keepdims=True)
    stds = windows.std(axis=1, keepdims=True)
    stds[stds == 0] = 1.0
    windows_norm = (windows - means) / stds
    correlations = windows_norm @ query_norm / window_len
    best_idx = int(np.argmax(correlations))
    return best_idx, float(correlations[best_idx])


def _total_return_pct(closes: np.ndarray, start_idx: int, length: int) -> float:
    """Percentage return of a window: (end - start) / start * 100."""
    start_price = closes[start_idx]
    if start_price == 0:
        return 0.0
    return float((closes[start_idx + length - 1] - start_price) / start_price * 100)


# ── command entry point ────────────────────────────────────────────────────────

def run():
    data = json.loads(sys.stdin.read())
    window_len: int = data["window_len"]
    query_closes_raw = np.array(data["query_closes"], dtype=float)
    query_norm = _zscore(query_closes_raw)
    stocks: list = data["stocks"]

    if window_len < 2:
        emit({"type": "done", "total": 0, "topMatches": []})
        return

    query_total_return = round(_total_return_pct(query_closes_raw, 0, window_len), 2)

    # ── Phase 1: shape similarity (Pearson on z-score windows) ────────────────
    candidates = []
    for stock in stocks:
        closes = np.array(stock["closes"], dtype=float)
        best_idx, best_r = _sliding_pearson(closes, query_norm, window_len)
        if best_idx < 0:
            continue
        candidates.append((best_r, stock["code"], best_idx, stock["dates"], closes))

    candidates.sort(key=lambda x: -x[0])
    top_shape = candidates[:SHAPE_CANDIDATES]

    # ── Phase 2: total-return filter ──────────────────────────────────────────
    results = []
    for best_r, code, best_idx, dates, closes in top_shape:
        candidate_return = round(_total_return_pct(closes, best_idx, window_len), 2)
        if abs(candidate_return - query_total_return) > RETURN_THRESHOLD:
            continue
        match = {
            "type": "match",
            "code": code,
            "startDate": dates[best_idx],
            "endDate": dates[best_idx + window_len - 1],
            "similarity": round(best_r, 4),
            "totalReturn": candidate_return,
            "queryTotalReturn": query_total_return,
        }
        results.append(match)
        emit(match)

    results.sort(key=lambda x: -x["similarity"])
    emit({
        "type": "done",
        "total": len(results),
        "queryTotalReturn": query_total_return,
        "topMatches": results,
    })
