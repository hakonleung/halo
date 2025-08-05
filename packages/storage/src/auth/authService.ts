import type { User, NewUser } from '@halo/models';
import { hash, compare } from 'bcryptjs';
import { eq, and, or } from 'drizzle-orm';

import { getDb } from '../db/index';
import { users } from '../db/schema/users';

/**
 * 认证服务类
 */
export class AuthService {
  private dbPromise: ReturnType<typeof getDb>;

  constructor(postgresUrl: string) {
    this.dbPromise = getDb(postgresUrl);
  }

  /**
   * 创建用户
   */
  async createUser(userData: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const db = await this.dbPromise;

      // 检查邮箱是否已存在
      const existingEmailUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingEmailUser.length > 0) {
        return { success: false, error: '邮箱已被使用' };
      }

      // 检查用户名是否已存在
      const existingUsernameUser = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);

      if (existingUsernameUser.length > 0) {
        return { success: false, error: '用户名已被使用' };
      }

      // 哈希密码
      const passwordHash = await hash(userData.password, 12);

      // 创建用户
      const newUser: NewUser = {
        email: userData.email,
        username: userData.username,
        passwordHash,
        displayName: userData.displayName ?? userData.username,
        isActive: true,
      };

      const result = await db.insert(users).values(newUser).returning();

      if (result.length === 0) {
        return { success: false, error: '创建用户失败' };
      }

      // 移除敏感信息
      const { passwordHash: _, ...safeUser } = result[0] ?? {};

      return { success: true, user: safeUser as User };
    } catch (error) {
      console.error('创建用户失败:', error);
      return { success: false, error: '创建用户失败' };
    }
  }

  /**
   * 验证用户登录
   */
  async authenticateUser(
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const db = await this.dbPromise;

      // 查找用户（支持邮箱或用户名登录）
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            or(eq(users.email, emailOrUsername), eq(users.username, emailOrUsername)),
            eq(users.isActive, true)
          )
        )
        .limit(1);

      const foundUser = user[0];

      if (!foundUser) {
        return { success: false, error: '用户不存在或已被禁用' };
      }

      // 验证密码
      const isPasswordValid = await compare(password, foundUser.passwordHash);
      if (!isPasswordValid) {
        return { success: false, error: '密码错误' };
      }

      // 更新最后登录时间
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, foundUser.id));

      // 移除敏感信息
      const { passwordHash: _, passwordResetToken: __, ...safeUser } = foundUser;

      return { success: true, user: safeUser as User };
    } catch (error) {
      console.error('用户认证失败:', error);
      return { success: false, error: '登录失败' };
    }
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const db = await this.dbPromise;

      const result = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), eq(users.isActive, true)))
        .limit(1);

      const user = result[0];

      if (!user) {
        return { success: false, error: '用户不存在' };
      }

      const { passwordHash: _, passwordResetToken: __, ...safeUser } = user;

      return { success: true, user: safeUser as User };
    } catch (error) {
      console.error('获取用户失败:', error);
      return { success: false, error: '获取用户失败' };
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(
    id: string,
    updates: Partial<Pick<User, 'displayName' | 'avatar'>>
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const db = await this.dbPromise;

      const result = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      const user = result[0];

      if (!user) {
        return { success: false, error: '更新用户失败' };
      }

      const { passwordHash: _, passwordResetToken: __, ...safeUser } = user;

      return { success: true, user: safeUser as User };
    } catch (error) {
      console.error('更新用户失败:', error);
      return { success: false, error: '更新用户失败' };
    }
  }
}
