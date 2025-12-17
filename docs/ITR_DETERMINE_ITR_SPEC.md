# Determine ITR (Canonical Step) — Auto-first, Minimal Fallback

This is the single canonical “Determine ITR” step at route **`/itr/determine`**.

Goal: remove clutter by replacing multiple ITR-selection flows with **one** simple experience that:
- tries auto-detection first using the best available data,
- falls back to a tiny manual signal form only when necessary,
- always explains “why this ITR”, and
- always has a single primary CTA: **Continue**.

---

## Inputs & outputs

### Inputs (must)
- `selectedPerson` (self/family/client context)
- PAN status (verified/known)
- assessment year intent (default to current year)

### Outputs (must)
On “Continue”, navigate to `/itr/computation` with state:
- `selectedPerson`
- `selectedITR`
- `recommendation` (reason + confidence + triggered rules)
- `dataSource` (`auto|upload|manual`)
- `entryPoint` (always `determine`)

---

## Screen states (no clutter)

### State 0 — Gate (missing person)
If no `selectedPerson` is available:
- show a short message
- single CTA: “Select person” → `/itr/select-person`

### State 1 — Auto-first chooser (default)
Default screen shows **three** ways to determine ITR (auto-first):

1) **Connect & Auto-detect (Recommended)**
- Action: fetch AIS/26AS (and optional previous-year summary) → auto-detect ITR.
- If detection succeeds: show recommendation panel + **Continue** CTA.
- If detection fails: show friendly failure and offer fallback (State 3).

2) **Upload Form 16**
- Action: upload Form-16 → infer likely ITR and auto-fill salary/TDS.
- If inference succeeds: show recommendation panel + **Continue** CTA.
- If upload fails/unavailable: offer fallback (State 3).

3) **Answer a few questions (Fallback)**
- Action: show minimal manual signals questionnaire (4 “questions”; see State 3).

Small override (always visible, not a big card): **“I know my ITR”** → expert selection (ITR-1/2/3/4).

---

### State 2 — Recommendation panel (always consistent)
Whenever we have a recommendation (auto/upload/manual/expert), show:
- **Recommended ITR** (e.g., “ITR-2”)
- **Why this ITR** (1–3 bullets; plain language)
- **Confidence** (simple: “High / Medium / Low”)
- **Primary CTA**: “Continue”
- **Small override**: “Change ITR” (expert selection)

Copy (exact, simple):
- Heading: **“Recommended ITR”**
- Subtext: “We’ll set up your return for this ITR. You can edit if anything changes.”
- “Why this ITR” label: **“Why this ITR?”**

---

### State 3 — Manual fallback (max 4 “questions”)
Only show this if:
- auto-fetch fails, or
- confidence is low, or
- user chooses “Answer a few questions”.

Manual signals (minimal, mapped to existing guided flow):
- **Income sources**: Salary / Capital gains / Business / Freelance / House property / Foreign / Agriculture (>₹5k)
- **Total income range**: <₹50L / ₹50L–₹1Cr / >₹1Cr
- **Residency**: Resident / NRI-RNOR
- **Special cases**: Director / Unlisted shares / Foreign account authority / Foreign assets-income / Loss carryforward / None

Result must show the **Recommendation panel** (State 2) with “Why”.

---

### State 4 — Expert override (small, deterministic)
If user chooses “I know my ITR”:
- show ITR cards (ITR-1/2/3/4)
- on selection: show **Recommendation panel** (State 2) but with “Selected by you”

---

## Canonical route behavior
- Route: **`/itr/determine`**
- This route is the only entry for ITR determination.
- Old routes hard-redirect to `/itr/determine` and preserve `location.state`.

---

## Data mapping (implementation contract)

### What we pass to `/itr/computation`
We must navigate to `/itr/computation` with:
- `selectedPerson`
- `selectedITR` (string: `ITR-1|ITR-2|ITR-3|ITR-4`)
- `recommendation` (object if available; at minimum `{ reason, confidence }`)
- `dataSource` (existing internal label; keep for compatibility)
- `entryPoint` (`auto|upload|manual|override`)

---

## Metrics (events)
Emit these events via `trackEvent` (`POST /api/analytics/events`):
- `itr_determine_view` (screen view)
- `itr_data_source_selected` (properties: `{ source: 'auto'|'upload'|'manual'|'override' }`)
- `itr_auto_detect_success` (properties: `{ recommendedITR, confidence }`)
- `itr_manual_fallback_used` (properties: `{ recommendedITR }`)
- `itr_itr_override_used` (properties: `{ selectedITR }`)

---

## Acceptance criteria
- There is exactly **one** user-facing way to determine ITR: `/itr/determine`.
- Any attempt to open the legacy determination routes lands on `/itr/determine` (with state preserved).
- Auto-first is the primary path; manual fallback only appears when needed or explicitly chosen.
- The user always sees **a clear recommendation + reason + a single “Continue” CTA**.
