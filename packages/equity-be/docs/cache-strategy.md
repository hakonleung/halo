# Equity BE 缓存策略

## 数据特征

| 数据 | 表 | 变化方式 |
|------|-----|----------|
| 股票基本信息（代码、名称） | `neolog_equity_list` | **完全静态** |
| 日线数据 | `neolog_equity_daily` | **只增不改**，每交易日 Sync 后追加 |

---

## Watermark 设计

日线缓存维护一个 **per-stock watermark**（每只股票已缓存到的最新交易日）：

```
watermark: Record<code, lastCachedDate>
```

**为什么不用全局 watermark**：`syncAllStream` 可能因网络报错中途中断，导致不同股票的实际最新数据日期不一致。全局 watermark 会导致部分股票缓存过时但不被更新。Per-stock watermark 精确追踪每只股票的缓存边界，Sync 成功哪只更新哪只。

### 缓存读写流程

**首次加载**（缓存为空，或请求的 `sinceDate` 早于缓存最早日期）：
- 从 DB 拉取所有股票 `sinceDate` 至今的数据
- 写入缓存，记录缓存的 `earliestDate`，初始化每只股票的 watermark

**Sync 完成后（增量更新）**：
- 对每只成功同步的股票，读取其 watermark
- 仅从 DB 拉取该股票 `watermark` 之后的新增行，追加到缓存
- 更新该股票的 watermark

**读取时（传入 `sinceDate`）**：
- 若 `sinceDate >= earliestDate`：直接从缓存返回并内存过滤，无需访问 DB
- 若 `sinceDate < earliestDate`：缓存不满足需求，回退到 DB 查询（同时考虑是否扩展缓存范围）
- 内存过滤掉 `excludeCode` 的数据

失败未同步的股票，缓存数据保持不变，仍然有效（历史数据不会被修改）。

---

## 抽象接口设计

所有环境共用同一套接口，业务代码不感知底层存储。

### `CacheStore` 接口

```
interface CacheStore {
  // 读取一条缓存（name map 等全量数据）
  get<T>(key: string): Promise<T | null>

  // 写入一条缓存
  set<T>(key: string, value: T): Promise<void>

  // 读取 per-stock watermark map
  getWatermarks(): Promise<Record<string, string>>

  // 追加新 bars，并更新对应股票的 watermark
  appendBars(
    bars: Array<{ code: string; trade_date: string; close: number }>,
    updatedWatermarks: Record<string, string>
  ): Promise<void>

  // 读取全部已缓存的 bars
  getAllBars(): Promise<Array<{ code: string; trade_date: string; close: number }>>
}
```

### 实现类

| 实现 | 用途 |
|------|------|
| `FlatCacheStore` | 当前 dev + 生产均使用，持久化到磁盘 |
| `NullCacheStore` | 无缓存（直接透传 DB），用于测试或禁用缓存场景 |
| `RedisStore` | 未来生产升级，接口完全兼容 |

`NullCacheStore` 的所有 `get` 返回 `null`，`set`/`append` 为 no-op，业务逻辑无需任何改动即可切换。

---

## 存储方案

### 当前：`flat-cache`（dev + 生产）

数据持久化到 `.cache/equity/` 目录，进程重启后缓存依然有效。

- **Dev**：彻底消除本地反复拉取 Supabase 的开销（冷启动 ~15s → <100ms）
- **生产（Vercel）**：Serverless 实例无持久化磁盘，每次冷启动缓存为空，但 warm 实例内 `.cache/` 在实例生命周期内有效，可减少重复拉取

`.cache/` 加入 `.gitignore`。

### 未来：Redis（`@upstash/redis`）

HTTP-based，无长连接，Vercel Serverless 友好。Upstash 免费层（256MB）足够：全市场 90 天收盘价约 22MB。

切换时只需替换 `FlatCacheStore` 为 `RedisStore`，业务代码零改动。

---

## Sync 与缓存协作流程

```
[syncAllStream 执行]
        ↓
  成功写入股票 A、B、C 的新日线（D、E 失败）
        ↓
  读取缓存中 A、B、C 各自的 watermark
        ↓
  仅拉取 A、B、C 在 watermark 之后的新增行
        ↓
  appendBars(新增行, {A: newDate, B: newDate, C: newDate})
        ↓
  D、E 的缓存数据不变，保持有效

[用户发起 findSimilarStream]
  getAllBars() → 内存过滤（sinceDate + excludeCode）→ 传给 Python
```

---

## 实施路线

| 阶段 | 目标 |
|------|------|
| P0 | 实现 `CacheStore` 接口 + `NullCacheStore` + `FlatCacheStore`，dev 本地接入 |
| P1 | 生产环境接入 `FlatCacheStore`，Sync 后执行 per-stock 增量追加 |
| P2 | 实现 `RedisStore`，生产切换到 Upstash Redis |
