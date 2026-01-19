// =====================================================
// UNIFIED FRONTEND SERVICES EXPORTS
// Minimal services for User Onboarding and ITR Detection
// =====================================================

// Core services
import apiClient from './core/APIClient';
import errorHandler from './core/ErrorHandler';

// API services
import authService from './api/authService';
import itrService from './api/itrService';
import itrDeterminationService from './api/itrDeterminationService';

// ITR services
import ITRAutoDetector from './ITRAutoDetector';
import surepassService from './surepassService';
import gstinService from './gstinService';

// =====================================================
// EXPORTS
// =====================================================

// Core services
export {
  apiClient,
  errorHandler,
};

// API services
export {
  authService,
  itrService,
  itrDeterminationService,
};

// ITR services
export {
  ITRAutoDetector,
  surepassService,
  gstinService,
};

// Service categories
export const core = {
  apiClient,
  errorHandler,
};

export const api = {
  authService,
  itrService,
  itrDeterminationService,
};

export const itr = {
  ITRAutoDetector,
  surepassService,
  gstinService,
};

// Default export
export default {
  ...core,
  ...api,
  ...itr,
};
