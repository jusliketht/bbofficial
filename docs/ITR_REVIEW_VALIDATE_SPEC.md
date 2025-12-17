# ITR Review & Validate (Canonical) — Spec

This defines the **single canonical review checkpoint** that comes after “Collect Data” and before submission.

Route: **`/itr/review`**

## Goal
- Show a calm, CA-like checklist of issues:
  - **Must fix** (blocks submit)
  - **Recommended** (non-blocking, user can acknowledge)
- Make it effortless to fix issues by jumping back to the exact section in `/itr/computation`.

Non-goals:
- No multi-page wizard.
- No new “compute on change”.

---

## Inputs (contract)
From computation we pass only identifiers (no large payloads):
- `draftId` (required)
- `filingId` (optional but preferred if available)
- `selectedITR`
- `assessmentYear`

The review page must fetch the draft via `GET /api/itr/drafts/:draftId`.

---

## Validation model
Validation output is normalized to:
- `mustFix[]`: blocking errors (section + message + optional field)
- `recommended[]`: warnings/info (section + message + optional field)

Rules:
- If `mustFix.length > 0`: **Submit disabled**
- If `mustFix.length === 0`:
  - Submit enabled once all **unacknowledged** recommended items are acknowledged **OR**
  - (simpler) Submit enabled and recommended items are never blocking (MVP choice). We will start with **acknowledge-to-proceed** only if it’s already implemented; otherwise keep warnings non-blocking.

---

## UI structure (minimal)
1) Header:
- Title: “Review & Submit”
- Subtext: “Fix must‑fix issues. Recommended items are optional.”

2) Summary cards:
- Must fix count
- Recommended count
- Sections completed count

3) Issue lists:
- Must fix list with **Fix now** button per item/section
- Recommended list with **Acknowledge** toggle (if supported)

4) Primary CTA:
- “Submit” (disabled if must-fix exist)

---

## Fix-now navigation
`Fix now` navigates back to `/itr/computation` with:
- `initialSectionId` (e.g., `personalInfo`, `income`, `deductions`, `taxesPaid`, `bankDetails`, `businessIncome`, `professionalIncome`, `balanceSheet`, `auditInfo`, `scheduleFA`, `presumptiveIncome`)

Computation must accept `initialSectionId` and focus that section.

---

## Events
Emit:
- `itr_review_view`
- `itr_section_fix_clicked` (properties: `{ sectionId }`)


