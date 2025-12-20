// =====================================================
// FILING UI TYPES
// Domain states and actions for ITR filing UI
// =====================================================

/**
 * Domain states from backend (backend/src/domain/states.js)
 * These are the ONLY valid lifecycle states for ITR filings
 */
export type DomainState =
  | 'DRAFT_INIT'
  | 'ITR_DETERMINED'
  | 'DATA_COLLECTED'
  | 'DATA_CONFIRMED'
  | 'COMPUTED'
  | 'LOCKED'
  | 'FILED'
  | 'ACKNOWLEDGED'
  | 'COMPLETED';

/**
 * ITR Type
 */
export type ITRType = 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4';

/**
 * Domain Actions (from backend/src/domain/states.js STATE_ALLOWED_ACTIONS)
 * These are the actions that can be performed on a filing based on its state
 */
export type DomainAction =
  | 'determine_itr_type'
  | 'collect_initial_data'
  | 'cancel_draft'
  | 'collect_data'
  | 'validate_data'
  | 'change_itr_type'
  | 'confirm_data'
  | 'edit_data'
  | 'compute_tax'
  | 'lock_filing'
  | 'review_computation'
  | 'override_values'
  | 'recompute_tax'
  | 'file_itr'
  | 'unlock_filing'
  | 'e_verify'
  | 'track_submission'
  | 'download_acknowledgment'
  | 'track_refund'
  | 'track_itrv'
  | 'view_acknowledgment'
  | 'mark_completed'
  | 'view_history'
  | 'download_documents';

/**
 * Filing UI Context
 * Single contract that every page/component must consume
 * This is the authoritative source for what actions are allowed
 */
export interface FilingUIContext {
  lifecycleState: DomainState | null;
  itrType: ITRType | null;
  allowedActions: DomainAction[];
  filingId: string;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Locked states - when UI should be read-only
 */
export const LOCKED_STATES: DomainState[] = ['LOCKED', 'FILED', 'ACKNOWLEDGED', 'COMPLETED'];

/**
 * Check if a state is locked (read-only)
 */
export function isLockedState(state: DomainState | null): boolean {
  if (!state) return false;
  return LOCKED_STATES.includes(state);
}

