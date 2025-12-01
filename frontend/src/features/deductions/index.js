// =====================================================
// DEDUCTIONS FEATURE - BARREL EXPORTS
// Central export point for all deduction-related components, hooks, and services
// =====================================================

// Components
export { default as Section80C } from './components/Section80C';
export { default as Section80CCC } from './components/Section80CCC';
export { default as Section80CCD } from './components/Section80CCD';
export { default as Section80D } from './components/Section80D';
export { default as Section80DD } from './components/Section80DD';
export { default as Section80DDB } from './components/Section80DDB';
export { default as Section80E } from './components/Section80E';
export { default as Section80EE } from './components/Section80EE';
export { default as Section80G } from './components/Section80G';
export { default as Section80GG } from './components/Section80GG';
export { default as Section80GGA } from './components/Section80GGA';
export { default as Section80GGC } from './components/Section80GGC';
export { default as Section80TTA } from './components/Section80TTA';
export { default as Section80U } from './components/Section80U';

// Manager Component
export { default as DeductionsManager } from './components/DeductionsManager';

// Utilization Dashboard
export { default as DeductionUtilizationDashboard } from './components/DeductionUtilizationDashboard';

// AI Suggestions
export { default as AIDeductionSuggestions } from './components/AIDeductionSuggestions';

// Document Uploader
export { default as DocumentUploader } from './components/document-upload/DocumentUploader';

// Hooks
export * from './hooks/use-deductions';
export { useAISuggestions } from './hooks/use-ai-suggestions';

// Services
export { deductionService } from './services/deduction.service';
export { deductionLimitsService } from './services/deduction-limits.service';

// Constants
export { DEDUCTION_LIMITS, AGE_THRESHOLDS, INCOME_THRESHOLDS, VALIDATION_RULES } from './constants/deduction-limits';

// Validation Schemas
export * from './schema/deductions.schema';

// Types (TypeScript - if needed)
// export * from './types/deduction.types';

