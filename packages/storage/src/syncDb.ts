import { eq } from 'drizzle-orm';

import { getDb } from './db/index';
import { syncRecords } from './db/schema/stocks';
import { syncStockBasicInfo } from './syncStockBasicInfo';
import { syncStockPricesHistory } from './syncStockPricesHistory';

export interface SyncOptions {
  batchSize?: number;
  delayBetweenBatches?: number;
  syncBasicInfo?: boolean;
}

export interface SyncResult {
  success: boolean;
  totalStocks: number;
  newStocks: number;
  updatedPrices: number;
  errors: string[];
  duration: number;
}

/**
 * 同步股票数据到数据库
 * @param postgresUrl PostgreSQL连接字符串
 * @param options 同步选项
 * @returns 同步结果
 */
export async function syncDb(postgresUrl: string, options: SyncOptions = {}): Promise<SyncResult> {
  const startTime = Date.now();
  const { batchSize = 1, delayBetweenBatches = 200, syncBasicInfo = false } = options;

  const result: SyncResult = {
    success: false,
    totalStocks: 0,
    newStocks: 0,
    updatedPrices: 0,
    errors: [],
    duration: 0,
  };

  let syncRecordId: number | null = null;

  try {
    const db = await getDb(postgresUrl);

    // 创建同步记录
    syncRecordId = await createSyncRecord(db);
    console.log(`开始数据同步，记录ID: ${syncRecordId}`);

    // 1. 同步股票基本信息（可选）
    if (syncBasicInfo) {
      console.log('开始同步股票基本信息...');
      const stockSyncResult = await syncStockBasicInfo(db, batchSize, delayBetweenBatches);

      result.totalStocks = stockSyncResult.totalStocks;
      result.newStocks = stockSyncResult.newStocks;
      result.errors.push(...stockSyncResult.errors);

      console.log(`股票基本信息同步完成: 总数 ${result.totalStocks}, 新增 ${result.newStocks}`);
    } else {
      console.log('跳过股票基本信息同步');
    }

    // 2. 同步股票价格历史数据
    console.log('开始同步股票价格历史数据...');
    const pricesSyncResult = await syncStockPricesHistory(db, batchSize, delayBetweenBatches);

    result.updatedPrices = pricesSyncResult.updatedPrices;
    result.errors.push(...pricesSyncResult.errors);

    console.log(`股票价格历史数据同步完成: 更新 ${result.updatedPrices} 条记录`);

    // 更新同步记录为成功状态
    await updateSyncRecord(db, syncRecordId, result, startTime, true);

    console.log(`数据同步完成，耗时 ${result.duration} 秒`);
    return result;
  } catch (error) {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    result.duration = duration;
    result.success = false;

    const errorMessage = error instanceof Error ? error.message : '未知错误';
    result.errors.push(errorMessage);

    console.error('数据同步失败:', errorMessage);

    // 更新同步记录为失败状态
    if (syncRecordId) {
      try {
        const db = await getDb(postgresUrl);
        await updateSyncRecord(db, syncRecordId, result, startTime, false, error);
      } catch (updateError) {
        console.error('更新同步记录失败:', updateError);
      }
    }

    return result;
  }
}

/**
 * 创建同步记录
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createSyncRecord(db: any): Promise<number> {
  const syncRecordResult = await db
    .insert(syncRecords)
    .values({
      syncType: 'full_sync',
      status: 'running',
      startedAt: new Date(),
      totalRecords: 0,
      successRecords: 0,
      failedRecords: 0,
    })
    .returning({ id: syncRecords.id });

  if (syncRecordResult.length === 0 || !syncRecordResult[0]) {
    throw new Error('创建同步记录失败');
  }

  return syncRecordResult[0].id;
}

/**
 * 更新同步记录
 */

async function updateSyncRecord(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  syncRecordId: number,
  result: SyncResult,
  startTime: number,
  isSuccess: boolean,
  error?: unknown
): Promise<void> {
  const duration = Math.floor((Date.now() - startTime) / 1000);
  result.duration = duration;
  result.success = isSuccess;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    status: isSuccess ? 'success' : 'failed',
    completedAt: new Date(),
    duration,
    totalRecords: result.totalStocks + result.updatedPrices,
    successRecords: result.newStocks + result.updatedPrices,
    failedRecords: result.errors.length,
    errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
  };

  if (error) {
    updateData.errorDetails = {
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  try {
    await db.update(syncRecords).set(updateData).where(eq(syncRecords.id, syncRecordId));
  } catch (updateError) {
    console.error('更新同步记录失败:', updateError);
  }
}
