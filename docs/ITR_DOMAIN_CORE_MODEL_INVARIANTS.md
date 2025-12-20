# ITR Domain Core - Model Invariants

**Generated:** December 2024  
**Purpose:** Verify model invariants and identify immutable fields after LOCKED

---

## ITRDraft Model

### Fields that Imply State

#### `step` (ENUM)
- **Domain State Mapping:**
  - `personal_info` → `ITR_DETERMINED` or `DATA_COLLECTED`
  - `income_sources` → `DATA_COLLECTED`
  - `deductions` → `DATA_COLLECTED`
  - `tax_computation` → `COMPUTED`
  - `bank_details` → `DATA_COLLECTED` or `DATA_CONFIRMED`
  - `verification` → `LOCKED` or `FILED`
  - `review` → `DATA_CONFIRMED` or `COMPUTED`
  - `submit` → `LOCKED` or `FILED`
- **Note:** Step is a UI-level concept, not the authoritative domain state
- **Violation:** ⚠️ Step-based logic may not align with domain states

#### `isCompleted` (BOOLEAN)
- **Domain State Mapping:**
  - `false` → `DATA_COLLECTED` (in progress)
  - `true` → `DATA_CONFIRMED` (section confirmed)
- **Note:** Completion of a step doesn't necessarily mean domain state transition

#### `lastSavedAt` (DATE)
- **Domain State Mapping:** None (metadata only)
- **Status:** ✅ No state implication

### Fields that Should be Immutable After LOCKED

#### `data` (JSONB)
- **Should be Immutable After:** `LOCKED`
- **Current Protection:** ❌ No state check in `updateData()` method
- **Violation:** Can be updated even after `LOCKED` state
- **Required Fix:** Add state check before allowing updates

#### `validationErrors` (JSONB)
- **Should be Immutable After:** `LOCKED`
- **Current Protection:** ❌ No state check
- **Violation:** Can be updated even after `LOCKED` state

### Update Paths that Bypass State Checks

#### `ITRDraft.prototype.updateData()`
- **Location:** `backend/src/models/ITRDraft.js:117`
- **Violation:** ❌ Updates `data` without checking if filing is in `LOCKED` state
- **Required Fix:** Check filing state through Domain Core before allowing update

#### `ITRDraft.prototype.markCompleted()`
- **Location:** `backend/src/models/ITRDraft.js:94`
- **Violation:** ⚠️ Marks step as completed without state validation
- **Required Fix:** Verify state allows completion

#### `ITRDraft.createOrUpdate()`
- **Location:** `backend/src/models/ITRDraft.js:255`
- **Violation:** ❌ Creates or updates draft without state check
- **Required Fix:** Check state through Domain Core before create/update

---

## ITRFiling Model

### Fields that Imply State

#### `status` (ENUM: 'draft', 'paused', 'submitted', 'acknowledged', 'processed', 'rejected')
- **Domain State Mapping:**
  - `draft` → `DRAFT_INIT`, `ITR_DETERMINED`, `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
  - `paused` → Any state (paused is orthogonal to domain state)
  - `submitted` → `FILED`
  - `acknowledged` → `ACKNOWLEDGED`
  - `processed` → `COMPLETED`
  - `rejected` → Error state (not in domain states)
- **Note:** Model status is not the same as domain state - needs mapping
- **Violation:** ⚠️ Status enum doesn't match domain states exactly

#### `reviewStatus` (ENUM: 'pending', 'in_review', 'approved', 'rejected')
- **Domain State Mapping:** None (CA review is orthogonal to domain state)
- **Status:** ✅ No direct state implication

#### `verificationStatus` (ENUM: 'pending', 'verified', 'failed')
- **Domain State Mapping:**
  - `pending` → `FILED` (awaiting verification)
  - `verified` → `ACKNOWLEDGED` (verification complete)
  - `failed` → `FILED` (verification failed, may need retry)
- **Status:** ✅ Maps to domain states

#### `verificationMethod` (ENUM: 'AADHAAR_OTP', 'NETBANKING', 'DSC')
- **Domain State Mapping:** None (metadata only)
- **Status:** ✅ No state implication

### Fields that Should be Immutable After LOCKED

#### `itrType` (ENUM: 'ITR-1', 'ITR-2', 'ITR-3', 'ITR-4')
- **Should be Immutable After:** `ITR_DETERMINED`
- **Current Protection:** ❌ No explicit protection
- **Violation:** Can be changed even after `ITR_DETERMINED` state
- **Required Fix:** Only Domain Core can change ITR type after `ITR_DETERMINED`

#### `jsonPayload` (JSONB)
- **Should be Immutable After:** `LOCKED`
- **Current Protection:** ❌ No state check
- **Violation:** Can be updated even after `LOCKED` state
- **Required Fix:** Check state through Domain Core before allowing updates

#### `taxLiability` (DECIMAL)
- **Should be Immutable After:** `COMPUTED` (unless recomputed)
- **Current Protection:** ❌ No state check
- **Violation:** Can be updated without recomputation
- **Required Fix:** Only allow updates through Domain Core recomputation

#### `refundAmount` (DECIMAL)
- **Should be Immutable After:** `COMPUTED` (unless recomputed)
- **Current Protection:** ❌ No state check
- **Violation:** Can be updated without recomputation
- **Required Fix:** Only allow updates through Domain Core recomputation

#### `balancePayable` (DECIMAL)
- **Should be Immutable After:** `COMPUTED` (unless recomputed)
- **Current Protection:** ❌ No state check
- **Violation:** Can be updated without recomputation
- **Required Fix:** Only allow updates through Domain Core recomputation

### Update Paths that Bypass State Checks

#### `ITRFiling.prototype.updateStatus()`
- **Location:** `backend/src/models/ITRFiling.js:255`
- **Violation:** ❌ Updates status without Domain Core validation
- **Required Fix:** Must go through Domain Core for state transitions

#### Direct Sequelize Updates
- **Violation:** ❌ Any direct `update()` calls bypass state checks
- **Required Fix:** All updates must go through Domain Core or model methods that check state

---

## ReturnVersion Model

### Fields that Imply State

#### `versionNumber` (INTEGER)
- **Domain State Mapping:** None (versioning is orthogonal to domain state)
- **Status:** ✅ No state implication

#### `isCurrent` (BOOLEAN)
- **Domain State Mapping:** None (versioning metadata)
- **Status:** ✅ No state implication

### Fields that Should be Immutable After LOCKED

#### `dataSnapshot` (JSONB)
- **Should be Immutable After:** Creation (snapshot is immutable by design)
- **Current Protection:** ✅ Immutable (snapshot shouldn't change)
- **Status:** ✅ Correct

#### `taxComputation` (JSONB)
- **Should be Immutable After:** Creation (snapshot is immutable by design)
- **Current Protection:** ✅ Immutable (snapshot shouldn't change)
- **Status:** ✅ Correct

### Update Paths that Bypass State Checks

#### ReturnVersion Creation
- **Status:** ✅ No violations (versions are immutable snapshots)

---

## Summary

### Critical Violations (❌)

1. **ITRDraft.data** - Can be updated after `LOCKED` state
2. **ITRDraft.validationErrors** - Can be updated after `LOCKED` state
3. **ITRFiling.itrType** - Can be changed after `ITR_DETERMINED` state
4. **ITRFiling.jsonPayload** - Can be updated after `LOCKED` state
5. **ITRFiling.taxLiability/refundAmount/balancePayable** - Can be updated without recomputation
6. **ITRFiling.updateStatus()** - Bypasses Domain Core for state transitions
7. **ITRDraft.updateData()** - Bypasses state checks
8. **ITRDraft.createOrUpdate()** - Bypasses state checks

### Warnings (⚠️)

1. **ITRDraft.step** - Step-based logic may not align with domain states
2. **ITRFiling.status** - Status enum doesn't match domain states exactly
3. **ITRDraft.markCompleted()** - Marks completion without state validation

### Recommendations

1. All model update methods must check state through Domain Core
2. Immutable fields must be protected by state checks
3. State transitions must go through Domain Core
4. ITR type changes must go through Domain Core
5. Tax computation fields must only be updated through Domain Core recomputation

