import { StockAPI } from '@halo/stock';
import type { KlineData } from '@halo/stock';
import { eq, desc } from 'drizzle-orm';

import { stocks, stockPrices } from './db/schema/stocks.js';
import { delay } from './utils/delay.js';

/**
 * 同步股票价格历史数据的结果
 */
export interface SyncStockPricesHistoryResult {
  updatedPrices: number;
  errors: string[];
}

/**
 * 同步股票价格历史数据
 */

export async function syncStockPricesHistory(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  batchSize: number,
  delayBetweenBatches: number
): Promise<SyncStockPricesHistoryResult> {
  const result: SyncStockPricesHistoryResult = {
    updatedPrices: 0,
    errors: [],
  };

  try {
    // 获取所有股票代码
    const allStocks = await db.select({ symbol: stocks.symbol, name: stocks.name }).from(stocks);
    console.log(`开始为 ${allStocks.length} 只股票同步价格数据`);

    // 分批处理股票
    for (let i = 0; i < allStocks.length; i += batchSize) {
      const batch = allStocks.slice(i, i + batchSize);
      console.log(
        `处理第 ${Math.floor(i / batchSize) + 1} 批股票价格数据 (${i + 1}-${Math.min(i + batchSize, allStocks.length)}/${allStocks.length})`
      );

      // 并行处理每只股票的价格数据
      const priceUpdatePromises = batch.map(async (stock: { symbol: string; name: string }) => {
        try {
          // 获取该股票最新的交易日期
          const latestPriceRecord = await db
            .select({ tradeDate: stockPrices.tradeDate })
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
            const error = `获取股票 ${stock.symbol}(${stock.name}) 历史数据失败: ${historyResponse.error}`;
            console.error(error);
            throw new Error(error);
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
            turnover: kline.turnover.toString(),
          }));

          await db.insert(stockPrices).values(pricesToInsert);
          console.log(`股票 ${stock.symbol} 新增 ${historyData.length} 条价格记录`);
          return historyData.length;
        } catch (error) {
          const errorMsg = `股票 ${stock.symbol}(${stock.name}) 价格数据同步失败: ${error instanceof Error ? error.message : '未知错误'}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      });

      const batchResults = await Promise.all(priceUpdatePromises);
      const updatedPrices = batchResults.reduce((sum, count) => sum + count, 0);
      result.updatedPrices += updatedPrices;

      // 批次间延迟
      if (i + batchSize < allStocks.length) {
        await delay(delayBetweenBatches);
      }
    }
  } catch (error) {
    const errorMsg = `同步股票价格历史数据失败: ${error instanceof Error ? error.message : '未知错误'}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return result;
}
