#!/usr/bin/env node

/**
 * 股票API演示脚本
 * 调用所有API接口并打印结果
 */

// 注意: 这里需要根据实际编译后的文件路径调整
// 如果没有编译，请先运行: npm run build
import { StockAPI } from '../dist/index.js';

// 演示配置
const DEMO_CONFIG = {
  stockSymbol: '000001',  // 平安银行
  startDate: 1704067200000,
  endDate: 1704326400000,
  delay: 2000  // API调用间隔 (毫秒)
};

/**
 * 格式化输出JSON数据
 */
function formatOutput(title, data) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${title.toUpperCase()}`);
  console.log('='.repeat(60));
  
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.log(data);
      return;
    }
  }
  
  if (data.success) {
    console.log(`✅ 成功获取数据`);
    console.log(`🕐 时间戳: ${data.timestamp}`);
    
    if (data.total !== undefined) {
      console.log(`📊 总数: ${data.total}`);
    }
    
    if (data.symbol) {
      console.log(`📈 股票代码: ${data.symbol}`);
    }
    
    if (data.start_date && data.end_date) {
      console.log(`📅 日期范围: ${data.start_date} 到 ${data.end_date}`);
    }
    
    // 显示数据样例
    if (Array.isArray(data.data)) {
      console.log(`\n📋 数据样例 (前3条):`);
      const sample = data.data.slice(0, 3);
      sample.forEach((item, index) => {
        console.log(`\n${index + 1}. ${JSON.stringify(item, null, 2)}`);
      });
      
      if (data.data.length > 3) {
        console.log(`\n... 还有 ${data.data.length - 3} 条数据`);
      }
    } else if (data.data) {
      console.log(`\n📋 数据详情:`);
      console.log(JSON.stringify(data.data, null, 2));
    }
  } else {
    console.log(`❌ 获取数据失败`);
    console.log(`🕐 时间戳: ${data.timestamp}`);
    console.log(`🚫 错误信息: ${data.error}`);
    
    if (data.symbol) {
      console.log(`📈 股票代码: ${data.symbol}`);
    }
  }
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 演示所有API
 */
async function demonstrateAllAPIs() {
  console.log('🚀 开始股票API演示');
  console.log(`📊 使用股票代码: ${DEMO_CONFIG.stockSymbol}`);
  console.log(`📅 历史数据范围: ${DEMO_CONFIG.startDate} - ${DEMO_CONFIG.endDate}`);
  console.log(`⏱️  API调用间隔: ${DEMO_CONFIG.delay}ms`);

  try {
    // 1. 获取所有股票信息
    // console.log('\n🔍 正在获取所有股票信息...');
    // formatOutput('所有股票信息', await StockAPI.getAllStocksInfo());
    
    // await delay(DEMO_CONFIG.delay);

    // 2. 获取股票历史数据
    console.log('\n🔍 正在获取股票历史数据...');
    formatOutput(
      `股票历史数据 (${DEMO_CONFIG.stockSymbol})`,
      await StockAPI.getStockHistory(
        DEMO_CONFIG.stockSymbol,
        DEMO_CONFIG.startDate,
        DEMO_CONFIG.endDate
      )
    );
    
    // await delay(DEMO_CONFIG.delay);

    // // 3. 获取股票实时数据
    // console.log('\n🔍 正在获取股票实时数据...');
    // formatOutput(
    //   `股票实时数据 (${DEMO_CONFIG.stockSymbol})`,
    //   await StockAPI.getStockRealtime(DEMO_CONFIG.stockSymbol)
    // );
    
    await delay(DEMO_CONFIG.delay);

    // 4. 获取股票基本信息
    console.log('\n🔍 正在获取股票基本信息...');
    formatOutput(
      `股票基本信息 (${DEMO_CONFIG.stockSymbol})`,
      await StockAPI.getStockIndividualBasicInfoXq(DEMO_CONFIG.stockSymbol)
    );

    console.log('\n🎉 所有API演示完成!');
    console.log('\n💡 提示: 你可以修改脚本顶部的 DEMO_CONFIG 来测试不同的股票代码和日期范围');

  } catch (error) {
    console.error('\n❌ 演示过程中发生错误:');
    console.error(error.message);
    console.error('\n🔧 请检查:');
    console.error('1. Python环境是否正确安装');
    console.error('2. akshare和pandas是否已安装');
    console.error('3. 网络连接是否正常');
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  // 检查命令行参数
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📈 股票API演示脚本

使用方法:
  node stock-demo.mjs [选项]

选项:
  -h, --help     显示帮助信息
  --stock CODE   指定股票代码 (默认: ${DEMO_CONFIG.stockSymbol})
  --start DATE   开始日期 (默认: ${DEMO_CONFIG.startDate})
  --end DATE     结束日期 (默认: ${DEMO_CONFIG.endDate})

示例:
  node stock-demo.mjs
  node stock-demo.mjs --stock 000002 --start 2024-02-01 --end 2024-02-28
`);
    process.exit(0);
  }

  // 解析命令行参数
  const stockIndex = args.indexOf('--stock');
  if (stockIndex !== -1 && args[stockIndex + 1]) {
    DEMO_CONFIG.stockSymbol = args[stockIndex + 1];
  }

  const startIndex = args.indexOf('--start');
  if (startIndex !== -1 && args[startIndex + 1]) {
    DEMO_CONFIG.startDate = args[startIndex + 1];
  }

  const endIndex = args.indexOf('--end');
  if (endIndex !== -1 && args[endIndex + 1]) {
    DEMO_CONFIG.endDate = args[endIndex + 1];
  }

  await demonstrateAllAPIs();
}

// 运行主函数
main().catch(console.error); 