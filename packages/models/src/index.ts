/**
 * Halo项目通用数据模型和类型定义
 */

// 股票相关类型
export type { StockInfo, KlineData, RealtimeData, StockIndividualBasicInfo } from './stock';

// API相关类型
export type { ApiResponse, FunctionArgs, DateString, StockSymbol } from './api';

// Python桥接相关类型
export type { PythonBridgeConfig, PythonExecutionResult, PythonFunctionCall } from './bridge';

export { PythonFunction } from './bridge';

// 用户相关类型
export type {
  User,
  NewUser,
  UserSession,
  NewUserSession,
  UserRole,
  NewUserRole,
  UserRoleAssignment,
  NewUserRoleAssignment,
} from './user';

// 数据库相关类型
export type { DatabaseConnection, ConnectionPool } from './database';

// 重新导出组合类型（从原来的stock包迁移过来）
import type { ApiResponse } from './api';
import type { KlineData, RealtimeData, StockInfo, StockIndividualBasicInfo } from './stock';

export type StockHistoryResponse = ApiResponse<KlineData[]>;
export type StockRealtimeResponse = ApiResponse<RealtimeData>;
export type StockInfoResponse = ApiResponse<StockInfo[]>;
export type StockBasicInfoResponse = ApiResponse<StockIndividualBasicInfo>;
