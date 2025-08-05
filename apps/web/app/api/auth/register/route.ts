import { createUserService } from '@halo/storage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 注册请求验证schema
const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
  displayName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = registerSchema.safeParse(body);
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

    const { email, username, password, displayName } = validationResult.data;

    // 获取数据库连接URL（应该从环境变量中获取）
    const postgresUrl = process.env.POSTGRES_URL;
    if (!postgresUrl) {
      return NextResponse.json({ success: false, error: '数据库配置错误' }, { status: 500 });
    }

    // 创建用户服务实例
    const userService = await createUserService(postgresUrl);

    // 创建用户
    const result = await userService.createUser({
      email,
      username,
      password,
      displayName,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    // 返回成功结果（不包含敏感信息）
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: result.user!.id,
        email: result.user!.email,
        username: result.user!.username,
        displayName: result.user!.displayName,

        createdAt: result.user!.createdAt,
      },
    });
  } catch (error) {
    console.error('注册API错误:', error);
    return NextResponse.json({ success: false, error: '服务器内部错误' }, { status: 500 });
  }
}
