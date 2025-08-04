/**
 * 股票数据API类型定义统一导出
 */

// 股票相关类型
export type {
  StockInfo,
  KlineData,
  RealtimeData,
  StockIndividualBasicInfo
} from './stock.js';

// API相关类型
export type {
  ApiResponse,
  FunctionArgs,
  DateString,
  StockSymbol
} from './api.js';

// 桥接相关类型
export type {
  PythonBridgeConfig,
  PythonExecutionResult,
  PythonFunctionCall
} from './bridge.js';

export {
  PythonFunction
} from './bridge.js';

// 导入类型用于重新导出组合
import type { ApiResponse } from './api.js';
import type { KlineData, RealtimeData, StockInfo, StockIndividualBasicInfo } from './stock.js';

// 重新导出常用类型组合
export type StockHistoryResponse = ApiResponse<KlineData[]>;
export type StockRealtimeResponse = ApiResponse<RealtimeData>;
export type StockInfoResponse = ApiResponse<StockInfo[]>;
export type StockBasicInfoResponse = ApiResponse<StockIndividualBasicInfo>; 