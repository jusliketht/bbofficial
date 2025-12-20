---
name: Phase 3 DB Schema Alignment
overview: Normalize lifecycle_state enum, add immutability metadata fields, support ITR type freezing, improve version traceability, and verify referential discipline. All changes are additive and safe - no triggers or business logic in SQL.
todos: []
---

# Phase 3: DB Schema Alignment

## Objective

Make Supabase schema reflect Domain Core states without breaking data, refactoring, or adding triggers. This is structural integrity work, not feature work.

## Current State Analysis

### `itr_filings` table

- Current `status`: ENUM('draft', 'paused', 'submitted', 'acknowledged', 'processed', 'rejected')
- Mapping exists in `backend/src/middleware/domainGuard.js:mapStatusToDomainState()` to convert to domain states
- Missing: `lifecycle_state`, `locked_at`, `locked_by`, `filed_at`, `filed_by`, `computation_version`, `computed_at`, `computed_by`
- `itr_type` is NOT NULL but should be nullable initially
- `regime` exists but should be renamed to `regime_selected` for clarity

### `itr_drafts` table

- No status/lifecycle column currently
- Does not need lifecycle_state (inherits from parent filing)

### `return_versions` table

- No status/lifecycle column currently
- Does not need lifecycle_state (version history, not active state)

## Step 3.1: Normalize Lifecycle State (MANDATORY)

### Action

**File:** `backend/src/scripts/migrations/add-lifecycle-state-enum.js` (new migration)

1. Create PostgreSQL ENUM type for lifecycle states:
   ```sql
   CREATE TYPE itr_lifecycle_state AS ENUM (
     'DRAFT_INIT',
     'ITR_DETERMINED',
     'DATA_COLLECTED',
     'DATA_CONFIRMED',
     'COMPUTED',
     'LOCKED',
     'FILED',
     'ACKNOWLEDGED',
     'COMPLETED'
   );
   ```

2. Add `lifecycle_state` column to `itr_filings`:
   ```sql
   ALTER TABLE itr_filings 
   ADD COLUMN lifecycle_state itr_lifecycle_state;
   ```

3. Migrate existing data using mapping logic from `domainGuard.js`:

   - Use `mapStatusToDomainState()` logic to populate `lifecycle_state` from `status`
   - Handle edge cases: 'paused' → keep current domain state, 'rejected' → DRAFT_INIT

4. Make `lifecycle_state` NOT NULL after migration:
   ```sql
   ALTER TABLE itr_filings 
   ALTER COLUMN lifecycle_state SET NOT NULL;
   ```

5. Keep `status` column temporarily (for backward compatibility during transition)

   - Add comment: "Deprecated: Use lifecycle_state instead. Will be removed in future migration."

6. Update Sequelize model: `backend/src/models/ITRFiling.js`

   - Add `lifecycleState` field with ENUM type
   - Keep `status` field for now (marked as deprecated in comments)

### Migration Strategy

- Use data migration script to populate `lifecycle_state` from `status`
- Handle NULL cases (default to DRAFT_INIT)
- Log migration progress for audit

## Step 3.2: Enforce Immutability Metadata (NO TRIGGERS)

### Action

**File:** `backend/src/scripts/migrations/add-immutability-metadata.js` (new migration)

Add metadata columns to `itr_filings`:

```sql
ALTER TABLE itr_filings
ADD COLUMN locked_at TIMESTAMP NULL,
ADD COLUMN locked_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN filed_at TIMESTAMP NULL,
ADD COLUMN filed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL;
```

**Purpose:**

- Domain Core uses these as guards (not SQL constraints)
- Audits become reliable
- Finance hooks become deterministic

**Update Sequelize model:** `backend/src/models/ITRFiling.js`

- Add `lockedAt`, `lockedBy`, `filedAt`, `filedBy` fields

**Note:** Domain Core will populate these fields when locking/filing. No triggers needed.

## Step 3.3: ITR Type Freezing Support

### Action

**File:** `backend/src/scripts/migrations/support-itr-type-freezing.js` (new migration)

1. Make `itr_type` nullable:
   ```sql
   ALTER TABLE itr_filings 
   ALTER COLUMN itr_type DROP NOT NULL;
   ```

2. Add comment to column:
   ```sql
   COMMENT ON COLUMN itr_filings.itr_type IS 
   'ITR type (ITR-1, ITR-2, ITR-3, ITR-4). Nullable initially, must be set once determined, must not change after LOCKED state. Domain Core enforces immutability.';
   ```

3. Add optional partial index for audits:
   ```sql
   CREATE INDEX idx_itr_locked_type 
   ON itr_filings (itr_type) 
   WHERE lifecycle_state IN ('LOCKED', 'FILED', 'ACKNOWLEDGED', 'COMPLETED');
   ```


**Update Sequelize model:** `backend/src/models/ITRFiling.js`

- Change `itrType.allowNull` to `true`
- Add comment to field definition

## Step 3.4: Version & Computation Traceability

### Action

**File:** `backend/src/scripts/migrations/add-computation-traceability.js` (new migration)

Add computation tracking columns to `itr_filings`:

```sql
ALTER TABLE itr_filings
ADD COLUMN computation_version INTEGER DEFAULT 1,
ADD COLUMN computed_at TIMESTAMP NULL,
ADD COLUMN computed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN regime_selected VARCHAR(10) CHECK (regime_selected IN ('old', 'new'));
```

**Migration logic:**

- Copy existing `regime` values to `regime_selected` if `regime` exists
- Set `computation_version = 1` for existing records with `tax_computation`
- Set `computed_at` from `updated_at` if `tax_computation` exists

**Update Sequelize model:** `backend/src/models/ITRFiling.js`

- Add `computationVersion`, `computedAt`, `computedBy`, `regimeSelected` fields
- Keep `regime` field for backward compatibility (deprecated)

**Update `return_versions` table:**

- Ensure `regime` column exists (already exists per model)
- Add comment that it should match `regime_selected` from parent filing

## Step 3.5: Soft Referential Discipline

### Action

**File:** `backend/src/scripts/migrations/verify-referential-integrity.js` (new migration - verification only)

1. Verify foreign keys exist:

   - `itr_drafts.filing_id → itr_filings.id` (already exists)
   - `return_versions.return_id → itr_filings.id` (already exists per model)

2. Document any gaps in `docs/DB_REFERENTIAL_INTEGRITY.md`:

   - List all foreign key relationships
   - Note any missing constraints
   - Document future finance table relationships

3. No migrations to add constraints if risky (per plan guidance)

## Implementation Details

### Migration Execution Order

1. `add-lifecycle-state-enum.js` - Create enum and add column
2. `add-immutability-metadata.js` - Add lock/file metadata
3. `support-itr-type-freezing.js` - Make itr_type nullable, add index
4. `add-computation-traceability.js` - Add computation tracking
5. `verify-referential-integrity.js` - Verify and document FKs

### Model Updates Required

**File:** `backend/src/models/ITRFiling.js`

Add new fields:

- `lifecycleState` (ENUM matching domain states)
- `lockedAt`, `lockedBy`, `filedAt`, `filedBy` (metadata)
- `computationVersion`, `computedAt`, `computedBy` (traceability)
- `regimeSelected` (rename from `regime`)

Update existing fields:

- `itrType.allowNull = true`
- `status` (keep for backward compatibility, mark deprecated)

### Domain Core Integration

**File:** `backend/src/middleware/domainGuard.js`

Update `getCurrentDomainState()`:

- Read from `lifecycle_state` column instead of mapping from `status`
- Fallback to mapping if `lifecycle_state` is NULL (during migration)

**File:** `backend/src/controllers/ITRController.js`

Update state transitions:

- Set `lifecycle_state` when transitioning states
- Populate `locked_at`, `locked_by` when locking
- Populate `filed_at`, `filed_by` when filing
- Increment `computation_version` when computing tax
- Set `computed_at`, `computed_by` when computing tax

## Constraints and Rules

### DO NOT

- Add SQL triggers
- Encode business rules in DB
- Change computation fields structure
- Touch frontend code
- Touch RBAC logic
- Touch finance logic
- Remove `status` column yet (keep for backward compatibility)

### DO

- Add columns (all additive)
- Add indexes (performance)
- Add comments (documentation)
- Update models (Sequelize)
- Update Domain Core integration (read from new column)
- Document referential integrity gaps

## Success Criteria

Phase 3 is complete when:

- `itr_filings` has `lifecycle_state` ENUM column matching domain states
- `lifecycle_state` is populated for all existing records
- Immutability metadata columns exist (`locked_at`, `locked_by`, `filed_at`, `filed_by`)
- `itr_type` is nullable with proper documentation
- Computation traceability columns exist (`computation_version`, `computed_at`, `computed_by`, `regime_selected`)
- Referential integrity is documented
- Models are updated to reflect new schema
- Domain Core reads from `lifecycle_state` instead of mapping from `status`
- All migrations are reversible (additive only)

## Files to Create/Modify

**New Migration Files:**

- `backend/src/scripts/migrations/add-lifecycle-state-enum.js`
- `backend/src/scripts/migrations/add-immutability-metadata.js`
- `backend/src/scripts/migrations/support-itr-type-freezing.js`
- `backend/src/scripts/migrations/add-computation-traceability.js`
- `backend/src/scripts/migrations/verify-referential-integrity.js`

**Model Updates:**

- `backend/src/models/ITRFiling.js` - Add new fields, update existing

**Domain Core Integration:**

- `backend/src/middleware/domainGuard.js` - Read from `lifecycle_state`
- `backend/src/controllers/ITRController.js` - Set `lifecycle_state` and metadata on state transitions

**Documentation:**

- `docs/DB_REFERENTIAL_INTEGRITY.md` - Document FK relationships and gaps

## Migration Safety

All migrations are:

- **Additive** - Only adding columns, no data deletion
- **Reversible** - Can be rolled back by dropping columns
- **Non-breaking** - Existing `status` column kept for compatibility
- **Data-preserving** - All existing data migrated to new structure
- **No triggers** - Domain Core enforces rules, not SQL