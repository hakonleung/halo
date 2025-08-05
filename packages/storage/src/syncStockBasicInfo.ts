import { stocks } from './db/schema/stocks.js';
import { StockAPI } from '@halo/stock';
import { delay } from './utils/delay.js';

/**
 * 同步股票基本信息的结果
 */
export interface SyncStockBasicInfoResult {
  totalStocks: number;
  newStocks: number;
  errors: string[];
}

/**
 * 同步股票基本信息
 */

export async function syncStockBasicInfo(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  batchSize: number,
  delayBetweenBatches: number
): Promise<SyncStockBasicInfoResult> {
  const result: SyncStockBasicInfoResult = {
    totalStocks: 0,
    newStocks: 0,
    errors: [],
  };

  try {
    // 获取所有股票代码
    console.log('正在获取股票列表...');
    const stocksResponse = await StockAPI.getAllStocksInfo();

    if (!stocksResponse.success || !stocksResponse.data) {
      const error = `获取股票列表失败: ${stocksResponse.error}`;
      console.error(error);
      throw new Error(error);
    }

    const allStocks = stocksResponse.data;
    result.totalStocks = allStocks.length;
    console.log(`获取到 ${allStocks.length} 只股票`);

    // 获取数据库中已存在的股票代码
    const existingStocks = await db.select({ symbol: stocks.symbol }).from(stocks);
    const existingSymbols = new Set(existingStocks.map((s: { symbol: string }) => s.symbol));

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
      console.log(
        `处理第 ${Math.floor(i / batchSize) + 1} 批股票 (${i + 1}-${Math.min(i + batchSize, newStocks.length)}/${newStocks.length})`
      );

      // 并行获取每只股票的详细信息
      const stockDetailsPromises = batch.map(async stock => {
        try {
          const detailResponse = await StockAPI.getStockIndividualBasicInfoXq(stock.symbol);
          if (detailResponse.success && detailResponse.data) {
            return {
              stock,
              detail: detailResponse.data,
            };
          } else {
            const error = `获取股票 ${stock.symbol}(${stock.name}) 详细信息失败: ${detailResponse.error}`;
            console.error(error);
            throw new Error(error);
          }
        } catch (error) {
          const errorMsg = `获取股票 ${stock.symbol}(${stock.name}) 详细信息异常: ${error instanceof Error ? error.message : '未知错误'}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      });

      const stockDetails = await Promise.all(stockDetailsPromises);

      // 批量插入数据库
      if (stockDetails.length > 0) {
        try {
          const stocksToInsert = stockDetails.map(({ stock, detail }) => ({
            symbol: stock.symbol,
            name: stock.name,
            industry: detail.industry,
            listDate: detail.list_date ? new Date(detail.list_date) : null,
            totalShares: detail.total_shares,
            circulatingShares: detail.circulating_shares,
          }));

          await db.insert(stocks).values(stocksToInsert);
          result.newStocks += stockDetails.length;
          console.log(`成功插入 ${stockDetails.length} 条股票基本信息`);
        } catch (error) {
          const errorMsg = `批量插入股票信息失败: ${error instanceof Error ? error.message : '未知错误'}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      }

      // 批次间延迟
      if (i + batchSize < newStocks.length) {
        await delay(delayBetweenBatches);
      }
    }
  } catch (error) {
    const errorMsg = `同步股票基本信息失败: ${error instanceof Error ? error.message : '未知错误'}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return result;
}
