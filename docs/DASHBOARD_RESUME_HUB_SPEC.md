# Dashboard Resume Hub (Core → Outward) — Spec

This document defines the canonical behavior for `/dashboard` as the **Resume Hub** for an end-user filing journey.

## Goals

- `/dashboard` should present **one obvious next action**:
  - **Continue** (if a resumable draft exists)
  - **Track** (if a filing was submitted)
  - **Start** (if user has no filings/drafts)
- Deep-links must be **deterministic** and should not depend on fragile client-only state.

## Source of truth for “Continue”

### Primary signal (preferred)
- `localStorage.itr_last_resume` written by `ITRComputation` on **Save** and **Save & Exit**.
- Shape (best-effort):
  - `draftId` (string UUID) — required for deterministic resume
  - `filingId` (string UUID) — optional
  - `assessmentYear` (string) — optional
  - `itrType` (string) — optional
  - `savedAt` (number epoch ms) — optional

### Fallback signal (server-backed)
- `GET /api/itr/drafts` (latest-first).
- Pick the **latest draft** where filing `status ∈ {draft, paused}`.
- The response must include `filingId` so the UI can join drafts ↔ filings.

## Deep-link rules

### Continue (draft resume)
- Navigate to: `/itr/computation?draftId=<draftId>&filingId=<filingId?>`
- **DraftId is canonical**. FilingId is additive (analytics/debug).

### Track (submitted filing)
- Navigate to: `/acknowledgment/<filingId>`
- Secondary track links (optional):
  - `/itr/itrv-tracking`
  - `/itr/refund-tracking`

### Start (new filing)
- Navigate to: `/itr/select-person`

## Save vs Save & Exit (landing)

- **Save**: persists draft and stays on `/itr/computation`.
- **Save & Exit**: persists draft and navigates to `/dashboard`.

## Non-goals (deferred)

- CA/firm/admin dashboards (separate UX tracks).
- Showing full “step completion” progress (until required-fields audit is stable).


