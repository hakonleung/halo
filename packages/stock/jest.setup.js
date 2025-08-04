// Jest setup file

// 设置测试超时时间
jest.setTimeout(30000);

// 全局测试配置
global.console = {
  ...console,
  // 在测试中静默某些console输出
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 