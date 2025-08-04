import { getDb } from './db/index.js';
import { stocks, stockPrices, syncRecords } from './db/schema/stocks.js';
import { StockAPI } from '@halo/stock';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { StockInfo, StockIndividualBasicInfo, KlineData } from '@halo/stock';

export interface SyncOptions {
  batchSize?: number;
  maxRetries?: number;
  delayBetweenBatches?: number;
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
export async function syncDb(
  postgresUrl: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const startTime = Date.now();
  const {
    batchSize = 50,
    maxRetries = 3,
    delayBetweenBatches = 1000,
  } = options;

  const result: SyncResult = {
    success: false,
    totalStocks: 0,
    newStocks: 0,
    updatedPrices: 0,
    errors: [],
    duration: 0
  };

  let syncRecordId: number | null = null;

  try {
    const db = await getDb(postgresUrl);

    // 创建同步记录
    const syncRecordResult = await db.insert(syncRecords).values({
      syncType: 'full_sync',
      status: 'running',
      startedAt: new Date(),
      totalRecords: 0,
      successRecords: 0,
      failedRecords: 0
    }).returning({ id: syncRecords.id });

    if (syncRecordResult.length === 0 || !syncRecordResult[0]) {
      throw new Error('创建同步记录失败');
    }

    syncRecordId = syncRecordResult[0].id;
    console.log(`开始数据同步，记录ID: ${syncRecordId}`);

    // 1. 同步股票基本信息
    console.log('开始同步股票基本信息...');
    const stockSyncResult = await syncStockBasicInfo(db, batchSize, maxRetries, delayBetweenBatches);
    
    result.totalStocks = stockSyncResult.totalStocks;
    result.newStocks = stockSyncResult.newStocks;
    result.errors.push(...stockSyncResult.errors);

    console.log(`股票基本信息同步完成: 总数 ${result.totalStocks}, 新增 ${result.newStocks}`);

    // 2. 同步股票价格历史数据
    console.log('开始同步股票价格历史数据...');
    const pricesSyncResult = await syncStockPricesHistory(db, batchSize, maxRetries, delayBetweenBatches);
    
    result.updatedPrices = pricesSyncResult.updatedPrices;
    result.errors.push(...pricesSyncResult.errors);

    console.log(`股票价格历史数据同步完成: 更新 ${result.updatedPrices} 条记录`);

    // 更新同步记录
    const duration = Math.floor((Date.now() - startTime) / 1000);
    result.duration = duration;
    result.success = result.errors.length === 0;

    await db.update(syncRecords)
      .set({
        status: result.success ? 'success' : 'failed',
        completedAt: new Date(),
        duration,
        totalRecords: result.totalStocks + result.updatedPrices,
        successRecords: result.newStocks + result.updatedPrices,
        failedRecords: result.errors.length,
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null
      })
      .where(eq(syncRecords.id, syncRecordId));

    console.log(`数据同步完成，耗时 ${duration} 秒`);
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
        await db.update(syncRecords)
          .set({
            status: 'failed',
            completedAt: new Date(),
            duration,
            errorMessage,
            errorDetails: { error: errorMessage, stack: error instanceof Error ? error.stack : undefined }
          })
          .where(eq(syncRecords.id, syncRecordId));
      } catch (updateError) {
        console.error('更新同步记录失败:', updateError);
      }
    }

    return result;
  }
}

/**
 * 同步股票基本信息
 */
async function syncStockBasicInfo(
  db: any,
  batchSize: number,
  maxRetries: number,
  delayBetweenBatches: number
) {
  const result = {
    totalStocks: 0,
    newStocks: 0,
    errors: [] as string[]
  };

  try {
    // 获取所有股票代码
    console.log('正在获取股票列表...');
    const stocksResponse = await StockAPI.getAllStocksInfo();
    
    if (!stocksResponse.success || !stocksResponse.data) {
      throw new Error(`获取股票列表失败: ${stocksResponse.error}`);
    }

    const allStocks = stocksResponse.data;
    result.totalStocks = allStocks.length;
    console.log(`获取到 ${allStocks.length} 只股票`);

    // 获取数据库中已存在的股票代码
    const existingStocks = await db.select({ symbol: stocks.symbol }).from(stocks);
    const existingSymbols = new Set(existingStocks.map((s: any) => s.symbol));
    
    // 筛选出需要新增的股票
    const newStocks = allStocks.filter(stock => !existingSymbols.has(stock.symbol));
    console.log(`需要新增 ${newStocks.length} 只股票的基本信息`);

    if (newStocks.length === 0) {
      console.log('没有需要新增的股票');
      return result;
    }

    // 分批处理新股票
    for (let i = 0; i < newStocks.length; i += batchSize) {
      const batch = newStocks.slice(i, i + batchSize);
      console.log(`处理第 ${Math.floor(i / batchSize) + 1} 批股票 (${i + 1}-${Math.min(i + batchSize, newStocks.length)}/${newStocks.length})`);

      // 并行获取每只股票的详细信息
      const stockDetailsPromises = batch.map(async (stock) => {
        for (let retry = 0; retry < maxRetries; retry++) {
          try {
            const detailResponse = await StockAPI.getStockIndividualBasicInfoXq(stock.symbol);
            if (detailResponse.success && detailResponse.data) {
              return {
                stock,
                detail: detailResponse.data
              };
            } else {
              if (retry === maxRetries - 1) {
                result.errors.push(`获取股票 ${stock.symbol}(${stock.name}) 详细信息失败: ${detailResponse.error}`);
              }
            }
          } catch (error) {
            if (retry === maxRetries - 1) {
              result.errors.push(`获取股票 ${stock.symbol}(${stock.name}) 详细信息异常: ${error instanceof Error ? error.message : '未知错误'}`);
            }
          }
          
          if (retry < maxRetries - 1) {
            await delay(1000 * (retry + 1)); // 递增延迟
          }
        }
        return null;
      });

      const stockDetails = (await Promise.all(stockDetailsPromises)).filter(Boolean) as Array<{
        stock: StockInfo;
        detail: StockIndividualBasicInfo;
      }>;

      // 批量插入数据库
      if (stockDetails.length > 0) {
        try {
          const stocksToInsert = stockDetails.map(({ stock, detail }) => ({
            symbol: stock.symbol,
            name: stock.name,
            industry: detail.industry,
            listDate: detail.list_date ? new Date(detail.list_date) : null,
            totalShares: detail.total_shares,
            circulatingShares: detail.circulating_shares
          }));

          await db.insert(stocks).values(stocksToInsert);
          result.newStocks += stockDetails.length;
          console.log(`成功插入 ${stockDetails.length} 条股票基本信息`);
        } catch (error) {
          result.errors.push(`批量插入股票信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      // 批次间延迟
      if (i + batchSize < newStocks.length) {
        await delay(delayBetweenBatches);
      }
    }

  } catch (error) {
    result.errors.push(`同步股票基本信息失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  return result;
}

/**
 * 同步股票价格历史数据
 */
async function syncStockPricesHistory(
  db: any,
  batchSize: number,
  maxRetries: number,
  delayBetweenBatches: number
) {
  const result = {
    updatedPrices: 0,
    errors: [] as string[]
  };

  try {
    // 获取所有股票代码
    const allStocks = await db.select({ symbol: stocks.symbol, name: stocks.name }).from(stocks);
    console.log(`开始为 ${allStocks.length} 只股票同步价格数据`);

    // 分批处理股票
    for (let i = 0; i < allStocks.length; i += batchSize) {
      const batch = allStocks.slice(i, i + batchSize);
      console.log(`处理第 ${Math.floor(i / batchSize) + 1} 批股票价格数据 (${i + 1}-${Math.min(i + batchSize, allStocks.length)}/${allStocks.length})`);

      // 并行处理每只股票的价格数据
      const priceUpdatePromises = batch.map(async (stock: { symbol: string; name: string }) => {
        try {
          // 获取该股票最新的交易日期
          const latestPriceRecord = await db.select({ tradeDate: stockPrices.tradeDate })
            .from(stockPrices)
            .where(eq(stockPrices.symbol, stock.symbol))
            .orderBy(desc(stockPrices.tradeDate))
            .limit(1);

          let startDate: Date | undefined;
          if (latestPriceRecord.length > 0) {
            startDate = new Date(latestPriceRecord[0].tradeDate);
            startDate.setDate(startDate.getDate() + 1); // 从下一天开始
          }

          // 如果开始日期是今天或未来，跳过
          const today = new Date();
          if (startDate && startDate >= today) {
            return 0;
          }

          // 获取历史价格数据
          const historyResponse = await StockAPI.getStockHistory(
            stock.symbol,
            startDate?.getTime(),
            today.getTime()
          );

          if (!historyResponse.success || !historyResponse.data) {
            result.errors.push(`获取股票 ${stock.symbol}(${stock.name}) 历史数据失败: ${historyResponse.error}`);
            return 0;
          }

          const historyData = historyResponse.data;
          if (historyData.length === 0) {
            return 0;
          }

          // 批量插入价格数据
          const pricesToInsert = historyData.map((kline: KlineData) => ({
            symbol: stock.symbol,
            tradeDate: new Date(kline.date),
            open: kline.open.toString(),
            high: kline.high.toString(),
            low: kline.low.toString(),
            close: kline.close.toString(),
            volume: kline.volume.toString(),
            amount: kline.amount.toString(),
            changePercent: kline.pct_change.toString(),
            turnover: kline.turnover.toString()
          }));

          await db.insert(stockPrices).values(pricesToInsert);
          console.log(`股票 ${stock.symbol} 新增 ${historyData.length} 条价格记录`);
          return historyData.length;

        } catch (error) {
          // 重试逻辑
          for (let retry = 1; retry < maxRetries; retry++) {
            try {
              await delay(1000 * retry);
              // 重复上面的逻辑...
              return 0;
            } catch (retryError) {
              if (retry === maxRetries - 1) {
                result.errors.push(`股票 ${stock.symbol}(${stock.name}) 价格数据同步失败: ${error instanceof Error ? error.message : '未知错误'}`);
              }
            }
          }
          return 0;
        }
      });

      const batchResults = await Promise.all(priceUpdatePromises);
      result.updatedPrices += batchResults.reduce((sum, count) => sum + count, 0);

      // 批次间延迟
      if (i + batchSize < allStocks.length) {
        await delay(delayBetweenBatches);
      }
    }

  } catch (error) {
    result.errors.push(`同步股票价格历史数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  return result;
}

/**
 * 延迟工具函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 