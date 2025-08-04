#!/usr/bin/env node

/**
 * 股票数据快速更新命令行工具
 */

import { syncDb } from '../dist/index.mjs';
import 'dotenv/config';

async function main() {
  console.log('🚀 股票数据同步工具启动');
  console.log('================================');

  // 从环境变量或命令行参数获取数据库连接字符串
  const postgresUrl = process.env.POSTGRES_URL || process.argv[2];

  if (!postgresUrl) {
    console.error('❌ 错误: 请提供 PostgreSQL 连接字符串');
    console.log('');
    console.log('使用方法:');
    console.log('  1. 设置环境变量: export POSTGRES_URL="postgresql://user:pass@localhost:5432/db"');
    console.log('  2. 或者作为参数传入: pnpm stock-quick-update "postgresql://user:pass@localhost:5432/db"');
    console.log('');
    process.exit(1);
  }

  // 解析命令行选项
  const args = process.argv.slice(2);
  const options = {};
  
  // 解析批次大小
  const batchSizeIndex = args.findIndex(arg => arg === '--batch-size');
  if (batchSizeIndex !== -1 && args[batchSizeIndex + 1]) {
    options.batchSize = parseInt(args[batchSizeIndex + 1]);
  }

  // 解析最大重试次数
  const maxRetriesIndex = args.findIndex(arg => arg === '--max-retries');
  if (maxRetriesIndex !== -1 && args[maxRetriesIndex + 1]) {
    options.maxRetries = parseInt(args[maxRetriesIndex + 1]);
  }

  // 解析批次间延迟
  const delayIndex = args.findIndex(arg => arg === '--delay');
  if (delayIndex !== -1 && args[delayIndex + 1]) {
    options.delayBetweenBatches = parseInt(args[delayIndex + 1]);
  }

  // 显示配置信息
  console.log('📋 同步配置:');
  console.log(`   数据库: ${postgresUrl.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2')}`);
  console.log(`   批次大小: ${options.batchSize || 50}`);
  console.log(`   最大重试: ${options.maxRetries || 3}`);
  console.log(`   批次延迟: ${options.delayBetweenBatches || 1000}ms`);
  console.log('');

  try {
    console.log('⏳ 开始同步数据...');
    const startTime = Date.now();

    const result = await syncDb(postgresUrl, options);

    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    console.log('');
    console.log('================================');
    console.log('📊 同步结果统计:');
    console.log('================================');
    console.log(`✅ 同步状态: ${result.success ? '成功' : '失败'}`);
    console.log(`📈 总股票数: ${result.totalStocks.toLocaleString()}`);
    console.log(`🆕 新增股票: ${result.newStocks.toLocaleString()}`);
    console.log(`💰 更新价格记录: ${result.updatedPrices.toLocaleString()}`);
    console.log(`⏱️  总耗时: ${result.duration}秒`);
    
    if (result.errors.length > 0) {
      console.log('');
      console.log('⚠️  错误信息:');
      console.log('================================');
      result.errors.slice(0, 10).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      if (result.errors.length > 10) {
        console.log(`... 还有 ${result.errors.length - 10} 个错误未显示`);
      }
    }

    console.log('');
    if (result.success) {
      console.log('🎉 数据同步完成！');
      process.exit(0);
    } else {
      console.log('💔 数据同步存在错误，请检查上述错误信息');
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    console.error('💥 同步过程中发生严重错误:');
    console.error('================================');
    console.error(error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('');
      console.error('🔍 错误堆栈:');
      console.error(error.stack);
    }
    
    console.error('');
    console.error('📝 请检查:');
    console.error('1. 数据库连接字符串是否正确');
    console.error('2. 数据库服务是否正在运行');
    console.error('3. 网络连接是否正常');
    console.error('4. API服务是否可用');
    
    process.exit(1);
  }
}

// 处理进程信号
process.on('SIGINT', () => {
  console.log('');
  console.log('⚡ 收到中断信号，正在退出...');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('⚡ 收到终止信号，正在退出...');
  process.exit(143);
});

// 运行CLI
main().catch((error) => {
  console.error('💥 未处理的错误:', error);
  process.exit(1);
}); 