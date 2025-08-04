# 可执行脚本

这个目录包含了股票API的可执行演示脚本。

## 📁 文件结构

```
bin/
├── stock-demo.mjs  # 股票API演示脚本
└── README.md       # 本文档
```

## 🚀 使用方式

### 1. 直接运行演示

```bash
# 使用默认配置运行所有API演示
npm run demo

# 或者直接使用node
node ./bin/stock-demo.mjs
```

### 2. 查看帮助信息

```bash
npm run demo:help

# 或者
node ./bin/stock-demo.mjs --help
```

### 3. 自定义参数运行

```bash
# 指定不同的股票代码和日期范围
node ./bin/stock-demo.mjs --stock 000002 --start 2024-02-01 --end 2024-02-28

# 使用万科A股票
node ./bin/stock-demo.mjs --stock 000002

# 指定日期范围
node ./bin/stock-demo.mjs --start 2024-03-01 --end 2024-03-31
```

### 4. 通过npm安装后使用

```bash
# 如果包已经全局安装
stock-demo
stock-api-demo

# 使用参数
stock-demo --stock 000001 --start 2024-01-01 --end 2024-01-31
```

## 📊 演示内容

脚本会依次调用以下API并展示结果：

1. **获取所有股票信息** - `StockAPI.getAllStocksInfo()`
   - 显示A股市场所有股票的基本信息
   - 包含股票代码、名称、市场等信息

2. **获取股票历史数据** - `StockAPI.getStockHistory()`
   - 获取指定股票的历史K线数据
   - 包含开盘价、收盘价、成交量等详细信息

3. **获取股票实时数据** - `StockAPI.getStockRealtime()`
   - 获取指定股票的实时行情数据
   - 包含当前价格、涨跌幅、市值等信息

4. **获取股票基本信息** - `StockAPI.getStockIndividualBasicInfoXq()`
   - 获取指定股票的详细基本面信息
   - 包含财务数据、行业信息、估值指标等

## ⚙️ 配置选项

### 命令行参数

| 参数      | 说明     | 默认值       | 示例                 |
| --------- | -------- | ------------ | -------------------- |
| `--stock` | 股票代码 | `000001`     | `--stock 000002`     |
| `--start` | 开始日期 | `2024-01-01` | `--start 2024-02-01` |
| `--end`   | 结束日期 | `2024-01-31` | `--end 2024-02-28`   |
| `--help`  | 显示帮助 | -            | `--help`             |

### 脚本内配置

可以编辑 `stock-demo.mjs` 文件顶部的 `DEMO_CONFIG` 对象：

```javascript
const DEMO_CONFIG = {
  stockSymbol: "000001", // 默认股票代码
  startDate: "2024-01-01", // 默认开始日期
  endDate: "2024-01-31", // 默认结束日期
  delay: 2000, // API调用间隔(毫秒)
};
```

## 📝 输出格式

脚本会以结构化的方式显示API返回的数据：

- ✅ 成功标识和基本信息
- 🕐 时间戳
- 📊 数据统计（总数、代码等）
- 📅 日期范围（如适用）
- 📋 数据样例（前3条记录）
- ❌ 错误信息（如失败）

## 🔧 故障排除

### 常见问题

1. **Python环境问题**

   ```
   错误: 启动Python进程失败
   解决: 确保Python3已安装并在PATH中
   ```

2. **依赖库缺失**

   ```
   错误: Unable to import 'akshare'
   解决: 运行 npm run install:python 安装Python依赖
   ```

3. **网络连接问题**
   ```
   错误: 获取数据失败
   解决: 检查网络连接，某些API可能需要VPN
   ```

### 调试模式

可以修改脚本中的 `DEMO_CONFIG.delay` 来调整API调用间隔，避免请求过于频繁。

## 🌟 扩展功能

### 添加新的演示API

1. 在 `StockAPI` 中添加新方法
2. 在 `demonstrateAllAPIs()` 函数中添加调用
3. 更新帮助文档

### 自定义输出格式

可以修改 `formatOutput()` 函数来自定义数据显示格式，支持：

- JSON格式输出
- CSV格式导出
- 图表数据准备
- 日志文件记录

### 批量处理

可以扩展脚本支持批量处理多个股票代码：

```bash
node ./bin/stock-demo.mjs --stocks 000001,000002,000858
```
