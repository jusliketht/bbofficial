// =====================================================
// ITR FEATURE - BARREL EXPORTS
// =====================================================

// Components
export { default as VersionHistory } from './components/version-history';
export { default as VersionComparison } from './components/version-comparison';
export { default as PreviousYearSelector } from './components/previous-year-selector';
export { default as PreviousYearPreview } from './components/previous-year-preview';
export { default as PreviousYearReview } from './components/previous-year-review';
export { default as ShareDraftModal } from './components/share-draft-modal';

// Hooks
export * from './hooks/use-auto-save';
export * from './hooks/use-previous-year-copy';

// Services
export { draftService } from './services/draft.service';
export { default as previousYearService } from './services/previous-year.service';

