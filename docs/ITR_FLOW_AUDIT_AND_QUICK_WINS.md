# ITR Flow Audit + Quick Wins Backlog

This audit compares the **canonical core journey** to the current platform routing/screens and lists actionable fixes.

References:
- Core spec: `[docs/ITR_USERFLOW_CORE_SPEC.md](docs/ITR_USERFLOW_CORE_SPEC.md)`
- Variants: `[docs/ITR_VARIANTS_AND_PROGRESSIVE_DISCLOSURE.md](docs/ITR_VARIANTS_AND_PROGRESSIVE_DISCLOSURE.md)`
- Prior analysis: `[docs/reference/itr-flow-analysis.md](docs/reference/itr-flow-analysis.md)`

---

## What we verified (current reality)

### Canonical end-user funnel exists in code *as pages/components*
- `/itr/start` → `/itr/select-person`
- `/itr/pan-verification`
- `/itr/recommend-form`
- `/itr/computation`

### Critical routing gap (P0)
Those two routes were being navigated to by UI components, but were not declared in the router. This breaks the journey even if individual screens are correct.

**Fixed**: `frontend/src/App.js` now registers:
- `/itr/pan-verification` → `frontend/src/pages/ITR/PANVerification.js`
- `/itr/recommend-form` → `frontend/src/components/ITR/ITRFormRecommender.js`

---

## Current duplication / fragmentation (design + product risk)

### 1) Multiple “Determine ITR” entry points (needs convergence)
Current routes that determine ITR in different ways:
- `/itr/mode-selection` (expert/guided/auto mode)
- `/itr/income-sources` (guided source selection)
- `/itr/select-form` (questionnaire)
- `/itr/recommend-form` (rule engine + optional backend)
- `/itr/direct-selection` (expert selection)

**Risk**: user bounces between “choose ITR” experiences; harder to maintain correctness.

### 2) Two computation routes
Both currently render the same computation page:
- `/itr/computation`
- `/itr/filing/:filingId/*`

**Risk**: different entry state (URL/state params) can create inconsistent behavior unless draft identity and navigation rules are centralized.

### 3) CA context is not yet a single filing entry
CA surfaces exist (firm dashboard/clients/review queue), but there’s no canonical “Open this client’s filing in computation” flow.

---

## Quick wins backlog (prioritized)

### P0 — must fix (journey blockers)
1. **Route completeness**: ensure every navigated route is registered in `App.js` (fixed for PAN + recommender).
2. **Canonical funnel navigation**: END_USER should always have one “happy path” that works without branching confusion.

### P1 — should fix (reduces churn + improves completion)
3. **Converge ITR determination**: pick one canonical “Determine ITR” UI and make others link to it (keep expert shortcut).
4. **One source-of-truth for “current filing”**: prefer `filingId + draftId` as URL query params for all computation entries.
5. **Review step consolidation**: convert “File” into a single checklist step with must-fix gating.

### P2 — scale enablers (CA-grade + multi-year)
6. **Onboarding wizard**: separate onboarding from filing, minimal essentials first.
7. **Year selection**: stop hardcoding AY; add a controlled selector and persist per filing.
8. **CA review gate**: connect “caReviewRequired” (rule engine) to the CA review queue and audit trail.

---

## “One step at a time” implementation rhythm
1. Keep the core draft→compute→review→file loop stable.
2. Add one ITR-variant module at a time (ITR-3 business modules are the largest chunk).
3. Every step ships with:
   - success criteria
   - fallback behavior (manual entry if prefill fails)
   - clear next action on-screen


