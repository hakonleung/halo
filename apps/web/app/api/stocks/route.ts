import { NextResponse } from 'next/server';
import { getDb, stocks } from '@halo/storage';

export async function GET() {
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

    // 获取数据库连接
    const db = await getDb(postgresUrl);

    // 查询所有股票基本信息
    const stockList = await db.select().from(stocks);

    console.log(`获取到 ${stockList.length} 条股票基本信息`);

    return NextResponse.json({
      success: true,
      data: {
        stocks: stockList,
        total: stockList.length,
      },
    });
  } catch (error) {
    console.error('获取股票基本信息API错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取股票信息时发生未知错误',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
