# DATABASE SCHEMA REQUIREMENTS

## Core Tables (Required for MVP)

### 1. users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. itr_filings

```sql
CREATE TABLE itr_filings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    member_id UUID REFERENCES users(id),
    itr_type VARCHAR(10) NOT NULL,
    assessment_year VARCHAR(7) NOT NULL,
    json_payload JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    ack_number VARCHAR(50),
    submitted_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    processed_at TIMESTAMP,
    rejection_reason TEXT,
    tax_liability DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. itr_drafts

```sql
CREATE TABLE itr_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_id UUID NOT NULL REFERENCES itr_filings(id),
    step VARCHAR(50) NOT NULL,
    data JSONB,
    is_completed BOOLEAN DEFAULT FALSE,
    validation_errors JSONB,
    last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(filing_id, step)
);
```

### 4. documents

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    filing_id UUID REFERENCES itr_filings(id),
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50) DEFAULT 'general',
    metadata JSONB,
    channels TEXT[] DEFAULT '{in_app}',
    expires_at TIMESTAMP,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. sessions

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_id VARCHAR(255),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexes Required

```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ITR filings indexes
CREATE INDEX idx_itr_filings_user_id ON itr_filings(user_id);
CREATE INDEX idx_itr_filings_status ON itr_filings(status);
CREATE INDEX idx_itr_filings_assessment_year ON itr_filings(assessment_year);
CREATE INDEX idx_itr_filings_itr_type ON itr_filings(itr_type);

-- ITR drafts indexes
CREATE INDEX idx_itr_drafts_filing_id ON itr_drafts(filing_id);
CREATE INDEX idx_itr_drafts_step ON itr_drafts(step);
CREATE INDEX idx_itr_drafts_is_completed ON itr_drafts(is_completed);

-- Documents indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_filing_id ON documents(filing_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## Constraints

```sql
-- Check constraints
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('user', 'ca', 'ca_admin', 'super_admin'));
ALTER TABLE users ADD CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE itr_filings ADD CONSTRAINT chk_itr_filings_itr_type CHECK (itr_type IN ('ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'));
ALTER TABLE itr_filings ADD CONSTRAINT chk_itr_filings_status CHECK (status IN ('draft', 'submitted', 'acknowledged', 'processed', 'rejected'));
ALTER TABLE itr_drafts ADD CONSTRAINT chk_itr_drafts_step CHECK (step IN ('personal_info', 'income_sources', 'deductions', 'tax_computation', 'bank_details', 'verification', 'review', 'submit'));
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
```

## Triggers for updated_at

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itr_filings_updated_at BEFORE UPDATE ON itr_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itr_drafts_updated_at BEFORE UPDATE ON itr_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
