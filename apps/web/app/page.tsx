'use client';

import { useState } from 'react';

import { Navbar } from '../components/Navbar';
import { StockChart } from '../components/StockChart';
import { StockSearch } from '../components/StockSearch';
import type { Stock } from '../lib/types/stock';

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>();

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Halo - 股票分析平台</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            实时股票数据分析，支持K线图表、技术指标分析和智能投资决策
          </p>
        </div>

        {/* 股票搜索区域 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 股票搜索</h2>
            <StockSearch
              onStockSelect={setSelectedStock}
              selectedStock={selectedStock}
              placeholder="输入股票代码或名称搜索..."
              className="max-w-md"
            />
          </div>
        </div>

        {/* 股票图表区域 */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm">
            <StockChart
              symbol={selectedStock?.symbol || ''}
              symbolName={selectedStock?.name}
              days={500}
              height={700}
            />
          </div>
        </div>

        {/* 功能介绍区域 */}
        {!selectedStock && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">智能搜索</h3>
              <p className="text-gray-600">支持股票代码和公司名称搜索，快速找到您关注的股票</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">数据分析</h3>
              <p className="text-gray-600">
                提供详细的股票价格数据，包括开盘、收盘、最高、最低价格
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">技术指标</h3>
              <p className="text-gray-600">支持多种移动平均线(MA5-MA250)和成交量分析</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-3xl mb-4">⏰</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">多周期分析</h3>
              <p className="text-gray-600">支持日线、周线、月线等不同时间周期的数据分析</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">响应式设计</h3>
              <p className="text-gray-600">完美适配桌面端和移动端，随时随地查看股票数据</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">实时更新</h3>
              <p className="text-gray-600">提供最新的股票价格数据，助您把握市场脉动</p>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-blue-400 text-xl">💡</div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-800">使用说明</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>在搜索框中输入股票代码(如:000001)或公司名称(如:平安银行)</li>
                  <li>从搜索结果中选择您要分析的股票</li>
                  <li>查看详细的价格数据表格，包含开盘、收盘、涨跌幅等信息</li>
                  <li>使用控制面板切换不同的时间周期和技术指标</li>
                  <li>通过成交量选项查看交易活跃度</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* 开发状态说明 */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-yellow-400 text-xl">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">开发状态</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  当前版本提供基础的股票数据表格显示功能。
                  K线图表、更多技术指标和实时数据推送功能正在开发中，敬请期待！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
