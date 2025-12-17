# Collect Data (Guided, Single-Page) — Spec

This spec defines the **guided “Collect Data” experience** inside the existing single-page computation flow (`/itr/computation`). It applies to **ITR-1/2/3/4** and follows the core userflow principle: **progressive disclosure** (show only what’s relevant) with **one next action** at a time.

## Goal
- Convert the computation screen into a CA-like checklist:
  - clear section order
  - a primary **Next** action
  - completion cues (“Incomplete” vs “Done”)
  - still allows jumping to any visible section (soft gating)

Non-goals:
- Changing tax computation behavior (compute remains **manual**).
- Rebuilding the page into a multi-route wizard.

---

## Canonical section order (base)
Base order (for all ITRs):

1. `personalInfo`
2. `income`
3. `deductions`
4. `taxesPaid`
5. `bankDetails`
6. `taxComputation` (review/compute state)
7. `taxOptimizer` (optional; never blocks)

### ITR-specific insertions (progressive disclosure)
Sections are inserted into the base order when applicable:

- **ITR-2**:
  - Insert `scheduleFA` after `income` (only shown if ITR requires it).

- **ITR-3**:
  - Insert after `income`: `businessIncome`, `professionalIncome`
  - Insert after those: `balanceSheet`, `auditInfo`
  - Insert `scheduleFA` after `auditInfo` (if applicable)

- **ITR-4**:
  - Insert after `income`: `presumptiveIncome`, `goodsCarriage` (if shown)

---

## Soft gating (default behavior)
Soft gating means:
- The primary CTA **Next** is disabled when the **current section** is missing required information.
- The user can still jump to any visible section via the sidebar.
- Sections show a small “Incomplete” indicator (count of missing required items) until complete.

This keeps the experience simple without “blocking walls”.

---

## Required fields (minimum viable)
These are “required to proceed” for the **Next** CTA only (not necessarily legal submission requirements).

### `personalInfo` (must)
- `personalInfo.pan`
- `personalInfo.name`
- `personalInfo.dateOfBirth`

### `income` (must)
At least one meaningful income signal must exist. Examples that qualify:
- `income.salary > 0`
- OR other sources total > 0
- OR capital gains details present (for ITR-2/3)
- OR business/professional/presumptive structures contain entries/amounts (for ITR-3/4)
- OR house property entries present

### `bankDetails` (must)
- `bankDetails.accountNumber`
- `bankDetails.ifsc`

### Optional (never blocks Next)
- `deductions`
- `taxesPaid`
- `scheduleFA`
- `taxOptimizer`
- `balanceSheet` and `auditInfo` only block Next when the user explicitly turns them “on” (e.g., `hasBalanceSheet` / `isAuditApplicable`)

---

## Completion rules (UI)
For each visible section, show one of:
- **Done**: section has required items
- **Incomplete**: missing required items (show count)
- **Error/Warning**: existing validation errors/warnings (these override “Done/Incomplete”)

---

## UX copy (minimal, reassuring)
- Header helper (top of computation): “Complete the sections in order. You can jump to any section.”
- Next button labels:
  - `Next: Income`, `Next: Deductions`, etc.
  - On last actionable section: hide Next (compute is separate).

---

## Analytics events
Emit via `trackEvent` (`POST /api/analytics/events`):
- `itr_collect_data_view` (once on computation view, alongside existing `itr_computation_view`)
- `itr_section_next_clicked` (properties: `{ fromSectionId, toSectionId, itrType }`)
- `itr_section_completed` (properties: `{ sectionId, itrType }` — once per section per journey)


