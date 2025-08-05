import { createUserService } from '@halo/storage';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 登录请求验证schema
const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // 获取配置
    const postgresUrl = process.env.POSTGRES_URL;
    const jwtSecret = process.env.JWT_SECRET;

    if (!postgresUrl || !jwtSecret) {
      return NextResponse.json({ success: false, error: '服务器配置错误' }, { status: 500 });
    }

    // 创建用户服务实例
    const userService = await createUserService(postgresUrl);

    // 验证用户
    const authResult = await userService.authenticateUser(username, password);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: 401 });
    }

    const user = authResult.user!;

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // 创建会话
    const sessionResult = await userService.createSession(user.id, userAgent, ipAddress);

    if (!sessionResult.success) {
      return NextResponse.json({ success: false, error: '创建会话失败' }, { status: 500 });
    }

    const session = sessionResult.session!;

    // 生成JWT token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        sessionId: session.id,
        sessionToken: session.sessionToken,
      },
      jwtSecret,
      {
        expiresIn: '7d',
        issuer: 'halo-app',
        subject: user.id,
      }
    );

    // 设置HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
    });

    // 设置安全的cookie
    response.cookies.set('session_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    });

    response.cookies.set('refresh_token', session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/api/auth',
    });

    return response;
  } catch (error) {
    console.error('登录API错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}
