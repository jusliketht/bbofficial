// =====================================================
// ITR DOMAIN CORE - SINGLE AUTHORITY FOR ITR DOMAIN LOGIC
// 
// This is a PLACEHOLDER/STRUCTURE ONLY - no implementation yet
// 
// Responsibilities:
// - Decide state transitions
// - Decide ITR type
// - Decide allowed actions
// - Decide recomputation / invalidation
//
// ❌ Controllers, UI, services must NOT decide these.
// =====================================================

const { ITR_DOMAIN_STATES, VALID_STATE_TRANSITIONS, STATE_ALLOWED_ACTIONS } = require('./states');

/**
 * ITR Domain Core
 * 
 * This module is the single authority for:
 * 1. State transitions - only Domain Core can change state
 * 2. ITR type decisions - only Domain Core can determine/change ITR type
 * 3. Allowed actions - only Domain Core can decide what actions are allowed
 * 4. Recomputation/invalidation - only Domain Core can trigger recomputation
 * 
 * All controllers, services, and UI must go through Domain Core for these decisions.
 */
class ITRDomainCore {
  constructor() {
    // TODO: Initialize domain core
  }

  /**
   * Get current state of a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<string>} Current domain state
   */
  async getCurrentState(filingId) {
    // TODO: Implement state retrieval
    // Should read from ITRFiling model and map to domain state
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Check if state transition is allowed
   * @param {string} currentState - Current domain state
   * @param {string} targetState - Target domain state
   * @returns {boolean} Whether transition is allowed
   */
  canTransition(currentState, targetState) {
    if (!currentState || !targetState) {
      return false;
    }
    const allowedTransitions = VALID_STATE_TRANSITIONS[currentState] || [];
    return allowedTransitions.includes(targetState);
  }

  /**
   * Determine ITR type based on user data signals (pure logic only)
   * @param {object} signals - User data signals (income sources, capital gains, etc.)
   * @returns {object} { recommendedITR: string, confidence: number, reason: string }
   */
  determineITR(signals) {
    if (!signals || typeof signals !== 'object') {
      return {
        recommendedITR: 'ITR-1',
        confidence: 0.5,
        reason: 'Insufficient data - defaulting to ITR-1',
      };
    }

    // ITR determination rules (from frontend ITRAutoDetector, converted to pure logic)
    const rules = [
      {
        id: 'agricultural_income',
        condition: (data) => {
          const agriIncome = data.agriculturalIncome
            || data.exemptIncome?.agriculturalIncome?.netAgriculturalIncome
            || data.exemptIncome?.netAgriculturalIncome
            || 0;
          return agriIncome > 5000; // ₹5,000 threshold per ITD rules
        },
        recommendedITR: 'ITR-2',
        reason: 'Agricultural income exceeds ₹5,000 - ITR-2 is mandatory',
        priority: 10, // Highest priority - regulatory requirement
      },
      {
        id: 'business_income',
        condition: (data) => (data.businessIncome > 0 || data.professionalIncome > 0),
        recommendedITR: 'ITR-3',
        alternativeITR: 'ITR-4', // if presumptive taxation eligible
        reason: 'Business or professional income detected',
      },
      {
        id: 'capital_gains',
        condition: (data) => data.capitalGains > 0,
        recommendedITR: 'ITR-2',
        reason: 'Capital gains from investments or property',
      },
      {
        id: 'multiple_properties',
        condition: (data) => data.houseProperties && data.houseProperties.length > 1,
        recommendedITR: 'ITR-2',
        reason: 'More than one house property',
      },
      {
        id: 'foreign_income',
        condition: (data) => data.foreignIncome > 0 || data.isNRI || data.dtaaClaim,
        recommendedITR: 'ITR-2',
        reason: 'Foreign income or NRI status or DTAA claim',
      },
      {
        id: 'director_partner',
        condition: (data) => data.isDirector || data.isPartner,
        recommendedITR: 'ITR-2',
        reason: 'Director or partner status',
      },
      {
        id: 'itr1_eligible',
        condition: (data) => {
          const agriIncome = data.agriculturalIncome
            || data.exemptIncome?.agriculturalIncome?.netAgriculturalIncome
            || data.exemptIncome?.netAgriculturalIncome
            || 0;
          if (agriIncome > 5000) {
            return false; // ITR-1 not eligible if agricultural income > ₹5,000
          }
          return (
            data.salary > 0 &&
            (data.interestIncome || 0) <= 50000 && // bank interest limit
            (!data.capitalGains || data.capitalGains === 0) &&
            (!data.houseProperties || data.houseProperties.length <= 1) &&
            (!data.businessIncome || data.businessIncome === 0) &&
            (!data.professionalIncome || data.professionalIncome === 0) &&
            (!data.foreignIncome || data.foreignIncome === 0) &&
            !data.isNRI &&
            !data.dtaaClaim &&
            !data.isDirector &&
            !data.isPartner
          );
        },
        recommendedITR: 'ITR-1',
        reason: 'Simple salaried individual with basic income sources',
      },
    ];

    const results = [];

    // Check each rule
    for (const rule of rules) {
      if (rule.condition(signals)) {
        const confidence = this._calculateConfidence(rule, signals);
        results.push({
          ...rule,
          triggered: true,
          confidence,
        });
      }
    }

    // Sort by priority (if set), then confidence, then ITR type
    results.sort((a, b) => {
      // First sort by explicit priority (higher priority first)
      if (a.priority !== undefined || b.priority !== undefined) {
        const aPriority = a.priority || 0;
        const bPriority = b.priority || 0;
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
      }
      // Then by confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      // Finally by ITR type priority: ITR-3 > ITR-2 > ITR-1
      const priority = { 'ITR-3': 3, 'ITR-2': 2, 'ITR-1': 1, 'ITR-4': 2.5 };
      return (priority[b.recommendedITR] || 0) - (priority[a.recommendedITR] || 0);
    });

    return {
      recommendedITR: results[0]?.recommendedITR || 'ITR-1',
      confidence: results[0]?.confidence || 0.8,
      reason: results[0]?.reason || 'Default recommendation',
      triggeredRules: results,
    };
  }

  /**
   * Calculate confidence score for ITR recommendation
   * @private
   */
  _calculateConfidence(rule, signals) {
    let confidence = 0.9; // Base confidence

    // Adjust based on data completeness
    const requiredFields = rule.additionalFields || [];
    const availableFields = requiredFields.filter(field =>
      signals[field] !== undefined && signals[field] !== null,
    );

    if (requiredFields.length > 0) {
      confidence = Math.min(confidence, 0.7 + (availableFields.length / requiredFields.length) * 0.3);
    }

    // Adjust based on data values
    if (rule.id === 'business_income') {
      if (signals.businessIncome > 1000000) confidence += 0.1;
      if (signals.professionalIncome > 500000) confidence += 0.1;
    }

    if (rule.id === 'capital_gains') {
      if (signals.capitalGains > 100000) confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get allowed actions for a given state and actor (pure logic only)
   * @param {string} state - Current domain state
   * @param {object} actor - Actor context { role: string, permissions?: string[] }
   * @returns {Array<string>} Array of allowed action strings
   */
  getAllowedActions(state, actor = {}) {
    if (!state || !STATE_ALLOWED_ACTIONS[state]) {
      return [];
    }

    // Get base allowed actions for state
    const baseActions = STATE_ALLOWED_ACTIONS[state] || [];

    // Filter by actor role/permissions (RBAC integration point)
    // For Phase 1, we'll do basic role filtering
    // Full RBAC integration will come in Phase 2
    const role = actor.role || 'END_USER';
    const permissions = actor.permissions || [];

    // Admin roles can unlock filings
    const adminRoles = ['SUPER_ADMIN', 'PLATFORM_ADMIN'];
    const isAdmin = adminRoles.includes(role);

    // Filter actions based on role
    const filteredActions = baseActions.filter(action => {
      // Admin can unlock filings
      if (action === 'unlock_filing') {
        return isAdmin;
      }

      // CA/Admin can override values in COMPUTED state
      if (action === 'override_values') {
        const caRoles = ['CA', 'CA_FIRM_ADMIN', ...adminRoles];
        return caRoles.includes(role);
      }

      // All other actions are allowed for all roles (for Phase 1)
      // Phase 2 will add more granular RBAC filtering
      return true;
    });

    return filteredActions;
  }

  /**
   * Extract normalized domain snapshot from draft data
   * Returns only tax-affecting signals (income, deductions, regime, flags)
   * NOT raw JSON structure
   * @param {object} draftData - Raw draft data
   * @returns {object} Normalized domain snapshot
   */
  extractDomainSnapshot(draftData) {
    if (!draftData) {
      return {};
    }

    const income = draftData.income || {};
    const personalInfo = draftData.personalInfo || draftData.personal_info || {};
    const exemptIncome = draftData.exemptIncome || draftData.exempt_income || {};

    return {
      // Income signals
      salary: income.salary || 0,
      businessIncome: income.businessIncome || income.business_income || 0,
      professionalIncome: income.professionalIncome || income.professional_income || 0,
      capitalGains: income.capitalGains || income.capital_gains || 0,
      interestIncome: income.interestIncome || income.interest_income || 0,
      rentalIncome: income.rentalIncome || income.rental_income || 0,
      foreignIncome: income.foreignIncome || income.foreign_income || 0,
      agriculturalIncome: income.agriculturalIncome || income.agricultural_income || exemptIncome.netAgriculturalIncome || 0,
      presumptiveBusiness: income.presumptiveBusiness || income.presumptive_business || 0,
      presumptiveProfessional: income.presumptiveProfessional || income.presumptive_professional || 0,

      // Flags
      hasCapitalGains: (income.capitalGains || income.capital_gains || 0) > 0,
      hasBusinessIncome: (income.businessIncome || income.business_income || 0) > 0,
      hasProfessionalIncome: (income.professionalIncome || income.professional_income || 0) > 0,
      hasPresumptiveIncome: (income.presumptiveBusiness || income.presumptive_business || 0) > 0 ||
                          (income.presumptiveProfessional || income.presumptive_professional || 0) > 0,
      hasForeignIncome: (income.foreignIncome || income.foreign_income || 0) > 0 || draftData.isNRI || draftData.dtaaClaim,
      hasAgriculturalIncome: (income.agriculturalIncome || income.agricultural_income || exemptIncome.netAgriculturalIncome || 0) > 5000,

      // Regime selection
      taxRegime: draftData.taxRegime || draftData.tax_regime || draftData.regime || 'old',

      // ITR type
      itrType: draftData.itrType || draftData.itr_type,

      // Deductions (normalized)
      deductions: draftData.deductions || {},
    };
  }

  /**
   * Determine if recomputation is needed after data changes
   * Uses domain snapshots (normalized signals), not raw JSON
   * @param {object} prevSnapshot - Previous domain snapshot
   * @param {object} newSnapshot - New domain snapshot
   * @returns {boolean} Whether recomputation is needed
   */
  shouldRecompute(prevSnapshot, newSnapshot) {
    if (!prevSnapshot || !newSnapshot) {
      return true; // If no previous snapshot, recompute
    }

    // Compare domain signals (not raw JSON)
    const signalFields = [
      'salary', 'businessIncome', 'professionalIncome', 'capitalGains',
      'interestIncome', 'rentalIncome', 'foreignIncome', 'agriculturalIncome',
      'presumptiveBusiness', 'presumptiveProfessional',
    ];

    for (const field of signalFields) {
      if (prevSnapshot[field] !== newSnapshot[field]) {
        return true;
      }
    }

    // Compare flags
    const flagFields = [
      'hasCapitalGains', 'hasBusinessIncome', 'hasProfessionalIncome',
      'hasPresumptiveIncome', 'hasForeignIncome', 'hasAgriculturalIncome',
    ];

    for (const field of flagFields) {
      if (prevSnapshot[field] !== newSnapshot[field]) {
        return true;
      }
    }

    // Compare regime
    if (prevSnapshot.taxRegime !== newSnapshot.taxRegime) {
      return true;
    }

    // Compare ITR type
    if (prevSnapshot.itrType !== newSnapshot.itrType) {
      return true;
    }

    // Compare deductions (normalized comparison)
    if (this._hasObjectChanged(prevSnapshot.deductions, newSnapshot.deductions)) {
      return true;
    }

    return false;
  }

  /**
   * Get nested value from object using dot notation
   * @private
   */
  _getNestedValue(obj, path) {
    if (!obj || typeof obj !== 'object') {
      return undefined;
    }

    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Check if two values have changed (deep comparison for objects)
   * @private
   */
  _hasChanged(prevValue, newValue) {
    // Both undefined/null - no change
    if (prevValue === undefined && newValue === undefined) {
      return false;
    }
    if (prevValue === null && newValue === null) {
      return false;
    }

    // One is undefined/null, other is not - changed
    if (prevValue === undefined || prevValue === null) {
      return newValue !== undefined && newValue !== null;
    }
    if (newValue === undefined || newValue === null) {
      return true;
    }

    // Primitive comparison
    if (typeof prevValue !== 'object' || typeof newValue !== 'object') {
      return prevValue !== newValue;
    }

    // Object comparison - use JSON.stringify for simplicity
    // For Phase 1, this is sufficient
    try {
      return JSON.stringify(prevValue) !== JSON.stringify(newValue);
    } catch (e) {
      // If stringify fails, assume changed
      return true;
    }
  }

  /**
   * Check if object has changed (for nested objects like deductions)
   * @private
   */
  _hasObjectChanged(prevObj, newObj) {
    if (!prevObj && !newObj) {
      return false;
    }
    if (!prevObj || !newObj) {
      return true;
    }

    try {
      return JSON.stringify(prevObj) !== JSON.stringify(newObj);
    } catch (e) {
      return true;
    }
  }

  /**
   * Check if a section is applicable for given ITR type
   * CONSTRAINT: Pure, declarative, ITR-type-driven ONLY
   * MUST NOT: Inspect lifecycle state, inspect raw amounts, perform validation logic
   * @param {string} itrType - ITR type (ITR-1, ITR-2, ITR-3, ITR-4)
   * @param {string} sectionId - Section identifier
   * @returns {boolean} Whether section is possible in this ITR type
   */
  isSectionApplicable(itrType, sectionId) {
    if (!itrType || !sectionId) {
      return false;
    }

    // Normalize ITR type
    const normalizedITR = itrType.replace('-', '').toUpperCase();
    const itrKey = normalizedITR.startsWith('ITR') ? `ITR-${normalizedITR.slice(3)}` : itrType;

    const sectionMap = {
      'ITR-1': ['personalInfo', 'income', 'deductions', 'taxesPaid', 'bankDetails'],
      'ITR-2': ['personalInfo', 'income', 'deductions', 'taxesPaid', 'bankDetails', 'scheduleFA', 'foreignIncome'],
      'ITR-3': ['personalInfo', 'income', 'deductions', 'taxesPaid', 'bankDetails', 'balanceSheet', 'auditInfo', 'scheduleFA'],
      'ITR-4': ['personalInfo', 'income', 'deductions', 'taxesPaid', 'bankDetails', 'presumptiveIncome', 'goodsCarriage'],
    };

    return (sectionMap[itrKey] || []).includes(sectionId);
  }

  /**
   * Get required fields for ITR type
   * CONSTRAINT: Pure, declarative, ITR-type-driven ONLY
   * MUST NOT: Inspect lifecycle state, inspect raw amounts, perform validation logic
   * @param {string} itrType - ITR type (ITR-1, ITR-2, ITR-3, ITR-4)
   * @returns {Array<string>} Array of required field paths
   */
  getRequiredFieldsForITR(itrType) {
    if (!itrType) {
      return [];
    }

    // Normalize ITR type
    const normalizedITR = itrType.replace('-', '').toUpperCase();
    const itrKey = normalizedITR.startsWith('ITR') ? `ITR-${normalizedITR.slice(3)}` : itrType;

    const fieldMap = {
      'ITR-1': ['personalInfo.pan', 'personalInfo.name', 'income.salary'],
      'ITR-2': ['personalInfo.pan', 'personalInfo.name', 'income.salary'],
      'ITR-3': ['personalInfo.pan', 'personalInfo.name', 'income.businessIncome', 'income.professionalIncome'],
      'ITR-4': ['personalInfo.pan', 'personalInfo.name', 'income.presumptiveBusiness', 'income.presumptiveProfessional'],
    };

    return fieldMap[itrKey] || [];
  }

  /**
   * Transition state (with validation)
   * @param {string} filingId - Filing ID
   * @param {string} targetState - Target state
   * @param {object} context - Transition context (user, reason, etc.)
   * @returns {Promise<string>} New state
   */
  async transitionState(filingId, targetState, context = {}) {
    // TODO: Implement state transition with validation
    // Should:
    // 1. Get current state
    // 2. Validate transition is allowed
    // 3. Update model state
    // 4. Log transition (audit)
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Determine ITR type (only Domain Core can do this)
   * @param {object} userData - User data for ITR determination
   * @returns {Promise<string>} Determined ITR type (ITR-1, ITR-2, ITR-3, ITR-4)
   */
  async determineITRType(userData) {
    // TODO: Implement ITR type determination
    // Should use ITRAutoDetectorService but Domain Core decides
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Change ITR type (only Domain Core can do this)
   * @param {string} filingId - Filing ID
   * @param {string} newITRType - New ITR type
   * @param {object} context - Context (user, reason, etc.)
   * @returns {Promise<string>} New ITR type
   */
  async changeITRType(filingId, newITRType, context = {}) {
    // TODO: Implement ITR type change
    // Should:
    // 1. Check current state allows ITR type change
    // 2. Validate new ITR type
    // 3. Update ITR type
    // 4. Invalidate dependent data (may need to reset to ITR_DETERMINED)
    // 5. Log change (audit)
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Get allowed actions for current state
   * @param {string} filingId - Filing ID
   * @param {object} userContext - User context (role, permissions)
   * @returns {Promise<Array<string>>} Allowed actions
   */
  async getAllowedActions(filingId, userContext = {}) {
    // TODO: Implement allowed actions retrieval
    // Should:
    // 1. Get current state
    // 2. Get base allowed actions for state
    // 3. Filter by user context (RBAC)
    // 4. Return allowed actions
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Check if action is allowed
   * @param {string} filingId - Filing ID
   * @param {string} action - Action to check
   * @param {object} userContext - User context
   * @returns {Promise<boolean>} Whether action is allowed
   */
  async isActionAllowed(filingId, action, userContext = {}) {
    const allowedActions = await this.getAllowedActions(filingId, userContext);
    return allowedActions.includes(action);
  }

  /**
   * Trigger recomputation (only Domain Core can do this)
   * @param {string} filingId - Filing ID
   * @param {object} context - Context (reason, user, etc.)
   * @returns {Promise<object>} Computation result
   */
  async triggerRecomputation(filingId, context = {}) {
    // TODO: Implement recomputation trigger
    // Should:
    // 1. Check current state allows recomputation
    // 2. Invalidate current computation
    // 3. Trigger tax computation
    // 4. Update state if needed
    // 5. Log recomputation (audit)
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Lock filing (only Domain Core can do this)
   * @param {string} filingId - Filing ID
   * @param {object} context - Context (user, reason, etc.)
   * @returns {Promise<string>} New state (LOCKED)
   */
  async lockFiling(filingId, context = {}) {
    // TODO: Implement filing lock
    // Should:
    // 1. Check current state allows locking
    // 2. Validate all required data is present
    // 3. Transition to LOCKED state
    // 4. Make data immutable
    // 5. Log lock (audit)
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Unlock filing (admin only, with reason)
   * @param {string} filingId - Filing ID
   * @param {object} context - Context (admin user, reason, etc.)
   * @returns {Promise<string>} New state (usually COMPUTED)
   */
  async unlockFiling(filingId, context = {}) {
    // TODO: Implement filing unlock
    // Should:
    // 1. Check user is admin
    // 2. Check current state is LOCKED
    // 3. Require reason
    // 4. Transition to previous state (usually COMPUTED)
    // 5. Log unlock (audit)
    throw new Error('Not implemented - mapping phase only');
  }

  /**
   * Determine if mutation requires state rollback
   * @param {string} currentState - Current domain state
   * @param {object} prevSnapshot - Previous domain snapshot
   * @param {object} newSnapshot - New domain snapshot
   * @returns {object} Rollback decision { required: boolean, targetState?: string, reason?: string }
   */
  requiresStateRollback(currentState, prevSnapshot, newSnapshot) {
    const { ITR_DOMAIN_STATES } = require('./states');

    // If in early states, no rollback needed
    if (currentState === ITR_DOMAIN_STATES.DRAFT_INIT ||
        currentState === ITR_DOMAIN_STATES.ITR_DETERMINED) {
      return { required: false };
    }

    // Check for ITR type change
    const prevITR = prevSnapshot.itrType;
    const newITR = newSnapshot.itrType;
    if (prevITR && newITR && prevITR !== newITR) {
      return {
        required: true,
        targetState: ITR_DOMAIN_STATES.ITR_DETERMINED,
        reason: 'ITR type changed, must re-determine eligibility',
      };
    }

    // Check for income type changes that invalidate ITR determination
    // Adding capital gains while in COMPUTED/DATA_CONFIRMED
    if ((currentState === ITR_DOMAIN_STATES.COMPUTED ||
         currentState === ITR_DOMAIN_STATES.DATA_CONFIRMED) &&
        !prevSnapshot.hasCapitalGains && newSnapshot.hasCapitalGains) {
      return {
        required: true,
        targetState: ITR_DOMAIN_STATES.ITR_DETERMINED,
        reason: 'Capital gains added, ITR type may need re-determination',
      };
    }

    // Adding business income while in COMPUTED/DATA_CONFIRMED (if was ITR-1)
    if ((currentState === ITR_DOMAIN_STATES.COMPUTED ||
         currentState === ITR_DOMAIN_STATES.DATA_CONFIRMED) &&
        !prevSnapshot.hasBusinessIncome && newSnapshot.hasBusinessIncome &&
        prevSnapshot.itrType === 'ITR-1') {
      return {
        required: true,
        targetState: ITR_DOMAIN_STATES.ITR_DETERMINED,
        reason: 'Business income added, ITR-1 no longer valid',
      };
    }

    // Adding foreign income while in COMPUTED/DATA_CONFIRMED (if was ITR-1)
    if ((currentState === ITR_DOMAIN_STATES.COMPUTED ||
         currentState === ITR_DOMAIN_STATES.DATA_CONFIRMED) &&
        !prevSnapshot.hasForeignIncome && newSnapshot.hasForeignIncome &&
        prevSnapshot.itrType === 'ITR-1') {
      return {
        required: true,
        targetState: ITR_DOMAIN_STATES.ITR_DETERMINED,
        reason: 'Foreign income added, ITR-1 no longer valid',
      };
    }

    // No rollback needed
    return { required: false };
  }

  /**
   * Validate state-based invariants
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} Validation result
   */
  async validateInvariants(filingId) {
    // TODO: Implement invariant validation
    // Should check:
    // 1. State is valid
    // 2. Immutable fields haven't changed
    // 3. Required fields are present for current state
    // 4. State transitions are valid
    throw new Error('Not implemented - mapping phase only');
  }
}

module.exports = new ITRDomainCore();

