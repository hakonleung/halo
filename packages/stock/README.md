# A股数据查询库

基于akshare的A股数据查询Python库，可供Node.js调用。

## 功能特性

- ✅ 查询A股所有股票基本信息
- ✅ 查询某只股票历史日K线数据
- ✅ 支持按时间区间查询历史数据
- ✅ 获取股票实时数据
- ✅ 查询个股基本信息（东方财富数据源）
- ✅ TypeScript支持
- ✅ 完整的错误处理

## 安装

### 1. 安装Python依赖

```bash
# 安装Python依赖包
pip install -r requirements.txt

# 或者使用conda
conda install akshare pandas numpy requests
```

### 2. 安装Node.js依赖

```bash
# 安装Node.js依赖
npm install

# 或者使用pnpm
pnpm install
```

### 3. 构建项目

```bash
# 构建TypeScript
npm run build

# 安装Python包
npm run install:python
```

## 使用方法

### 在Node.js中使用

```typescript
import StockAPI from '@halo/stock';

// 获取所有A股股票信息
async function getAllStocks() {
  const result = await StockAPI.getAllStocksInfo();
  if (result.success) {
    console.log(`总共找到 ${result.total} 只股票`);
    console.log(result.data);
  } else {
    console.error('获取股票信息失败:', result.error);
  }
}

// 获取股票历史数据
async function getStockHistory() {
  // 查询所有历史数据
  const allHistory = await StockAPI.getStockHistory('000001');

  // 按时间区间查询
  const rangeHistory = await StockAPI.getStockHistory('000001', '2024-01-01', '2024-01-31');

  if (allHistory.success) {
    console.log('历史数据:', allHistory.data);
  }
}

// 获取股票实时数据
async function getRealtimeData() {
  const result = await StockAPI.getStockRealtime('000001');
  if (result.success) {
    console.log('实时数据:', result.data);
  }
}

// 获取个股基本信息
async function getStockBasicInfo() {
  const result = await StockAPI.getStockIndividualBasicInfoXq('000001');
  if (result.success) {
    console.log('基本信息:', result.data);
  }
}
```

### 在Python中直接使用

```python
from src.stock_data import stock_api

# 获取所有股票信息
result = stock_api.get_all_stocks_info()
print(result)

# 获取股票历史数据
history = stock_api.get_stock_history('000001', '2024-01-01', '2024-01-31')
print(history)

# 获取实时数据
realtime = stock_api.get_stock_realtime('000001')
print(realtime)

# 获取个股基本信息
basic_info = stock_api.get_stock_individual_basic_info_xq('000001')
print(basic_info)
```

## API文档

### StockAPI.getAllStocksInfo()

获取所有A股股票的基本信息。

**返回值:**

```typescript
Promise<ApiResponse<StockInfo[]>>;
```

**示例:**

```typescript
const result = await StockAPI.getAllStocksInfo();
// {
//   success: true,
//   data: [
//     { code: "000001", name: "平安银行", symbol: "000001", market: "A股" },
//     ...
//   ],
//   total: 5000,
//   timestamp: "2024-01-01T00:00:00.000Z"
// }
```

### StockAPI.getStockHistory(symbol, startDate?, endDate?)

获取股票历史K线数据。

**参数:**

- `symbol` (string): 股票代码，如 "000001"
- `startDate` (string, 可选): 开始日期，格式 "YYYY-MM-DD"
- `endDate` (string, 可选): 结束日期，格式 "YYYY-MM-DD"

**返回值:**

```typescript
Promise<ApiResponse<KlineData[]>>;
```

**示例:**

```typescript
// 获取所有历史数据
const allHistory = await StockAPI.getStockHistory('000001');

// 获取指定时间范围的数据
const rangeHistory = await StockAPI.getStockHistory('000001', '2024-01-01', '2024-01-31');
```

### StockAPI.getStockRealtime(symbol)

获取股票实时数据。

**参数:**

- `symbol` (string): 股票代码，如 "000001"

**返回值:**

```typescript
Promise<ApiResponse<RealtimeData>>;
```

### StockAPI.getStockIndividualBasicInfoXq(symbol)

获取个股基本信息（东方财富数据源）。
注意：原计划使用雪球API，但由于akshare雪球API存在问题，实际使用东方财富API。

**参数:**

- `symbol` (string): 股票代码，如 "000001"

**返回值:**

```typescript
Promise<ApiResponse<StockIndividualBasicInfo>>;
```

**示例:**

```typescript
const result = await StockAPI.getStockIndividualBasicInfoXq('000001');
if (result.success) {
  console.log('股票名称:', result.data.name);
  console.log('所属行业:', result.data.industry);
  console.log('总市值:', result.data.market_cap);
}
```

## 数据类型

### StockInfo

```typescript
interface StockInfo {
  code: string; // 股票代码
  name: string; // 股票名称
  symbol: string; // 股票符号
  market: string; // 市场类型
}
```

### KlineData

```typescript
interface KlineData {
  date: string; // 日期
  open: number; // 开盘价
  high: number; // 最高价
  low: number; // 最低价
  close: number; // 收盘价
  volume: number; // 成交量
  amount: number; // 成交额
  amplitude: number; // 振幅
  pct_change: number; // 涨跌幅
  pct_change_amount: number; // 涨跌额
  turnover: number; // 换手率
}
```

### RealtimeData

```typescript
interface RealtimeData {
  code: string; // 股票代码
  name: string; // 股票名称
  current_price: number; // 当前价格
  change: number; // 涨跌幅
  change_amount: number; // 涨跌额
  volume: number; // 成交量
  amount: number; // 成交额
  amplitude: number; // 振幅
  high: number; // 最高价
  low: number; // 最低价
  open: number; // 开盘价
  prev_close: number; // 昨收价
  turnover: number; // 换手率
  pe: number; // 市盈率
  pb: number; // 市净率
  market_cap: number; // 总市值
  circulating_market_cap: number; // 流通市值
}
```

### StockIndividualBasicInfo

```typescript
interface StockIndividualBasicInfo {
  code: string; // 股票代码
  name: string; // 股票简称
  full_name: string; // 股票全称
  industry: string; // 所属行业
  market: string; // 上市市场
  list_date: string; // 上市日期
  total_shares: string; // 总股本
  circulating_shares: string; // 流通股本
  market_cap: string; // 总市值
  circulating_market_cap: string; // 流通市值
  pe_ratio: string; // 市盈率
  pb_ratio: string; // 市净率
  ps_ratio: string; // 市销率
  dividend_yield: string; // 股息率
  roe: string; // 净资产收益率
  revenue: string; // 营业收入
  net_profit: string; // 净利润
  revenue_growth: string; // 营收同比增长
  profit_growth: string; // 净利润同比增长
  basic_info: Record<string, string>; // 原始数据
}
```

### ApiResponse

```typescript
interface ApiResponse<T> {
  success: boolean; // 是否成功
  data?: T; // 数据
  error?: string; // 错误信息
  total?: number; // 总数
  symbol?: string; // 股票代码
  start_date?: string; // 开始日期
  end_date?: string; // 结束日期
  timestamp: string; // 时间戳
}
```

## 开发

### 项目结构

```
packages/stock/
├── src/
│   ├── stock_data.py    # Python核心模块
│   ├── bridge.cpp       # C++桥接文件
│   └── index.ts         # TypeScript接口
├── requirements.txt     # Python依赖
├── package.json        # Node.js配置
├── tsconfig.json       # TypeScript配置
└── README.md          # 文档
```

### 开发命令

```bash
# 安装依赖
npm run install:python

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 运行测试
npm test

# 运行测试（监听模式）
npm run test:watch

# 运行测试覆盖率
npm run test:coverage

# 清理构建文件
npm run clean
```

### 测试

```bash
# 运行Python测试
python test_python.py

# 运行Node.js测试
npm test

# 运行Jest测试（TypeScript）
npm test

# 运行测试覆盖率
npm run test:coverage
```

## 注意事项

1. **网络连接**: 需要稳定的网络连接来获取股票数据
2. **数据延迟**: 实时数据可能有几秒到几分钟的延迟
3. **API限制**: 请合理使用API，避免频繁请求
4. **Python版本**: 需要Python 3.8或更高版本
5. **Node.js版本**: 需要Node.js 16或更高版本

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v1.1.0

- 新增个股基本信息查询功能（东方财富数据源）
- 支持查询股票详细信息，包括行业、市值、财务指标等
- 注意：原计划使用雪球API，但由于akshare雪球API存在问题，实际使用东方财富API

### v1.0.0

- 初始版本
- 支持A股股票基本信息查询
- 支持股票历史K线数据查询
- 支持股票实时数据查询
- 提供TypeScript类型定义
