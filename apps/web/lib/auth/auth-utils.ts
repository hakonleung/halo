import type { User } from '@halo/models';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface JWTPayload {
  userId: string;
  sessionId: string;
  sessionToken: string;
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * 从请求中验证用户身份
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // 获取数据库和JWT配置
    const postgresUrl = process.env.POSTGRES_URL;
    const jwtSecret = process.env.JWT_SECRET;

    if (!postgresUrl || !jwtSecret) {
      return { success: false, error: '服务器配置错误' };
    }

    // 尝试从Authorization header获取token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    // 如果没有token，尝试从cookie获取session token
    if (!token) {
      const sessionToken = request.cookies.get('session_token')?.value;
      if (sessionToken) {
        // 通过API调用验证session
        const response = await fetch(`/api/auth/me`, {
          headers: {
            Cookie: `session_token=${sessionToken}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: result.success,
            user: result.user,
            error: result.error,
          };
        }
      }

      return { success: false, error: '未提供认证信息' };
    }

    // 验证JWT token
    try {
      jwt.verify(token, jwtSecret) as JWTPayload;
    } catch {
      return { success: false, error: 'Token无效' };
    }

    // 通过API调用验证会话
    const response = await fetch(`/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: result.success,
        user: result.user,
        error: result.error,
      };
    }

    return { success: false, error: '验证会话失败' };
  } catch (error) {
    console.error('认证请求错误:', error);
    return { success: false, error: '认证过程中发生错误' };
  }
}

/**
 * 检查用户是否具有指定权限
 */
export function hasPermission(user: User): boolean {
  // 这里可以根据用户角色和权限进行检查
  // 当前简化实现，后续可以扩展
  return user.isActive;
}

/**
 * 检查用户是否为管理员
 */
export function isAdmin(user: User): boolean {
  // 这里可以根据用户角色进行检查
  // 当前简化实现，后续可以扩展
  return user.isActive;
}

/**
 * 生成API错误响应
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * 客户端认证工具
 */
export class ClientAuth {
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly USER_KEY = 'current_user';

  /**
   * 保存认证信息到localStorage
   */
  static saveAuth(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * 从localStorage获取token
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * 从localStorage获取用户信息
   */
  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * 清除认证信息
   */
  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }

  /**
   * 创建带认证头的fetch选项
   */
  static createAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 带认证的fetch请求
   */
  static async authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = this.createAuthHeaders();

    return fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });
  }
}
