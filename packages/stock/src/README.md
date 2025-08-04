# 股票数据API - 源代码结构

本目录包含了完全模块化的股票数据API实现，采用TypeScript + Python混合架构。**所有导出都使用具名导出，无默认导出。**

## 📁 目录结构

```
src/
├── index.ts           # 主入口文件，统一导出所有API和类型
├── stock-api.ts       # StockAPI类实现
├── simple_bridge.ts   # Python桥接器实现
├── types/             # TypeScript类型定义目录
│   ├── index.ts       # 类型定义统一导出
│   ├── stock.ts       # 股票相关数据类型
│   ├── api.ts         # API响应和通用类型
│   ├── bridge.ts      # Python桥接相关类型
│   └── README.md      # 类型定义说明文档
├── py/                # Python模块目录
│   ├── __init__.py    # Python包初始化和向后兼容
│   ├── base.py        # 基础类和工具函数
│   ├── all_stocks.py  # 所有股票信息API
│   ├── stock_history.py     # 股票历史数据API
│   ├── stock_realtime.py    # 股票实时数据API
│   ├── stock_basic_info.py  # 股票基本信息API
│   └── README.md      # Python模块说明文档
└── README.md          # 本文档
```

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│           用户应用层                │
├─────────────────────────────────────┤
│     TypeScript API层 (StockAPI)    │
├─────────────────────────────────────┤
│   Python桥接层 (SimplePythonBridge) │
├─────────────────────────────────────┤
│      Python业务层 (py模块)         │
├─────────────────────────────────────┤
│      数据源层 (akshare)             │
└─────────────────────────────────────┘
```

### 核心组件

#### 1. StockAPI类 (`stock-api.ts`)

- **职责**: 提供统一的TypeScript API接口
- **导出**: `export class StockAPI`
- **特点**:
  - 静态方法设计，无需实例化
  - 完整的类型安全
  - 统一的错误处理
  - Promise-based异步接口

#### 2. SimplePythonBridge类 (`simple_bridge.ts`)

- **职责**: TypeScript与Python之间的桥接
- **导出**: `export class SimplePythonBridge`
- **特点**:
  - 子进程管理
  - 超时控制
  - 错误处理和重试机制
  - 可配置的执行环境

#### 3. Python模块 (`py/`)

- **职责**: 具体的股票数据获取业务逻辑
- **特点**:
  - 模块化设计，每个API独立文件
  - 统一的基础类 (BaseStockAPI)
  - 一致的响应格式
  - 向后兼容接口

#### 4. 类型定义 (`types/`)

- **职责**: 提供完整的TypeScript类型约束
- **特点**:
  - 按领域分类组织
  - 可重用的类型组合
  - 统一的导出接口
  - 全部使用具名导出

## 🚀 使用方式

### 基本用法（具名导入）

```typescript
import { StockAPI } from './src/index.js';

// 获取所有股票信息
const stocksInfo = await StockAPI.getAllStocksInfo();

// 获取股票历史数据
const history = await StockAPI.getStockHistory('000001', '2024-01-01', '2024-01-31');

// 获取实时数据
const realtime = await StockAPI.getStockRealtime('000001');

// 获取基本信息
const basicInfo = await StockAPI.getStockIndividualBasicInfoXq('000001');
```

### 类型导入（具名导入）

```typescript
import type { StockInfo, KlineData, StockHistoryResponse } from './src/types/index.js';
```

### 直接使用Python桥接器

```typescript
// 通过桥接器直接调用
import { SimplePythonBridge } from './src/simple_bridge.js';

const bridge = new SimplePythonBridge();
const result = await bridge.getAllStocksInfo();
```

### 单独导入不同模块

```typescript
// 只导入需要的类
import { StockAPI } from './src/stock-api.js';
import { SimplePythonBridge } from './src/simple_bridge.js';

// 只导入需要的类型
import type { StockInfo, ApiResponse } from './src/types/index.js';
```

## 🔧 配置选项

### Python桥接配置

```typescript
import { SimplePythonBridge } from './src/simple_bridge.js';

const bridge = new SimplePythonBridge({
  pythonPath: 'python3', // Python解释器路径
  timeout: 30000, // 超时时间(毫秒)
  workingDirectory: './py', // 工作目录
});
```

## 🛠️ 开发指南

### 添加新的API

1. 在对应的Python模块中添加函数
2. 在SimplePythonBridge中添加调用方法
3. 在StockAPI中添加TypeScript接口
4. 添加相应的类型定义
5. 更新文档

### 扩展类型定义

1. 在对应的types文件中添加类型
2. 在types/index.ts中导出
3. 更新相关的API接口

## 📊 导出规范

### ✅ 推荐的导出方式

```typescript
// 具名导出类
export class StockAPI { ... }

// 具名导出接口
export interface StockInfo { ... }

// 具名导出类型
export type StockSymbol = string;

// 具名导出枚举
export enum PythonFunction { ... }

// 重新导出
export { StockAPI } from './stock-api.js';
export type { StockInfo } from './types/index.js';
```

### ❌ 避免的导出方式

```typescript
// 不使用默认导出
export default StockAPI; // ❌ 已移除

// 不使用默认导入
import StockAPI from './stock-api.js'; // ❌ 已改为具名导入
```

## 🔍 测试策略

- **单元测试**: 每个模块独立测试
- **集成测试**: API层面的完整流程测试
- **类型测试**: TypeScript类型覆盖测试
- **性能测试**: 并发和大数据量测试

## 📝 维护说明

- **版本管理**: 遵循语义化版本规范
- **文档更新**: 代码变更时同步更新文档
- **向后兼容**: 保持公共API的稳定性
- **代码质量**: 使用ESLint和Prettier保证代码质量
- **导出规范**: 统一使用具名导出，便于tree-shaking和模块分析

## 🌟 优势

- **Tree-shaking友好**: 具名导出支持更好的代码分割
- **模块化**: 按需加载，减少内存占用
- **类型安全**: 编译时类型检查，减少运行时错误
- **缓存友好**: 清晰的模块边界，便于缓存
- **并发支持**: Python进程池管理，支持并发请求
- **可预测性**: 所有导入都是显式的，提高代码可读性
