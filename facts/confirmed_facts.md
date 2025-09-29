# CONFIRMED FACTS - BurnBlack ITR Platform

## Database Schema Requirements

### Core Models (Confirmed from codebase analysis)

1. **User Model** (`users` table)
   - Fields: id (UUID), email, password_hash, role, full_name, phone, status, email_verified, phone_verified, last_login_at, created_at, updated_at
   - Roles: 'user', 'ca', 'ca_admin', 'super_admin'
   - Status: 'active', 'inactive', 'suspended'

2. **ITRFiling Model** (`itr_filings` table)
   - Fields: id (UUID), user_id, member_id, itr_type, assessment_year, json_payload (JSONB), status, ack_number, submitted_at, acknowledged_at, processed_at, rejection_reason, tax_liability
   - ITR Types: 'ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'
   - Status: 'draft', 'submitted', 'acknowledged', 'processed', 'rejected'

3. **ITRDraft Model** (`itr_drafts` table)
   - Fields: id (UUID), filing_id, step, data (JSONB), is_completed, validation_errors (JSONB), last_saved_at, created_at, updated_at
   - Steps: 'personal_info', 'income_sources', 'deductions', 'tax_computation', 'bank_details', 'verification', 'review', 'submit'

### Additional Models Needed (From documentation analysis)

4. **Document Model** (`documents` table)
   - Referenced in DocumentService.js and routes/documents.js
   - Fields needed: id, user_id, filing_id, document_type, file_name, file_path, mime_type, file_size, upload_date

5. **Notification Model** (`notifications` table)
   - Referenced in routes/notifications.js and NotificationService
   - Fields needed: id, user_id, type, title, message, priority, category, metadata, channels, expires_at, related_entity_type, related_entity_id

6. **Session Model** (`sessions` table)
   - Referenced in authentication middleware
   - Fields needed: id, user_id, device_id, token_hash, expires_at, created_at

### Mobile-Specific Models (From MOBILE_FIRST_ARCHITECTURE.md)

7. **MobileDevice Model** (`mobile_devices` table)
8. **NotificationToken Model** (`notification_tokens` table)
9. **BiometricAuth Model** (`biometric_auth` table)
10. **OfflineSyncLog Model** (`offline_sync_logs` table)

## Database Configuration

- **Database**: PostgreSQL
- **Connection**: Local PostgreSQL running on localhost:5432
- **Database Name**: burnblack_itr
- **User**: postgres
- **Password**: 123456
- **Environment**: Development

## Server Configuration

- **Port**: 3002
- **Environment**: development
- **Status**: ✅ Server running successfully
- **Health Check**: ✅ API responding at http://localhost:3002/api/health

## Missing Components

1. **Migration Scripts**: migrate.js, seed.js, reset.js (referenced in package.json but don't exist)
2. **Database Initialization**: No database setup scripts found
3. **Model Associations**: Not defined in current models
4. **Frontend Components**: Many components referenced but not implemented

## Business Logic Requirements

- **ITR Filing Flow**: 8-step process (personal_info → income_sources → deductions → tax_computation → bank_details → verification → review → submit)
- **Validation Engine**: Singleton service for form validation
- **Tax Computation Engine**: Singleton service for tax calculations
- **ERI Integration**: For ITD submission
- **Document Management**: File upload and processing
- **Notification System**: Multi-channel notifications
- **Authentication**: JWT with refresh tokens, rate limiting

## File Structure Confirmed

```
backend/src/
├── models/ (User.js, ITRFiling.js, ITRDraft.js)
├── services/ (ValidationEngine.js, TaxComputationEngine.js, ERIIntegration.js, DocumentService.js, FilingService.js)
├── routes/ (auth.js, itr.js, user.js, health.js, admin.js, documents.js, notifications.js)
├── middleware/ (auth.js, errorHandler.js)
├── config/ (database.js)
└── utils/ (logger.js)
```

## Environment Variables Required

- NODE_ENV, PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
- All configured in backend/.env file

## Next Steps

1. Create database migration scripts
2. Initialize database with proper schema
3. Define model associations
4. Test database connectivity
5. Complete frontend components
