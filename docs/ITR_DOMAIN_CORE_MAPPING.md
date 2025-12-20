# ITR Domain Core - Complete Mapping Document

**Generated:** December 2024  
**Purpose:** Complete mapping of codebase to ITR Domain Core State Machine

---

## Executive Summary

### Assessment

- **Domain-ready:** ~20% of files
- **Needs consolidation:** ~60% of files
- **Unsafe logic:** ~20% of files

### Critical Findings

1. **No Domain Core implementation** - Domain Core is placeholder only
2. **State violations everywhere** - Mutations happen without state checks
3. **Logic leaks in frontend** - Frontend decides ITR type and blocks actions
4. **Missing guards** - No state validation before operations
5. **ITR type changes bypass Domain Core** - Controllers and frontend change ITR type directly

---

## 1. File → Lifecycle State(s) Mapping

### Backend Controllers

| File | Methods | Domain States | Notes |
|------|---------|---------------|-------|
| `ITRController.js` | `createDraft()` | `DRAFT_INIT` → `ITR_DETERMINED` | ⚠️ No state check |
| `ITRController.js` | `updateDraft()` | `ITR_DETERMINED`, `DATA_COLLECTED`, `DATA_CONFIRMED` | ❌ No state check, may mutate in LOCKED |
| `ITRController.js` | `validateDraft()` | `DATA_COLLECTED` → `DATA_CONFIRMED` | ⚠️ No Domain Core approval |
| `ITRController.js` | `computeTax()` | `DATA_CONFIRMED` → `COMPUTED` | ❌ No Domain Core approval |
| `ITRController.js` | `submitITR()` | `LOCKED` → `FILED` | ❌ No state check |
| `eriController.js` | `submitToERI()` | `LOCKED` → `FILED` | ❌ No state check |
| `ITRVController.js` | `initializeTracking()` | `FILED`, `ACKNOWLEDGED` | ⚠️ No state check |

### Backend Services

| File | Type | Domain Dependency | Notes |
|------|------|-------------------|-------|
| `TaxComputationEngine.js` | Pure calculation | ✅ Domain-Independent | Can execute without state checks |
| `ValidationEngine.js` | Validation | ⚠️ Domain-Dependent | Must be gated by Domain Core |
| `DeductionTypeDetectionService.js` | AI detection | ⚠️ Domain-Dependent | Must be gated by Domain Core |
| `EVerificationService.js` | E-verification | ⚠️ Domain-Dependent | Must verify LOCKED state |
| `DataMatchingService.js` | Data matching | ⚠️ Domain-Dependent | Must be gated by Domain Core |
| `ERIIntegrationService.js` | ERI submission | ⚠️ Domain-Dependent | Must verify LOCKED state |

### Frontend Pages

| File | Domain States | Notes |
|------|---------------|-------|
| `DetermineITR.js` | `DRAFT_INIT` → `ITR_DETERMINED` | ❌ Frontend decides ITR type |
| `ITRComputation.js` | `ITR_DETERMINED` → `DATA_COLLECTED` → `DATA_CONFIRMED` → `COMPUTED` | ❌ Frontend infers ITR type, blocks actions |
| `ITRReview.js` | `DATA_CONFIRMED` → `COMPUTED` → `LOCKED` | ⚠️ Frontend validates without backend |
| `EVerification.js` | `LOCKED` → `FILED` | ⚠️ No state check |
| `Acknowledgment.js` | `FILED` → `ACKNOWLEDGED` | ✅ Read-only |

### Frontend Components

| File | Domain States | Notes |
|------|---------------|-------|
| `DataSourceSelector.js` | `DRAFT_INIT` → `ITR_DETERMINED` | ❌ Frontend decides ITR type |
| `ITRFormRecommender.js` | `DRAFT_INIT` → `ITR_DETERMINED` | ❌ Frontend decides ITR type |
| `ITRToggle.js` | `ITR_DETERMINED` | ❌ Frontend allows ITR type change |
| `ComputationSidebar.js` | `ITR_DETERMINED` → `DATA_COLLECTED` | ⚠️ Frontend decides section order |
| `TaxComputationBar.js` | `COMPUTED`, `LOCKED` | ⚠️ Frontend decides if filing is allowed |

---

## 2. File → Allowed Actions Mapping

### Backend Controllers

| File | Method | Allowed Actions (Current) | Should Be |
|------|--------|--------------------------|-----------|
| `ITRController.js` | `createDraft()` | Always allowed | `determine_itr_type`, `collect_initial_data` (if state allows) |
| `ITRController.js` | `updateDraft()` | Always allowed | `collect_data`, `edit_data` (if state allows, not in LOCKED) |
| `ITRController.js` | `computeTax()` | Always allowed | `compute_tax` (if state is DATA_CONFIRMED) |
| `ITRController.js` | `submitITR()` | Always allowed | `file_itr` (if state is LOCKED) |

### Frontend Pages

| File | Allowed Actions (Current) | Should Be |
|------|--------------------------|-----------|
| `ITRComputation.js` | Frontend decides | Get `allowed_actions[]` from backend |
| `ITRReview.js` | Frontend decides | Get `allowed_actions[]` from backend |
| `EVerification.js` | Always allowed | `e_verify` (if state is LOCKED) |

---

## 3. Violations List

### ❌ State Violations (Mutations in Wrong State)

1. **ITRController.updateDraft()** - May mutate data in `LOCKED` or later states
2. **ITRController.createDeduction()** - May mutate in `LOCKED` state
3. **ITRController.updateDeduction()** - May mutate in `LOCKED` state
4. **ITRController.deleteDeduction()** - May mutate in `LOCKED` state
5. **ITRController.updateRefundBankAccount()** - May mutate in `LOCKED` state
6. **ITRController.updateForeignAsset()** - May mutate in `LOCKED` state
7. **ITRController.deleteForeignAsset()** - May mutate in `LOCKED` state
8. **ITRController.updateHouseProperty()** - May mutate in `LOCKED` state
9. **ITRController.updateCapitalGains()** - May mutate in `LOCKED` state
10. **ITRController.updateBusinessIncome()** - May mutate in `LOCKED` state
11. **ITRController.updateProfessionalIncome()** - May mutate in `LOCKED` state
12. **ITRController.updateAuditInformation()** - May mutate in `LOCKED` state
13. **ITRController.updateBalanceSheet()** - May mutate in `LOCKED` state
14. **ITRDraft.updateData()** - Updates data without state check
15. **ITRDraft.createOrUpdate()** - Creates/updates without state check
16. **ITRFiling.updateStatus()** - Updates status without Domain Core
17. **Direct Sequelize updates** - Bypass state checks

### ❌ Logic Leaks (Frontend Deciding Legality)

1. **ITRAutoDetector (frontend)** - Frontend deciding ITR type
2. **ITRComputation.js** - Frontend infers ITR type and blocks actions
3. **ITRToggle.js** - Frontend allows ITR type change
4. **DataSourceSelector.js** - Frontend deciding ITR type
5. **ITRFormRecommender.js** - Frontend deciding ITR type
6. **ITRReview.js** - Frontend validates and blocks submission
7. **TaxComputationBar.js** - Frontend decides if filing is allowed
8. **ComputationSidebar.js** - Frontend decides section order
9. **sectionFlow.js** - Frontend decides section flow

### ❌ Missing Domain Core Checks

1. **All ITRController methods** - No Domain Core checks
2. **All mutation methods** - No state validation
3. **All computation methods** - No Domain Core approval
4. **All submission methods** - No state check
5. **All Domain-Dependent services** - No state checks before execution

---

## 4. Duplication List

### ⚠️ Logic Duplication

1. **ITR type detection** - Duplicated in frontend (`ITRAutoDetector.js`) and should be in backend Domain Core
2. **State checks** - Duplicated across multiple controllers (should be in Domain Core)
3. **Validation logic** - Duplicated in frontend and backend (should be backend only)
4. **Section flow logic** - Duplicated in frontend (`sectionFlow.js`) and should come from backend
5. **ITR type conditional logic** - Duplicated across multiple files (should use Domain Core)

### ⚠️ State Checks Duplicated

1. **State validation** - Each controller method checks state independently (should use Domain Core)
2. **ITR type validation** - Duplicated in multiple places (should use Domain Core)
3. **Action permission checks** - Duplicated in frontend and backend (should be backend only)

---

## 5. Missing Guards List

### 🟡 Missing Domain Core Checks

1. **All controller mutation methods** - No Domain Core state check
2. **All controller computation methods** - No Domain Core approval
3. **All controller submission methods** - No Domain Core state check
4. **All Domain-Dependent services** - No state validation before execution
5. **All model update methods** - No state check before updates
6. **All frontend mutation operations** - No backend state check

### 🟡 Missing State Validation

1. **ITRController.createDraft()** - Doesn't verify current state
2. **ITRController.updateDraft()** - Doesn't verify state allows updates
3. **ITRController.computeTax()** - Doesn't verify state allows computation
4. **ITRController.submitITR()** - Doesn't verify state is LOCKED
5. **All mutation methods** - Don't verify state before mutations

### 🟡 Missing ITR Type Validation

1. **ITRController.createDraft()** - Accepts ITR type without Domain Core validation
2. **Frontend ITR type changes** - No backend validation
3. **ITRToggle.js** - No backend validation for ITR type changes

---

## 6. Summary Assessment

### Domain-ready Files (✅)

1. **Domain state definitions** (`backend/src/domain/states.js`) - ✅ Complete
2. **Domain Core structure** (`backend/src/domain/ITRDomainCore.js`) - ✅ Placeholder created
3. **Read-only services** - ✅ Domain-Independent services
4. **Read-only pages** - ✅ Acknowledgment, tracking pages

### Needs Consolidation Files (⚠️)

1. **All controllers** - Need Domain Core integration
2. **All Domain-Dependent services** - Need state checks
3. **All frontend pages** - Need backend state integration
4. **All model update methods** - Need state checks
5. **ITR type detection logic** - Needs consolidation into Domain Core

### Unsafe Logic Files (❌)

1. **ITRController.js** - Multiple unsafe mutations
2. **ITRAutoDetector.js (frontend)** - Logic leak
3. **ITRComputation.js** - Frontend deciding legality
4. **ITRToggle.js** - Frontend allowing ITR type change
5. **DataSourceSelector.js** - Frontend deciding ITR type
6. **All model update methods** - Bypass state checks

---

## 7. Next Steps

### Immediate Actions Required

1. **Implement Domain Core** - Replace placeholder with actual implementation
2. **Add state checks to all mutations** - Verify state before allowing operations
3. **Move ITR detection to backend** - Remove frontend ITRAutoDetector logic leak
4. **Add allowed_actions[] API** - Backend should return allowed actions based on state
5. **Protect immutable fields** - Add state checks to model update methods
6. **Integrate RBAC with Domain Core** - Filter allowed actions based on role
7. **Add billing hooks** - Implement billing at state transitions
8. **Add audit logging** - Log all state transitions and overrides

### Refactoring Priority

1. **High Priority:**
   - Implement Domain Core state management
   - Add state checks to all mutation methods
   - Move ITR detection to backend
   - Add allowed_actions[] API

2. **Medium Priority:**
   - Consolidate state checks into Domain Core
   - Integrate RBAC with Domain Core
   - Add billing hooks
   - Protect immutable fields

3. **Low Priority:**
   - Optimize state transition logic
   - Add state transition analytics
   - Enhance audit logging

---

## 8. Detailed Mappings

See separate documents:
- [Controller Mapping](ITR_DOMAIN_CORE_CONTROLLER_MAPPING.md)
- [Service Classification](ITR_DOMAIN_CORE_SERVICE_CLASSIFICATION.md)
- [Model Invariants](ITR_DOMAIN_CORE_MODEL_INVARIANTS.md)
- [Frontend Mapping](ITR_DOMAIN_CORE_FRONTEND_MAPPING.md)
- [ITR Switching Logic](ITR_DOMAIN_CORE_ITR_SWITCHING.md)
- [Override and Audit](ITR_DOMAIN_CORE_OVERRIDE_AUDIT.md)
- [Finance and RBAC](ITR_DOMAIN_CORE_FINANCE_RBAC.md)

---

**Status:** Mapping complete. Ready for surgical refactoring.

