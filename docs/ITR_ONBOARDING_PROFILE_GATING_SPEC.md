# Minimal Onboarding (Hybrid Profile Gating) — Spec

This spec defines the **minimum** end-user onboarding requirements to keep the ITR filing journey simple and CA-like.

## Principles

- **Don’t block early** unless a missing field would make the next step meaningless.
- **Hard-gate only what’s essential** to start computation.
- **Hard-gate submit** on items that are legally/operationally required to file.

## Gate A (hard gate before `/itr/computation`)

Users **must not enter** `/itr/computation` unless:

- PAN is verified: `user.panVerified === true`
- Date of birth is present: `user.dateOfBirth` is set

If Gate A fails, redirect to:

`/onboarding/complete-profile?returnTo=<original_url>`

### UX copy

- Title: “Complete your profile to continue”
- Subtext: “We need a couple of basics before we start your filing.”

## Gate B (hard gate at Submit)

Users **can compute and review** without these, but **cannot submit** unless:

- Address is present: `addressLine1`, `city`, `state`, `pincode`
- Bank details are present in the draft: `bankDetails.accountNumber` and `bankDetails.ifsc`

### UX behavior

- When the user clicks Submit, if Gate B fails:
  - Block submit
  - Show a small list of missing items with **Fix now** CTAs:
    - Bank → jump to computation section `bankDetails`
    - Address → send user to `/profile` (so they can update address) and then retry submit

## Source of truth

- Profile (PAN verified + DOB + address): `GET /api/auth/profile`
- Draft bank details: `GET /api/itr/drafts/:draftId` (via `draft.formData.bankDetails`)


