/**
 * 数据库相关类型定义
 */

/**
 * 数据库连接类型
 * 通用的数据库连接接口，具体实现由具体的ORM决定
 */
export type DatabaseConnection = unknown;

/**
 * 连接池类型
 * 通用的连接池接口，具体实现由具体的数据库驱动决定
 */
export type ConnectionPool = unknown;
