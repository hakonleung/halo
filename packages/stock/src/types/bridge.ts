/**
 * Python桥接相关类型定义
 */

/**
 * Python桥接配置接口
 */
export interface PythonBridgeConfig {
  pythonPath?: string;
  workingDirectory?: string;
  timeout?: number;
}

/**
 * Python执行结果接口
 */
export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Python函数调用参数
 */
export interface PythonFunctionCall {
  functionName: string;
  args: unknown[];
  module?: string;
}

/**
 * 支持的Python函数名枚举
 */
export enum PythonFunction {
  GET_ALL_STOCKS_INFO = 'get_all_stocks_info',
  GET_STOCK_HISTORY = 'get_stock_history',
  GET_STOCK_REALTIME = 'get_stock_realtime',
  GET_STOCK_INDIVIDUAL_BASIC_INFO_XQ = 'get_stock_individual_basic_info_xq',
}
