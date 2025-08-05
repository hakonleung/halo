'use client';

import { useState } from 'react';
import {
  useStocks,
  useStockSearch,
  useStockPricesRealtime,
  useStockPricesHistory,
  type Stock,
  type StockPrice,
} from '../../lib/hooks';

export default function StocksPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // 获取所有股票数据
  const { data: stocksData, isLoading: stocksLoading, error: stocksError } = useStocks();

  // 搜索股票
  const { filteredStocks: searchResults, count: searchCount } = useStockSearch(searchKeyword);

  // 获取选中股票的实时价格
  const { data: realtimePricesData, isLoading: pricesLoading } = useStockPricesRealtime(
    selectedStock?.symbol || '',
    {
      limit: 1,
      refreshInterval: 10000, // 10秒刷新
      enabled: !!selectedStock,
    }
  );

  // 获取选中股票的历史价格（最近30天）
  const { data: historyPricesData, isLoading: historyLoading } = useStockPricesHistory(
    selectedStock?.symbol || '',
    {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    {
      limit: 30,
      enabled: !!selectedStock,
    }
  );

  const realtimePrices = realtimePricesData?.prices || [];
  const historyPrices = historyPricesData?.prices || [];
  const stocks = stocksData?.stocks || [];
  const totalCount = stocksData?.total || 0;
  const displayStocks = searchKeyword ? searchResults : stocks.slice(0, 50); // 只显示前50条

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">股票数据查询系统</h1>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">总股票数</h3>
            <p className="text-2xl font-bold text-blue-900">
              {stocksLoading ? '...' : totalCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">搜索结果</h3>
            <p className="text-2xl font-bold text-green-900">
              {searchKeyword ? searchCount.toLocaleString() : '0'}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">选中股票</h3>
            <p className="text-2xl font-bold text-purple-900">
              {selectedStock ? selectedStock.symbol : '无'}
            </p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索股票代码或名称..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 错误提示 */}
        {stocksError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            错误：{stocksError.message}
          </div>
        )}

        {/* 股票列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              股票列表 {searchKeyword && `(搜索: "${searchKeyword}")`}
            </h2>

            {stocksLoading ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {displayStocks.map((stock: Stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStock?.symbol === stock.symbol
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-mono font-semibold">{stock.symbol}</span>
                        <span className="ml-2 text-gray-700">{stock.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{stock.industry}</span>
                    </div>
                  </div>
                ))}

                {displayStocks.length === 0 && !stocksLoading && (
                  <div className="text-center py-8 text-gray-500">
                    {searchKeyword ? '未找到匹配的股票' : '暂无数据'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 股票详情 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">股票详情</h2>

            {selectedStock ? (
              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">基本信息</h3>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">代码：</span>
                      {selectedStock.symbol}
                    </div>
                    <div>
                      <span className="font-medium">名称：</span>
                      {selectedStock.name}
                    </div>
                    <div>
                      <span className="font-medium">行业：</span>
                      {selectedStock.industry || '未知'}
                    </div>
                    <div>
                      <span className="font-medium">上市日期：</span>
                      {selectedStock.listDate
                        ? new Date(selectedStock.listDate).toLocaleDateString('zh-CN')
                        : '未知'}
                    </div>
                  </div>
                </div>

                {/* 实时价格 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    实时价格
                    {pricesLoading && (
                      <span className="text-sm font-normal text-gray-500 ml-2">刷新中...</span>
                    )}
                  </h3>
                  {realtimePrices.length > 0 ? (
                    <div className="space-y-1 text-sm">
                      {realtimePrices.map((price: StockPrice) => (
                        <div key={`${price.symbol}-${price.tradeDate}`}>
                          <div className="flex justify-between">
                            <span>收盘价：</span>
                            <span className="font-mono">¥{price.close}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>涨跌幅：</span>
                            <span
                              className={`font-mono ${
                                parseFloat(price.changePercent || '0') >= 0
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {parseFloat(price.changePercent || '0') >= 0 ? '+' : ''}
                              {price.changePercent}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>成交量：</span>
                            <span className="font-mono">{price.volume}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">暂无实时数据</div>
                  )}
                </div>

                {/* 历史价格 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">
                    历史价格（最近30天）
                    {historyLoading && (
                      <span className="text-sm font-normal text-gray-500 ml-2">加载中...</span>
                    )}
                  </h3>
                  {historyPrices.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {historyPrices.map((price: StockPrice) => (
                        <div
                          key={`${price.symbol}-${price.tradeDate}`}
                          className="flex justify-between text-sm"
                        >
                          <span>{new Date(price.tradeDate).toLocaleDateString('zh-CN')}</span>
                          <span className="font-mono">¥{price.close}</span>
                          <span
                            className={`font-mono ${
                              parseFloat(price.changePercent || '0') >= 0
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {parseFloat(price.changePercent || '0') >= 0 ? '+' : ''}
                            {price.changePercent}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">暂无历史数据</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">请选择一只股票查看详情</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
