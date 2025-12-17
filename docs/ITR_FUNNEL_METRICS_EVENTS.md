# ITR Funnel Metrics & Events

Goal: measure **drop-off** and **time-to-success** across the ITR journey without over-instrumenting.

Primary metrics:
- **Drop-off per step** (how many users reach each step)
- **Time to first save** (draft created/saved)
- **Time to first compute**
- **Time to submit** (future when submission is real)

## Event transport
- Frontend sends events to `POST /api/analytics/events`.
- Backend logs events (and later can persist to DB/warehouse).

## Event schema (v1)

```json
{
  "name": "itr_compute_clicked",
  "timestamp": "2025-12-17T12:00:00.000Z",
  "sessionId": "uuid",
  "journeyId": "uuid",
  "properties": {
    "role": "END_USER",
    "itrType": "ITR-3",
    "filingId": "uuid",
    "draftId": "uuid",
    "entryPoint": "guided|expert|auto|resume",
    "msSinceJourneyStart": 123456
  }
}
```

Notes:
- `sessionId`: stable per browser session (localStorage).
- `journeyId`: stable per filing journey (sessionStorage/localStorage; reset when starting a new filing).
- `msSinceJourneyStart`: derived client-side for simple time-to-* metrics.

## Canonical funnel events (minimum set)

### Auth / landing
- `auth_login_success` (after successful login)
- `auth_oauth_success` (after OAuth success)
- `home_redirect` (when `/home` resolves)
- `dashboard_view` (when END_USER lands on `/dashboard`)

### Filing start & identity
- `itr_start_clicked` (when user initiates filing from dashboard/CTA)
- `itr_select_person_view` (person selection screen loaded)
- `itr_person_selected` (self/family selected and can proceed)

### PAN verification
- `pan_verification_view`
- `pan_verification_success`
- `pan_verification_skipped` (already verified)

### Determine ITR (canonical)
- `itr_determine_view` (when `/itr/determine` loads)
- `itr_data_source_selected` (properties: `{ source: 'auto'|'upload'|'manual'|'override' }`)
- `itr_auto_detect_success` (properties: `{ recommendedITR, confidence }`)
- `itr_manual_fallback_used` (properties: `{ recommendedITR }` or `{ started: true }`)
- `itr_itr_override_used` (properties: `{ selectedITR }`)
- `itr_type_selected` (final ITR choice committed)

Legacy (kept for backward compatibility; routes now redirect to `/itr/determine`):
- `itr_determination_view`

### Draft & computation
- `itr_computation_view`
- `itr_collect_data_view`
- `itr_section_next_clicked`
- `itr_section_completed`
- `itr_draft_created` (first successful POST /itr/drafts)
- `itr_draft_saved` (PUT /itr/drafts/:id or manual save)
- `itr_save_and_exit` (save+exit action)
- `itr_compute_clicked`
- `itr_compute_success`

### Review & submit (future-ready)
- `itr_review_view`
- `itr_submit_clicked`
- `itr_submit_success`
- `itr_ack_view`
- `itr_everify_view`
- `itr_everify_success`

## Where to emit (current code anchors)
- Auth: `frontend/src/contexts/AuthContext.js`
- Dashboard: `frontend/src/pages/Dashboard/UserDashboard.js`
- Person selection: `frontend/src/components/ITR/FilingPersonSelector.js`
- PAN verification: `frontend/src/pages/ITR/PANVerification.js`
- ITR selection/recommend: `frontend/src/components/ITR/ITRFormRecommender.js`, `frontend/src/pages/ITR/ITRFormSelection.js`, `frontend/src/pages/ITR/IncomeSourceSelector.js`, `frontend/src/pages/ITR/ITRDirectSelection.js`
- Computation: `frontend/src/pages/ITR/ITRComputation.js`


