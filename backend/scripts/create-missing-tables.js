#!/usr/bin/env node

// =====================================================
// CREATE MISSING TABLES FOR ITR IMPLEMENTATION
// Based on verified database schema and ITR blueprint
// =====================================================

require('dotenv').config();
const { Pool } = require('pg');

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack_itr',
  password: process.env.DB_PASSWORD || '123456',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 1
};

const pool = new Pool(dbConfig);

async function createMissingTables() {
  console.log('🏗️  CREATING MISSING TABLES FOR ITR IMPLEMENTATION');
  console.log('==================================================');

  try {
    // 1. Create financial_profiles table
    console.log('1. Creating financial_profiles table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS financial_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pan VARCHAR(10) NOT NULL,
        pan_hash VARCHAR(64) NOT NULL,
        user_id UUID REFERENCES users(user_id),
        tenant_id UUID REFERENCES ca_firms(ca_id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(pan_hash)
      )
    `);
    console.log('   ✅ financial_profiles table created');

    // 2. Create financial_history table
    console.log('2. Creating financial_history table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS financial_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        financial_profile_id UUID REFERENCES financial_profiles(id),
        assessment_year VARCHAR(7) NOT NULL,
        gross_income DECIMAL(15,2) DEFAULT 0,
        deductions DECIMAL(15,2) DEFAULT 0,
        tax_paid DECIMAL(15,2) DEFAULT 0,
        refund DECIMAL(15,2) DEFAULT 0,
        ack_number VARCHAR(50),
        json_payload JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(financial_profile_id, assessment_year)
      )
    `);
    console.log('   ✅ financial_history table created');

    // 3. Create insights_cache table
    console.log('3. Creating insights_cache table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS insights_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        financial_profile_id UUID REFERENCES financial_profiles(id),
        insight_type VARCHAR(50) NOT NULL,
        insight_data JSONB NOT NULL,
        computed_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        UNIQUE(financial_profile_id, insight_type)
      )
    `);
    console.log('   ✅ insights_cache table created');

    // 4. Create drafts table for autosave functionality
    console.log('4. Creating drafts table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drafts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id),
        tenant_id UUID REFERENCES ca_firms(ca_id),
        draft_type VARCHAR(50) NOT NULL DEFAULT 'itr_filing',
        draft_data JSONB NOT NULL,
        version INTEGER DEFAULT 1,
        locked_by UUID REFERENCES users(user_id),
        locked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ drafts table created');

    // 5. Create indexes for performance
    console.log('5. Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_profiles_pan_hash ON financial_profiles(pan_hash)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_profiles_user_id ON financial_profiles(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_history_profile_id ON financial_history(financial_profile_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_history_assessment_year ON financial_history(assessment_year)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_cache_profile_id ON insights_cache(financial_profile_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_insights_cache_type ON insights_cache(insight_type)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drafts_user_id ON drafts(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drafts_type ON drafts(draft_type)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_drafts_locked_by ON drafts(locked_by)'
    ];

    for (const indexQuery of indexes) {
      try {
        await pool.query(indexQuery);
        console.log(`   ✅ Index created: ${indexQuery.split('idx_')[1].split(' ')[0]}`);
      } catch (error) {
        console.log(`   ⚠️  Index creation skipped: ${error.message}`);
      }
    }

    console.log('\n✅ ALL MISSING TABLES CREATED SUCCESSFULLY');
    console.log('==========================================');
    console.log('Tables created:');
    console.log('- financial_profiles (for PAN-based financial data)');
    console.log('- financial_history (for historical filing data)');
    console.log('- insights_cache (for computed insights)');
    console.log('- drafts (for autosave functionality)');
    console.log('- Performance indexes added');

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
createMissingTables()
  .then(() => {
    console.log('\n🎯 Ready to implement ITR dashboard!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
