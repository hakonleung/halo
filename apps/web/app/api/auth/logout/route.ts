import { createUserService } from '@halo/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 获取session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: '未找到会话' }, { status: 400 });
    }

    // 获取数据库配置
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      return NextResponse.json({ success: false, error: '数据库配置错误' }, { status: 500 });
    }

    // 创建用户服务实例
    const userService = await createUserService(postgresUrl);

    // 注销会话
    await userService.revokeSession(sessionToken);

    // 创建响应并清除cookies
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除cookies
    response.cookies.delete('session_token');
    response.cookies.delete('refresh_token');

    return response;
  } catch (error) {
    console.error('登出API错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}
