import { spawn } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { PythonFunction } from '@halo/models';
import type { PythonBridgeConfig, StockSymbol, DateString } from '@halo/models';

/**
 * Python桥接类
 * 通过child_process调用Python脚本
 */
export class SimplePythonBridge {
  private pythonPath: string;
  private pyPackagePath: string;
  private config: PythonBridgeConfig;

  constructor(config: PythonBridgeConfig = {}) {
    this.config = {
      pythonPath: 'python3',
      timeout: 60000,
      ...config,
    };
    this.pythonPath = this.config.pythonPath!;

    // 获取正确的Python包路径
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const srcDir = currentDir.includes('dist') ? path.join(currentDir, '..', 'src') : currentDir;
    this.pyPackagePath = path.resolve(srcDir, 'py');
  }

  /**
   * 执行Python脚本并返回结果
   * @param functionName - 要调用的Python函数名
   * @param args - 函数参数
   * @returns Promise<string> - JSON字符串结果
   */
  async executePythonFunction(functionName: string, args: unknown[] = []): Promise<string> {
    return new Promise((resolve, reject) => {
      // 使用绝对路径和更健壮的Python命令
      const srcDir = path.dirname(this.pyPackagePath);
      const pythonScript = `
import sys
import os
import warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)

# 设置工作目录和路径
os.chdir('${srcDir}')
if '${srcDir}' not in sys.path:
    sys.path.insert(0, '${srcDir}')

try:
    from py import ${functionName}
    result = ${functionName}(${args.map(arg => JSON.stringify(arg)).join(', ')})
    print(result)
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
`;

      const pythonArgs = ['-c', pythonScript];

      const pythonProcess = spawn(this.pythonPath, pythonArgs, {
        cwd: srcDir,
        env: {
          ...process.env,
          PYTHONPATH: srcDir,
          PYTHONIOENCODING: 'utf-8',
        },
      });

      let stdout = '';
      let stderr = '';

      // 设置超时
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error(`Python执行超时 (${this.config.timeout}ms)`));
      }, this.config.timeout);

      pythonProcess.stdout.on('data', data => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', data => {
        stderr += data.toString();
      });

      pythonProcess.on('close', code => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Python执行失败 (${code}): ${stderr}`));
        }
      });

      pythonProcess.on('error', error => {
        clearTimeout(timeout);
        reject(new Error(`启动Python进程失败: ${error.message}`));
      });
    });
  }

  /**
   * 获取所有股票信息
   * @returns Promise<string> - JSON字符串
   */
  async getAllStocksInfo(): Promise<string> {
    return this.executePythonFunction(PythonFunction.GET_ALL_STOCKS_INFO);
  }

  /**
   * 获取股票历史数据
   * @param symbol - 股票代码
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns Promise<string> - JSON字符串
   */
  async getStockHistory(
    symbol: StockSymbol,
    startDate: DateString | null = null,
    endDate: DateString | null = null
  ): Promise<string> {
    const args: unknown[] = [symbol];
    if (startDate && endDate) {
      args.push(startDate, endDate);
    }
    return this.executePythonFunction(PythonFunction.GET_STOCK_HISTORY, args);
  }

  /**
   * 获取股票实时数据
   * @param symbol - 股票代码
   * @returns Promise<string> - JSON字符串
   */
  async getStockRealtime(symbol: StockSymbol): Promise<string> {
    return this.executePythonFunction(PythonFunction.GET_STOCK_REALTIME, [symbol]);
  }

  /**
   * 获取个股基本信息（东方财富数据源）
   * @param symbol - 股票代码
   * @returns Promise<string> - JSON字符串
   */
  async getStockIndividualBasicInfoXq(symbol: StockSymbol): Promise<string> {
    return this.executePythonFunction(PythonFunction.GET_STOCK_INDIVIDUAL_BASIC_INFO_XQ, [symbol]);
  }
}
