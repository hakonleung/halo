import { pgTable, varchar, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';

/**
 * 用户表
 */
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    displayName: varchar('display_name', { length: 100 }),
    avatar: text('avatar'), // 头像URL
    isActive: boolean('is_active').notNull().default(true),

    passwordResetToken: text('password_reset_token'),
    passwordResetExpires: timestamp('password_reset_expires'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    usernameIdx: index('users_username_idx').on(table.username),
    passwordResetTokenIdx: index('users_password_reset_token_idx').on(table.passwordResetToken),
  })
);

/**
 * 用户会话表
 */
export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionToken: text('session_token').notNull().unique(),
    refreshToken: text('refresh_token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    refreshExpiresAt: timestamp('refresh_expires_at').notNull(),
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }), // 支持IPv6
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
    sessionTokenIdx: index('user_sessions_session_token_idx').on(table.sessionToken),
    refreshTokenIdx: index('user_sessions_refresh_token_idx').on(table.refreshToken),
    expiresAtIdx: index('user_sessions_expires_at_idx').on(table.expiresAt),
  })
);

/**
 * 用户角色表
 */
export const userRoles = pgTable(
  'user_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    description: text('description'),
    permissions: text('permissions').array(), // 权限数组
    isSystem: boolean('is_system').notNull().default(false), // 是否系统内置角色
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => ({
    nameIdx: index('user_roles_name_idx').on(table.name),
  })
);

/**
 * 用户角色关联表
 */
export const userRoleAssignments = pgTable(
  'user_role_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => userRoles.id, { onDelete: 'cascade' }),
    assignedBy: uuid('assigned_by').references(() => users.id),
    assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  },
  table => ({
    userIdIdx: index('user_role_assignments_user_id_idx').on(table.userId),
    roleIdIdx: index('user_role_assignments_role_id_idx').on(table.roleId),
    userRoleIdx: index('user_role_assignments_user_role_idx').on(table.userId, table.roleId),
  })
);
