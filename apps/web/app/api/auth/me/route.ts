import { createUserService } from '@halo/storage';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface JWTPayload {
  userId: string;
  sessionId: string;
  sessionToken: string;
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
}

export async function GET(request: NextRequest) {
  try {
    // 获取token from Authorization header或cookie
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      const sessionToken = request.cookies.get('session_token')?.value;
      if (sessionToken) {
        // 如果有session token，需要验证会话
        const postgresUrl = process.env.POSTGRES_URL;
        if (!postgresUrl) {
          return NextResponse.json({ success: false, error: '数据库配置错误' }, { status: 500 });
        }

        const userService = await createUserService(postgresUrl);
        const sessionResult = await userService.validateSession(sessionToken);

        if (!sessionResult.success) {
          return NextResponse.json({ success: false, error: '会话无效' }, { status: 401 });
        }

        return NextResponse.json({
          success: true,
          user: sessionResult.user,
        });
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, error: '未提供认证信息' }, { status: 401 });
    }

    // 验证JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 });
    }

    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return NextResponse.json({ success: false, error: 'Token无效' }, { status: 401 });
    }

    // 获取数据库配置
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      return NextResponse.json({ success: false, error: '数据库配置错误' }, { status: 500 });
    }

    // 创建用户服务实例并验证会话
    const userService = await createUserService(postgresUrl);
    const sessionResult = await userService.validateSession(decoded.sessionToken);

    if (!sessionResult.success) {
      return NextResponse.json({ success: false, error: '会话无效' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: sessionResult.user,
    });
  } catch (error) {
    console.error('获取用户信息API错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}
