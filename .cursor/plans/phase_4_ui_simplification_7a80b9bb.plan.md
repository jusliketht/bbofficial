---
name: Phase 4 UI Simplification
overview: Remove all step/wizard logic from frontend, make UI state-aware (not flow-aware), gate all actions using allowedActions via a single hook, and enforce read-only UI automatically for LOCKED and later states. This is logic simplification only - no UI redesign or navigation changes.
todos: []
---

# Phase 4: UI Simplification

## Objective

Make the frontend submit to the Domain Core by removing step-based logic, making UI state-aware instead of flow-aware, and gating all actions through `allowedActions`. The UI must never infer legality locally.

## Current State Analysis

### What Exists

- Backend: `GET /itr/filings/:filingId/allowed-actions` endpoint returns `{ allowedActions: string[], state: string }`
- Service: `itrService.getAllowedActions(filingId)` method exists
- Domain States: Defined in `backend/src/domain/states.js` (DRAFT_INIT, ITR_DETERMINED, DATA_COLLECTED, DATA_CONFIRMED, COMPUTED, LOCKED, FILED, ACKNOWLEDGED, COMPLETED)
- Read-only logic: Currently checks `status` field (`['submitted', 'acknowledged', 'processed']`)

### What Needs Fixing

- Step-based logic in `ITRFiling.js`, `ITRComputation.js`, `GuideMeQuestionnaire.js`, `OnboardingWizard.js`, `JourneyCompletion.jsx`
- No `useFilingContext` hook exists
- No `FilingUIContext` type definition
- Read-only logic uses deprecated `status` instead of `lifecycleState`
- UI components make local decisions about what's allowed instead of checking `allowedActions`

## Step 4.1: Declare UI Contract

**File:** `frontend/src/types/filing.ts` (new file)

Create TypeScript type definitions:

```typescript
// Domain states from backend
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

export type ITRType = 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4';

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

export interface FilingUIContext {
  lifecycleState: DomainState;
  itrType: ITRType | null;
  allowedActions: DomainAction[];
  filingId: string;
  isLoading?: boolean;
  error?: string | null;
}
```

**Rule:** Every page/component that interacts with filings must consume this contract.

## Step 4.2: Create Centralized Hook

**File:** `frontend/src/hooks/useFilingContext.js` (new file)

Create React hook that:

- Calls `itrService.getAllowedActions(filingId)`
- Returns `FilingUIContext` object
- Handles loading and error states
- Refreshes when `filingId` changes
```javascript
import { useState, useEffect } from 'react';
import itrService from '../services/api/itrService';

export function useFilingContext(filingId) {
  const [context, setContext] = useState({
    lifecycleState: null,
    itrType: null,
    allowedActions: [],
    filingId,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!filingId) {
      setContext(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let cancelled = false;

    async function fetchContext() {
      try {
        // Fetch allowed actions (returns { allowedActions, state })
        const result = await itrService.getAllowedActions(filingId);
        
        // Fetch filing details to get itrType (if not in allowed-actions response)
        let itrType = null;
        try {
          const filing = await itrService.getITR(filingId);
          itrType = filing?.filing?.itrType || filing?.itrType || null;
        } catch (filingError) {
          // Non-critical - itrType can be null
          console.warn('Could not fetch ITR type:', filingError);
        }
        
        if (!cancelled) {
          setContext({
            lifecycleState: result.state || result.data?.state,
            itrType,
            allowedActions: result.allowedActions || result.data?.allowedActions || [],
            filingId,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setContext(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Failed to load filing context',
          }));
        }
      }
    }

    fetchContext();

    return () => {
      cancelled = true;
    };
  }, [filingId]);

  return context;
}
```


**Rule:** UI must never infer legality locally. All buttons/edits/submits must check `allowedActions.includes('ACTION')`.

## Step 4.3: Remove Step-Based Logic

**Files to Update:**

- `frontend/src/pages/ITR/ITRFiling.js` - Remove `currentStep`, `stepIndex`, `handleNextStep`, `handlePrevStep`, `handleStepClick`
- `frontend/src/pages/ITR/ITRComputation.js` - Remove any step progression logic
- `frontend/src/components/ITR/GuideMeQuestionnaire.js` - Keep for ITR determination only (not filing flow)
- `frontend/src/components/Layout/OnboardingWizard.js` - Keep (user onboarding, not filing flow)
- `frontend/src/components/Layout/JourneyCompletion.jsx` - Remove step logic if it's part of filing flow

**Action:**

- Search for: `currentStep`, `stepIndex`, `stepOrder`, `nextStep`, `previousStep`
- Replace step-based conditionals with `allowedActions.includes('ACTION_NAME')`
- Example transformation:
  ```javascript
  // ❌ OLD
  if (currentStep >= 3 && itrType === 'ITR-2')
  
  // ✅ NEW
  if (allowedActions.includes('edit_data') && itrType === 'ITR-2')
  ```


## Step 4.4: Make Pages State-Aware

**File:** `frontend/src/pages/ITR/ITRComputation.js`

Update to:

1. Use `useFilingContext(filingId)` hook
2. Declare `supportedStates` array for each major section/page
3. Check if current state is supported, render read-only or redirect if not
4. Remove step guards and routing gymnastics
```javascript
// At component level
const { lifecycleState, allowedActions, itrType } = useFilingContext(filingId);

// For data collection sections
const supportedStates = ['ITR_DETERMINED', 'DATA_COLLECTED', 'DATA_CONFIRMED', 'COMPUTED'];
if (!supportedStates.includes(lifecycleState)) {
  // Render read-only view or redirect
}

// For computation section
const computationSupportedStates = ['DATA_CONFIRMED', 'COMPUTED'];
if (!computationSupportedStates.includes(lifecycleState)) {
  // Show read-only or disable computation
}
```


**File:** `frontend/src/pages/ITR/ITRFiling.js`

Same pattern - declare supported states, check at runtime.

## Step 4.5: Enforce Read-Only Automatically

**File:** `frontend/src/pages/ITR/ITRComputation.js`

Replace current read-only logic:

```javascript
// ❌ OLD
const isReadOnly = viewMode === 'readonly' ||
                   (currentFiling && ['submitted', 'acknowledged', 'processed'].includes(currentFiling.status));
```

With:

```javascript
// ✅ NEW
const LOCKED_STATES = ['LOCKED', 'FILED', 'ACKNOWLEDGED', 'COMPLETED'];
const isReadOnly = viewMode === 'readonly' || 
                   (lifecycleState && LOCKED_STATES.includes(lifecycleState));
```

**Rule:** When `lifecycleState >= LOCKED`, UI becomes fully read-only automatically. No extra flags, no per-field hacks.

**Files to Update:**

- `frontend/src/pages/ITR/ITRComputation.js` - Update `isReadOnly` calculation
- `frontend/src/components/ITR/FinalActions.js` - Check `allowedActions` instead of `filingStatus`
- All form components that receive `isReadOnly` prop - Ensure they respect it

## Step 4.6: Gate All Actions with allowedActions

**File:** `frontend/src/components/ITR/FinalActions.js`

Replace status checks with `allowedActions` checks:

```javascript
// ❌ OLD
const canSubmit = filingStatus === 'ready' && validationErrors.length === 0;

// ✅ NEW
const canSubmit = allowedActions.includes('file_itr') && validationErrors.length === 0;
```

**File:** `frontend/src/pages/ITR/ITRComputation.js`

Update all action buttons:

- Save Draft: `allowedActions.includes('edit_data')`
- Compute Tax: `allowedActions.includes('compute_tax')`
- Lock Filing: `allowedActions.includes('lock_filing')`
- Submit: `allowedActions.includes('file_itr')`
- Edit fields: `allowedActions.includes('edit_data')`

**Files to Update:**

- `frontend/src/pages/ITR/ITRComputation.js` - All action handlers
- `frontend/src/components/ITR/FinalActions.js` - All button visibility logic
- `frontend/src/pages/ITR/ITRFiling.js` - All action buttons

## Step 4.7: Improve Error Messaging

**File:** `frontend/src/utils/filingErrors.js` (new file)

Create domain-aware error messages:

```javascript
export function getActionErrorMessage(action, lifecycleState) {
  const messages = {
    'file_itr': 'This return is locked for filing.',
    'edit_data': 'This return cannot be edited in its current state.',
    'compute_tax': 'Tax computation is not available in the current state.',
    'lock_filing': 'This return cannot be locked in its current state.',
  };

  return messages[action] || `Action '${action}' is not allowed in state '${lifecycleState}'.`;
}
```

**Files to Update:**

- Replace generic "Invalid action" messages with domain-provided reasons
- Use `getActionErrorMessage()` in error handlers

## Step 4.8: Update sectionFlow.js (If Needed)

**File:** `frontend/src/pages/ITR/sectionFlow.js`

If this file contains step-based logic for the filing flow (not just ITR determination), update it to check `allowedActions` instead of step progression.

**Note:** This file appears to be for guided data collection, which may be acceptable to keep if it's just about section ordering, not step enforcement.

## Implementation Order

1. **Step 4.1** - Create type definitions (`filing.ts`)
2. **Step 4.2** - Create `useFilingContext` hook
3. **Step 4.5** - Update read-only logic (quick win)
4. **Step 4.3** - Remove step-based logic from `ITRComputation.js` and `ITRFiling.js`
5. **Step 4.4** - Make pages state-aware
6. **Step 4.6** - Gate all actions with `allowedActions`
7. **Step 4.7** - Improve error messaging
8. **Step 4.8** - Review and update `sectionFlow.js` if needed

## Constraints

### DO NOT

- Redesign UI
- Change navigation structure
- Add animations
- Touch branding
- Optimize performance
- Touch finance module
- Remove `sectionFlow.js` if it's only for section ordering (not step enforcement)

### DO

- Remove step/wizard progression logic
- Replace with `allowedActions` checks
- Make UI state-aware (not flow-aware)
- Enforce read-only automatically for LOCKED+ states
- Use domain-provided error messages

## Success Criteria

Phase 4 is complete when:

- No step-based logic remains in filing flow components
- UI never decides "what is allowed" locally
- All actions depend on `allowedActions` from backend
- LOCKED state auto-enforces read-only UI
- Adding a new domain state does NOT break UI (it just shows/hides based on `allowedActions`)
- All error messages are domain-aware and user-friendly

## Files to Create/Modify

**New Files:**

- `frontend/src/types/filing.ts` - Type definitions
- `frontend/src/hooks/useFilingContext.js` - Centralized hook
- `frontend/src/utils/filingErrors.js` - Error message helpers

**Files to Modify:**

- `frontend/src/pages/ITR/ITRComputation.js` - Remove step logic, add state-awareness, gate actions
- `frontend/src/pages/ITR/ITRFiling.js` - Remove step logic, add state-awareness
- `frontend/src/components/ITR/FinalActions.js` - Gate actions with `allowedActions`
- `frontend/src/components/ITR/GuideMeQuestionnaire.js` - Review (keep if only for ITR determination)
- `frontend/src/pages/ITR/sectionFlow.js` - Review (keep if only for section ordering)

## Backend Response Structure

The `GET /itr/filings/:filingId/allowed-actions` endpoint currently returns:

```json
{
  "success": true,
  "data": {
    "allowedActions": ["collect_data", "validate_data", f...],
    "state": "DATA_COLLECTED"
  }
}
```

**Note:** The endpoint does not return `itrType`. We have two options:

1. Enhance the endpoint to include `itrType` (recommended for Phase 4)
2. Fetch it separately in the hook (acceptable but less efficient)

**Action:** Enhance backend endpoint to include `itrType` in response for better performance.

## Additional Considerations

### Missing from Previous Phases

Before starting Phase 4, verify:

- Phase 1: Domain Core gatekeeper is in place ✅
- Phase 2: Domain Core intelligence is centralized ✅
- Phase 3: DB schema alignment is complete ✅
- Backend endpoint `/itr/filings/:filingId/allowed-actions` exists and works ✅
- Frontend service `itrService.getAllowedActions()` exists ✅

### Integration Points

1. **Filing ID Resolution**: Ensure `filingId` is available in all components that need it. It may come from:

   - URL params (`/itr/computation?filingId=...`)
   - Route params (`/itr/filing/:filingId`)
   - Context/state from navigation

2. **Backward Compatibility**: During transition:

   - Keep `status` field checks as fallback if `lifecycleState` is not available
   - Gradually migrate components one by one
   - Test each component after migration

3. **Error Handling**: If `allowedActions` fetch fails:

   - Show appropriate error message
   - Fall back to read-only mode (safest default)
   - Log error for debugging

## Testing Strategy

After each step:

1. Verify `useFilingContext` hook fetches data correctly
2. Test read-only enforcement for LOCKED+ states
3. Verify action buttons are gated correctly
4. Test error messages are user-friendly
5. Ensure no step-based logic remains

## Notes

- `GuideMeQuestionnaire.js` and `OnboardingWizard.js` are for user onboarding/ITR determination, not filing flow. Keep them as-is unless they contain filing flow step logic.
- `sectionFlow.js` appears to be for section ordering in guided data collection. Keep it if it's just ordering, not step enforcement.
- The plan focuses on filing flow components, not onboarding or ITR determination flows.

## Step 4.9: Enhance Backend Endpoint (Optional but Recommended)

**File:** `backend/src/routes/itr.js`

Enhance the `/filings/:filingId/allowed-actions` endpoint to include `itrType` in the response:

```javascript
router.get('/filings/:filingId/allowed-actions', authenticateToken, async (req, res) => {
  try {
    const { filingId } = req.params;
    const domainCore = require('../domain/ITRDomainCore');
    const { getCurrentDomainState } = require('../middleware/domainGuard');
    const { ITRFiling } = require('../models');

    const currentState = await getCurrentDomainState(filingId);
    const actor = {
      role: req.user?.role || 'END_USER',
      permissions: req.user?.permissions || [],
    };

    const allowedActions = domainCore.getAllowedActions(currentState, actor);

    // Fetch ITR type from filing
    const filing = await ITRFiling.findByPk(filingId, {
      attributes: ['itr_type'],
    });

    return successResponse(res, {
      allowedActions,
      state: currentState,
      itrType: filing?.itrType || null,
    }, 'Allowed actions retrieved');
  } catch (error) {
    return errorResponse(res, error, 500);
  }
});
```

**Benefit:** Reduces API calls and improves performance. The hook can then use `result.itrType` directly.

## Step 4.10: Update Hook to Handle Response Structure

**File:** `frontend/src/hooks/useFilingContext.js`

Ensure the hook properly handles the response structure (may be wrapped in `data`):

```javascript
async function fetchContext() {
  try {
    const result = await itrService.getAllowedActions(filingId);
    
    // Handle both direct response and wrapped response
    const data = result.data || result;
    const lifecycleState = data.state;
    const allowedActions = data.allowedActions || [];
    const itrType = data.itrType || null;
    
    if (!cancelled) {
      setContext({
        lifecycleState,
        itrType,
        allowedActions,
        filingId,
        isLoading: false,
        error: null,
      });
    }
  } catch (error) {
    // ... error handling
  }
}
```

## Detailed File-by-File Changes

### `frontend/src/pages/ITR/ITRComputation.js`

**Specific changes:**

1. **Import hook:**
   ```javascript
   import { useFilingContext } from '../../hooks/useFilingContext';
   ```

2. **Get filingId from URL/search params:**
   ```javascript
   const filingId = searchParams.get('filingId') || params.filingId || currentFiling?.id;
   const { lifecycleState, allowedActions, itrType: contextITRType, isLoading: contextLoading } = useFilingContext(filingId);
   ```

3. **Replace isReadOnly calculation (line ~476):**
   ```javascript
   // OLD
   const isReadOnly = viewMode === 'readonly' ||
                      (currentFiling && ['submitted', 'acknowledged', 'processed'].includes(currentFiling.status));
   
   // NEW
   const LOCKED_STATES = ['LOCKED', 'FILED', 'ACKNOWLEDGED', 'COMPLETED'];
   const isReadOnly = viewMode === 'readonly' || 
                      (lifecycleState && LOCKED_STATES.includes(lifecycleState));
   ```

4. **Remove step-based section visibility logic:**

   - Remove any checks like `if (currentStep >= X)`
   - Replace with `if (allowedActions.includes('edit_data'))`

5. **Gate action buttons:**

   - Save Draft button: `disabled={!allowedActions.includes('edit_data') || isSaving}`
   - Compute Tax button: `disabled={!allowedActions.includes('compute_tax')}`
   - Submit button: `disabled={!allowedActions.includes('file_itr')}`

### `frontend/src/pages/ITR/ITRFiling.js`

**Specific changes:**

1. **Remove step state and handlers:**

   - Remove `const [currentStep, setCurrentStep] = useState(0);`
   - Remove `handleStepClick`, `handleNextStep`, `handlePrevStep` functions
   - Remove `steps` array if it's used for progression

2. **Add hook:**
   ```javascript
   const filingId = currentFiling?.id;
   const { lifecycleState, allowedActions } = useFilingContext(filingId);
   ```

3. **Replace step-based conditionals:**

   - Replace `if (currentStep >= X)` with `if (allowedActions.includes('ACTION'))`

### `frontend/src/components/ITR/FinalActions.js`

**Specific changes:**

1. **Add props:**
   ```javascript
   const FinalActions = ({
     // ... existing props
     allowedActions = [], // Add this prop
     lifecycleState, // Add this prop
     // ...
   }) => {
   ```

2. **Replace status checks:**
   ```javascript
   // OLD
   const canSubmit = filingStatus === 'ready' && validationErrors.length === 0;
   
   // NEW
   const canSubmit = allowedActions.includes('file_itr') && validationErrors.length === 0;
   ```

3. **Gate all action buttons:**

   - Save: `allowedActions.includes('edit_data')`
   - Preview: `allowedActions.includes('review_computation')`
   - Submit: `allowedActions.includes('file_itr')`
   - Print/Download: `allowedActions.includes('download_documents')`

## Migration Strategy

### Phase 4.1: Foundation (Steps 4.1, 4.2, 4.9)

- Create type definitions
- Create hook
- Enhance backend endpoint (optional)
- Test hook in isolation

### Phase 4.2: Read-Only Enforcement (Step 4.5)

- Update `isReadOnly` calculation
- Test with LOCKED+ states
- Verify UI becomes read-only

### Phase 4.3: Action Gating (Step 4.6)

- Gate buttons in `FinalActions.js`
- Gate buttons in `ITRComputation.js`
- Test each action individually

### Phase 4.4: Remove Step Logic (Step 4.3)

- Remove step state and handlers
- Replace step conditionals
- Test navigation still works

### Phase 4.5: State-Awareness (Step 4.4)

- Add `supportedStates` checks
- Handle unsupported states gracefully
- Test state transitions

### Phase 4.6: Polish (Steps 4.7, 4.8)

- Improve error messages
- Review `sectionFlow.js`
- Final testing

## Edge Cases to Handle

1. **No filingId available:**

   - Hook returns `isLoading: false, lifecycleState: null, allowedActions: []`
   - UI should handle gracefully (show message or redirect)

2. **Backend returns error:**

   - Hook sets `error` state
   - UI should show error message and fall back to read-only

3. **lifecycleState is null:**

   - Fall back to checking `status` field (backward compatibility)
   - Log warning for debugging

4. **allowedActions is empty array:**

   - All action buttons should be disabled
   - Show appropriate message to user

5. **State transition during user session:**

   - Hook should refresh periodically or on focus
   - Consider adding refresh mechanism to hook

## Performance Considerations

1. **Hook caching:**

   - Consider caching `allowedActions` response
   - Refresh on filingId change or after state transitions

2. **Multiple hook calls:**

   - If multiple components use the hook for same filingId, consider context provider
   - For Phase 4, multiple calls are acceptable

3. **Backend endpoint performance:**

   - Endpoint should be fast (just DB lookup + Domain Core call)
   - Consider adding response caching if needed

## Rollback Plan

If issues arise:

1. Keep old `status` field checks as fallback
2. Gradually migrate components (not all at once)
3. Feature flag the new hook usage
4. Monitor error logs for issues

## Completion Checklist

- [ ] Type definitions created (`filing.ts`)
- [ ] `useFilingContext` hook created and tested
- [ ] Backend endpoint enhanced (optional)
- [ ] `ITRComputation.js` updated (read-only, actions gated, step logic removed)
- [ ] `ITRFiling.js` updated (step logic removed, state-aware)
- [ ] `FinalActions.js` updated (actions gated)
- [ ] Error messages improved
- [ ] `sectionFlow.js` reviewed
- [ ] All step-based logic removed from filing flow
- [ ] Read-only enforcement works for LOCKED+ states
- [ ] All actions are gated with `allowedActions`
- [ ] No local legality inference remains
- [ ] Error handling is graceful
- [ ] Backward compatibility maintained during transition