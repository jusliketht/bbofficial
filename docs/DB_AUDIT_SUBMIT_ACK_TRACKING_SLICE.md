# DB Audit (Targeted) — Submit / Acknowledgment / Tracking Slice

Scope: post-submit loop only: submission → acknowledgment → ITR‑V tracking → refund tracking.

## Tables & columns (expected)

### `itr_filings`
Required for this slice:
- `status` transitions: `draft/paused` → `submitted` → `acknowledged` → `processed`
- `submitted_at` (timestamp)
- `acknowledgment_number` (varchar, nullable) — canonical ack number used by UI + PDF
- `ack_number` (varchar, nullable) — legacy/alternate field; some code may still write here
- `verification_method` (varchar, nullable)
- `verification_status` (varchar, default `pending`)
- `tax_computation` (jsonb, optional for downloads)

### `itrv_processing` (or equivalent)
Used by ITR‑V tracking endpoints under `/api/itr/filings/:filingId/itrv/*`.

### `refund_tracking` (optional)
Backend already treats missing table as non-fatal and returns empty history.

## API endpoints (expected behavior)

### `POST /api/itr/drafts/:draftId/submit`
- Returns `data.filing.acknowledgmentNumber` (nullable until ERI fills) and `verificationMethod` (nullable).

### `GET /api/itr/filings/:filingId`
- Must return `filing.acknowledgmentNumber` and `filing.verificationMethod` (nullable).
- Used by `/acknowledgment/:filingId` page after refresh (no reliance on navigation state).

### `GET /api/itr/filings/:filingId/acknowledgment/pdf`
- Must read ack number from DB (`acknowledgment_number` OR `ack_number`) to avoid model drift.

### ITR‑V tracking
- `POST /api/itr/filings/:filingId/itrv/initialize`
- `GET  /api/itr/filings/:filingId/itrv/status`
- `POST /api/itr/filings/:filingId/itrv/check-status`
- `POST /api/itr/filings/:filingId/itrv/verify`

### Refund tracking
- `GET  /api/itr/filings/:filingId/refund/status`
- `POST /api/itr/filings/:filingId/refund/update-account`
- `POST /api/itr/filings/:filingId/refund/reissue-request`
- `GET  /api/itr/refunds/history`

## Notes / known risks

- Ensure `acknowledgment_number` is consistently used as the canonical ack field; `ack_number` should be treated as fallback only.
- Keep response shapes aligned with the shared response formatter pattern (`{ success, data }`).


