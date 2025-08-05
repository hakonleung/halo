import type { User, UserSession } from '@halo/models';

import { AuthService } from './auth/authService';
import { SessionService } from './auth/sessionService';

/**
 * 用户服务类 - 统一用户管理入口
 */
export class UserService {
  private authService: AuthService;
  private sessionService: SessionService;

  constructor(postgresUrl: string) {
    this.authService = new AuthService(postgresUrl);
    this.sessionService = new SessionService(postgresUrl);
  }

  /**
   * 创建用户
   */
  async createUser(userData: {
    username: string;
    password: string;
    displayName?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.authService.createUser(userData);
  }

  /**
   * 验证用户登录
   */
  async authenticateUser(
    username: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.authService.authenticateUser(username, password);
  }

  /**
   * 创建用户会话
   */
  async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    return this.sessionService.createSession(userId, userAgent, ipAddress);
  }

  /**
   * 验证会话
   */
  async validateSession(
    sessionToken: string
  ): Promise<{ success: boolean; user?: User; session?: UserSession; error?: string }> {
    return this.sessionService.validateSession(sessionToken);
  }

  /**
   * 刷新会话
   */
  async refreshSession(
    refreshToken: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    return this.sessionService.refreshSession(refreshToken);
  }

  /**
   * 注销会话
   */
  async revokeSession(sessionToken: string): Promise<{ success: boolean; error?: string }> {
    return this.sessionService.revokeSession(sessionToken);
  }

  /**
   * 注销用户的所有会话
   */
  async revokeAllUserSessions(userId: string): Promise<{ success: boolean; error?: string }> {
    return this.sessionService.revokeAllUserSessions(userId);
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.authService.getUserById(id);
  }

  /**
   * 更新用户信息
   */
  async updateUser(
    id: string,
    updates: Partial<Pick<User, 'displayName' | 'avatar'>>
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    return this.authService.updateUser(id, updates);
  }
}

// 导出便捷函数
export async function createUserService(postgresUrl: string): Promise<UserService> {
  return new UserService(postgresUrl);
}
