# ITR Submit → E‑Verify → Acknowledgment (Canonical) — Spec

This defines the canonical transitions for the last part of the END_USER filing flow.

## Goal
Keep submission simple and reliable:
- one submit endpoint
- one canonical acknowledgment route
- optional e‑verification step

---

## Canonical endpoints (backend)
All submission should use these endpoints under `backend/src/routes/itr.js`:

- Validate draft: `POST /api/itr/drafts/:draftId/validate`
- Submit draft: `POST /api/itr/drafts/:draftId/submit`
- Filing details: `GET /api/itr/filings/:filingId`
- Acknowledgment PDF: `GET /api/itr/filings/:filingId/acknowledgment/pdf`
- ITR‑V lifecycle:
  - `GET /api/itr/filings/:filingId/verification`
  - `/api/itr/filings/:filingId/itrv/*`

---

## Canonical routes (frontend)
- Review: `/itr/review`
- Computation: `/itr/computation`
- E‑Verify: `/itr/e-verify`
- Acknowledgment (canonical): `/acknowledgment/:filingId`

Legacy compatibility:
- `/itr/acknowledgment` must redirect to `/acknowledgment/:filingId` when `filingId` is provided via query or state.

---

## Submission contract (frontend → backend)
`POST /api/itr/drafts/:draftId/submit` payload:
- `verificationMethod` (optional)
- `verificationToken` (optional)

Response expectations (minimum):
- `filing.id`
- `filing.acknowledgmentNumber` (or equivalent)

After success:
- navigate to `/acknowledgment/:filingId` and pass `ackNumber` in navigation state.

---

## DB audit checkpoint (targeted)
Before considering this step “done”, verify DB alignment for:
- `itr_drafts`:
  - `id` uuid default
  - `data` jsonb default `'{}'::jsonb`
  - `last_saved_at` default `NOW()`
- `itr_filings`:
  - `id` uuid default
  - `status` transitions include `draft → submitted`
  - `submitted_at` set on submission
  - `json_payload` and `tax_computation` not-null/default compatibility

Only audit tables/endpoints touched by review/submission/ack flows; avoid broad platform churn.

---

## Events
Emit:
- `itr_submit_clicked`
- `itr_submit_success`
- `itr_ack_view`
- `itr_everify_view`
- `itr_everify_success`


