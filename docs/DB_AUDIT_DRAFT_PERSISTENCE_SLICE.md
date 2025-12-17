# DB Audit (Targeted) — Draft Persistence Slice

Scope: only the core “draft create/update/resume” path used by `/itr/computation` and `/dashboard` resume hub.

## Tables & columns (expected)

### `itr_drafts`
- `id` (UUID, PK, default UUID)
- `filing_id` (UUID, FK → `itr_filings.id`)
- `step` (varchar)
- `data` (JSONB, default `{}`) — canonical form data payload
- `is_completed` (boolean, default `false`)
- `last_saved_at` (timestamp)
- `created_at`, `updated_at` (timestamps, default `NOW()`)

### `itr_filings`
- `id` (UUID, PK, default UUID)
- `user_id` (UUID, FK → `users.id`)
- `status` includes: `draft`, `paused`, `submitted`, `acknowledged`, `processed`
- `assessment_year`, `itr_type`
- `json_payload` (JSONB, default `{}`)
- `idempotency_key` (optional; used for create draft idempotency)

## API endpoints (expected behavior)

### `POST /api/itr/drafts`
- Creates **both** filing and draft.
- Returns `draft.id` and `draft.filingId`.
- Must be idempotent when `X-Idempotency-Key` is supplied.

### `PUT /api/itr/drafts/:draftId`
- Updates `itr_drafts.data` and refreshes `updated_at` / `last_saved_at`.

### `GET /api/itr/drafts`
- Returns latest-first drafts for the user.
- **Must include** `filingId` so frontend can join drafts ↔ filings for deterministic resume.

## Notes / known risks

- `itr_drafts.data` vs `itr_filings.json_payload` are both JSONB; draft persistence should treat `itr_drafts.data` as the canonical working payload.
- Ensure DB defaults exist (`id`, timestamps, JSONB defaults) to avoid NOT NULL constraint violations in hosted DBs.


