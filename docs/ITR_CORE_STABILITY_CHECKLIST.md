# ITR Core Stability Checklist (END_USER)

Use this checklist to verify the **core filing journey** stays stable after changes.

## A) Happy path (first-time user)

1. **Login/Signup** → land on `/home` → `/dashboard`
2. **Start filing** from dashboard → `/itr/select-person`
3. Select **Self** → `/itr/pan-verification`
4. Verify PAN → `/itr/determine`
5. Pick data source / confirm recommended ITR → enter `/itr/computation`
6. Complete guided sections (Next works, soft-gating works)
7. **Save** keeps user on computation
8. **Save & Exit** lands on `/dashboard`
9. **File** from computation → `/itr/review`
10. Validate → submit → `/acknowledgment/:filingId`
11. From acknowledgment, open:
    - ITR‑V tracking (`/itr/itrv-tracking?filingId=...`)
    - Refund tracking (`/itr/refund-tracking?filingId=...`)

## B) Resume reliability

1. After **Save & Exit**, `/dashboard` shows a primary **Continue** CTA
2. Continue deep-links using **draftId**:
   - `/itr/computation?draftId=...&filingId=...`
3. Refresh browser on computation page:
   - draft loads from backend and remains editable

## C) Gate A (hard gate before computation)

Expected: END_USER cannot enter computation unless:
- `panVerified === true`
- `dateOfBirth` exists

Tests:
1. Try to enter `/itr/computation?...` without PAN verified → redirect to:
   - `/onboarding/complete-profile?returnTo=<original>`
2. Complete PAN verification and DOB → auto-return to `returnTo`

## D) Gate B (hard gate at submit)

Expected: user can compute/review, but submit requires:
- Address (addressLine1, city, state, pincode) from profile
- Bank details (accountNumber, ifsc) from draft

Tests:
1. Missing address → submit blocked, CTA routes to `/profile?returnTo=<review>`
2. Missing bank → submit blocked, CTA routes to computation `bankDetails` section
3. Backend also blocks submit with actionable validation errors if client bypasses UI

## E) Direct navigation + refresh safety

1. `/acknowledgment/:filingId` loads after refresh
2. `/itr/itrv-tracking` with missing `filingId` shows “pick a filing”
3. `/itr/refund-tracking` with missing `filingId` shows history + “pick a filing”

## F) Read-only safety

1. Opening a completed filing should set view mode to **readonly**
2. Readonly mode should never “leak” into a new/editable filing after starting fresh


