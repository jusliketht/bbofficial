# Tracking Slice (Ack / ITR‑V / Refund) — Spec

This document defines the minimal, “not a new product” tracking slice that completes the post-filing loop.

## Entry points

- **Acknowledgment**: `/acknowledgment/:filingId`
  - Primary CTAs:
    - Download acknowledgment PDF
    - Download full ITR PDF
    - Track ITR‑V (opens `/itr/itrv-tracking?filingId=:filingId`)
    - Track refund (opens `/itr/refund-tracking?filingId=:filingId`)
    - Back to dashboard

- **ITR‑V tracking**: `/itr/itrv-tracking`
  - If `filingId` query param exists, show status for that filing.
  - If missing, show a lightweight “Pick a filing” list from latest completed filings.

- **Refund tracking**: `/itr/refund-tracking`
  - Always shows refund history.
  - If `filingId` query param exists, also shows “Current refund status” for that filing.
  - If missing, show a lightweight “Pick a filing” list to view current status.

## Data requirements

### Filing details for acknowledgment and linking

`GET /api/itr/filings/:filingId` must return:
- `filing.id`
- `filing.itrType`
- `filing.status`
- `filing.submittedAt`
- `filing.assessmentYear`
- `filing.acknowledgmentNumber` (nullable)
- `filing.verificationMethod` (nullable)

## Status display rules

- Acknowledgment page shows the **actual filing status** (submitted/acknowledged/processed).
- Do not show fake/mock acknowledgment numbers; show `acknowledgmentNumber` if present, else show `filingId` as reference.


