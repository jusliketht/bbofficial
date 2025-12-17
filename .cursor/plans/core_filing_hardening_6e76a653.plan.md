---
name: Core filing hardening
overview: Stabilize the END_USER ITR filing core end-to-end by enforcing simple, required-only UX, normalizing API contracts, consolidating submit paths, and running a strict verification pass for refresh/resume/submit/ack/tracking.
todos:
  - id: api-contract-normalize-filing
    content: Normalize GET /api/itr/filings/:filingId to standardized successResponse shape and ensure frontend consumers remain compatible.
    status: completed
  - id: single-submit-path
    content: Verify and enforce single canonical submit path (Review only); remove/disable any residual submit semantics in computation UI.
    status: completed
    dependencies:
      - api-contract-normalize-filing
  - id: progressive-disclosure-sections
    content: Implement trigger-based visibility for optional sections (Balance Sheet, Audit, 44AE) and move visibility rules into sectionFlow as a single source of truth.
    status: completed
    dependencies:
      - single-submit-path
  - id: resume-refresh-hardening
    content: Harden refresh/direct-link/resume flows and returnTo across PAN gate/profile/review/ack.
    status: completed
    dependencies:
      - progressive-disclosure-sections
  - id: core-verification-report
    content: Run the core stability checklist end-to-end and produce a short report of remaining gaps with fixes.
    status: completed
    dependencies:
      - resume-refresh-hardening
---

# Core Filing Hardening (Design-first, END_USER)

## Goal

Make the ITR filing core **boringly stable** and **unambiguous** from signup → dashboard → PAN → determine → computation → review → submit → acknowledgment → tracking.

Core principles (apply to every step)

- **Simple, required-only**: hide optional complexity until triggered.
- **One primary action per screen**.
- **Deterministic state**: user choices never get overridden by stale state.
- **Single source of truth**: drafts/filings loaded from canonical stores; refresh-safe.
- **Consistent API contracts**: same response shapes across endpoints.

## Current baseline (already implemented)

- Determine ITR is canonical and spec-aligned (auto-first + recommendation panel):
- [`frontend/src/components/ITR/DataSourceSelector.js`](frontend/src/components/ITR/DataSourceSelector.js)
- [`frontend/src/components/ITR/DetermineITR/RecommendationPanel.js`](frontend/src/components/ITR/DetermineITR/RecommendationPanel.js)
- “ITR always becomes ITR-2” fixed by preventing stale localStorage overrides on explicit starts:
- [`frontend/src/pages/ITR/ITRComputation.js`](frontend/src/pages/ITR/ITRComputation.js)
- Schedule FA: hidden until triggered + correct data fetching:
- [`frontend/src/pages/ITR/ITRComputation.js`](frontend/src/pages/ITR/ITRComputation.js)
- [`frontend/src/features/foreign-assets/services/foreign-assets.service.js`](frontend/src/features/foreign-assets/services/foreign-assets.service.js)
- “File” now forces save before review so review is never stale:
- [`frontend/src/pages/ITR/ITRComputation.js`](frontend/src/pages/ITR/ITRComputation.js)
- Review submit paths consume wrapped responses correctly:
- [`frontend/src/pages/ITR/ITRReview.js`](frontend/src/pages/ITR/ITRReview.js)
- Gate A + Gate B are enforced (frontend + backend):
- [`frontend/src/pages/Onboarding/CompleteProfileGate.js`](frontend/src/pages/Onboarding/CompleteProfileGate.js)
- [`frontend/src/pages/ITR/ITRReview.js`](frontend/src/pages/ITR/ITRReview.js)
- [`backend/src/controllers/ITRController.js`](backend/src/controllers/ITRController.js)

## Phase 1 — Lock API contracts (remove “shape ambiguity”)

### 1.1 Normalize backend responses for core endpoints

Target: every core endpoint returns `successResponse({ data: ... })`.

- Update `GET /api/itr/filings/:filingId` in [`backend/src/routes/itr.js`](backend/src/routes/itr.js) to use `successResponse` and keep the payload under `data.filing`.
- Ensure errors use `errorResponse/validationErrorResponse` consistently.

### 1.2 Add a frontend unwrapping convention

Target: frontend services always return consistent shapes regardless of backend drift.

- Centralize unwrap helpers (already started in `itrService` and foreign assets service).
- Audit core services for raw usage:
- [`frontend/src/services/api/itrService.js`](frontend/src/services/api/itrService.js)
- [`frontend/src/services/everificationService.js`](frontend/src/services/everificationService.js)
- [`frontend/src/features/submission/services/submission.service.js`](frontend/src/features/submission/services/submission.service.js)

Acceptance:

- Refresh/direct-link to `/acknowledgment/:filingId` works reliably.
- No page assumes a single response shape.

## Phase 2 — Single canonical submit path

Target: submission happens in exactly one place: `/itr/review`.

- Ensure computation contains no “submit” semantics and only navigates to review (already aligned; verify no lingering submit CTA).
- Ensure review always:
- validates against latest draft (handled by forced save before navigation)
- blocks by Gate B (UI + backend)

Acceptance:

- No duplicate submit entry points for END_USER.

## Phase 3 — Progressive disclosure per ITR (no clutter)

Target: each ITR shows only what is required/applicable.

### 3.1 Replace unconditional section visibility with triggers

- **Schedule FA**: already hidden until triggered.
- Add the same pattern for:
- **Balance Sheet**: show only if `balanceSheet.hasBalanceSheet === true`
- **Audit**: show only if `auditInfo.isAuditApplicable === true`
- **Goods carriage (44AE)**: show only if user opts in / has vehicles

Implementation surface:

- Prefer moving visibility rules into [`frontend/src/pages/ITR/sectionFlow.js`](frontend/src/pages/ITR/sectionFlow.js) as the single source of truth.
- Keep computation rendering simple: render only `orderedSections`.

Acceptance:

- Sidebar never shows “irrelevant” sections for the selected ITR.
- Optional sections appear only when the user triggers them.

## Phase 4 — Resume + refresh safety (hardening)

Target: any core page should be refresh-safe.

- `/itr/computation?draftId=...` loads and stays editable.
- `/itr/review?draftId=...` loads and can submit.
- `/acknowledgment/:filingId` loads and shows consistent status.
- returnTo flows are robust across:
- [`frontend/src/pages/ITR/PANVerification.js`](frontend/src/pages/ITR/PANVerification.js)
- [`frontend/src/pages/Onboarding/CompleteProfileGate.js`](frontend/src/pages/Onboarding/CompleteProfileGate.js)
- [`frontend/src/pages/User/ProfileSettings.js`](frontend/src/pages/User/ProfileSettings.js)

## Phase 5 — Verification pass (find and close remaining gaps)

Run [`docs/ITR_CORE_STABILITY_CHECKLIST.md`](docs/ITR_CORE_STABILITY_CHECKLIST.md) end-to-end:

- New user
- Existing user
- Save vs Save&Exit
- Refresh on compute/review/ack
- Submit (success + Gate B fail)
- Tracking pages

Deliverable:

- A short “Core Filing Stability Report” listing any remaining gaps + exact fixes.

## Out of scope (explicit)

- CA firm workflow/queue stabilization (planned after END_USER core is stable).