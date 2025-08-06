/* eslint-disable max-lines */
'use client';

import { init, dispose, Chart } from 'klinecharts';
import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';

import { useStockPricesHistory } from '../lib/hooks/useStockPrices';
import type { StockPrice } from '../lib/types/stock';

export interface StockChartProps {
  symbol: string;
  symbolName?: string;
  days?: number;
  height?: number;
  className?: string;
}

export interface ChartPeriod {
  key: string;
  label: string;
  value: '1d' | '1w' | '1M';
}

const CHART_PERIODS: ChartPeriod[] = [
  { key: 'daily', label: '日线', value: '1d' },
  { key: 'weekly', label: '周线', value: '1w' },
  { key: 'monthly', label: '月线', value: '1M' },
];

const MOVING_AVERAGES = [5, 10, 20, 30, 60, 120, 250];

export function StockChart({
  symbol,
  symbolName,
  days = 500,
  height = 500,
  className = '',
}: StockChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<Chart>(null);
  const [period, setPeriod] = useState<ChartPeriod>(CHART_PERIODS[0]!);
  const [showVolume, setShowVolume] = useState(true);
  const [enabledMAs, setEnabledMAs] = useState<number[]>(MOVING_AVERAGES);

  // 计算日期范围
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [days]);

  // 获取股票价格数据
  const {
    data: priceData,
    error,
    isLoading,
  } = useStockPricesHistory(symbol, dateRange, { enabled: !!symbol });

  // 转换数据格式为KLineChart格式
  const chartData = useMemo(() => {
    if (!priceData?.prices) return [];

    return priceData.prices
      .map((price: StockPrice) => ({
        timestamp: new Date(price.tradeDate).getTime(),
        open: parseFloat(price.open),
        high: parseFloat(price.high),
        low: parseFloat(price.low),
        close: parseFloat(price.close),
        volume: parseFloat(price.volume || '0'),
      }))
      .reverse();
  }, [priceData]);

  // 聚合数据（周线、月线）
  const aggregatedData = useMemo(() => {
    if (!chartData.length || period.value === '1d') return chartData;

    const grouped: { [key: string]: typeof chartData } = {};

    chartData.forEach(item => {
      const date = new Date(item.timestamp);
      let groupKey: string;

      if (period.value === '1w') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1);
        groupKey = startOfWeek.toISOString().split('T')[0] || '';
      } else if (period.value === '1M') {
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        groupKey = date.toISOString().split('T')[0] || '';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey]!.push(item);
    });

    return Object.entries(grouped)

      .map(([_, items]) => {
        const sorted = items.sort((a, b) => a.timestamp - b.timestamp);
        if (sorted.length === 0) return null;

        const first = sorted[0]!;
        const last = sorted[sorted.length - 1]!;

        return {
          timestamp: first.timestamp,
          open: first.open,
          high: Math.max(...sorted.map(item => item.high)),
          low: Math.min(...sorted.map(item => item.low)),
          close: last.close,
          volume: sorted.reduce((sum, item) => sum + item.volume, 0),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [chartData, period.value]);

  // 初始化图表
  const initChart = useCallback(() => {
    if (!chartRef.current || chartInstanceRef.current) return;

    try {
      const chart = init(chartRef.current, {
        timezone: 'Asia/Shanghai',
      });
      if (chart) {
        chartInstanceRef.current = chart;

        // 配置图表样式

        chart.setStyles({
          grid: {
            horizontal: {
              show: true,
              color: '#E5E7EB',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              style: 'dashed' as any,
            },
            vertical: {
              show: true,
              color: '#E5E7EB',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              style: 'dashed' as any,
            },
          },
          candle: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: 'solid' as any,
            bar: {
              upColor: '#EF4444',
              downColor: '#10B981',
              noChangeColor: '#6B7280',
            },
            tooltip: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              showRule: 'follow_cross' as any,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              showType: 'rect' as any,
            },
          },
          indicator: {
            lastValueMark: {
              show: true,
              text: {
                show: true,
                color: '#FFFFFF',
                size: 12,
              },
            },
          },
        });

        // 创建成交量副图
        if (showVolume) {
          chart.createIndicator('VOL', false);
        }
      }
    } catch (err) {
      console.error('初始化图表失败:', err);
    }
  }, [showVolume]);

  // 更新图表数据
  const updateChartData = useCallback(() => {
    const chart = chartInstanceRef.current;
    if (!chart || !aggregatedData.length) return;

    try {
      // 应用新数据
      chart.applyNewData(aggregatedData);

      // 清除所有移动平均线
      // chart.removeIndicator('MA');

      // chart.createIndicator('MA', true, {
      //   calcParams: enabledMAs,
      //   id: 'candle_pane',
      // });

      // // 更新成交量显示
      // if (showVolume) {
      //   const indicators = chart.getIndicators();
      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   const hasVolume = indicators.some((ind: any) => ind.name === 'VOL');
      //   if (!hasVolume) {
      //     chart.createIndicator('VOL', false);
      //   }
      // } else {
      //   chart.removeIndicator('VOL');
      // }
    } catch (err) {
      console.error('更新图表数据失败:', err);
    }
  }, [aggregatedData]);

  // 切换移动平均线
  const toggleMA = useCallback((ma: number) => {
    setEnabledMAs(prev =>
      prev.includes(ma) ? prev.filter(m => m !== ma) : [...prev, ma].sort((a, b) => a - b)
    );
  }, []);

  // 组件挂载时初始化图表
  useEffect(() => {
    const currentChartRef = chartRef.current;
    initChart();

    return () => {
      if (chartInstanceRef.current && currentChartRef) {
        dispose(currentChartRef);
        chartInstanceRef.current = null;
      }
    };
  }, [initChart]);

  // 数据变化时更新图表
  useEffect(() => {
    updateChartData();
  }, [updateChartData]);

  if (!symbol) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">请选择股票以查看图表</p>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* 控制面板 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          {/* 股票信息 */}
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{symbolName || symbol}</h3>
            <span className="text-sm text-gray-500">{symbol}</span>
          </div>

          {/* 时间周期选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">周期:</span>
            <div className="flex rounded-md shadow-sm">
              {CHART_PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-sm font-medium border ${
                    period.key === p.key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  } ${p.key === CHART_PERIODS[0]!.key ? 'rounded-l-md' : ''} ${
                    p.key === CHART_PERIODS[CHART_PERIODS.length - 1]!.key ? 'rounded-r-md' : ''
                  } ${p.key !== CHART_PERIODS[0]!.key ? '-ml-px' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 成交量切换 */}
          <div className="flex items-center gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={e => setShowVolume(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">成交量</span>
            </label>
          </div>
        </div>

        {/* 移动平均线选择 */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm font-medium text-gray-700">移动平均线:</span>
          <div className="flex flex-wrap gap-2">
            {MOVING_AVERAGES.map(ma => (
              <button
                key={ma}
                onClick={() => toggleMA(ma)}
                className={`px-2 py-1 text-xs font-medium rounded ${
                  enabledMAs.includes(ma)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                MA{ma}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 图表内容 */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">加载中...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-red-600 mb-2">📈</div>
              <p className="text-sm text-red-600">加载图表数据失败: {error.message}</p>
            </div>
          </div>
        )}

        <div ref={chartRef} style={{ height }} className="w-full" />
      </div>
    </div>
  );
}
