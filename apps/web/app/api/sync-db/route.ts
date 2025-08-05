import { NextRequest, NextResponse } from 'next/server';
import { syncDb, type SyncOptions } from '@halo/storage';

export async function POST(request: NextRequest) {
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

    // 解析请求体中的选项
    let options: SyncOptions = {};
    try {
      const body = await request.json();
      options = {
        batchSize: body.batchSize || 1,
        delayBetweenBatches: body.delayBetweenBatches || 200,
        syncBasicInfo: body.syncBasicInfo || false,
      };
    } catch {
      // 如果没有请求体或解析失败，使用默认选项
    }

    console.log('开始数据库同步，选项:', options);

    // 执行同步
    const result = await syncDb(postgresUrl, options);

    console.log('数据库同步完成:', result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('数据库同步API错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '同步过程中发生未知错误',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: '请使用 POST 方法调用此接口',
      usage: {
        method: 'POST',
        endpoint: '/api/sync-db',
        body: {
          batchSize: '可选，批次大小，默认为 1',
          delayBetweenBatches: '可选，批次间延迟毫秒数，默认为 200',
          syncBasicInfo: '可选，是否同步股票基本信息，默认为 false',
        },
      },
    },
    { status: 405 }
  );
}
