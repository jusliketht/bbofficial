---
name: Converge Determine ITR
overview: Create one auto-first Determine-ITR step (fetch-first, minimal fallback) and hard-redirect all other ITR selection routes to it, so the journey becomes simple and non-cluttered.
todos:
  - id: design-determine-itrscreen
    content: Write docs/ITR_DETERMINE_ITR_SPEC.md (states, copy, fallback questions, acceptance criteria).
    status: completed
  - id: build-determine-screen
    content: Implement /itr/determine screen using existing DataSourceSelector + ITRAutoDetector + backend /itr/recommend-form cross-check.
    status: completed
  - id: redirect-old-routes
    content: Hard redirect old Determine-ITR routes to /itr/determine, preserving location.state.
    status: completed
  - id: extend-metrics
    content: Add Determine-ITR events and emit them from the new screen.
    status: completed
---

# Next Step: One Auto-First “Determine ITR” Screen

## Design (what “simple” means here)

We will replace the current multiple “ITR selection” experiences with **one canonical step** that is **auto-first**:

- **Primary action**: Fetch/import data (IT portal/AIS/26AS/ERI) → auto-detect ITR.
- **Secondary action**: Upload Form-16 / documents → infer likely ITR.
- **Fallback**: a *very short* “manual signals” form (4–6 questions) only if fetch/import can’t determine confidently.
- **Always show**: Recommended ITR + “Why this ITR” + “Continue” + small “I know my ITR” override.

## Canonical route (single source of truth)

- Add a single route: **`/itr/determine`**
- Input: `selectedPerson`, PAN status, assessment year intent.
- Output: `selectedITR` + `recommendation` + `dataSource` → navigates to `/itr/computation`.

## Hard de-clutter (your choice)

All existing ITR-determination routes will **hard redirect** into the canonical route:

- `/itr/mode-selection`
- `/itr/select-form`
- `/itr/income-sources`
- `/itr/direct-selection`
- `/itr/recommend-form`

They will preserve any existing `location.state` data and pass it through to `/itr/determine`.

## Implementation (code changes after design is written)

### 1) Create the canonical Determine screen

- Add [`frontend/src/pages/ITR/DetermineITR.js`](frontend/src/pages/ITR/DetermineITR.js)
- Reuse existing logic instead of rewriting:
- Use `DataSourceSelector` behavior/ideas from [`frontend/src/components/ITR/DataSourceSelector.js`](frontend/src/components/ITR/DataSourceSelector.js) for auto-first fetch.
- Use rules engine from [`frontend/src/services/ITRAutoDetector.js`](frontend/src/services/ITRAutoDetector.js).
- Optionally cross-check with backend using existing `POST /api/itr/recommend-form`.

### 2) Wire routing and redirects

- Update [`frontend/src/App.js`](frontend/src/App.js):
- Add route `/itr/determine`.
- Change the 5 old selection routes to redirect to `/itr/determine`.

### 3) Make “Proceed” consistent

- After determination, navigate to `/itr/computation` with state:
- `selectedPerson`, `selectedITR`, `recommendation`, `dataSource`, `entryPoint: 'auto'|'upload'|'manual'`.

### 4) Documentation (design-first)

- Add `docs/ITR_DETERMINE_ITR_SPEC.md` describing:
- Screen states (fetch success, fetch failure, low-confidence fallback)
- Exact copy (“Why this ITR”, reassurance)
- What data we ask in fallback (max 4–6 answers)

### 5) Metrics (already plumbed; extend events)

- Extend the event spec in [`docs/ITR_FUNNEL_METRICS_EVENTS.md`](docs/ITR_FUNNEL_METRICS_EVENTS.md) with:
- `itr_determine_view`, `itr_data_source_selected`, `itr_auto_detect_success`, `itr_manual_fallback_used`, `itr_itr_override_used`.

## Acceptance criteria

- There is exactly **one** user-facing way to determine ITR: `/itr/determine`.
- Any attempt to open the other determination routes lands on `/itr/determine`.
- Auto-first works; fallback only appears when needed.
- The user always sees a clear recommendation + reason + single “Continue” CTA.