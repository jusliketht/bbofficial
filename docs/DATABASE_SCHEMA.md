# ITR Database Schema Documentation

## Overview

This document provides detailed database schema information for ITR-related tables, including column definitions, indexes, relationships, and data storage patterns.

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [itr_filings Table](#itr_filings-table)
3. [itr_drafts Table](#itr_drafts-table)
4. [user_profiles Table](#user_profiles-table)
5. [report_templates Table](#report_templates-table)
6. [system_settings Table](#system_settings-table)
7. [Indexes](#indexes)
8. [Data Storage Patterns](#data-storage-patterns)
9. [Query Patterns](#query-patterns)
10. [Migration Scripts](#migration-scripts)

## Schema Overview

The ITR system uses PostgreSQL with JSONB support for flexible data storage. The schema supports all ITR types (ITR-1 through ITR-4) with a unified structure.

### Entity Relationship Diagram

```
users
  │
  ├─> itr_filings (1:N)
  │       │
  │       └─> itr_drafts (1:N)
  │
  └─> family_members (1:N)
          │
          └─> itr_filings (1:N) [via member_id]
```

## itr_filings Table

Stores ITR filing records for all ITR types.

### Table Definition

```sql
CREATE TABLE itr_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  itr_type VARCHAR(10) NOT NULL CHECK (itr_type IN ('ITR-1', 'ITR-2', 'ITR-3', 'ITR-4')),
  assessment_year VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged', 'processed', 'rejected', 'paused')),
  json_payload JSONB DEFAULT '{}',
  submitted_at TIMESTAMP,
  acknowledgment_number VARCHAR(50),
  ack_number VARCHAR(50),
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP,
  pause_reason TEXT,
  acknowledged_at TIMESTAMP,
  processed_at TIMESTAMP,
  rejection_reason TEXT,
  tax_liability DECIMAL(15, 2),
  refund_amount DECIMAL(15, 2),
  balance_payable DECIMAL(15, 2),
  service_ticket_id UUID,
  firm_id UUID REFERENCES ca_firms(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  review_status VARCHAR(20) CHECK (review_status IN ('pending', 'in_review', 'approved', 'rejected')),
  verification_method VARCHAR(20) CHECK (verification_method IN ('AADHAAR_OTP', 'NETBANKING', 'DSC')),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  verification_date TIMESTAMP,
  verification_details JSONB,
  regime VARCHAR(10) CHECK (regime IN ('old', 'new')),
  previous_year_filing_id UUID REFERENCES itr_filings(id) ON DELETE SET NULL,
  shared_with JSONB DEFAULT '[]',
  tax_computation JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_filing_per_member UNIQUE (user_id, member_id, itr_type, assessment_year)
);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to users table |
| `member_id` | UUID | For family/friend profiles, links to family_members |
| `itr_type` | VARCHAR(10) | ITR form type: ITR-1, ITR-2, ITR-3, or ITR-4 |
| `assessment_year` | VARCHAR(10) | Assessment year (e.g., '2024-25') |
| `status` | VARCHAR(50) | Filing status: draft, submitted, acknowledged, processed, rejected, paused |
| `json_payload` | JSONB | Complete form data for all sections (supports all ITR types) |
| `submitted_at` | TIMESTAMP | Timestamp when filing was submitted |
| `acknowledgment_number` | VARCHAR(50) | ITR-V acknowledgment number after submission |
| `ack_number` | VARCHAR(50) | Alternative acknowledgment number field |
| `paused_at` | TIMESTAMP | When filing was paused |
| `resumed_at` | TIMESTAMP | When filing was resumed |
| `pause_reason` | TEXT | Reason for pausing |
| `acknowledged_at` | TIMESTAMP | When acknowledgment was received |
| `processed_at` | TIMESTAMP | When filing was processed |
| `rejection_reason` | TEXT | Reason for rejection (if rejected) |
| `tax_liability` | DECIMAL(15,2) | Total tax liability |
| `refund_amount` | DECIMAL(15,2) | Refund amount (if applicable) |
| `balance_payable` | DECIMAL(15,2) | Balance payable after taxes paid |
| `service_ticket_id` | UUID | Link to support ticket |
| `firm_id` | UUID | CA firm ID (if filed through CA) |
| `assigned_to` | UUID | User ID of assigned CA/reviewer |
| `review_status` | VARCHAR(20) | CA review status |
| `verification_method` | VARCHAR(20) | E-verification method used |
| `verification_status` | VARCHAR(20) | E-verification status |
| `verification_date` | TIMESTAMP | When verification was completed |
| `verification_details` | JSONB | Verification details and metadata |
| `regime` | VARCHAR(10) | Tax regime selected: old or new |
| `previous_year_filing_id` | UUID | Reference to previous year filing for copy feature |
| `shared_with` | JSONB | Array of draft sharing records for collaboration |
| `tax_computation` | JSONB | Stored tax computation result with breakdown for both regimes |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

### json_payload Structure

The `json_payload` JSONB column stores the complete form data:

```json
{
  "personalInfo": {
    "pan": "ABCDE1234F",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "address": {}
  },
  "income": {
    "salary": 1000000,
    "businessIncome": {
      "businesses": []
    },
    "professionalIncome": {
      "professions": []
    },
    "houseProperty": {
      "properties": []
    },
    "otherSources": {}
  },
  "deductions": {},
  "taxesPaid": {},
  "balanceSheet": {},
  "auditInfo": {}
}
```

### tax_computation Structure

The `tax_computation` JSONB column stores computed tax results:

```json
{
  "assessmentYear": "2024-25",
  "itrType": "ITR-3",
  "grossTotalIncome": 1500000,
  "totalDeductions": 200000,
  "taxableIncome": 1300000,
  "oldRegime": {
    "totalTax": 150000,
    "cess": 6000,
    "finalTax": 156000
  },
  "newRegime": {
    "totalTax": 140000,
    "cess": 5600,
    "finalTax": 145600
  },
  "taxPaid": 100000,
  "refundAmount": 0,
  "balancePayable": 56000,
  "computedAt": "2024-01-01T00:00:00.000Z"
}
```

## user_profiles Table

Stores extended user profile information including PAN, Aadhaar, address, and bank details.

### Aadhaar Linking Fields

The following fields were added to support Aadhaar linking functionality:

```sql
ALTER TABLE user_profiles 
ADD COLUMN aadhaar_linked BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN aadhaar_verified_at TIMESTAMP,
ADD COLUMN aadhaar_verification_data JSONB DEFAULT '{}';
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `aadhaar_number` | VARCHAR(12) | 12-digit Aadhaar number (unique) |
| `aadhaar_linked` | BOOLEAN | Whether Aadhaar is linked to the user profile |
| `aadhaar_verified_at` | TIMESTAMP | Timestamp when Aadhaar was verified |
| `aadhaar_verification_data` | JSONB | Verification response data from SurePass API |

### Aadhaar Verification Data Structure

The `aadhaar_verification_data` JSONB column stores verification response:

```json
{
  "success": true,
  "verified": true,
  "aadhaarNumber": "123456789012",
  "name": "User Name",
  "dateOfBirth": "1990-01-01",
  "gender": "M",
  "address": "Full Address",
  "pincode": "123456",
  "state": "State Name",
  "district": "District Name",
  "verificationTimestamp": "2024-01-01T00:00:00.000Z",
  "source": "SUREPASS",
  "rawData": { /* SurePass API response */ }
}
```

## report_templates Table

Stores custom report templates for admin analytics and reporting.

### Table Definition

```sql
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  metrics JSONB NOT NULL DEFAULT '[]',
  dimensions JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  aggregation VARCHAR(50) DEFAULT 'count',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_template_name_per_user UNIQUE (name, created_by)
);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | VARCHAR(255) | Template name (unique per user) |
| `description` | TEXT | Template description |
| `metrics` | JSONB | Array of metric IDs (e.g., ['users', 'filings', 'revenue']) |
| `dimensions` | JSONB | Array of dimension IDs (e.g., ['date', 'status', 'itrType']) |
| `filters` | JSONB | Filter configuration object |
| `aggregation` | VARCHAR(50) | Aggregation type: count, sum, average, min, max |
| `created_by` | UUID | Foreign key to users table (admin who created template) |
| `created_at` | TIMESTAMP | Template creation timestamp |
| `updated_at` | TIMESTAMP | Template last update timestamp |

### Example Template Data

```json
{
  "name": "Monthly User Growth Report",
  "description": "Track user growth by month",
  "metrics": ["users"],
  "dimensions": ["month", "status"],
  "filters": {
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  },
  "aggregation": "count"
}
```

## system_settings Table

Stores system-wide configuration settings organized by category.

### Table Definition

```sql
CREATE TABLE system_settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'tax', 'security', 'integrations', 'notifications')),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_settings_category ON system_settings(category);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `key` | VARCHAR(255) | Setting key (primary key) |
| `value` | JSONB | Setting value (flexible JSON structure) |
| `category` | VARCHAR(50) | Category: general, tax, security, integrations, notifications |
| `updated_by` | UUID | Foreign key to users table (admin who last updated) |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `created_at` | TIMESTAMP | Creation timestamp |

### Setting Categories

1. **general**: Platform name, email, timezone, currency, language, maintenance mode
2. **tax**: Assessment year, filing deadlines, default ITR type, auto-computation settings
3. **security**: Email/phone verification requirements, 2FA, session timeout, rate limiting, password policies
4. **integrations**: SurePass API keys, Google OAuth, email service configuration (SMTP/SendGrid/SES)
5. **notifications**: Email/SMS/push notification settings, notification type preferences

### Example Settings

```json
{
  "key": "platform_name",
  "value": "BurnBlack ITR Platform",
  "category": "general"
}

{
  "key": "current_assessment_year",
  "value": "2024-25",
  "category": "tax"
}

{
  "key": "require_2fa",
  "value": false,
  "category": "security"
}
```

## itr_drafts Table

Stores draft data during ITR editing with section-based workflow.

### Table Definition

```sql
CREATE TABLE itr_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID NOT NULL REFERENCES itr_filings(id) ON DELETE CASCADE,
  step VARCHAR(50) DEFAULT 'personal_info',
  data JSONB DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  last_saved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `filing_id` | UUID | Foreign key to itr_filings table |
| `step` | VARCHAR(50) | Current step in filing process (e.g., 'personal_info', 'income', 'deductions') |
| `data` | JSONB | Form data for all sections (JSONB for efficient querying and updates) |
| `is_completed` | BOOLEAN | Whether the draft is marked as completed |
| `last_saved_at` | TIMESTAMP | Timestamp of last save operation |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record last update timestamp |

### data Structure

The `data` JSONB column stores the current draft form data (same structure as `json_payload` in `itr_filings`):

```json
{
  "personalInfo": {},
  "income": {
    "businessIncome": { "businesses": [] },
    "professionalIncome": { "professions": [] }
  },
  "deductions": {},
  "taxesPaid": {}
}
```

## Indexes

### itr_filings Indexes

```sql
-- Primary key index (automatic)
CREATE INDEX idx_itr_filings_user_id ON itr_filings(user_id);
CREATE INDEX idx_itr_filings_member_id ON itr_filings(member_id);
CREATE INDEX idx_itr_filings_status ON itr_filings(status);
CREATE INDEX idx_itr_filings_itr_type ON itr_filings(itr_type);
CREATE INDEX idx_itr_filings_assessment_year ON itr_filings(assessment_year);

-- Composite indexes for common queries
CREATE INDEX idx_itr_filings_user_status ON itr_filings(user_id, status);
CREATE INDEX idx_itr_filings_previous_year_queries ON itr_filings(user_id, assessment_year, status);
CREATE INDEX idx_itr_filings_regime ON itr_filings(regime);
CREATE INDEX idx_itr_filings_previous_year_filing_id ON itr_filings(previous_year_filing_id);

-- Unique constraint index
CREATE UNIQUE INDEX idx_itr_filings_unique_filing ON itr_filings(user_id, member_id, itr_type, assessment_year);

-- JSONB GIN indexes for efficient JSON queries
CREATE INDEX idx_itr_filings_json_payload_gin ON itr_filings USING gin(json_payload);
CREATE INDEX idx_itr_filings_tax_computation_gin ON itr_filings USING gin(tax_computation);

-- Lookup indexes
CREATE INDEX idx_itr_filings_ack_number ON itr_filings(ack_number);
CREATE INDEX idx_itr_filings_created_at ON itr_filings(created_at);
```

### itr_drafts Indexes

```sql
-- Primary key index (automatic)
CREATE INDEX idx_itr_drafts_filing_id ON itr_drafts(filing_id);
CREATE INDEX idx_itr_drafts_step ON itr_drafts(step);
CREATE INDEX idx_itr_drafts_is_completed ON itr_drafts(is_completed);

-- JSONB GIN index for efficient JSON queries
CREATE INDEX idx_itr_drafts_data_gin ON itr_drafts USING gin(data);
```

## Data Storage Patterns

### JSONB Usage

Both `json_payload` and `data` columns use JSONB for:
1. **Flexibility**: Support all ITR types with different structures
2. **Efficiency**: JSONB is binary format, faster than JSON
3. **Querying**: GIN indexes enable efficient JSON queries
4. **Updates**: Partial updates without full document replacement

### Querying JSONB Data

```sql
-- Get business income from JSONB
SELECT 
  json_payload->'income'->'businessIncome' as business_income
FROM itr_filings
WHERE id = 'uuid';

-- Query by JSONB field value
SELECT *
FROM itr_filings
WHERE json_payload->'income'->>'salary'::numeric > 1000000;

-- Update JSONB field
UPDATE itr_drafts
SET data = jsonb_set(
  data,
  '{income,businessIncome}',
  '{"businesses": []}'::jsonb
)
WHERE id = 'uuid';
```

### Data Migration Pattern

When loading draft data:

```sql
-- Get draft with filing info
SELECT 
  d.id,
  d.data,
  d.step,
  f.itr_type,
  f.status,
  f.assessment_year
FROM itr_drafts d
JOIN itr_filings f ON d.filing_id = f.id
WHERE d.id = $1 AND f.user_id = $2;
```

## Query Patterns

### Common Queries

#### 1. Get User's Drafts

```sql
SELECT 
  d.id as draft_id,
  d.step,
  d.last_saved_at,
  f.itr_type,
  f.status,
  f.assessment_year
FROM itr_drafts d
JOIN itr_filings f ON d.filing_id = f.id
WHERE f.user_id = $1
  AND f.status = 'draft'
ORDER BY d.last_saved_at DESC
LIMIT $2 OFFSET $3;
```

#### 2. Get User's Filings

```sql
SELECT 
  id,
  itr_type,
  status,
  assessment_year,
  tax_liability,
  refund_amount,
  submitted_at
FROM itr_filings
WHERE user_id = $1
  AND status IN ('submitted', 'acknowledged', 'processed')
ORDER BY submitted_at DESC
LIMIT $2 OFFSET $3;
```

#### 3. Get Tax Computation

```sql
SELECT 
  tax_computation
FROM itr_filings
WHERE id = $1 AND user_id = $2;
```

#### 4. Update Draft Data

```sql
UPDATE itr_drafts
SET 
  data = $1::jsonb,
  last_saved_at = NOW(),
  updated_at = NOW()
WHERE id = $2
RETURNING id, last_saved_at;
```

#### 5. Search by Income Amount

```sql
SELECT 
  id,
  itr_type,
  json_payload->'income'->>'salary' as salary
FROM itr_filings
WHERE user_id = $1
  AND (json_payload->'income'->>'salary')::numeric > $2;
```

## Migration Scripts

### Create Tables

Location: `backend/src/scripts/migrations/create-itr-tables.js`

**Usage:**
```bash
node backend/src/scripts/migrations/create-itr-tables.js
```

**What it does:**
1. Creates `itr_filings` table if not exists
2. Creates `itr_drafts` table if not exists
3. Adds missing columns if tables exist
4. Creates all indexes
5. Adds table/column comments

### Optimize Indexes

Location: `backend/src/scripts/migrations/optimize-database-indexes.js`

**Usage:**
```bash
node backend/src/scripts/migrations/optimize-database-indexes.js
```

**What it does:**
1. Analyzes query patterns
2. Creates composite indexes
3. Creates partial indexes
4. Optimizes foreign key indexes

## Data Consistency

### Constraints

1. **Unique Constraint**: One filing per user/member/ITR type/assessment year
2. **Foreign Key Constraints**: Cascade deletes for data integrity
3. **Check Constraints**: Valid enum values for status, ITR type, etc.

### Triggers

```sql
-- Auto-update updated_at timestamp
CREATE TRIGGER update_itr_filings_updated_at
  BEFORE UPDATE ON itr_filings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itr_drafts_updated_at
  BEFORE UPDATE ON itr_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Performance Considerations

### JSONB Indexing Strategy

1. **GIN Indexes**: For full JSONB document queries
2. **Expression Indexes**: For specific JSONB paths
3. **Partial Indexes**: For filtered queries

### Query Optimization

1. **Use JSONB Operators**: `->`, `->>`, `@>`, `?`
2. **Limit JSONB Size**: Keep documents under 1MB
3. **Normalize When Possible**: Extract frequently queried fields to columns
4. **Cache Computed Values**: Store tax_computation separately

### Example Optimized Query

```sql
-- Instead of querying JSONB every time, extract to column
ALTER TABLE itr_filings 
ADD COLUMN total_income DECIMAL(15,2) 
GENERATED ALWAYS AS (
  (json_payload->'income'->>'salary')::numeric +
  (json_payload->'income'->>'businessIncome')::numeric
) STORED;

CREATE INDEX idx_itr_filings_total_income ON itr_filings(total_income);
```

## Backup and Recovery

### Backup Strategy

1. **Full Backup**: Daily full database backup
2. **Incremental Backup**: Hourly incremental backups
3. **JSONB Data**: Included in backups (PostgreSQL handles JSONB)

### Recovery Procedures

1. Restore from latest backup
2. Replay transaction logs
3. Verify data integrity
4. Rebuild indexes if needed

## Monitoring

### Key Metrics

1. **Table Sizes**: Monitor `itr_filings` and `itr_drafts` table sizes
2. **Index Usage**: Monitor index hit rates
3. **Query Performance**: Track slow queries (> 500ms)
4. **JSONB Size**: Monitor average JSONB document size

### Monitoring Queries

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('itr_filings', 'itr_drafts');

-- Index usage
SELECT 
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexrelname LIKE 'idx_itr_%';

-- Slow queries (requires pg_stat_statements)
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%itr_%'
ORDER BY mean_time DESC
LIMIT 10;
```

