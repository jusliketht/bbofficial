// =====================================================
// MIGRATION: Add Performance Indexes
// =====================================================
// Adds missing indexes for improved query performance
// Usage: node src/scripts/migrations/add-performance-indexes.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function addPerformanceIndexes() {
  try {
    enterpriseLogger.info('Adding performance indexes...');
    console.log('\n=== Adding Performance Indexes ===\n');

    // =====================================================
    // 1. ITR FILINGS TABLE INDEXES
    // =====================================================
    console.log('Adding ITR filings indexes...');

    // Composite index for user filings with status filter and sorting
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itr_filings_user_status_created_desc 
      ON itr_filings(user_id, status, created_at DESC)
    `);
    console.log('✅ idx_itr_filings_user_status_created_desc');

    // Index for assessment year
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itr_filings_assessment_year 
      ON itr_filings(assessment_year)
    `);
    console.log('✅ idx_itr_filings_assessment_year');

    // Composite index for user and assessment year
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itr_filings_user_assessment_year 
      ON itr_filings(user_id, assessment_year)
    `);
    console.log('✅ idx_itr_filings_user_assessment_year');

    // Index for submitted_at (for date range queries)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itr_filings_submitted_at 
      ON itr_filings(submitted_at DESC) 
      WHERE submitted_at IS NOT NULL
    `);
    console.log('✅ idx_itr_filings_submitted_at');

    // =====================================================
    // 2. NOTIFICATIONS TABLE INDEXES
    // =====================================================
    console.log('\nAdding notifications indexes...');

    // Composite index for user notifications with read status and sorting
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created_desc 
      ON notifications(user_id, read, created_at DESC)
    `);
    console.log('✅ idx_notifications_user_read_created_desc');

    // =====================================================
    // 3. DOCUMENTS TABLE INDEXES
    // =====================================================
    console.log('\nAdding documents indexes...');

    // Composite index for user documents with category
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_category_created_desc 
      ON documents(user_id, category, created_at DESC) 
      WHERE is_deleted = false
    `);
    console.log('✅ idx_documents_user_category_created_desc');

    // Composite index for filing documents
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_filing_category 
      ON documents(filing_id, category) 
      WHERE filing_id IS NOT NULL AND is_deleted = false
    `);
    console.log('✅ idx_documents_filing_category');

    // =====================================================
    // 4. ASSESSMENT NOTICES TABLE INDEXES
    // =====================================================
    console.log('\nAdding assessment notices indexes...');

    // Composite index for user notices with status and date
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_assessment_notices_user_status_received_desc 
      ON assessment_notices(user_id, status, received_date DESC)
    `);
    console.log('✅ idx_assessment_notices_user_status_received_desc');

    // Index for due_date (for overdue queries)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_assessment_notices_due_date 
      ON assessment_notices(due_date) 
      WHERE due_date IS NOT NULL
    `);
    console.log('✅ idx_assessment_notices_due_date');

    // =====================================================
    // 5. TAX DEMANDS TABLE INDEXES
    // =====================================================
    console.log('\nAdding tax demands indexes...');

    // Composite index for user demands with status and date
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_tax_demands_user_status_received_desc 
      ON tax_demands(user_id, status, received_date DESC)
    `);
    console.log('✅ idx_tax_demands_user_status_received_desc');

    // Index for due_date (for overdue queries)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_tax_demands_due_date 
      ON tax_demands(due_date) 
      WHERE due_date IS NOT NULL
    `);
    console.log('✅ idx_tax_demands_due_date');

    // =====================================================
    // 6. ITR-V PROCESSING TABLE INDEXES
    // =====================================================
    console.log('\nAdding ITR-V processing indexes...');

    // Composite index for filing and status
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itrv_processing_filing_status 
      ON itr_v_processing(filing_id, status)
    `);
    console.log('✅ idx_itrv_processing_filing_status');

    // Index for expiry_date
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_itrv_processing_expiry_date 
      ON itr_v_processing(expiry_date) 
      WHERE expiry_date IS NOT NULL
    `);
    console.log('✅ idx_itrv_processing_expiry_date');

    // =====================================================
    // 7. SCENARIOS TABLE INDEXES
    // =====================================================
    console.log('\nAdding scenarios indexes...');

    // Composite index for user scenarios with filing
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_scenarios_user_filing_created_desc 
      ON scenarios(user_id, filing_id, created_at DESC)
    `);
    console.log('✅ idx_scenarios_user_filing_created_desc');

    // Index for scenario_type
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_scenarios_type 
      ON scenarios(scenario_type)
    `);
    console.log('✅ idx_scenarios_type');

    // =====================================================
    // 8. USERS TABLE INDEXES (if missing)
    // =====================================================
    console.log('\nChecking users table indexes...');

    // Check if email index exists
    const emailIndexCheck = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname LIKE '%email%'
    `);
    
    if (emailIndexCheck[0].length === 0) {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email 
        ON users(email)
      `);
      console.log('✅ idx_users_email');
    } else {
      console.log('✅ idx_users_email (already exists)');
    }

    // Check if PAN index exists
    const panIndexCheck = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname LIKE '%pan%'
    `);
    
    if (panIndexCheck[0].length === 0) {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_users_pan_number 
        ON users(pan_number) 
        WHERE pan_number IS NOT NULL
      `);
      console.log('✅ idx_users_pan_number');
    } else {
      console.log('✅ idx_users_pan_number (already exists)');
    }

    console.log('\n✅ All performance indexes added successfully!\n');
    enterpriseLogger.info('Performance indexes migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Performance indexes migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addPerformanceIndexes()
    .then(async () => {
      console.log('Migration script completed');
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Migration script failed:', error);
      await sequelize.close();
      process.exit(1);
    });
}

module.exports = addPerformanceIndexes;

