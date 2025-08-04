# @halo/storage

股票数据存储和缓存包，提供本地JSON文件缓存功能。

## 功能特性

- 🚀 高性能本地JSON文件缓存
- 📊 支持三种数据类型：全量股票代码、历史行情、基本信息
- 🔄 智能增量更新历史数据
- 🎯 灵活的缓存策略（强制更新或读取缓存）
- 📁 自动管理数据目录结构
- 🔧 批量更新支持
- ⚡ **CLI工具支持快速更新**

## 安装

```bash
pnpm install @halo/storage
```

## CLI工具使用

安装包后，可以直接使用CLI工具进行快速数据更新：

### 基本用法

```bash
# 更新最近7天的历史数据（默认）
stock-quick-update

# 更新最近1天的数据
stock-quick-update --since 1d

# 更新最近3小时的数据
stock-quick-update --since 3h

# 从指定日期开始更新
stock-quick-update --since 2023-12-01

# 同时更新历史数据和基本信息
stock-quick-update --include-info

# 指定数据存储目录
stock-quick-update --data-dir /path/to/data

# 启用调试模式
stock-quick-update --debug

# 显示帮助信息
stock-quick-update --help
```

### CLI选项说明

- `-d, --data-dir <path>` - 数据存储目录 (默认: ./data)
- `-s, --since <time>` - 更新起始时间，支持格式：
  - `1d`, `2d` (天数)
  - `1h`, `12h` (小时数)
  - `2023-12-01` (具体日期)
  - 数字时间戳
- `-i, --include-info` - 是否同时更新基本信息 (默认: false)
- `--debug` - 启用调试日志
- `-h, --help` - 显示帮助信息

### 实际使用示例

```bash
# 生产环境定时任务：每日更新最近1天数据
stock-quick-update --since 1d --data-dir /var/stock-data

# 开发环境：调试模式下更新最近几小时数据
stock-quick-update --since 6h --debug

# 完整更新：更新历史数据和基本信息
stock-quick-update --since 7d --include-info
```

## 编程接口使用

### 方式一：统一存储类（向后兼容）

```typescript
import { StockStorage } from '@halo/storage';

// 创建存储实例
const storage = new StockStorage({
  dataDir: './data', // 数据存储目录，默认为 './data'
  debug: true, // 是否启用调试日志，默认为 false
});

// 使用统一接口
const stocks = await storage.getAllStocks();
const history = await storage.getStockHistory('000001');
```

### 方式二：模块化API（推荐）

```typescript
import { StockListStorage, StockHistoryStorage, StockInfoStorage } from '@halo/storage';

// 创建独立的存储管理器
const stockListStorage = new StockListStorage({ dataDir: './data' });
const stockHistoryStorage = new StockHistoryStorage({ dataDir: './data' });
const stockInfoStorage = new StockInfoStorage({ dataDir: './data' });

// 使用专门的API
const stocks = await stockListStorage.getAllStocks();
const history = await stockHistoryStorage.getStockHistory('000001');
const info = await stockInfoStorage.getStockBasicInfo('000001');
```

### 方式三：组合使用

```typescript
import { StockStorage } from '@halo/storage';

const storage = new StockStorage({ dataDir: './data', debug: true });

// 通过子模块访问专门功能
const stocks = await storage.stockList.getAllStocks();
const cacheInfo = await storage.stockList.getCacheInfo();

// 获取缓存概览
const overview = await storage.getCacheOverview();
console.log('缓存状态:', overview);
```

### 获取全量股票数据

```typescript
// 从缓存读取，如果没有则从API获取
const stocksResponse = await storage.getAllStocks();

// 强制从API更新
const stocksResponse = await storage.getAllStocks({
  forceUpdate: true,
});

if (stocksResponse.success) {
  console.log(`获取到 ${stocksResponse.data.length} 只股票`);
  console.log(`数据来源: ${stocksResponse.fromCache ? '缓存' : 'API'}`);
}
```

### 获取股票历史数据

```typescript
// 获取股票历史数据
const historyResponse = await storage.getStockHistory('000001');

// 增量更新（从指定日期开始获取新数据）
const historyResponse = await storage.getStockHistory('000001', {
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 最近30天
});

// 强制全量更新
const historyResponse = await storage.getStockHistory('000001', {
  forceUpdate: true,
});
```

### 获取股票基本信息

```typescript
// 获取股票基本信息
const infoResponse = await storage.getStockBasicInfo('000001');

// 强制更新
const infoResponse = await storage.getStockBasicInfo('000001', {
  forceUpdate: true,
});
```

### 批量更新

```typescript
// 批量更新多只股票的历史数据
const symbols = ['000001', '000002', '600000'];
const batchResult = await storage.batchUpdateStockHistory(symbols, {
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 最近7天
});

console.log(`批量更新结果: 成功 ${batchResult.success}，失败 ${batchResult.failed}`);
```

### 全量数据更新（新功能）

```typescript
// 完整的全量更新
const updateResult = await storage.updateAllData({
  forceUpdate: true,
  dataTypes: {
    stockList: true, // 更新股票列表
    history: true, // 更新历史数据
    info: true, // 更新基本信息
  },
  historyOptions: {
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 最近30天
    limitCount: 100, // 限制更新100只股票（可选）
  },
  onProgress: progress => {
    console.log(`${progress.stageDescription}: ${progress.totalProgress.toFixed(1)}%`);
    console.log(`成功: ${progress.successCount}, 失败: ${progress.errorCount}`);
  },
});

console.log(`更新完成: ${updateResult.success ? '成功' : '失败'}`);
console.log(`耗时: ${(updateResult.duration / 1000).toFixed(2)} 秒`);
console.log(`成功率: ${updateResult.summary.successRate.toFixed(2)}%`);
```

### 快速增量更新

```typescript
// 快速更新最近的数据
const quickResult = await storage.quickUpdate({
  since: Date.now() - 7 * 24 * 60 * 60 * 1000, // 最近7天
  includeInfo: false, // 不更新基本信息
  onProgress: progress => {
    console.log(`快速更新: ${progress.processed}/${progress.total}`);
  },
});
```

### 缓存管理

```typescript
// 清除所有缓存
await storage.clearCache('all');

// 只清除股票列表缓存
await storage.clearCache('stocks');

// 只清除历史数据缓存
await storage.clearCache('daily');
```

## 数据库支持

包现在支持PostgreSQL数据库存储，提供了更强大的数据管理能力。

### 数据库配置

1. 创建 `.env` 文件：

```bash
cp .env.example .env
```

2. 配置数据库连接：

```env
DATABASE_URL=postgres://username:password@localhost:5432/stock_data
```

### 使用数据库服务

```typescript
import { SimpleStockDatabaseService } from '@halo/storage';

const dbService = new SimpleStockDatabaseService();

// 初始化数据库表
await dbService.initializeTables();

// 保存股票数据到数据库
const stockList = [
  /* 股票数据 */
];
const savedCount = await dbService.saveStockList(stockList);

// 从数据库获取股票列表
const stocks = await dbService.getStockList();

// 保存价格数据
const priceData = [
  /* 价格数据 */
];
await dbService.saveStockPrices('000001', priceData);

// 获取价格数据
const prices = await dbService.getStockPrices('000001', new Date('2024-01-01'));

// 获取统计信息
const stats = await dbService.getStats();
console.log(`总股票数: ${stats.totalStocks}, 价格记录数: ${stats.totalPriceRecords}`);

// 关闭连接
await dbService.close();
```

### 数据库管理命令

```bash
# 初始化数据库表（通过代码）
pnpm db:seed

# 启动 Drizzle Studio（可视化管理工具）
pnpm db:studio
```

### 数据库表结构

#### stocks 表

- `id`: 主键
- `symbol`: 股票代码（唯一）
- `name`: 股票名称
- `market`: 市场（SZ/SH等）
- `industry`: 行业
- `sector`: 板块
- `list_date`: 上市日期
- `total_shares`: 总股本
- `circulating_shares`: 流通股本
- `market_cap`: 市值
- `extra_info`: 扩展信息（JSON）
- `is_active`: 是否活跃
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### stock_prices 表

- `id`: 主键
- `stock_id`: 股票ID（外键）
- `trade_date`: 交易日期
- `open`: 开盘价
- `high`: 最高价
- `low`: 最低价
- `close`: 收盘价
- `volume`: 成交量
- `amount`: 成交金额
- `amplitude`: 振幅
- `pct_change`: 涨跌幅
- `pct_change_amount`: 涨跌额
- `turnover`: 换手率
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### sync_records 表

- `id`: 主键
- `sync_type`: 同步类型
- `target_symbol`: 目标股票代码
- `status`: 状态
- `sync_start_date`: 同步开始日期
- `sync_end_date`: 同步结束日期
- `total_records`: 总记录数
- `success_records`: 成功记录数
- `failed_records`: 失败记录数
- `error_message`: 错误信息
- `error_details`: 错误详情（JSON）
- `started_at`: 开始时间
- `completed_at`: 完成时间
- `duration`: 持续时间（秒）
- `created_at`: 创建时间
- `updated_at`: 更新时间
