// =====================================================
// DOMAIN GUARD MIDDLEWARE
// Enforces Domain Core rules before allowing controller execution
// =====================================================

const { ITR_DOMAIN_STATES } = require('../domain/states');
const domainCore = require('../domain/ITRDomainCore');
const { ITRFiling, ITRDraft } = require('../models');
const enterpriseLogger = require('../utils/logger');
const { AppError } = require('./errorHandler');

/**
 * Map ITRFiling.status to domain state
 * @param {string} status - ITRFiling status
 * @param {object} filing - Filing object (optional, for additional context)
 * @returns {string} Domain state
 */
function mapStatusToDomainState(status, filing = null) {
  switch (status) {
    case 'draft':
      // Infer more specific state from filing context
      if (filing) {
        // If ITR type is set, assume ITR_DETERMINED or DATA_COLLECTED
        if (filing.itrType) {
          // Check if there's substantial data collected
          if (filing.jsonPayload && typeof filing.jsonPayload === 'object') {
            const hasData = Object.keys(filing.jsonPayload).length > 0;
            return hasData ? ITR_DOMAIN_STATES.DATA_COLLECTED : ITR_DOMAIN_STATES.ITR_DETERMINED;
          }
          return ITR_DOMAIN_STATES.ITR_DETERMINED;
        }
      }
      return ITR_DOMAIN_STATES.DRAFT_INIT;
    case 'submitted':
      return ITR_DOMAIN_STATES.FILED;
    case 'acknowledged':
      return ITR_DOMAIN_STATES.ACKNOWLEDGED;
    case 'processed':
      return ITR_DOMAIN_STATES.COMPLETED;
    case 'rejected':
      // Rejected is not a domain state, but we'll treat it as an error state
      // For now, return the last valid state or DRAFT_INIT
      return ITR_DOMAIN_STATES.DRAFT_INIT;
    default:
      return ITR_DOMAIN_STATES.DRAFT_INIT;
  }
}

/**
 * Get current domain state for a filing
 * @param {string} filingId - Filing ID
 * @returns {Promise<string>} Current domain state
 */
async function getCurrentDomainState(filingId) {
  try {
    const filing = await ITRFiling.findByPk(filingId, {
      attributes: ['id', 'status', 'lifecycleState', 'itrType', 'jsonPayload'],
    });

    if (!filing) {
      // If filing doesn't exist, assume DRAFT_INIT
      return ITR_DOMAIN_STATES.DRAFT_INIT;
    }

    // Prefer lifecycle_state if available (Phase 3 migration)
    if (filing.lifecycleState) {
      return filing.lifecycleState;
    }

    // Fallback to mapping from status (during migration or if lifecycle_state is NULL)
    return mapStatusToDomainState(filing.status, filing);
  } catch (error) {
    enterpriseLogger.error('Error getting domain state', {
      filingId,
      error: error.message,
    });
    // On error, default to DRAFT_INIT (most permissive)
    return ITR_DOMAIN_STATES.DRAFT_INIT;
  }
}

/**
 * Domain Guard Middleware
 * Checks if action is allowed in current state before allowing controller execution
 * 
 * @param {string} action - Domain action to check (e.g., 'edit_data', 'compute_tax', 'file_itr')
 * @param {object} options - Options
 * @param {string} options.filingIdSource - Where to get filingId from ('params', 'body', 'query', 'auto')
 * @param {string} options.filingIdParam - Parameter name for filingId (default: 'filingId')
 * @returns {Function} Express middleware
 */
const domainGuard = (action, options = {}) => {
  const {
    filingIdSource = 'auto', // 'auto' tries params, then body, then query
    filingIdParam = 'filingId',
  } = options;

  return async (req, res, next) => {
    try {
      // Extract filingId
      let filingId = null;

      if (filingIdSource === 'auto') {
        // Try params first, then body, then query
        filingId = req.params[filingIdParam] || req.params.filingId
          || req.body[filingIdParam] || req.body.filingId
          || req.query[filingIdParam] || req.query.filingId;
      } else {
        filingId = req[filingIdSource][filingIdParam] || req[filingIdSource].filingId;
      }

      // For draft operations, get filingId from draft
      if (!filingId && (req.params.draftId || req.body.draftId)) {
        const draftId = req.params.draftId || req.body.draftId;
        try {
          const draft = await ITRDraft.findByPk(draftId, {
            attributes: ['filingId'],
          });
          if (draft) {
            filingId = draft.filingId;
          }
        } catch (error) {
          enterpriseLogger.warn('Could not get filingId from draft', {
            draftId,
            error: error.message,
          });
        }
      }

      // If still no filingId, allow for creation operations
      if (!filingId) {
        // For create operations, we don't have a filingId yet
        // Allow if action is for initial creation
        if (action === 'determine_itr_type' || action === 'collect_initial_data') {
          return next();
        }
        // Otherwise, reject
        return res.status(400).json({
          success: false,
          message: 'Filing ID is required for this operation',
        });
      }

      // Get current domain state
      const currentState = await getCurrentDomainState(filingId);

      // CRITICAL: Enforce LOCKED state - no mutations allowed
      if (currentState === ITR_DOMAIN_STATES.LOCKED) {
        // Only allow: file_itr, unlock_filing (admin), read operations
        const allowedInLocked = ['file_itr', 'unlock_filing', 'read', 'track_submission', 'download_acknowledgment'];
        if (!allowedInLocked.includes(action)) {
          enterpriseLogger.warn('Domain Guard: Action blocked in LOCKED state', {
            filingId,
            action,
            state: currentState,
            userId: req.user?.userId,
          });
          return res.status(403).json({
            success: false,
            message: 'Filing is locked. No mutations allowed.',
            state: currentState,
            action,
          });
        }
      }

      // Get allowed actions for current state and actor
      const actor = {
        role: req.user?.role || 'END_USER',
        permissions: req.user?.permissions || [],
      };

      const allowedActions = domainCore.getAllowedActions(currentState, actor);

      // Check if action is allowed
      if (!allowedActions.includes(action)) {
        enterpriseLogger.warn('Domain Guard: Action not allowed', {
          filingId,
          action,
          state: currentState,
          allowedActions,
          userId: req.user?.userId,
          userRole: actor.role,
        });
        return res.status(403).json({
          success: false,
          message: `Action '${action}' is not allowed in current state '${currentState}'`,
          state: currentState,
          action,
          allowedActions,
        });
      }

      // Action is allowed - attach context to request
      req.domainState = currentState;
      req.domainAction = action;
      req.domainFilingId = filingId;

      enterpriseLogger.debug('Domain Guard: Action allowed', {
        filingId,
        action,
        state: currentState,
        userId: req.user?.userId,
      });

      next();
    } catch (error) {
      enterpriseLogger.error('Domain Guard error', {
        error: error.message,
        stack: error.stack,
        action,
        filingId: req.params.filingId || req.body.filingId,
      });
      next(new AppError('Domain validation error', 500));
    }
  };
};

module.exports = domainGuard;

