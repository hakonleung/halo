import { NextRequest, NextResponse } from 'next/server';
import { getDb, stockPrices, eq, and, gte, lte, inArray, desc } from '@halo/storage';

export async function GET(request: NextRequest) {
  try {
    // 检查是否有数据库连接 URL
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      return NextResponse.json(
        {
          success: false,
          error: '数据库连接配置未找到，请设置 POSTGRES_URL 环境变量',
        },
        { status: 500 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    // 检查必需的 symbols 参数
    if (!symbolsParam) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需参数 symbols，请提供股票代码（多个用逗号分隔）',
        },
        { status: 400 }
      );
    }

    // 解析股票代码列表
    const symbols = symbolsParam.split(',').map(symbol => symbol.trim().toUpperCase());

    console.log(
      `查询股票价格数据: symbols=${symbols.join(',')}, startDate=${startDate}, endDate=${endDate}`
    );

    // 获取数据库连接
    const db = await getDb(postgresUrl);

    // 构建查询条件
    const conditions = [];

    // 添加股票代码过滤条件
    if (symbols.length === 1 && symbols[0]) {
      conditions.push(eq(stockPrices.symbol, symbols[0]));
    } else if (symbols.length > 1) {
      conditions.push(inArray(stockPrices.symbol, symbols));
    }

    // 添加日期范围过滤条件
    if (startDate) {
      const startDateTime = new Date(startDate);
      if (!isNaN(startDateTime.getTime())) {
        conditions.push(gte(stockPrices.tradeDate, startDateTime));
      }
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      if (!isNaN(endDateTime.getTime())) {
        conditions.push(lte(stockPrices.tradeDate, endDateTime));
      }
    }

    // 构建查询并执行
    let priceData;

    if (conditions.length === 0) {
      // 没有条件的查询
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          priceData = await db
            .select()
            .from(stockPrices)
            .orderBy(desc(stockPrices.tradeDate), stockPrices.symbol)
            .limit(limitNum);
        } else {
          priceData = await db
            .select()
            .from(stockPrices)
            .orderBy(desc(stockPrices.tradeDate), stockPrices.symbol);
        }
      } else {
        priceData = await db
          .select()
          .from(stockPrices)
          .orderBy(desc(stockPrices.tradeDate), stockPrices.symbol);
      }
    } else {
      // 有条件的查询
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          priceData = await db
            .select()
            .from(stockPrices)
            .where(and(...conditions))
            .orderBy(desc(stockPrices.tradeDate), stockPrices.symbol)
            .limit(limitNum);
        } else {
          priceData = await db
            .select()
            .from(stockPrices)
            .where(and(...conditions))
            .orderBy(desc(stockPrices.tradeDate), stockPrices.symbol);
        }
      } else {
        priceData = await db
          .select()
          .from(stockPrices)
          .where(and(...conditions))
          .orderBy(desc(stockPrices.tradeDate), stockPrices.symbol);
      }
    }

    console.log(`获取到 ${priceData.length} 条价格数据`);

    return NextResponse.json({
      success: true,
      data: {
        prices: priceData,
        total: priceData.length,
        symbols: symbols,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error('获取股票价格数据API错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取股票价格数据时发生未知错误',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
