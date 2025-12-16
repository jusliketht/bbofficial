// =====================================================
// MIGRATION: Add Scalability Indexes
// Additional indexes for concurrent user performance
// Usage: node src/scripts/migrations/add-scalability-indexes.js
// =====================================================

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function addScalabilityIndexes() {
  try {
    enterpriseLogger.info('Starting scalability index optimization...');
    console.log('\n=== Scalability Index Optimization ===\n');

    // =====================================================
    // 1. USER_SESSIONS TABLE INDEXES
    // =====================================================
    console.log('Optimizing user_sessions indexes...');

    // Composite index for active sessions lookup
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active 
      ON user_sessions(user_id, revoked, expires_at)
      WHERE revoked = false AND expires_at > NOW()
    `);
    console.log('✅ Created index: idx_user_sessions_user_active');

    // Index for session cleanup (expired sessions)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at 
      ON user_sessions(expires_at)
      WHERE revoked = false
    `);
    console.log('✅ Created index: idx_user_sessions_expires_at');

    // =====================================================
    // 2. ITR_DRAFTS TABLE INDEXES
    // =====================================================
    console.log('Optimizing itr_drafts indexes...');

    // Composite index for user drafts with filing_id
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itr_drafts_user_filing 
      ON itr_drafts(user_id, filing_id, created_at DESC)
    `);
    console.log('✅ Created index: idx_itr_drafts_user_filing');

    // Index for draft status filtering
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itr_drafts_status 
      ON itr_drafts(is_completed, last_saved_at DESC)
    `);
    console.log('✅ Created index: idx_itr_drafts_status');

    // =====================================================
    // 3. DOCUMENTS TABLE INDEXES
    // =====================================================
    console.log('Optimizing documents indexes...');

    // Composite index for user documents with status
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_status 
      ON documents(user_id, status, created_at DESC)
      WHERE deleted_at IS NULL
    `);
    console.log('✅ Created index: idx_documents_user_status');

    // Index for filing documents
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_filing 
      ON documents(filing_id, document_type)
      WHERE deleted_at IS NULL AND filing_id IS NOT NULL
    `);
    console.log('✅ Created index: idx_documents_filing');

    // =====================================================
    // 4. NOTIFICATIONS TABLE INDEXES
    // =====================================================
    console.log('Optimizing notifications indexes...');

    // Composite index for user notifications with read status
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
      ON notifications(user_id, is_read, created_at DESC)
    `);
    console.log('✅ Created index: idx_notifications_user_read');

    // =====================================================
    // 5. SERVICE_TICKETS TABLE INDEXES
    // =====================================================
    console.log('Optimizing service_tickets indexes...');

    // Composite index for user tickets with status
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_service_tickets_user_status 
      ON service_tickets(user_id, status, created_at DESC)
    `);
    console.log('✅ Created index: idx_service_tickets_user_status');

    // Index for assigned tickets
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_service_tickets_assigned 
      ON service_tickets(assigned_to, status, created_at DESC)
      WHERE assigned_to IS NOT NULL
    `);
    console.log('✅ Created index: idx_service_tickets_assigned');

    // =====================================================
    // 6. INVOICES TABLE INDEXES
    // =====================================================
    console.log('Optimizing invoices indexes...');

    // Composite index for filing invoices
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_filing 
      ON invoices(filing_id, status, payment_status)
    `);
    console.log('✅ Created index: idx_invoices_filing');

    // Index for user invoices
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_user 
      ON invoices(user_id, created_at DESC)
    `);
    console.log('✅ Created index: idx_invoices_user');

    // =====================================================
    // 7. AUDIT_LOGS TABLE INDEXES
    // =====================================================
    console.log('Optimizing audit_logs indexes...');

    // Composite index for user audit logs with date range
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date 
      ON audit_logs(user_id, created_at DESC)
    `);
    console.log('✅ Created index: idx_audit_logs_user_date');

    // Index for action-based queries
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
      ON audit_logs(action, resource, created_at DESC)
    `);
    console.log('✅ Created index: idx_audit_logs_action');

    // =====================================================
    // 8. FAMILY_MEMBERS TABLE INDEXES
    // =====================================================
    console.log('Optimizing family_members indexes...');

    // Composite index for user members with status
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_family_members_user_active 
      ON family_members(user_id, is_active, created_at DESC)
    `);
    console.log('✅ Created index: idx_family_members_user_active');

    // =====================================================
    // 9. BANK_ACCOUNTS TABLE INDEXES
    // =====================================================
    console.log('Optimizing bank_accounts indexes...');

    // Composite index for user bank accounts
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bank_accounts_user 
      ON bank_accounts(user_id, is_primary, created_at DESC)
    `);
    console.log('✅ Created index: idx_bank_accounts_user');

    // =====================================================
    // 10. FOREIGN_ASSETS TABLE INDEXES (Schedule FA)
    // =====================================================
    console.log('Optimizing foreign_assets indexes...');

    // Composite index for user foreign assets
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_foreign_assets_user 
      ON foreign_assets(user_id, filing_id, asset_type)
    `);
    console.log('✅ Created index: idx_foreign_assets_user');

    console.log('\n✅ All scalability indexes created successfully!\n');
    enterpriseLogger.info('Scalability index optimization completed');

    return true;
  } catch (error) {
    enterpriseLogger.error('Failed to create scalability indexes', {
      error: error.message,
      stack: error.stack,
    });
    console.error('\n❌ Error creating indexes:', error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  addScalabilityIndexes()
    .then((success) => {
      if (success) {
        console.log('Migration completed successfully');
        process.exit(0);
      } else {
        console.error('Migration failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = { addScalabilityIndexes };

