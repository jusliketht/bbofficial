# ITR Domain Core - ITR Switching Logic Mapping

**Generated:** December 2024  
**Purpose:** Map ITR switching logic and identify where ITR type is changed

---

## Rule

> **Only Domain Core can change ITR type**
> 
> Everything else reacts.

---

## Backend ITR Type Changes

### `backend/src/controllers/ITRController.js`

#### `createDraft(req, res)`
- **Location:** Line 50-5500+
- **Action:** Accepts `itrType` from request body and creates filing with that ITR type
- **Violation:** ❌ **Controller decides ITR type** - Should go through Domain Core
- **Current Logic:** Directly uses `itrType` from request body
- **Required Fix:** Must call Domain Core to determine/validate ITR type

#### `updateDraft(req, res)`
- **Location:** Line 381+
- **Action:** Updates draft data, may include ITR type change
- **Violation:** ❌ **May change ITR type without Domain Core** - No explicit ITR type change, but data updates may imply ITR type change
- **Required Fix:** If ITR type changes, must go through Domain Core

### `backend/src/models/ITRFiling.js`

#### Direct Sequelize Updates
- **Action:** Any direct `update()` call can change `itrType`
- **Violation:** ❌ **Bypasses Domain Core** - Can change ITR type without Domain Core approval
- **Required Fix:** All ITR type changes must go through Domain Core

---

## Frontend ITR Type Changes

### `frontend/src/components/ITR/ITRToggle.js`
- **Action:** Allows user to toggle/change ITR type
- **Violation:** ❌ **Frontend allows ITR type change** - Should only be allowed through Domain Core
- **Current Logic:** Frontend component that allows changing ITR type
- **Required Fix:**
  - Must call backend Domain Core API to change ITR type
  - Frontend should only display toggle if Domain Core allows (state must be `ITR_DETERMINED` or earlier)

### `frontend/src/pages/ITR/ITRComputation.js`
- **Action:** Uses `selectedITR` state, may change ITR type
- **Violation:** ❌ **Frontend manages ITR type** - Uses local state for ITR type
- **Current Logic:**
  - Line 201: `const [selectedITR, setSelectedITR] = useState(initialITR);`
  - Line 212-215: Stores ITR type in localStorage
  - Multiple conditional logic based on `selectedITR`
- **Required Fix:**
  - Get ITR type from backend Domain Core
  - Frontend should not manage ITR type state

### `frontend/src/components/ITR/DataSourceSelector.js`
- **Action:** Determines ITR type via auto-detection or manual selection
- **Violation:** ❌ **Frontend decides ITR type** - Uses frontend `ITRAutoDetector`
- **Current Logic:** Calls `ITRAutoDetector.detectITR()` (frontend service)
- **Required Fix:**
  - Must call backend Domain Core for ITR determination
  - Frontend should only display recommendations

### `frontend/src/components/ITR/ITRFormRecommender.js`
- **Action:** Recommends ITR type
- **Violation:** ❌ **Frontend decides ITR type** - Uses frontend logic
- **Required Fix:** Must use backend Domain Core

---

## ITR Type Checks (Read-Only)

### Backend

#### `backend/src/services/core/ValidationEngine.js`
- **Action:** Validates data based on ITR type
- **Type:** Validation rule (doesn't change ITR type)
- **Status:** ✅ Correct - Validates based on ITR type but doesn't change it

#### `backend/src/services/core/TaxComputationEngine.js`
- **Action:** Computes tax based on ITR type
- **Type:** Calculation (doesn't change ITR type)
- **Status:** ✅ Correct - Uses ITR type for computation but doesn't change it

#### `backend/src/services/business/TaxAuditChecker.js`
- **Action:** Checks audit applicability based on ITR type
- **Type:** Validation rule (doesn't change ITR type)
- **Status:** ✅ Correct

### Frontend

#### `frontend/src/pages/ITR/sectionFlow.js`
- **Action:** Defines section order and required fields based on ITR type
- **Type:** UI rendering only (doesn't change ITR type)
- **Status:** ✅ Correct - Renders based on ITR type but doesn't change it

#### `frontend/src/pages/ITR/ITRComputation.js`
- **Action:** Conditional rendering based on ITR type (lines 320-427)
- **Type:** UI rendering only (but also manages ITR type state - violation)
- **Status:** ⚠️ Mixed - Rendering is OK, but state management is violation

---

## ITR Type Validation

### Backend

#### `backend/src/utils/validationUtils.js`
- **Function:** `validateITRType(itrType)`
- **Type:** Validation rule (validates ITR type but doesn't change it)
- **Status:** ✅ Correct

---

## Summary

### Critical Violations (❌)

1. **ITRController.createDraft()** - Controller decides ITR type without Domain Core
2. **ITRToggle.js** - Frontend allows ITR type change without Domain Core
3. **ITRComputation.js** - Frontend manages ITR type state
4. **DataSourceSelector.js** - Frontend decides ITR type via auto-detection
5. **ITRFormRecommender.js** - Frontend decides ITR type
6. **Direct Sequelize updates** - Can change ITR type without Domain Core

### Correct Usage (✅)

1. **ValidationEngine** - Validates based on ITR type (doesn't change it)
2. **TaxComputationEngine** - Computes based on ITR type (doesn't change it)
3. **TaxAuditChecker** - Checks based on ITR type (doesn't change it)
4. **sectionFlow.js** - Renders based on ITR type (doesn't change it)
5. **validateITRType()** - Validates ITR type (doesn't change it)

### Recommendations

1. **All ITR type changes must go through Domain Core**
2. **Frontend should not manage ITR type state** - Get from backend
3. **Frontend should not decide ITR type** - Only display backend recommendations
4. **Controllers should not decide ITR type** - Must call Domain Core
5. **Direct model updates should be prevented** - Use Domain Core methods only

