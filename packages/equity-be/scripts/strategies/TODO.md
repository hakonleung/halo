# 策略待开发清单

当前已实现：
- `find_similar.py` — Z-score Pearson 滑动窗口 + 涨跌幅过滤的形态相似搜索
- `find_breakout.py` — 布林带压缩突破识别
- `find_volume_price_divergence.py` — OBV 量价背离扫描
- `find_multi_timeframe.py` — 日/周/月三周期指标共振选股
- `find_momentum_reversal.py` — 趋势动量反转识别
- `find_chart_pattern.py` — 头肩顶/底、双顶/底、三角形整理识别

---

## Strategy 2: `find_momentum_reversal.py` — 动量反转识别

### 概述
识别经历强烈单边趋势后出现反转信号的股票。核心逻辑：趋势疲软 + 成交量萎缩 + 价格背离，预判短期反转。

### 算法设计

**输入**
```json
{
  "stocks": [{"code": str, "dates": [str], "ohlcv": [[open, high, low, close, volume]]}],
  "lookback_days": int,       // 趋势观测窗口，默认 20
  "momentum_threshold": float, // 趋势强度最低要求（线性回归斜率），默认 0.5
  "reversal_window": int       // 反转确认窗口，默认 3
}
```

**Phase 1 — 趋势强度评分**
- 用最近 `lookback_days` 天的收盘价做线性回归（`np.polyfit`），提取斜率 `slope` 和 R² 拟合度
- 斜率 * R² = 趋势得分（正为上涨趋势，负为下跌趋势）
- 只保留趋势得分绝对值 > `momentum_threshold` 的股票

**Phase 2 — 反转信号检测**
检测最近 `reversal_window` 天内是否同时出现以下信号（需至少满足 3 项）：

| 信号 | 计算方式 |
|------|----------|
| 价格背离 | 价格创新高/低，但当日涨幅 < 前一高/低点的 50% |
| 成交量萎缩 | 最近 3 日均量 < 趋势期均量的 60% |
| 长上影/下影线 | 影线长度 > 当日振幅的 60%（蜡烛图形态） |
| RSI 超买/超卖 | 14 日 RSI > 75（顶部）或 < 25（底部） |
| 收盘回撤 | 日内最高/低到收盘的回撤 > 1.5% |

**Phase 3 — 评分排序**
- 综合趋势强度得分 + 满足信号数量加权排序
- 输出按反转置信度从高到低排列

**NDJSON 输出**
```json
{"type": "match", "code", "direction": "top"|"bottom",
 "trendScore": float, "signalCount": int,
 "signals": ["rsi_overbought", "volume_shrink", ...],
 "latestDate": str}
{"type": "done", "total": int, "topMatches": [...]}
```

**复杂度**：O(n × lookback_days)，全市场扫描约 0.5s

---

## Strategy 3: `find_breakout.py` — 布林带压缩突破识别

### 概述
识别布林带长期收窄（低波动积累）后即将或刚刚发生方向性突破的股票。布林带收缩代表能量蓄积，突破往往伴随大行情启动。

### 算法设计

**输入**
```json
{
  "stocks": [{"code": str, "dates": [str], "closes": [float], "volumes": [float]}],
  "bb_period": int,         // 布林带周期，默认 20
  "squeeze_percentile": float, // 带宽处于历史最低百分位，默认 10（即最低10%分位）
  "squeeze_min_days": int,  // 最短压缩持续天数，默认 5
  "breakout_sigma": float   // 突破判定：价格超出 N 倍标准差，默认 2.0
}
```

**Phase 1 — 布林带计算**
```
middle = rolling_mean(close, bb_period)
std    = rolling_std(close, bb_period)
upper  = middle + 2 * std
lower  = middle - 2 * std
bandwidth = (upper - lower) / middle  // 相对带宽，消除价格绝对值影响
```

**Phase 2 — 压缩检测**
- 计算过去 252 天（1年）带宽的历史分布
- 当前带宽 ≤ 历史 `squeeze_percentile` 分位 = 进入压缩状态
- 统计压缩状态连续持续天数，需 ≥ `squeeze_min_days`
- 记录压缩起始日、当前带宽、历史最低带宽

**Phase 3 — 突破方向判定**
- 若最新收盘价 > `upper`：上轨突破（多头）
- 若最新收盘价 < `lower`：下轨突破（空头）
- 未突破但接近（距上/下轨 < 0.5%）：蓄势待发
- 突破同时成交量放大（> 20 日均量 × 1.5）：高置信度突破

**Phase 4 — 量价确认**
- 计算突破当日成交量 vs 压缩期间平均成交量的倍数（`volume_ratio`）
- `volume_ratio` > 2.0 → 强力突破；1.5–2.0 → 有效突破；< 1.5 → 待确认

**NDJSON 输出**
```json
{"type": "match", "code",
 "squeezeStartDate": str, "squeezeDays": int,
 "breakoutDirection": "up"|"down"|"pending",
 "breakoutDate": str | null,
 "currentBandwidth": float, "bandwidthPercentile": float,
 "volumeRatio": float, "confidence": "high"|"medium"|"low"}
{"type": "done", "total": int, "topMatches": [...]}
```

**复杂度**：需要至少 252 + bb_period 天历史数据；全市场约 1s

---

## Strategy 4: `find_chart_pattern.py` — 经典图形形态识别

### 概述
识别头肩顶/底、双顶/双底、三角形整理等经典 K 线形态。采用极值点检测 + 几何约束验证，比纯价格相关性更有解释性。

### 算法设计

**输入**
```json
{
  "stocks": [{"code": str, "dates": [str], "closes": [float], "highs": [float], "lows": [float]}],
  "patterns": ["head_shoulders_top", "head_shoulders_bottom", "double_top", "double_bottom",
               "ascending_triangle", "descending_triangle", "symmetrical_triangle"],
  "lookback_days": int,   // 形态识别窗口，默认 60
  "tolerance": float      // 关键价位误差容忍度（比例），默认 0.02（2%）
}
```

**极值点提取（基础算法）**
```python
# 使用 scipy.signal.argrelextrema 或手动实现
def _find_pivots(prices, order=5):
    # 找到局部高点（peaks）和低点（valleys）
    # order: 左右各 order 个点都低/高才算极值点
    peaks   = argrelextrema(prices, np.greater, order=order)[0]
    valleys = argrelextrema(prices, np.less, order=order)[0]
    return peaks, valleys
```

**各形态验证规则**

*头肩顶（Head & Shoulders Top）*
- 需要 3 个相邻高峰：左肩(L)、头部(H)、右肩(R)
- 约束：H > L ≈ R（左右肩高度差 < `tolerance`）
- 颈线：连接左右肩之间的两个低谷
- 确认：价格跌破颈线

*双顶（Double Top）*
- 2 个相近高峰（高度差 < `tolerance`），中间有一个明显低谷
- 约束：两峰间距 10–40 个交易日
- 确认：价格跌破中间低谷支撑位

*上升三角形（Ascending Triangle）*
- 高点连线水平（压力线），低点连线上升（支撑线）
- 用线性回归拟合高点序列和低点序列
- 压力线斜率接近 0，支撑线斜率 > 0
- 两线交汇距今 < 20 个交易日（形态接近完成）

*对称三角形（Symmetrical Triangle）*
- 高点连线下降，低点连线上升，两线对称收敛
- 量化：|上线斜率 + 下线斜率| < 0.1（近似对称）

**置信度评分**
- 极值点数量达标：+30 分
- 几何约束满足：+40 分
- 成交量配合（整理期量缩、突破期量增）：+20 分
- 近期（最后 5 日）形态完成度：+10 分

**NDJSON 输出**
```json
{"type": "match", "code", "pattern": str,
 "keyDates": [str],        // 关键极值点日期
 "keyPrices": [float],     // 关键价位
 "neckline": float | null, // 颈线价位（头肩/双顶底）
 "breakoutTarget": float,  // 理论目标价
 "confidence": float,      // 0-100 置信度评分
 "status": "forming"|"confirmed"|"failed"}
{"type": "done", "total": int, "topMatches": [...]}
```

**依赖**：需要 `scipy` 用于极值点检测（或纯 numpy 手工实现）

---

## Strategy 5: `find_volume_price_divergence.py` — 量价背离扫描

### 概述
量价关系是市场情绪的本质反映。此策略识别价格与成交量之间的多种背离模式，包括经典背离、隐藏背离，以及资金流向异常。

### 算法设计

**输入**
```json
{
  "stocks": [{"code": str, "dates": [str],
              "closes": [float], "volumes": [float], "amounts": [float]}],
  "scan_window": int,         // 背离扫描窗口，默认 20
  "divergence_min_gap": int,  // 两个极值点最小间距（天），默认 5
  "obv_period": int           // OBV 计算周期，默认 20
}
```

**核心指标计算**

*OBV（On-Balance Volume）*
```python
obv[i] = obv[i-1] + volume[i]  if close[i] > close[i-1]
       = obv[i-1] - volume[i]  if close[i] < close[i-1]
       = obv[i-1]               otherwise
```

*资金流量指数（MFI）*
```python
typical_price = (high + low + close) / 3
money_flow    = typical_price * volume
mfi_14 = 100 - 100 / (1 + positive_flow_14 / negative_flow_14)
```

**背离类型矩阵**

| 类型 | 价格 | OBV/成交量 | 意义 |
|------|------|------------|------|
| 顶背离（看跌） | 创新高 | OBV 未创新高 | 上涨动能衰竭 |
| 底背离（看涨） | 创新低 | OBV 未创新低 | 下跌动能衰竭 |
| 隐藏顶背离 | 未创新高 | OBV 创新高 | 资金悄悄撤退 |
| 量价齐升背离 | 上涨幅度递减 | 成交量递增 | 追涨力竭 |
| 缩量新高 | 连续创新高 | 连续缩量 | 最危险的顶部信号 |

**Phase 1 — OBV 背离检测**
- 在 `scan_window` 内找价格和 OBV 的局部高低点
- 比较最近两个高点/低点的价格趋势和 OBV 趋势
- 背离强度 = |价格变化率 - OBV 变化率| / max(|两者|)

**Phase 2 — 成交量异常检测**
- 均量基准：过去 20 日平均成交量
- 缩量阈值：当日量 < 均量 × 0.5
- 放量阈值：当日量 > 均量 × 2.0
- 连续缩量天数、最近放量日期

**Phase 3 — MFI 背离**
- MFI > 80 + 价格仍在涨 → 极度超买背离
- MFI < 20 + 价格仍在跌 → 极度超卖背离

**NDJSON 输出**
```json
{"type": "match", "code",
 "divergenceType": "bearish_classic"|"bullish_classic"|"hidden_bearish"|"volume_exhaustion"|...,
 "priceChange": float,  // 两极值点间价格变化 %
 "obvChange": float,    // 两极值点间 OBV 变化 %
 "divergenceStrength": float,  // 0-1 背离强度
 "mfi": float,
 "consecutiveShrinkDays": int,
 "latestDate": str}
{"type": "done", "total": int, "topMatches": [...]}
```

---

## Strategy 6: `find_multi_timeframe.py` — 多周期共振选股

### 概述
单一周期信号容易产生噪音，多周期共振策略要求日线、周线、月线三个级别的技术指标同时发出相同方向信号，大幅提升信号可靠性。

### 算法设计

**输入**
```json
{
  "stocks": [{"code": str, "dates": [str], "closes": [float], "volumes": [float]}],
  "signal_direction": "bullish"|"bearish"|"both",
  "required_timeframes": int,  // 需要共振的周期数，默认 3（全部共振）
  "indicators": ["ma_cross", "macd", "rsi", "kdj"]  // 参与共振的指标
}
```

**多周期数据聚合**
```python
# 日线数据直接使用
# 周线：每5个交易日合并一根蜡烛（取最后一日收盘、最高高点、最低低点、首日开盘、求和成交量）
# 月线：每 ~21 个交易日合并
def _resample_to_weekly(dates, closes, volumes):
    # 按自然周分组，或简单按5日分组
    ...
def _resample_to_monthly(dates, closes, volumes):
    ...
```

**各指标信号计算**

*MA 金叉/死叉*
```python
ma5  = rolling_mean(close, 5)
ma20 = rolling_mean(close, 20)
ma60 = rolling_mean(close, 60)
bullish_cross = ma5[-1] > ma20[-1] > ma60[-1]  // 多头排列
bearish_cross = ma5[-1] < ma20[-1] < ma60[-1]  // 空头排列
```

*MACD（标准 12-26-9）*
```python
ema12 = ema(close, 12)
ema26 = ema(close, 26)
dif   = ema12 - ema26
dea   = ema(dif, 9)
macd  = 2 * (dif - dea)
signal = "bullish" if dif > dea and macd > 0 else "bearish" if dif < dea and macd < 0 else "neutral"
```

*RSI（14日）*
```python
rsi_14 = compute_rsi(close, 14)
signal = "oversold" if rsi_14 < 30 else "overbought" if rsi_14 > 70 else "neutral"
```

*KDJ（9-3-3）*
```python
rsv = (close - min_low_9) / (max_high_9 - min_low_9) * 100
K = ema(rsv, 3)
D = ema(K, 3)
J = 3*K - 2*D
signal = "bullish" if K > D and J > K else "bearish" if K < D and J < K else "neutral"
```

**共振评分**
- 对每个时间级别（日/周/月）分别计算各指标信号
- 每个时间级别的共振得分 = 同方向信号数 / 总指标数
- 总共振得分 = 加权平均（日: 0.4, 周: 0.35, 月: 0.25）
- 过滤：三个时间级别都需要共振得分 ≥ 0.6

**NDJSON 输出**
```json
{"type": "match", "code",
 "direction": "bullish"|"bearish",
 "resonanceScore": float,        // 0-1 总共振得分
 "timeframeScores": {
   "daily": float, "weekly": float, "monthly": float
 },
 "signals": {
   "daily":   {"ma_cross": "bullish", "macd": "bullish", "rsi": "neutral", "kdj": "bullish"},
   "weekly":  {...},
   "monthly": {...}
 },
 "latestDate": str}
{"type": "done", "total": int, "topMatches": [...]}
```

**注意事项**
- 周线/月线聚合需要足够的历史数据：月线至少需要 6 个月 × 21 = 126 天
- EMA 计算需要预热期（warm-up），建议总数据至少 300 天
- 与 `find_similar` 不同，此策略不做滑动窗口，只看当前最新状态

---

## 开发优先级

| 优先级 | 策略 | 核心价值 | 实现复杂度 |
|--------|------|----------|------------|
| P1 | `find_breakout.py` | 布林带突破是最常用的起涨信号 | 低 |
| P1 | `find_volume_price_divergence.py` | 量价背离是经典见顶/底信号 | 中 |
| P2 | `find_multi_timeframe.py` | 多周期共振显著提升信号质量 | 中 |
| P2 | `find_momentum_reversal.py` | 趋势反转是高收益机会 | 中 |
| P3 | `find_chart_pattern.py` | 经典形态可解释性强，但实现最复杂 | 高 |

## 集成方式

每个新策略都遵循相同模式：
1. 在 `scripts/strategies/` 下创建 `find_xxx.py`，暴露 `run()` 函数
2. 在 `equity_bridge.py` 的 `main()` 中注册新命令 `elif cmd == "find_xxx"`
3. 在 `equity-service.ts` 中添加对应的 `findXxxStream()` 方法
4. 在 Node.js API 层添加对应路由

所有策略共享 `utils.py` 中的 `emit()`、`_fetch_kline_data()` 等基础工具。
