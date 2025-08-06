'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

import { useStockSearch } from '../lib/hooks/useStocks';
import type { Stock } from '../lib/types/stock';

export interface StockSearchProps {
  onStockSelect: (stock: Stock) => void;
  selectedStock?: Stock;
  placeholder?: string;
  className?: string;
}

export function StockSearch({
  onStockSelect,
  selectedStock,
  placeholder = '搜索股票代码或名称...',
  className = '',
}: StockSearchProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 搜索股票数据
  const { filteredStocks, isLoading, error } = useStockSearch(searchKeyword, {
    revalidateOnFocus: false,
  });

  // 限制显示的搜索结果数量
  const displayStocks = useMemo(() => {
    return filteredStocks.slice(0, 20); // 最多显示20个结果
  }, [filteredStocks]);

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchKeyword(value);
    setIsOpen(value.length > 0);
    setHighlightedIndex(-1);
  }, []);

  // 处理股票选择
  const handleStockSelect = useCallback(
    (stock: Stock) => {
      onStockSelect(stock);
      setSearchKeyword('');
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [onStockSelect]
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || displayStocks.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => (prev < displayStocks.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < displayStocks.length) {
            const selectedStock = displayStocks[highlightedIndex];
            if (selectedStock) {
              handleStockSelect(selectedStock);
            }
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [isOpen, displayStocks, highlightedIndex, handleStockSelect]
  );

  // 处理输入框焦点
  const handleInputFocus = useCallback(() => {
    if (searchKeyword.length > 0) {
      setIsOpen(true);
    }
  }, [searchKeyword]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 滚动到高亮项
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchKeyword}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />

        {/* 搜索图标 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* 当前选中的股票显示 */}
      {selectedStock && !isOpen && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">{selectedStock.name}</div>
              <div className="text-sm text-blue-600">{selectedStock.symbol}</div>
              {selectedStock.industry && (
                <div className="text-xs text-blue-500 mt-1">{selectedStock.industry}</div>
              )}
            </div>
            <button
              onClick={() => setSearchKeyword(selectedStock.symbol)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="重新搜索"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto"
        >
          {error && (
            <div className="p-4 text-center text-red-600">
              <div className="mb-2">⚠️</div>
              <div className="text-sm">搜索出错: {error.message}</div>
            </div>
          )}

          {!error && displayStocks.length === 0 && searchKeyword.length > 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="mb-2">🔍</div>
              <div className="text-sm">未找到匹配的股票</div>
            </div>
          )}

          {!error && displayStocks.length > 0 && (
            <>
              {displayStocks.map((stock, index) => (
                <button
                  key={stock.id}
                  onClick={() => handleStockSelect(stock)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === highlightedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{stock.name}</div>
                      <div className="text-sm text-gray-600">{stock.symbol}</div>
                      {stock.industry && (
                        <div className="text-xs text-gray-500 mt-1">{stock.industry}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {stock.listDate && new Date(stock.listDate).getFullYear()}
                    </div>
                  </div>
                </button>
              ))}

              {filteredStocks.length > displayStocks.length && (
                <div className="p-3 text-center text-gray-500 bg-gray-50 text-sm">
                  显示前 {displayStocks.length} 个结果，共 {filteredStocks.length} 个匹配项
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
