import { NextResponse } from 'next/server';

import { getSupabaseClient } from '@/server/services/supabase-server';

import type { ApiResponse } from '@/client/internal-api/base';
import type { Database } from '@/server/types/database';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

/**
 * API Handler Factory: createApiHandler
 *
 * 统一的鉴权处理工厂函数，返回 Next.js route handler。
 * 支持静态路由和动态路由（带 params）。
 *
 * 功能：
 * 1. 获取 Supabase client
 * 2. 获取并验证用户
 * 3. 处理鉴权错误
 * 4. 执行业务逻辑 callback
 * 5. 统一错误处理和响应格式
 *
 * @param callback 业务逻辑回调函数，接收 request、params（可选）、supabase 和 user
 *   - params 为 Promise<Record<string, string>> | undefined
 *   - 静态路由时 params 为 undefined，动态路由时为 Promise<P>
 *   返回 { data: T, status?: number } 或 { error: string, status?: number }
 * @returns Next.js route handler function
 */
export function createApiHandler<T, P extends Record<string, string> = Record<string, string>>(
  callback: (
    request: NextRequest,
    params: Promise<P> | undefined,
    supabase: SupabaseClient<Database>,
    user: User,
  ) => Promise<{ data: T; status?: number }>,
) {
  return async (
    request: NextRequest,
    context?: { params: Promise<P> },
  ): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // 1. 获取 Supabase client
      const supabase = await getSupabaseClient();

      // 2. 获取并验证用户
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      // 3. 处理鉴权错误
      if (authError || !user) {
        return NextResponse.json<ApiResponse<T>>({ error: 'Not authenticated' }, { status: 401 });
      }

      // 4. 执行业务逻辑 callback（params 为 undefined 或 Promise）
      const result = await callback(request, context?.params, supabase, user);

      // 6. 返回成功响应（支持自定义状态码，默认 200）
      return NextResponse.json<ApiResponse<T>>(
        { data: result.data },
        { status: result.status || 200 },
      );
    } catch (error: unknown) {
      // 7. 处理异常错误
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json<ApiResponse<T>>({ error: message }, { status: 500 });
    }
  };
}
