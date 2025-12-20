---
name: ITR Domain Core Mapping and Annotation
overview: Map the existing codebase to the ITR Domain Core State Machine, identify state violations, logic leaks, duplication, and missing guards. This is a mapping and annotation task only - no refactoring yet.
todos:
  - id: define-domain-states
    content: Define authoritative domain states (ENUM) and create Domain Core module structure (conceptual only)
    status: completed
  - id: map-backend-controllers
    content: Map backend controllers (ITRController, eriController, ITRVController) to domain states and flag violations
    status: completed
    dependencies:
      - define-domain-states
  - id: classify-backend-services
    content: Classify backend services into Domain-Independent vs Domain-Dependent and annotate state requirements
    status: completed
    dependencies:
      - define-domain-states
  - id: verify-model-invariants
    content: Verify model invariants (ITRDraft, ITRFiling, ReturnVersion) and identify immutable fields after LOCKED
    status: completed
    dependencies:
      - define-domain-states
  - id: map-frontend-pages
    content: Map frontend pages and components to domain states and flag frontend logic that decides legality
    status: completed
    dependencies:
      - define-domain-states
  - id: map-itr-switching
    content: Map ITR switching logic and identify where ITR type is changed (should only be Domain Core)
    status: completed
    dependencies:
      - define-domain-states
  - id: map-override-audit
    content: Map override and audit points (CA edits, admin edits, auto-corrections) and flag state violations
    status: completed
    dependencies:
      - define-domain-states
  - id: annotate-finance-rbac
    content: Annotate future finance and RBAC hooks (billing points, RBAC checks)
    status: completed
    dependencies:
      - define-domain-states
  - id: generate-mapping-doc
    content: Generate final mapping document with file→state mappings, violations, duplications, and missing guards
    status: completed
    dependencies:
      - map-backend-controllers
      - classify-backend-services
      - verify-model-invariants
      - map-frontend-pages
      - map-itr-switching
      - map-override-audit
      - annotate-finance-rbac
---

# ITR Domain Core Mapping and Annotation Plan

## Overview

This plan maps the existing codebase to the ITR Domain Core State Machine, enforcing state-based legality and identifying logic leaks, duplication, and missing guards. **No refactoring will be done** - only mapping and annotation.

## Domain States (Authoritative ENUM)

The following are the only valid lifecycle states:

```
DRAFT_INIT          - Initial draft creation
ITR_DETERMINED      - ITR type has been determined
DATA_COLLECTED      - User data has been collected
DATA_CONFIRMED      - Data has been confirmed/validated
COMPUTED            - Tax has been computed
LOCKED              - Filing is locked (no more edits)
FILED               - ITR has been filed/submitted
ACKNOWLEDGED        - ITR has been acknowledged by ITD
COMPLETED           - Filing process is complete
```

## Implementation Tasks

### Task 1: Define Domain States and Create Domain Core Module Structure

**Files to create/modify:**

- `backend/src/domain/ITRDomainCore.js` (new file - conceptual structure only)
- `backend/src/domain/states.js` (new file - state enum definitions)

**Actions:**

- Define state enum constants
- Document state transition rules
- Create placeholder for Domain Core module (no implementation yet)
- Document responsibilities: state transitions, ITR type decisions, allowed actions, recomputation/invalidation

**Output:** Conceptual domain state definitions and Domain Core module structure

---

### Task 2: Map Backend Controllers to Domain States

**Files to analyze:**

- `backend/src/controllers/ITRController.js`
- `backend/src/controllers/eriController.js`
- `backend/src/controllers/ITRVController.js`
- `backend/src/controllers/AssessmentNoticeController.js`
- `backend/src/controllers/TaxDemandController.js`

**Actions for each controller method:**

- Annotate which lifecycle state the action assumes
- Annotate which state transition it intends
- Classify: mutates data, computes, or files
- Flag violations:
  - ❌ Mutates data in `LOCKED` or later states
  - ⚠️ Implicitly assumes ITR type
  - ⚠️ Triggers compute without domain approval

**Output:** Annotated controller file with state mappings and violation flags

---

### Task 3: Classify and Map Backend Services

**Files to analyze:**

- All files in `backend/src/services/core/`
- All files in `backend/src/services/business/`
- All files in `backend/src/services/integration/`
- All files in `backend/src/services/utils/`

**Classification:**

1. **Pure Domain-Independent** (can execute without state checks):

   - `TaxComputationEngine` - pure calculation
   - `Form16ExtractionService` - data extraction
   - `BrokerFileProcessor` - file processing
   - `RefundTrackingService` - read-only tracking
   - `FileStorageService` - file operations
   - `EmailService`, `SMSService` - notification services

2. **Domain-Dependent** (must be gated by Domain Core):

   - `ITRAutoDetectorService` - determines ITR type
   - `ValidationEngine` - validates based on state
   - `TaxComputationService` - computes tax (state-dependent)
   - `DeductionDetectionService` - detects deductions (state-dependent)
   - `EVerificationService` - e-verification (state-dependent)
   - `DataMatchingService` - data matching (state-dependent)

**Actions:**

- Classify each service into category 1 or 2
- For category 2, annotate: "Must only execute if Domain Core allows action in current state"
- Document current state assumptions
- Flag services that bypass state checks

**Output:** Service classification document with domain dependency annotations

---

### Task 4: Verify Model Invariants

**Files to analyze:**

- `backend/src/models/ITRDraft.js`
- `backend/src/models/ITRFiling.js`
- `backend/src/models/ReturnVersion.js`

**Actions:**

- Identify which fields imply state (e.g., `status`, `step`, `isCompleted`)
- Identify which fields should be immutable after `LOCKED`:
  - `itrType` - should not change after `ITR_DETERMINED`
  - `jsonPayload` - should not change after `LOCKED`
  - `taxLiability`, `refundAmount` - should not change after `COMPUTED` (unless recomputed)
- Flag update paths that bypass state checks
- Document current state representation in models

**Output:** Model invariant analysis document

---

### Task 5: Map Frontend Pages and Components to Domain States

**Files to analyze:**

- `frontend/src/pages/ITR/DetermineITR.js` - `DRAFT_INIT` → `ITR_DETERMINED`
- `frontend/src/pages/ITR/ITRComputation.js` - `ITR_DETERMINED` → `DATA_COLLECTED` → `DATA_CONFIRMED`
- `frontend/src/pages/ITR/ITRReview.js` - `DATA_CONFIRMED` → `COMPUTED` → `LOCKED`
- `frontend/src/pages/ITR/EVerification.js` - `LOCKED` → `FILED`
- `frontend/src/pages/Acknowledgment.js` - `FILED` → `ACKNOWLEDGED`
- `frontend/src/components/ITR/DataSourceSelector.js`
- `frontend/src/components/ITR/ITRFormRecommender.js`
- `frontend/src/components/ITR/ComputationSidebar.js`
- `frontend/src/components/ITR/TaxComputationBar.js`

**Actions:**

- Map each page/component to its domain state(s)
- Identify frontend logic that infers ITR type (flag as ❌)
- Identify frontend logic that blocks actions without backend confirmation (flag as ❌)
- Replace assumptions like "Step 3", "Next section" with `allowed_actions[]` from backend
- Document current state assumptions in frontend code

**Output:** Frontend state mapping document with violation flags

---

### Task 6: Map ITR Switching Logic

**Files to search:**

- All files containing ITR type checks (`ITR-1`, `ITR-2`, `ITR-3`, `ITR-4`)
- Conditional logic based on ITR type
- ITR type validation logic

**Actions:**

- Find all ITR type checks in backend and frontend
- For each, annotate whether it should be:
  - Domain decision (only Domain Core can change ITR type)
  - Validation rule (validates ITR type but doesn't change it)
  - UI rendering only (displays based on ITR type)
- Flag any code that changes ITR type without Domain Core approval
- Document current ITR switching logic

**Output:** ITR switching logic mapping document

---

### Task 7: Map Override and Audit Points

**Files to search:**

- CA edit functionality
- Admin edit functionality
- System auto-correction logic
- Audit logging points

**Actions:**

- Find all override/edit points (CA edits, admin edits, auto-corrections)
- For each, annotate:
  - Which state this happens in
  - Whether override reason is mandatory
  - Whether audit is triggered
- Flag overrides that happen after `LOCKED` (should not be allowed)
- Document current override and audit mechanisms

**Output:** Override and audit mapping document

---

### Task 8: Annotate Finance and RBAC Hooks (Future)

**Files to analyze:**

- Payment/billing related code
- RBAC/middleware code

**Actions:**

- Annotate future billing hooks at:
  - `COMPUTED` - charge for computation
  - `LOCKED` - charge for locking
  - `FILED` - charge for filing
- Annotate RBAC checks:
  - Should only gate **who** can perform an allowed action
  - Should never decide **what** is allowed (Domain Core decides)
- Document current billing and RBAC implementation

**Output:** Finance and RBAC readiness annotation document

---

### Task 9: Generate Final Mapping Document

**Output document:** `docs/ITR_DOMAIN_CORE_MAPPING.md`

**Contents:**

1. **File → Lifecycle State(s) Mapping**

   - Each file mapped to its domain state(s)
   - Each method/function mapped to its state assumptions

2. **File → Allowed Actions Mapping**

   - What actions each file/method can perform
   - State-based action restrictions

3. **Violations List**

   - ❌ State violations (mutations in wrong state)
   - ❌ Logic leaks (frontend deciding legality)
   - ❌ Missing Domain Core checks

4. **Duplication List**

   - ⚠️ Logic duplication (same logic in multiple places)
   - ⚠️ State checks duplicated across files

5. **Missing Guards List**

   - 🟡 Missing Domain Core checks
   - 🟡 Missing state validation
   - 🟡 Missing ITR type validation

6. **Summary Assessment**

   - "Domain-ready" files
   - "Needs consolidation" files
   - "Unsafe logic" files

---

## Deliverables

1. **Domain State Definitions** (`backend/src/domain/states.js` - conceptual)
2. **Domain Core Module Structure** (`backend/src/domain/ITRDomainCore.js` - placeholder)
3. **Controller Annotations** (annotated controller files)
4. **Service Classification** (service classification document)
5. **Model Invariant Analysis** (model analysis document)
6. **Frontend State Mapping** (frontend mapping document)
7. **ITR Switching Logic Map** (ITR switching document)
8. **Override and Audit Map** (override/audit document)
9. **Finance and RBAC Annotations** (future hooks document)
10. **Final Mapping Document** (`docs/ITR_DOMAIN_CORE_MAPPING.md`)

---

## Non-Negotiable Rules

- **No refactoring** - only mapping and annotation
- **Domain Core is the single authority** for:
  - State transitions
  - ITR type decisions
  - Allowed actions
  - Recomputation/invalidation
- **Controllers, UI, services must NOT decide** these
- **All mutations, computations, ITR switches, locks must go through Domain Core** (future)
- **For now, just identify & mark**

---

## Success Criteria

- All ITR-related files mapped to domain states
- All state violations identified and flagged
- All logic duplication identified
- All missing Domain Core checks identified
- Clear mapping document produced
- Ready for next surgical refactoring step