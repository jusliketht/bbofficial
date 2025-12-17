---
name: Review Submit Ack
overview: "Plan the next userflow step after guided Collect Data: add a simple Review & Validate step, wire Submit + E-Verify + Acknowledgment into canonical routes, and include targeted DB audit + UI/UX consistency checkpoints."
todos: []
---

# Next Step: Review & Validate → Submit → E-Verify → Acknowledgment

## Goal (simple, design-first)

After “Collect Data” is guided inside `/itr/computation`, the next step is a single, calm checkpoint where users:

- see **must-fix vs recommended** issues,
- fix them quickly by jumping back to the right section,
- submit once, then land on acknowledgment + optional e-verification.

This step is where we also add **targeted DB audit** and **UI/UX matching** checkpoints so the funnel stays correct and consistent.

---

## Design docs (write first)

Create 2 short docs (no overdesign):

- `docs/ITR_REVIEW_VALIDATE_SPEC.md`
- Must-fix vs recommended rules
- Minimal screen layout + exact copy
- “Fix now” behavior (jump back to computation section)
- `docs/ITR_SUBMIT_EVERIFY_ACK_SPEC.md`
- Canonical route transitions
- What is stored where (`itr_filings`, `itr_drafts`, itrv status)
- Error states (submission failed, e-verify failed)

Update metrics spec (small diff):

- `docs/ITR_FUNNEL_METRICS_EVENTS.md`
- Add: `itr_review_view`, `itr_submit_clicked`, `itr_submit_success`, `itr_ack_view`, `itr_everify_view`, `itr_everify_success`

---

## Frontend implementation (keep it minimal)

### 1) Add a single Review route (canonical)

- Add route `/itr/review` in [`frontend/src/App.js`](frontend/src/App.js)
- Add page: `frontend/src/pages/ITR/ITRReview.js`
- Reuse existing UI where possible:
- [`frontend/src/features/submission/components/validation-runner.jsx`](frontend/src/features/submission/components/validation-runner.jsx)
- Optional: reuse `SubmissionSuccess` for the “submitted” state (`frontend/src/features/submission/components/submission-success.jsx`)

### 2) Wire computation → review

- In [`frontend/src/pages/ITR/ITRComputation.js`](frontend/src/pages/ITR/ITRComputation.js)
- Add a single CTA (button) that navigates to `/itr/review` with minimal state:
- `draftId`, `filingId`, `selectedITR`, `assessmentYear`
- On review page, prefer fetching the draft via `GET /api/itr/drafts/:draftId` using [`frontend/src/services/api/itrService.js`](frontend/src/services/api/itrService.js) (`getDraftById`) rather than passing the full `formData` through navigation.

### 3) “Fix now” jumps back to the right section

- Add support in computation to accept an optional `initialSectionId` from `location.state` and set `activeSectionId` accordingly.
- Review page buttons should navigate back to `/itr/computation` with `initialSectionId`.

### 4) Submit + Acknowledgment (canonical)

- Use the backend’s existing canonical submit endpoint:
- `POST /api/itr/drafts/:draftId/submit` (exists in [`backend/src/routes/itr.js`](backend/src/routes/itr.js))
- After success:
- Navigate to canonical acknowledgment route:
- Prefer `/acknowledgment/:filingId` (already exists in [`frontend/src/App.js`](frontend/src/App.js))
- Standardize routing by making `/itr/acknowledgment` redirect to `/acknowledgment/:filingId` (so `Acknowledgment` always has `filingId`).
- If e-verification is required:
- Navigate to `/itr/e-verify` (already exists) with `{ filingId, acknowledgmentNumber }`.

---

## Backend/DB audit checkpoint (targeted, not broad)

We’ll do a focused audit only for what this step touches:

- **Routes**: confirm behavior + payload shapes:
- `POST /api/itr/drafts/:draftId/validate`
- `POST /api/itr/drafts/:draftId/submit`
- `GET /api/itr/filings/:filingId`
- `GET /api/itr/filings/:filingId/acknowledgment/pdf`
- ITR-V endpoints under `/api/itr/filings/:filingId/itrv/*`
- **Tables/columns** (ensure defaults + not-null constraints align):
- `itr_filings` (status, submitted_at, json_payload, tax_computation)
- `itr_drafts` (data jsonb, last_saved_at)
- any itrv tracking tables already migrated
- Use existing audit scripts/reports as the mechanism (don’t invent new ones unless needed):
- `scripts/full-db-audit.js` and docs in `docs/FULL_DB_AUDIT_REPORT.md`

---

## UI/UX matching checkpoint (keep it simple)

For any new/edited review/submission UI:

- Use design system tokens/components (no raw `blue-600` etc).
- Use consistent error UI (`ErrorMessage` component) and consistent loading states.
- Run a **small-scope** UX discrepancy check on only the new/changed files (avoid repo-wide churn).

---

## Acceptance criteria

- There is a single canonical review step: `/itr/review`.
- Review shows must-fix vs recommended and can jump back to fix.
- Submit uses `POST /api/itr/drafts/:draftId/submit` and lands on acknowledgment.
- Acknowledgment always has a `filingId` (canonical route), and e-verify is reachable and consistent.
- DB schema + endpoints for submission/ack are verified for this slice.
- UI stays aligned to the design system (no new token drift).