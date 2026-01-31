/**
 * Internal API Service
 *
 * 统一的客户端 API 调用服务，负责：
 * 1. API 调用和数据转换流程
 * 2. 每个 API 对应一个方法
 * 3. 类型安全：定义 server side 数据类型，添加 convert 函数，返回 client side 数据类型
 */

import { goalsApi } from './goals';
import { dashboardApi } from './dashboard';
import { behaviorsApi } from './behaviors';
import { notesApi } from './notes';
import { historyApi } from './history';
import { settingsApi } from './settings';
import { chatApi } from './chat';
import { authApi } from './auth';

/**
 * Internal API Service - 统一导出所有 API 方法
 */
export const internalApiService = {
  // Goals API
  getGoals: goalsApi.getGoals,
  getGoal: goalsApi.getGoal,
  createGoal: goalsApi.createGoal,
  updateGoal: goalsApi.updateGoal,
  deleteGoal: goalsApi.deleteGoal,

  // Dashboard API
  getDashboardStats: dashboardApi.getDashboardStats,
  getTrends: dashboardApi.getTrends,
  getHeatmap: dashboardApi.getHeatmap,

  // Behaviors API
  getBehaviorRecords: behaviorsApi.getBehaviorRecords,
  createBehaviorRecord: behaviorsApi.createBehaviorRecord,
  updateBehaviorRecord: behaviorsApi.updateBehaviorRecord,
  deleteBehaviorRecord: behaviorsApi.deleteBehaviorRecord,
  getBehaviorDefinitions: behaviorsApi.getBehaviorDefinitions,
  createBehaviorDefinition: behaviorsApi.createBehaviorDefinition,
  updateBehaviorDefinition: behaviorsApi.updateBehaviorDefinition,

  // Notes API
  getNotes: notesApi.getNotes,
  createNote: notesApi.createNote,
  updateNote: notesApi.updateNote,
  deleteNote: notesApi.deleteNote,

  // History API
  getHistory: historyApi.getHistory,

  // Settings API
  getSettings: settingsApi.getSettings,
  updateSettings: settingsApi.updateSettings,

  // Chat API
  getConversations: chatApi.getConversations,
  getMessages: chatApi.getMessages,
  sendMessage: chatApi.sendMessage,

  // Auth API
  getCurrentUser: authApi.getCurrentUser,
  login: authApi.login,
  logout: authApi.logout,
  signup: authApi.signup,
};
