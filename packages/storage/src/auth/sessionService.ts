import { randomBytes } from 'crypto';

import type { User, UserSession, NewUserSession } from '@halo/models';
import { eq, and, gte } from 'drizzle-orm';

import { getDb } from '../db/index';
import { users, userSessions } from '../db/schema/users';

/**
 * 会话管理服务类
 */
export class SessionService {
  private db: ReturnType<typeof getDb>;

  constructor(postgresUrl: string) {
    this.db = getDb(postgresUrl);
  }

  /**
   * 创建用户会话
   */
  async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const db = await this.db;

      const sessionToken = randomBytes(32).toString('hex');
      const refreshToken = randomBytes(32).toString('hex');

      // 会话有效期：7天
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      // 刷新token有效期：30天
      const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const newSession: NewUserSession = {
        userId,
        sessionToken,
        refreshToken,
        expiresAt,
        refreshExpiresAt,
        userAgent,
        ipAddress,
        isActive: true,
      };

      const result = await db.insert(userSessions).values(newSession).returning();

      if (result.length === 0) {
        return { success: false, error: '创建会话失败' };
      }

      return { success: true, session: result[0] };
    } catch (error) {
      console.error('创建会话失败:', error);
      return { success: false, error: '创建会话失败' };
    }
  }

  /**
   * 验证会话
   */
  async validateSession(
    sessionToken: string
  ): Promise<{ success: boolean; user?: User; session?: UserSession; error?: string }> {
    try {
      const db = await this.db;

      // 查找有效会话
      const sessionResult = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.sessionToken, sessionToken),
            eq(userSessions.isActive, true),
            gte(userSessions.expiresAt, new Date())
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        return { success: false, error: '会话无效或已过期' };
      }

      const session = sessionResult[0]!;

      // 获取用户信息
      const userResult = await db
        .select()
        .from(users)
        .where(and(eq(users.id, session.userId), eq(users.isActive, true)))
        .limit(1);

      if (userResult.length === 0) {
        return { success: false, error: '用户不存在或已被禁用' };
      }

      const user = userResult[0]!;

      // 移除敏感信息
      const { passwordHash: _, passwordResetToken: __, ...safeUser } = user;

      return { success: true, user: safeUser as User, session };
    } catch (error) {
      console.error('验证会话失败:', error);
      return { success: false, error: '验证会话失败' };
    }
  }

  /**
   * 刷新会话
   */
  async refreshSession(
    refreshToken: string
  ): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const db = await this.db;

      // 查找有效的刷新token
      const sessionResult = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.refreshToken, refreshToken),
            eq(userSessions.isActive, true),
            gte(userSessions.refreshExpiresAt, new Date())
          )
        )
        .limit(1);

      if (sessionResult.length === 0) {
        return { success: false, error: '刷新token无效或已过期' };
      }

      const oldSession = sessionResult[0]!;

      // 生成新的tokens
      const newSessionToken = randomBytes(32).toString('hex');
      const newRefreshToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // 更新会话
      const result = await db
        .update(userSessions)
        .set({
          sessionToken: newSessionToken,
          refreshToken: newRefreshToken,
          expiresAt,
          refreshExpiresAt,
          updatedAt: new Date(),
        })
        .where(eq(userSessions.id, oldSession.id))
        .returning();

      if (result.length === 0) {
        return { success: false, error: '刷新会话失败' };
      }

      return { success: true, session: result[0] };
    } catch (error) {
      console.error('刷新会话失败:', error);
      return { success: false, error: '刷新会话失败' };
    }
  }

  /**
   * 注销会话
   */
  async revokeSession(sessionToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await this.db;

      await db
        .update(userSessions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(userSessions.sessionToken, sessionToken));

      return { success: true };
    } catch (error) {
      console.error('注销会话失败:', error);
      return { success: false, error: '注销会话失败' };
    }
  }

  /**
   * 注销用户的所有会话
   */
  async revokeAllUserSessions(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await this.db;

      await db
        .update(userSessions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(userSessions.userId, userId));

      return { success: true };
    } catch (error) {
      console.error('注销用户所有会话失败:', error);
      return { success: false, error: '注销用户所有会话失败' };
    }
  }
}
