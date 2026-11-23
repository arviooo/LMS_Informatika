// =============================================================
// @lms/shared — Package Entry Point
// =============================================================

// Types
export type {
  User,
  UserRole,
  SchoolClass,
  Semester,
  Topic,
  Material,
  MaterialType,
  MaterialFormat,
  StudentProgress,
  ProgressStatus,
  ProgressSummary,
} from './types';

// Mock Data
export {
  mockStudents,
  mockTeachers,
  mockClasses,
  mockTopics,
  mockMaterials,
  mockProgress,
  getProgressSummary,
} from './mock/data';

// Services
export {
  login,
  logout,
  getCurrentUser,
  saveSession,
  clearSession,
} from './services/auth';

export type { LoginCredentials, AuthResult } from './services/auth';

export { default as api, backendUrl, formatStorageUrl } from './lib/axios';
