/**
 * 用户相关类型定义
 * 这些类型通常与数据库schema相关，但作为纯类型定义提供
 */

/**
 * 用户基础接口
 */
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建用户数据接口
 */
export interface NewUser {
  email: string;
  username: string;
  passwordHash: string;
  displayName?: string | null;
  avatar?: string | null;
  isActive?: boolean;
}

/**
 * 用户会话接口
 */
export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建用户会话数据接口
 */
export interface NewUserSession {
  userId: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  isActive?: boolean;
}

/**
 * 用户角色接口
 */
export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[] | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建用户角色数据接口
 */
export interface NewUserRole {
  name: string;
  description?: string | null;
  permissions?: string[] | null;
  isSystem?: boolean;
}

/**
 * 用户角色分配接口
 */
export interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string | null;
  assignedAt: Date;
}

/**
 * 创建用户角色分配数据接口
 */
export interface NewUserRoleAssignment {
  userId: string;
  roleId: string;
  assignedBy?: string | null;
}
