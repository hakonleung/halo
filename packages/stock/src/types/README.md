# TypeScript 类型定义

这个目录包含了股票数据API的所有TypeScript类型定义，采用模块化组织方式。

## 文件结构

```
types/
├── index.ts       # 统一导出所有类型定义
├── stock.ts       # 股票相关数据类型
├── api.ts         # API响应和通用类型
├── bridge.ts      # Python桥接相关类型
└── README.md      # 本文档
```

## 类型分类

### stock.ts - 股票数据类型

包含股票业务相关的数据结构：

- `StockInfo`: 股票基本信息
- `KlineData`: K线数据结构
- `RealtimeData`: 实时行情数据
- `StockIndividualBasicInfo`: 个股详细基本信息

### api.ts - API通用类型

包含API层面的通用类型：

- `ApiResponse<T>`: 统一的API响应格式
- `FunctionArgs`: 函数参数类型
- `DateString`: 日期字符串类型
- `StockSymbol`: 股票代码类型

### bridge.ts - 桥接层类型

包含Python桥接相关的类型：

- `PythonBridgeConfig`: 桥接配置接口
- `PythonExecutionResult`: Python执行结果
- `PythonFunctionCall`: Python函数调用参数
- `PythonFunction`: 支持的Python函数枚举

## 使用方式

### 1. 导入单个类型

```typescript
import type { StockInfo, KlineData } from './types/stock.js';
import type { ApiResponse } from './types/api.js';
```

### 2. 从统一入口导入

```typescript
import type { StockInfo, KlineData, ApiResponse, StockHistoryResponse } from './types/index.js';
```

### 3. 导入枚举（作为值）

```typescript
import { PythonFunction } from './types/index.js';
```

### 4. 使用预定义的组合类型

```typescript
import type {
  StockHistoryResponse, // ApiResponse<KlineData[]>
  StockRealtimeResponse, // ApiResponse<RealtimeData>
  StockInfoResponse, // ApiResponse<StockInfo[]>
  StockBasicInfoResponse, // ApiResponse<StockIndividualBasicInfo>
} from './types/index.js';
```

## 类型组合

`index.ts` 文件预定义了一些常用的类型组合：

- `StockHistoryResponse`: 历史数据API响应
- `StockRealtimeResponse`: 实时数据API响应
- `StockInfoResponse`: 股票列表API响应
- `StockBasicInfoResponse`: 基本信息API响应

## 设计原则

1. **模块化**: 按功能领域拆分类型定义
2. **可重用**: 类型可以被多个模块重用
3. **类型安全**: 提供完整的类型约束
4. **向后兼容**: 通过统一导出保持兼容性
5. **易于维护**: 清晰的文件组织和命名规范

## 扩展指南

添加新类型时：

1. 确定类型的功能领域（股票数据/API/桥接）
2. 在对应的文件中定义类型
3. 在 `index.ts` 中添加导出
4. 如需要，创建组合类型
5. 更新文档说明
