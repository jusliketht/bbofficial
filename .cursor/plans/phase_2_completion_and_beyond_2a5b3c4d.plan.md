# Phase 2 Completion and Beyond

## Current Status

**Steps 2.1-2.4: ✅ Complete**

- Step 2.1: ITR eligibility logic centralized
- Step 2.2: Recompute triggers centralized (with domain snapshots)
- Step 2.3: Validation gating centralized
- Step 2.4: Frontend decision-making reduced (minimal changes)

**Step 2.5: ⚠️ Partially Complete**

- `requiresStateRollback()` implemented in `ITRDomainCore.js` ✅
- Integrated into `updateDraft()` in `ITRController.js` ✅
- **Missing**: Rollback checks in other mutation points

## Step 2.5: Complete Rollback-on-Invalid-Mutation

### Current State

Rollback logic is implemented in `updateDraft()` but missing from:

- `createDeduction()` - Mutates deductions (affects recomputation, unlikely to trigger rollback)
- `updateDeduction()` - Mutates deductions (affects recomputation, unlikely to trigger rollback)
- `deleteDeduction()` - Mutates deductions (affects recomputation, unlikely to trigger rollback)
- `changeITRType()` - Changes ITR type (definitely needs rollback check)

### Action

**Priority 1: `changeITRType()` - Must have rollback check**

ITR type changes always invalidate state and require rollback to `ITR_DETERMINED`.

**File:** `backend/src/controllers/ITRController.js`

1. **In `changeITRType` method** (line 5612):

   - Extract domain snapshots before and after ITR type change
   - Check `domainCore.requiresStateRollback()` 
   - If rollback required, apply it before updating ITR type
   - Invalidate computation and dependent data

**Priority 2: Deduction mutations - Should check recomputation**

Deduction changes don't typically trigger state rollback, but they do require recomputation.

**Files:** `backend/src/controllers/ITRController.js`

1. **In `createDeduction`, `updateDeduction`, `deleteDeduction` methods**:

   - Extract domain snapshots before and after mutation
   - Check `domainCore.shouldRecompute()` (already implemented in step 2.2)
   - Mark for recomputation if needed
   - **Optional**: Check `requiresStateRollback()` for edge cases (e.g., if deduction change somehow affects ITR eligibility)

### Implementation

**Modify `changeITRType`:**

```javascript
// backend/src/controllers/ITRController.js

async changeITRType(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { filingId } = req.params;
    const { itrType, reason } = req.body;
    const userId = req.user.userId;

    // ... existing validation ...

    const filing = await ITRFiling.findByPk(filingId, {
      where: { userId },
      transaction,
    });

    if (!filing) {
      await transaction.rollback();
      return notFoundResponse(res, 'Filing');
    }

    // Get current draft data
    const draft = await ITRDraft.findOne({
      where: { filingId },
      order: [['updatedAt', 'DESC']],
      transaction,
    });

    const currentFormData = draft?.data || filing.jsonPayload || {};
    
    // Extract domain snapshots
    const domainCore = require('../domain/ITRDomainCore');
    const { getCurrentDomainState } = require('../middleware/domainGuard');
    
    const prevDomainSnapshot = domainCore.extractDomainSnapshot(currentFormData);
    const currentState = await getCurrentDomainState(filingId);
    
    // Create new snapshot with changed ITR type
    const newFormData = { ...currentFormData, itrType };
    const newDomainSnapshot = domainCore.extractDomainSnapshot(newFormData);
    
    // Check if rollback required (ITR type change always requires rollback)
    const rollbackDecision = domainCore.requiresStateRollback(
      currentState,
      prevDomainSnapshot,
      newDomainSnapshot
    );
    
    if (rollbackDecision.required) {
      // Rollback state to ITR_DETERMINED
      await filing.update({
        status: rollbackDecision.targetState,
        tax_computation: null,
        tax_liability: null,
        refund_amount: null,
      }, { transaction });
      
      enterpriseLogger.info('State rollback triggered by ITR type change', {
        filingId,
        fromState: currentState,
        toState: rollbackDecision.targetState,
        reason: rollbackDecision.reason,
        oldITR: filing.itrType,
        newITR: itrType,
      });
    }
    
    // Update ITR type
    await filing.update({ itrType }, { transaction });
    
    // Update draft data with new ITR type
    if (draft) {
      await draft.update({ data: newFormData }, { transaction });
    } else {
      // Create draft if doesn't exist
      await ITRDraft.create({
        filingId,
        step: 'data_collection',
        data: newFormData,
      }, { transaction });
    }
    
    await transaction.commit();
    
    return successResponse(res, {
      filing: {
        id: filing.id,
        itrType: filing.itrType,
        status: filing.status,
        rollbackApplied: rollbackDecision.required,
      },
    }, 'ITR type changed successfully');
  } catch (error) {
    await transaction.rollback();
    return errorResponse(res, error, 500);
  }
}
```

**Enhance deduction methods (optional, low priority):**

```javascript
// backend/src/controllers/ITRController.js

async createDeduction(req, res) {
  // ... existing code up to formData update ...
  
  // Extract domain snapshots for recomputation check
  const domainCore = require('../domain/ITRDomainCore');
  const { getCurrentDomainState } = require('../middleware/domainGuard');
  
  const prevDomainSnapshot = domainCore.extractDomainSnapshot(formData);
  const currentState = await getCurrentDomainState(filingId);
  
  // Update formData (deduction added)
  // ... existing deduction creation logic ...
  
  const newDomainSnapshot = domainCore.extractDomainSnapshot(formData);
  
  // Check if recomputation needed
  const needsRecompute = domainCore.shouldRecompute(prevDomainSnapshot, newDomainSnapshot);
  
  // Optional: Check for rollback (unlikely but possible edge cases)
  const rollbackDecision = domainCore.requiresStateRollback(
    currentState,
    prevDomainSnapshot,
    newDomainSnapshot
  );
  
  if (rollbackDecision.required) {
    // Apply rollback (rare case)
    await dbQuery(
      `UPDATE itr_filings SET status = $1, tax_computation = NULL WHERE id = $2`,
      [rollbackDecision.targetState, filingId]
    );
  }
  
  // Update draft
  await dbQuery(/* ... existing update query ... */);
  
  // Mark for recomputation if needed
  if (needsRecompute) {
    await dbQuery(
      `UPDATE itr_filings SET needs_recompute = TRUE WHERE id = $1`,
      [filingId]
    );
  }
  
  // ... rest of response ...
}
```

### Rule

> All mutations that can invalidate state must check `requiresStateRollback()`. ITR type changes always require rollback. Deduction changes typically only require recomputation.

## Phase 2 Completion Checklist

- [x] Step 2.1: ITR eligibility logic centralized
- [x] Step 2.2: Recompute triggers centralized
- [x] Step 2.3: Validation gating centralized
- [x] Step 2.4: Frontend decision-making reduced
- [ ] Step 2.5: Rollback-on-invalid-mutation complete
  - [x] `requiresStateRollback()` implemented
  - [x] Integrated into `updateDraft()`
  - [ ] Integrated into `changeITRType()`
  - [ ] Optional: Integrated into deduction mutations

## Phase 3 Preview: DB Alignment (Very Light)

### Objective

Enforce state enum and add immutability metadata without risky migrations.

### Planned Steps

1. **Enforce State Enum**

   - Add database constraint to ensure `itr_filings.status` only contains valid domain states
   - Migration: Add CHECK constraint

2. **Add Immutability Metadata**

   - Add `immutable_fields` JSONB column to `itr_filings` to track which fields are locked
   - Populate based on `IMMUTABLE_FIELDS_BY_STATE` from `states.js`

3. **Zero Risky Migrations**

   - All migrations are additive (new columns, constraints)
   - No data migration required
   - No breaking changes

### Files to Modify (Phase 3)

- `backend/src/migrations/XXXX-add-state-enum-constraint.js`
- `backend/src/migrations/XXXX-add-immutability-metadata.js`
- `backend/src/models/ITRFiling.js` - Update to use immutability metadata

## Success Criteria

Phase 2 is complete when:

- ✅ No service decides ITR eligibility (all use Domain Core)
- ✅ No service decides recompute necessity (all use Domain Core with domain snapshots)
- ✅ No service decides validation timing (all use Domain Core)
- ⚠️ No service decides rollback necessity (all use Domain Core) - **In Progress**
- ✅ Domain Core is the only brain for these decisions
- ✅ Controllers/services mostly delegate to Domain Core
- ✅ Frontend uses `allowed_actions` from backend instead of local state checks
- ✅ App behavior remains identical (but safer and more consistent)

## Next Steps After Phase 2

1. **Complete Step 2.5** - Add rollback checks to `changeITRType()` and optionally to deduction mutations
2. **Phase 3** - DB Alignment (very light, no risky migrations)
3. **Phase 4** - UI Simplification (massive code reduction)
4. **Phase 5** - Finance Module (billing, invoicing, payments)