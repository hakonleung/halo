import {
  pgTable,
  varchar,
  text,
  decimal,
  timestamp,
  integer,
  serial,
  index,
  uniqueIndex,
  json
} from 'drizzle-orm/pg-core';

/**
 * 股票基本信息表
 */
export const stocks = pgTable('stocks', {
  // 基本字段
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  
  // 基本信息
  industry: text('industry'),
  listDate: timestamp('list_date'),
  
  // 财务指标
  totalShares: decimal('total_shares', { precision: 20, scale: 0 }),
  circulatingShares: decimal('circulating_shares', { precision: 20, scale: 0 }),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  symbolIdx: uniqueIndex('stocks_symbol_idx').on(table.symbol),
  nameIdx: index('stocks_name_idx').on(table.name),
}));

/**
 * 股票历史价格数据表
 */
export const stockPrices = pgTable('stock_prices', {
  id: serial('id').primaryKey(),

  symbol: text('symbol').notNull(),
  
  // 交易日期
  tradeDate: timestamp('trade_date').notNull(),
  
  // 价格数据
  open: decimal('open', { precision: 10, scale: 3 }).notNull(),
  high: decimal('high', { precision: 10, scale: 3 }).notNull(),
  low: decimal('low', { precision: 10, scale: 3 }).notNull(),
  close: decimal('close', { precision: 10, scale: 3 }).notNull(),
  
  // 成交量数据
  volume: decimal('volume', { precision: 20, scale: 0 }),
  amount: decimal('amount', { precision: 20, scale: 3 }),
  
  // 涨跌信息
  changePercent: decimal('change_percent', { precision: 8, scale: 3 }),
  
  // 技术指标（可选）
  turnover: decimal('turnover', { precision: 8, scale: 3 }),
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  stockDateIdx: uniqueIndex('stock_prices_stock_date_idx').on(table.symbol, table.tradeDate),
  tradeDateIdx: index('stock_prices_trade_date_idx').on(table.tradeDate),
  stockIdIdx: index('stock_prices_stock_id_idx').on(table.symbol),
}));

/**
 * 数据同步记录表
 */
export const syncRecords = pgTable('sync_records', {
  id: serial('id').primaryKey(),
  
  // 同步类型
  syncType: text('sync_type').notNull(), // 'stock_list', 'stock_prices', 'stock_info'
  
  // 同步目标
  targetSymbol: text('target_symbol'), // 特定股票代码，为空表示全量同步
  
  // 同步状态
  status: text('status').notNull().default('pending'), // 'pending', 'running', 'success', 'failed'
  
  // 同步时间范围
  syncStartDate: timestamp('sync_start_date'),
  syncEndDate: timestamp('sync_end_date'),
  
  // 统计信息
  totalRecords: integer('total_records').default(0),
  successRecords: integer('success_records').default(0),
  failedRecords: integer('failed_records').default(0),
  
  // 错误信息
  errorMessage: text('error_message'),
  errorDetails: json('error_details'),
  
  // 执行时间
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'), // 执行时间（秒）
  
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  syncTypeIdx: index('sync_records_sync_type_idx').on(table.syncType),
  statusIdx: index('sync_records_status_idx').on(table.status),
  createdAtIdx: index('sync_records_created_at_idx').on(table.createdAt),
})); 