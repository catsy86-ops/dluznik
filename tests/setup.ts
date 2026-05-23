/**
 * Test Setup File
 * 
 * This file is executed before all tests run.
 * Use it for global test configuration, mocks, and utilities.
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/debt_management_test';

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global test utilities
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
