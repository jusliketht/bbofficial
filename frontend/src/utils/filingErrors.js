// =====================================================
// FILING ERROR MESSAGES
// Domain-aware error messages for filing actions
// =====================================================

/**
 * Get user-friendly error message for a disallowed action
 * 
 * @param {string} action - The action that was attempted
 * @param {string|null} lifecycleState - Current lifecycle state
 * @returns {string} User-friendly error message
 */
export function getActionErrorMessage(action, lifecycleState = null) {
  const messages = {
    'file_itr': 'This return is locked for filing.',
    'edit_data': 'This return cannot be edited in its current state.',
    'compute_tax': 'Tax computation is not available in the current state.',
    'lock_filing': 'This return cannot be locked in its current state.',
    'unlock_filing': 'This return cannot be unlocked. Please contact support if you need assistance.',
    'validate_data': 'Validation is not available in the current state.',
    'change_itr_type': 'ITR type cannot be changed in the current state.',
    'confirm_data': 'Data confirmation is not available in the current state.',
    'review_computation': 'Computation review is not available in the current state.',
    'override_values': 'Value overrides are not available in the current state.',
    'recompute_tax': 'Tax recomputation is not available in the current state.',
    'e_verify': 'E-verification is not available in the current state.',
    'track_submission': 'Submission tracking is not available.',
    'download_acknowledgment': 'Acknowledgment download is not available.',
    'track_refund': 'Refund tracking is not available.',
    'track_itrv': 'ITR-V tracking is not available.',
    'view_acknowledgment': 'Acknowledgment is not available.',
    'mark_completed': 'Cannot mark as completed in the current state.',
    'view_history': 'History is not available.',
    'download_documents': 'Document download is not available.',
  };

  if (messages[action]) {
    return messages[action];
  }

  // Fallback message
  const stateText = lifecycleState ? ` (current state: ${lifecycleState})` : '';
  return `Action '${action}' is not allowed${stateText}.`;
}

/**
 * Get error message for unsupported state
 * 
 * @param {string} lifecycleState - Current lifecycle state
 * @param {string[]} supportedStates - Array of supported states
 * @returns {string} User-friendly error message
 */
export function getUnsupportedStateMessage(lifecycleState, supportedStates) {
  if (!lifecycleState) {
    return 'Filing state is not available.';
  }
  
  return `This page is not available for filings in state '${lifecycleState}'. Supported states: ${supportedStates.join(', ')}.`;
}

