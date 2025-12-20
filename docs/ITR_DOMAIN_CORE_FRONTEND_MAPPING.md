# ITR Domain Core - Frontend Mapping

**Generated:** December 2024  
**Purpose:** Map frontend pages and components to domain states and flag frontend logic that decides legality

---

## Frontend Pages

### `frontend/src/pages/ITR/DetermineITR.js`
- **Domain State:** `DRAFT_INIT` → `ITR_DETERMINED`
- **Purpose:** ITR determination page (canonical route)
- **Current Logic:**
  - Wraps `DataSourceSelector` component
  - Allows auto-detection or manual selection
- **Violations:**
  - ⚠️ **Frontend may infer ITR type** - `DataSourceSelector` uses `ITRAutoDetector` (frontend service)
  - ❌ **Frontend deciding ITR type** - Should go through Domain Core (backend)
- **Required Fix:** Frontend should only display recommendations, backend Domain Core decides ITR type

### `frontend/src/pages/ITR/ITRComputation.js`
- **Domain State:** `ITR_DETERMINED` → `DATA_COLLECTED` → `DATA_CONFIRMED` → `COMPUTED`
- **Purpose:** Main ITR computation page with guided data collection
- **Current Logic:**
  - Uses `selectedITR` state (from `location.state` or localStorage)
  - Manages section navigation based on `sectionFlow.js`
  - Handles data collection, validation, and tax computation
- **Violations:**
  - ❌ **Frontend infers ITR type** - Uses `selectedITR` from state/localStorage without backend confirmation
  - ❌ **Frontend blocks actions** - `canProceedFromSection()` checks required fields without backend confirmation
  - ⚠️ **Frontend decides section visibility** - `shouldShowSection()` logic is frontend-only
  - ⚠️ **Frontend manages state** - Uses local state for `selectedITR` instead of backend domain state
- **Required Fix:**
  - Get `allowed_actions[]` from backend based on domain state
  - Replace frontend ITR type logic with backend Domain Core decisions
  - Frontend should only render based on backend state

### `frontend/src/pages/ITR/ITRReview.js`
- **Domain State:** `DATA_CONFIRMED` → `COMPUTED` → `LOCKED`
- **Purpose:** ITR review and pre-submission validation
- **Current Logic:**
  - Validates data before submission
  - Checks for address and bank details (Gate B)
  - Handles submission
- **Violations:**
  - ⚠️ **Frontend validates before backend** - Runs validation without checking domain state
  - ⚠️ **Frontend blocks submission** - Blocks submission based on frontend validation
- **Required Fix:**
  - Get `allowed_actions[]` from backend
  - Backend should decide if submission is allowed based on domain state

### `frontend/src/pages/ITR/EVerification.js`
- **Domain State:** `LOCKED` → `FILED`
- **Purpose:** E-verification page
- **Current Logic:**
  - Handles e-verification (Aadhaar OTP, Net Banking, DSC)
- **Violations:**
  - ⚠️ **No state check** - Doesn't verify filing is in `LOCKED` state
- **Required Fix:**
  - Verify state through backend before allowing e-verification

### `frontend/src/pages/Acknowledgment.js`
- **Domain State:** `FILED` → `ACKNOWLEDGED`
- **Purpose:** ITR submission acknowledgment
- **Current Logic:**
  - Displays acknowledgment number and filing details
- **Violations:** None (read-only display)

### `frontend/src/pages/ITR/PANVerification.js`
- **Domain State:** `DRAFT_INIT` (before ITR determination)
- **Purpose:** PAN verification page
- **Current Logic:**
  - Verifies PAN via Surepass
  - Navigates to `/itr/determine` after verification
- **Violations:** None (verification is separate from ITR domain)

### `frontend/src/pages/ITR/ITRVTracking.js`
- **Domain State:** `FILED`, `ACKNOWLEDGED`, or `COMPLETED`
- **Purpose:** ITR-V tracking page
- **Violations:** None (read-only tracking)

### `frontend/src/pages/ITR/RefundTracking.js`
- **Domain State:** `ACKNOWLEDGED` or `COMPLETED`
- **Purpose:** Refund tracking page
- **Violations:** None (read-only tracking)

---

## Frontend Components

### `frontend/src/components/ITR/DataSourceSelector.js`
- **Domain State:** `DRAFT_INIT` → `ITR_DETERMINED`
- **Purpose:** Data source selection and ITR auto-detection
- **Current Logic:**
  - Uses `ITRAutoDetector` (frontend service) to recommend ITR type
  - Allows manual ITR selection
- **Violations:**
  - ❌ **Frontend deciding ITR type** - Uses frontend `ITRAutoDetector` instead of backend Domain Core
  - ⚠️ **Frontend infers ITR type** - Should only display recommendations, not decide
- **Required Fix:**
  - Call backend Domain Core for ITR determination
  - Frontend should only display recommendations

### `frontend/src/components/ITR/ITRFormRecommender.js`
- **Domain State:** `DRAFT_INIT` → `ITR_DETERMINED`
- **Purpose:** ITR form recommendation component
- **Current Logic:**
  - Uses frontend logic to recommend ITR type
- **Violations:**
  - ❌ **Frontend deciding ITR type** - Should go through backend Domain Core
- **Required Fix:**
  - Use backend Domain Core for recommendations

### `frontend/src/components/ITR/ComputationSidebar.js`
- **Domain State:** `ITR_DETERMINED` → `DATA_COLLECTED` → `DATA_CONFIRMED`
- **Purpose:** Sidebar navigation for ITR computation sections
- **Current Logic:**
  - Displays sections based on `orderedSections` from `sectionFlow.js`
  - Shows completion status
- **Violations:**
  - ⚠️ **Frontend decides section order** - Should get from backend based on domain state
- **Required Fix:**
  - Get section order from backend based on domain state

### `frontend/src/components/ITR/TaxComputationBar.js`
- **Domain State:** `COMPUTED` or `LOCKED`
- **Purpose:** Sticky bar showing tax summary and "File" CTA
- **Current Logic:**
  - Shows tax computation results
  - "File" button navigates to `/itr/review`
- **Violations:**
  - ⚠️ **Frontend decides if filing is allowed** - Should check backend `allowed_actions[]`
- **Required Fix:**
  - Check `allowed_actions[]` from backend before showing "File" button

### `frontend/src/components/ITR/ITRToggle.js`
- **Domain State:** `ITR_DETERMINED` (should not allow changes after)
- **Purpose:** ITR type toggle component
- **Current Logic:**
  - Allows changing ITR type
- **Violations:**
  - ❌ **Frontend allows ITR type change** - Should only be allowed through Domain Core
  - ❌ **No state check** - Doesn't verify if ITR type can be changed
- **Required Fix:**
  - Only allow ITR type change if Domain Core allows (state must be `ITR_DETERMINED` or earlier)
  - Must go through backend Domain Core

### `frontend/src/components/ITR/DetermineITR/RecommendationPanel.js`
- **Domain State:** `DRAFT_INIT` → `ITR_DETERMINED`
- **Purpose:** Displays ITR recommendation
- **Current Logic:**
  - Shows recommended ITR, reasons, confidence
- **Violations:**
  - ⚠️ **Displays frontend recommendation** - Should display backend Domain Core recommendation
- **Required Fix:**
  - Get recommendation from backend Domain Core

### `frontend/src/pages/ITR/sectionFlow.js`
- **Domain State:** `ITR_DETERMINED` → `DATA_COLLECTED` → `DATA_CONFIRMED`
- **Purpose:** Section flow configuration
- **Current Logic:**
  - Defines section order per ITR type
  - Defines required fields per ITR type
  - Defines progressive disclosure rules
- **Violations:**
  - ⚠️ **Frontend decides section flow** - Should get from backend based on domain state
- **Required Fix:**
  - Backend should provide section flow based on domain state and ITR type

---

## Frontend Services

### `frontend/src/services/ITRAutoDetector.js`
- **Domain State:** `DRAFT_INIT` → `ITR_DETERMINED`
- **Purpose:** ITR auto-detection (frontend)
- **Current Logic:**
  - Rules engine for ITR type detection
  - Returns recommended ITR type with confidence
- **Violations:**
  - ❌ **Frontend deciding ITR type** - This is a logic leak
  - ❌ **Should be backend only** - ITR type determination must go through Domain Core
- **Required Fix:**
  - Move logic to backend Domain Core
  - Frontend should only call backend API

### `frontend/src/services/api/itrService.js`
- **Methods:**
  - `createITR()` - Creates filing and draft
  - `updateDraft()` - Updates draft data
  - `computeTax()` - Triggers tax computation
  - `submitITR()` - Submits ITR
  - `detectITRType()` - Detects ITR type (frontend call)
- **Violations:**
  - ⚠️ **No state checks** - Methods don't verify domain state before operations
  - ⚠️ **detectITRType()** - Frontend method for ITR detection (should be backend only)
- **Required Fix:**
  - All methods should check `allowed_actions[]` from backend
  - `detectITRType()` should call backend Domain Core

---

## Summary

### Critical Violations (❌)

1. **ITRAutoDetector (frontend)** - Frontend deciding ITR type (logic leak)
2. **ITRComputation.js** - Frontend infers ITR type and blocks actions without backend
3. **ITRToggle.js** - Frontend allows ITR type change without Domain Core
4. **DataSourceSelector.js** - Frontend deciding ITR type
5. **ITRFormRecommender.js** - Frontend deciding ITR type

### Warnings (⚠️)

1. **ITRComputation.js** - Frontend manages state and decides section visibility
2. **ITRReview.js** - Frontend validates and blocks submission without backend confirmation
3. **TaxComputationBar.js** - Frontend decides if filing is allowed
4. **ComputationSidebar.js** - Frontend decides section order
5. **sectionFlow.js** - Frontend decides section flow
6. **itrService.js** - No state checks in API methods

### Recommendations

1. **Frontend must not decide legality** - All decisions must come from backend Domain Core
2. **Use `allowed_actions[]` from backend** - Replace frontend logic with backend state
3. **ITR type determination must be backend only** - Move `ITRAutoDetector` to backend Domain Core
4. **Section flow must come from backend** - Backend should provide section order based on domain state
5. **All mutations must check state** - Frontend should verify `allowed_actions[]` before operations

