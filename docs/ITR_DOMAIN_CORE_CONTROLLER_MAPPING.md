# ITR Domain Core - Controller Mapping

**Generated:** December 2024  
**Purpose:** Map backend controllers to domain states and flag violations

---

## ITRController.js

### `createDraft(req, res)`
- **Assumes State:** `DRAFT_INIT` or `ITR_DETERMINED`
- **Intended Transition:** `DRAFT_INIT` → `ITR_DETERMINED` (if ITR type provided) or stays in `DRAFT_INIT`
- **Action Type:** Mutates data (creates filing and draft)
- **Violations:**
  - ⚠️ **Implicitly assumes ITR type** - Accepts `itrType` from request body without Domain Core validation
  - ⚠️ **Creates filing with ITR type** - Should go through Domain Core to determine ITR type
  - ⚠️ **No state check** - Doesn't verify current state before creating draft

### `updateDraft(req, res)`
- **Assumes State:** `ITR_DETERMINED`, `DATA_COLLECTED`, or `DATA_CONFIRMED`
- **Intended Transition:** None (stays in current state, may progress to `DATA_COLLECTED`)
- **Action Type:** Mutates data (updates draft data)
- **Violations:**
  - ❌ **No state check** - Doesn't verify state before allowing updates
  - ❌ **May mutate in LOCKED state** - No check to prevent updates after `LOCKED`
  - ⚠️ **No Domain Core approval** - Updates data without Domain Core validation

### `validateDraft(req, res)`
- **Assumes State:** `DATA_COLLECTED` or `DATA_CONFIRMED`
- **Intended Transition:** `DATA_COLLECTED` → `DATA_CONFIRMED` (if validation passes)
- **Action Type:** Validates data (read-only, but may trigger state transition)
- **Violations:**
  - ⚠️ **Triggers validation without Domain Core** - Should check if validation is allowed in current state
  - ⚠️ **No state transition control** - Validation may implicitly change state

### `computeTax(req, res)`
- **Assumes State:** `DATA_CONFIRMED` or `COMPUTED`
- **Intended Transition:** `DATA_CONFIRMED` → `COMPUTED` or `COMPUTED` → `COMPUTED` (recomputation)
- **Action Type:** Computes tax
- **Violations:**
  - ❌ **Triggers compute without Domain Core approval** - Should go through Domain Core
  - ⚠️ **No state check** - Doesn't verify if computation is allowed in current state
  - ⚠️ **May recompute in wrong state** - Should only recompute if Domain Core allows

### `submitITR(req, res)`
- **Assumes State:** `LOCKED`
- **Intended Transition:** `LOCKED` → `FILED`
- **Action Type:** Files ITR
- **Violations:**
  - ❌ **No state check** - Doesn't verify filing is in `LOCKED` state
  - ⚠️ **No Domain Core approval** - Should go through Domain Core to transition to `FILED`
  - ⚠️ **May file without locking** - No enforcement that filing must be locked first

### `createDeduction(req, res)`
- **Assumes State:** `ITR_DETERMINED`, `DATA_COLLECTED`, or `DATA_CONFIRMED`
- **Intended Transition:** None (stays in current state)
- **Action Type:** Mutates data (adds deduction)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states
  - ⚠️ **No Domain Core approval** - Should check if mutation is allowed

### `updateDeduction(req, res)`
- **Assumes State:** `ITR_DETERMINED`, `DATA_COLLECTED`, or `DATA_CONFIRMED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates deduction)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states
  - ⚠️ **No Domain Core approval** - Should check if mutation is allowed

### `deleteDeduction(req, res)`
- **Assumes State:** `ITR_DETERMINED`, `DATA_COLLECTED`, or `DATA_CONFIRMED`
- **Intended Transition:** None
- **Action Type:** Mutates data (deletes deduction)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states
  - ⚠️ **No Domain Core approval** - Should check if mutation is allowed

### `updateRefundBankAccount(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates bank account)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateForeignAsset(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates foreign asset)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `deleteForeignAsset(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (deletes foreign asset)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateHouseProperty(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates house property)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateCapitalGains(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates capital gains)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateBusinessIncome(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates business income)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateProfessionalIncome(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates professional income)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateAuditInformation(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates audit information)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

### `updateBalanceSheet(req, res)`
- **Assumes State:** `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Intended Transition:** None
- **Action Type:** Mutates data (updates balance sheet)
- **Violations:**
  - ❌ **No state check** - May mutate in `LOCKED` or later states

---

## eriController.js

### `testSigning(req, res)`
- **Assumes State:** Any (testing only)
- **Intended Transition:** None
- **Action Type:** Test operation (no state impact)
- **Violations:** None (testing only)

### `validateConfig(req, res)`
- **Assumes State:** Any
- **Intended Transition:** None
- **Action Type:** Configuration validation (read-only)
- **Violations:** None (read-only)

### `submitToERI(req, res)` (if exists)
- **Assumes State:** `LOCKED` or `FILED`
- **Intended Transition:** `LOCKED` → `FILED`
- **Action Type:** Files ITR to ERI
- **Violations:**
  - ❌ **No state check** - Should verify filing is in `LOCKED` state
  - ⚠️ **No Domain Core approval** - Should go through Domain Core

---

## ITRVController.js

### `initializeTracking(req, res)`
- **Assumes State:** `FILED` or `ACKNOWLEDGED`
- **Intended Transition:** None
- **Action Type:** Creates ITR-V tracking (read-only operation)
- **Violations:**
  - ⚠️ **No state check** - Should verify filing is in `FILED` or `ACKNOWLEDGED` state

### `getStatus(req, res)`
- **Assumes State:** `FILED`, `ACKNOWLEDGED`, or `COMPLETED`
- **Intended Transition:** None
- **Action Type:** Read-only (gets ITR-V status)
- **Violations:** None (read-only)

### `getUserRecords(req, res)`
- **Assumes State:** Any
- **Intended Transition:** None
- **Action Type:** Read-only (gets user's ITR-V records)
- **Violations:** None (read-only)

---

## Summary

### Critical Violations (❌)
- **17 methods** mutate data without state checks (may mutate in `LOCKED` or later states)
- **1 method** (`submitITR`) doesn't verify `LOCKED` state before filing
- **1 method** (`computeTax`) triggers computation without Domain Core approval

### Warnings (⚠️)
- **3 methods** implicitly assume ITR type without Domain Core validation
- **2 methods** trigger operations (validation, computation) without Domain Core approval
- **1 method** (`initializeTracking`) doesn't verify state before initializing

### Recommendations
1. All mutation methods must check state before allowing updates
2. All state transitions must go through Domain Core
3. ITR type determination must go through Domain Core
4. Computation must be approved by Domain Core

