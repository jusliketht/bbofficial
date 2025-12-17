---
name: Collect Data Guided Flow
overview: "Define and implement the next canonical step after /itr/determine: a guided, progressive-disclosure “Collect Data” experience inside the existing single-page ITR computation flow, across ITR-1/2/3/4."
todos:
  - id: doc-collect-data-spec
    content: Create docs/ITR_COLLECT_DATA_GUIDED_SPEC.md defining section order, soft gating, required fields, and ITR-1/2/3/4 progressive disclosure.
    status: completed
  - id: sectionflow-config
    content: Implement a section flow config (order + required fields) for ITR-1/2/3/4 to drive guided navigation.
    status: completed
    dependencies:
      - doc-collect-data-spec
  - id: guided-nav-mechanics
    content: Add orderedSections, section completion status, and Next/Prev navigation logic to ITRComputation using existing validation hooks.
    status: in_progress
    dependencies:
      - sectionflow-config
  - id: ui-guided-cta
    content: Update header + sidebar to show Next CTA and completion badges while preserving ability to jump sections (soft gating).
    status: pending
    dependencies:
      - guided-nav-mechanics
  - id: metrics-collect-data
    content: Add minimal analytics events for collect-data and section progression.
    status: pending
    dependencies:
      - ui-guided-cta
---

# Next Step: Guided “Collect Data” inside ITR computation

## Goal

Make the ITR experience feel like a simple CA-led checklist after `/itr/determine`: users see only the sections relevant to their chosen ITR, complete the minimum required inputs first, and proceed section-by-section with a clear “Next” path (while still allowing edits).

## Design-first documentation (must happen before code)

- Add a new spec: [`docs/ITR_COLLECT_DATA_GUIDED_SPEC.md`](docs/ITR_COLLECT_DATA_GUIDED_SPEC.md)
- Define the canonical section order: `personalInfo → income → deductions → taxesPaid → bankDetails → review/compute`
- Define **soft gating** rules (recommended default):
- “Next” is disabled until required fields in the current section are valid
- User can still jump to any visible section via sidebar (shows “Incomplete” badge)
- Define ITR-specific disclosure using existing section IDs from `ITRComputation`:
- ITR-1: hide business/professional/balance-sheet/audit/scheduleFA/presumptive (already implemented)
- ITR-2: hide business/professional/balance-sheet/audit/presumptive (already implemented)
- ITR-3: show business/professional/balance-sheet/audit/scheduleFA
- ITR-4: show presumptive/goodsCarriage; hide scheduleFA/balance-sheet/audit
- Copy guidelines for the UI (short, reassuring, 1–2 lines per state)

## Code changes (implement to match the spec)

### 1) Extract “section flow” config (single source of truth)

- Create a small config that maps:
- section order per ITR
- required fields per section
- optional sections per ITR
- Implement it close to the computation flow for now to keep it simple:
- Suggested new file: [`frontend/src/pages/ITR/sectionFlow.js`](frontend/src/pages/ITR/sectionFlow.js)
- Reuse section IDs already used in [`frontend/src/pages/ITR/ITRComputation.js`](frontend/src/pages/ITR/ITRComputation.js)

### 2) Add “guided flow” mechanics to computation

- In [`frontend/src/pages/ITR/ITRComputation.js`](frontend/src/pages/ITR/ITRComputation.js):
- Keep using the existing `sections` filtering and `activeSectionId` logic.
- Add derived state:
- `orderedSections` (based on ITR + spec order)
- `sectionStatus` (complete/incomplete) using existing validation sources:
- Prefer `useRealTimeValidation` + per-section required field list
- Add handlers:
- `goNextSection()` / `goPrevSection()`
- `canProceedFromSection(activeSectionId)`

### 3) Update UI components to expose the guided experience

- Update header to add a primary “Next” CTA (contextual label like “Next: Income”):
- [`frontend/src/components/ITR/ITRComputationHeader.js`](frontend/src/components/ITR/ITRComputationHeader.js)
- Update sidebar to show:
- ordered sections
- completion badges
- allow jumping (soft gating)
- File: [`frontend/src/components/ITR/ComputationSidebar.js`](frontend/src/components/ITR/ComputationSidebar.js)

### 4) Ensure Determine → Compute handoff supports the guided flow

- Confirm `/itr/determine` passes the minimal state already used by computation:
- `selectedPerson`, `selectedITR`, `recommendation`, `entryPoint`
- Optionally show the recommendation/why at top of computation once (non-blocking).

## Metrics

Extend funnel tracking minimally (design-first, then implement):

- Add events:
- `itr_collect_data_view`
- `itr_section_next_clicked`
- `itr_section_completed`
- Emit via `trackEvent` in computation flow.

## Acceptance criteria

- `/itr/computation` behaves as a guided checklist for **all ITRs (1/2/3/4)**.
- Only relevant sections are shown for the selected ITR.
- Users have a single primary path forward (Next), but can still jump around.
- No new “compute on every change” behavior is introduced.