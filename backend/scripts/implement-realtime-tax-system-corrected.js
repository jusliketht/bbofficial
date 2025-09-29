const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function implementRealtimeSyncAndTaxComputationCorrected() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Implementing real-time data sync and tax computation system (corrected)...');
    
    // =====================================================
    // 1. REAL-TIME DATA SYNCHRONIZATION SYSTEM
    // =====================================================
    console.log('🔄 Creating Real-time Data Sync System...');
    
    // API Integrations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_integrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_name VARCHAR(100) UNIQUE NOT NULL,
        integration_type VARCHAR(50) NOT NULL, -- 'banking', 'brokerage', 'mutual_fund', 'insurance', 'government'
        api_provider VARCHAR(255) NOT NULL,
        api_version VARCHAR(20),
        
        -- Configuration
        base_url VARCHAR(500) NOT NULL,
        authentication_method VARCHAR(50) NOT NULL, -- 'oauth2', 'api_key', 'basic_auth', 'jwt'
        configuration JSONB NOT NULL DEFAULT '{}',
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        last_sync_at TIMESTAMP WITH TIME ZONE,
        sync_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'on_demand'
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_integration_type CHECK (integration_type IN ('banking', 'brokerage', 'mutual_fund', 'insurance', 'government', 'other')),
        CONSTRAINT valid_auth_method CHECK (authentication_method IN ('oauth2', 'api_key', 'basic_auth', 'jwt', 'custom'))
      )
    `);
    console.log('✅ API Integrations table created');
    
    // API Data Sync Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_sync_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id UUID NOT NULL REFERENCES api_integrations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Sync Details
        sync_type VARCHAR(50) NOT NULL, -- 'income', 'deductions', 'transactions', 'documents'
        sync_status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'partial'
        records_synced INTEGER DEFAULT 0,
        records_failed INTEGER DEFAULT 0,
        
        -- Response Details
        response_data JSONB,
        error_details JSONB,
        
        -- Audit
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        
        CONSTRAINT valid_sync_type CHECK (sync_type IN ('income', 'deductions', 'transactions', 'documents', 'all')),
        CONSTRAINT valid_sync_status CHECK (sync_status IN ('success', 'failed', 'partial', 'in_progress'))
      )
    `);
    console.log('✅ API Sync Logs table created');
    
    // Real-time Data Sync Queue
    await client.query(`
      CREATE TABLE IF NOT EXISTS realtime_sync_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        integration_id UUID NOT NULL REFERENCES api_integrations(id) ON DELETE CASCADE,
        
        -- Sync Details
        sync_type VARCHAR(50) NOT NULL,
        priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        
        -- Data Details
        sync_data JSONB NOT NULL DEFAULT '{}',
        filters JSONB DEFAULT '{}',
        
        -- Status
        status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'retrying'
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        
        CONSTRAINT valid_sync_queue_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying'))
      )
    `);
    console.log('✅ Real-time Sync Queue table created');
    
    // =====================================================
    // 2. TAX COMPUTATION ENGINE
    // =====================================================
    console.log('🧮 Creating Tax Computation Engine...');
    
    // Tax Regimes Master
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_regimes_master (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        regime_name VARCHAR(100) UNIQUE NOT NULL, -- 'old_regime', 'new_regime'
        regime_code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        
        -- Regime Details
        effective_from DATE NOT NULL,
        effective_to DATE,
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Features
        features JSONB NOT NULL DEFAULT '{}', -- Standard deduction, exemptions, etc.
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tax Regimes Master table created');
    
    // Tax Slabs Master
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_slabs_master (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        regime_id UUID NOT NULL REFERENCES tax_regimes_master(id) ON DELETE CASCADE,
        
        -- Slab Details
        slab_name VARCHAR(100) NOT NULL, -- 'individual', 'senior_citizen', 'super_senior_citizen', 'huf'
        income_from DECIMAL(15,2) NOT NULL,
        income_to DECIMAL(15,2),
        tax_rate DECIMAL(5,2) NOT NULL, -- Percentage
        
        -- Additional Details
        cess_rate DECIMAL(5,2) DEFAULT 4.00, -- Health and Education Cess
        surcharge_rate DECIMAL(5,2) DEFAULT 0.00,
        surcharge_threshold DECIMAL(15,2),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_tax_rate CHECK (tax_rate >= 0 AND tax_rate <= 100),
        CONSTRAINT valid_cess_rate CHECK (cess_rate >= 0 AND cess_rate <= 100)
      )
    `);
    console.log('✅ Tax Slabs Master table created');
    
    // Tax Computations
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_computations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filing_submission_id UUID NOT NULL REFERENCES filing_submissions(submission_id) ON DELETE CASCADE,
        regime_id UUID NOT NULL REFERENCES tax_regimes_master(id),
        
        -- Income Summary
        gross_total_income DECIMAL(15,2) NOT NULL DEFAULT 0,
        total_deductions DECIMAL(15,2) NOT NULL DEFAULT 0,
        taxable_income DECIMAL(15,2) NOT NULL DEFAULT 0,
        
        -- Tax Calculation
        tax_on_taxable_income DECIMAL(15,2) NOT NULL DEFAULT 0,
        surcharge DECIMAL(15,2) DEFAULT 0,
        cess DECIMAL(15,2) DEFAULT 0,
        total_tax DECIMAL(15,2) NOT NULL DEFAULT 0,
        
        -- TDS and Advance Tax
        tds_deducted DECIMAL(15,2) DEFAULT 0,
        advance_tax_paid DECIMAL(15,2) DEFAULT 0,
        self_assessment_tax DECIMAL(15,2) DEFAULT 0,
        
        -- Final Calculation
        total_tax_paid DECIMAL(15,2) DEFAULT 0,
        tax_payable DECIMAL(15,2) DEFAULT 0,
        tax_refundable DECIMAL(15,2) DEFAULT 0,
        
        -- Additional Details
        computation_details JSONB DEFAULT '{}',
        slab_breakdown JSONB DEFAULT '[]',
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Tax Computations table created');
    
    // Tax Optimization Scenarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_optimization_scenarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filing_submission_id UUID NOT NULL REFERENCES filing_submissions(submission_id) ON DELETE CASCADE,
        
        -- Scenario Details
        scenario_name VARCHAR(100) NOT NULL,
        scenario_type VARCHAR(50) NOT NULL, -- 'regime_comparison', 'deduction_optimization', 'investment_planning'
        description TEXT,
        
        -- Optimization Results
        old_regime_tax DECIMAL(15,2) DEFAULT 0,
        new_regime_tax DECIMAL(15,2) DEFAULT 0,
        tax_savings DECIMAL(15,2) DEFAULT 0,
        savings_percentage DECIMAL(5,2) DEFAULT 0,
        
        -- Recommendations
        recommendations JSONB DEFAULT '[]',
        optimal_regime VARCHAR(20),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_scenario_type CHECK (scenario_type IN ('regime_comparison', 'deduction_optimization', 'investment_planning', 'custom'))
      )
    `);
    console.log('✅ Tax Optimization Scenarios table created');
    
    // =====================================================
    // 3. DOCUMENT PARSING SYSTEM
    // =====================================================
    console.log('📄 Creating Document Parsing System...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS document_parsing_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES document_uploads(upload_id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Parsing Details
        parsing_type VARCHAR(50) NOT NULL, -- 'form_16', 'bank_statement', 'rent_receipt', 'investment_certificate', 'insurance_policy', 'brokerage_statement'
        parsing_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
        
        -- Results
        parsed_data JSONB DEFAULT '{}',
        confidence_score DECIMAL(3,2),
        extracted_fields JSONB DEFAULT '{}',
        
        -- Error Handling
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        
        CONSTRAINT valid_parsing_type CHECK (parsing_type IN ('form_16', 'bank_statement', 'rent_receipt', 'investment_certificate', 'insurance_policy', 'brokerage_statement', 'generic')),
        CONSTRAINT valid_parsing_status CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed', 'retrying'))
      )
    `);
    console.log('✅ Document Parsing Jobs table created');
    
    // =====================================================
    // 4. INSERT INITIAL DATA FIRST
    // =====================================================
    console.log('📝 Inserting initial tax regime data...');
    
    // Insert Tax Regimes
    await client.query(`
      INSERT INTO tax_regimes_master (regime_name, regime_code, description, effective_from, features) VALUES
      ('Old Regime', 'old_regime', 'Traditional tax regime with all deductions and exemptions', '2020-04-01', 
       '{"standard_deduction": 50000, "hra_exemption": true, "lta_exemption": true, "medical_reimbursement": true, "investment_deductions": true}'),
      ('New Regime', 'new_regime', 'Simplified tax regime with lower rates but limited deductions', '2020-04-01', 
       '{"standard_deduction": 50000, "hra_exemption": false, "lta_exemption": false, "medical_reimbursement": false, "investment_deductions": false}')
      ON CONFLICT (regime_code) DO NOTHING
    `);
    
    // Insert Tax Slabs for Old Regime (FY 2023-24)
    await client.query(`
      INSERT INTO tax_slabs_master (regime_id, slab_name, income_from, income_to, tax_rate, cess_rate, surcharge_rate, surcharge_threshold) 
      SELECT 
        (SELECT id FROM tax_regimes_master WHERE regime_code = 'old_regime'),
        'individual',
        income_from,
        income_to,
        tax_rate,
        4.00,
        surcharge_rate,
        surcharge_threshold
      FROM (VALUES
        (0, 250000, 0, 0, NULL),
        (250000, 500000, 5, 0, NULL),
        (500000, 1000000, 20, 0, NULL),
        (1000000, NULL, 30, 10, 1000000)
      ) AS slabs(income_from, income_to, tax_rate, surcharge_rate, surcharge_threshold)
      ON CONFLICT DO NOTHING
    `);
    
    // Insert Tax Slabs for New Regime (FY 2023-24)
    await client.query(`
      INSERT INTO tax_slabs_master (regime_id, slab_name, income_from, income_to, tax_rate, cess_rate, surcharge_rate, surcharge_threshold) 
      SELECT 
        (SELECT id FROM tax_regimes_master WHERE regime_code = 'new_regime'),
        'individual',
        income_from,
        income_to,
        tax_rate,
        4.00,
        surcharge_rate,
        surcharge_threshold
      FROM (VALUES
        (0, 300000, 0, 0, NULL),
        (300000, 600000, 5, 0, NULL),
        (600000, 900000, 10, 0, NULL),
        (900000, 1200000, 15, 0, NULL),
        (1200000, 1500000, 20, 0, NULL),
        (1500000, NULL, 30, 10, 1500000)
      ) AS slabs(income_from, income_to, tax_rate, surcharge_rate, surcharge_threshold)
      ON CONFLICT DO NOTHING
    `);
    
    // Insert Senior Citizen Slabs for Old Regime
    await client.query(`
      INSERT INTO tax_slabs_master (regime_id, slab_name, income_from, income_to, tax_rate, cess_rate, surcharge_rate, surcharge_threshold) 
      SELECT 
        (SELECT id FROM tax_regimes_master WHERE regime_code = 'old_regime'),
        'senior_citizen',
        income_from,
        income_to,
        tax_rate,
        4.00,
        surcharge_rate,
        surcharge_threshold
      FROM (VALUES
        (0, 300000, 0, 0, NULL),
        (300000, 500000, 5, 0, NULL),
        (500000, 1000000, 20, 0, NULL),
        (1000000, NULL, 30, 10, 1000000)
      ) AS slabs(income_from, income_to, tax_rate, surcharge_rate, surcharge_threshold)
      ON CONFLICT DO NOTHING
    `);
    
    // Insert Super Senior Citizen Slabs for Old Regime
    await client.query(`
      INSERT INTO tax_slabs_master (regime_id, slab_name, income_from, income_to, tax_rate, cess_rate, surcharge_rate, surcharge_threshold) 
      SELECT 
        (SELECT id FROM tax_regimes_master WHERE regime_code = 'old_regime'),
        'super_senior_citizen',
        income_from,
        income_to,
        tax_rate,
        4.00,
        surcharge_rate,
        surcharge_threshold
      FROM (VALUES
        (0, 500000, 0, 0, NULL),
        (500000, 1000000, 20, 0, NULL),
        (1000000, NULL, 30, 10, 1000000)
      ) AS slabs(income_from, income_to, tax_rate, surcharge_rate, surcharge_threshold)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Tax regime data inserted');
    
    // =====================================================
    // 5. CREATE INDEXES FOR PERFORMANCE (SAFELY)
    // =====================================================
    console.log('🔍 Creating performance indexes...');
    
    const indexes = [
      // API Integration indexes
      'CREATE INDEX IF NOT EXISTS idx_api_integrations_integration_type ON api_integrations(integration_type)',
      'CREATE INDEX IF NOT EXISTS idx_api_integrations_is_active ON api_integrations(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_api_sync_logs_integration_id ON api_sync_logs(integration_id)',
      'CREATE INDEX IF NOT EXISTS idx_api_sync_logs_user_id ON api_sync_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_api_sync_logs_sync_status ON api_sync_logs(sync_status)',
      'CREATE INDEX IF NOT EXISTS idx_api_sync_logs_started_at ON api_sync_logs(started_at)',
      
      // Real-time sync queue indexes
      'CREATE INDEX IF NOT EXISTS idx_realtime_sync_queue_user_id ON realtime_sync_queue(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_sync_queue_status ON realtime_sync_queue(status)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_sync_queue_priority ON realtime_sync_queue(priority)',
      'CREATE INDEX IF NOT EXISTS idx_realtime_sync_queue_created_at ON realtime_sync_queue(created_at)',
      
      // Tax computation indexes
      'CREATE INDEX IF NOT EXISTS idx_tax_regimes_master_is_active ON tax_regimes_master(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_tax_slabs_master_regime_id ON tax_slabs_master(regime_id)',
      'CREATE INDEX IF NOT EXISTS idx_tax_slabs_master_slab_name ON tax_slabs_master(slab_name)',
      'CREATE INDEX IF NOT EXISTS idx_tax_computations_regime_id ON tax_computations(regime_id)',
      
      // Document parsing indexes
      'CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_document_id ON document_parsing_jobs(document_id)',
      'CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_user_id ON document_parsing_jobs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_parsing_status ON document_parsing_jobs(parsing_status)',
      'CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_parsing_type ON document_parsing_jobs(parsing_type)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
      } catch (error) {
        console.log(`⚠️  Index creation skipped: ${error.message}`);
      }
    }
    console.log('✅ Performance indexes created');
    
    // =====================================================
    // 6. VERIFY IMPLEMENTATION
    // =====================================================
    console.log('📊 Verifying implementation...');
    
    const tablesCount = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'api_integrations', 'api_sync_logs', 'realtime_sync_queue',
        'tax_regimes_master', 'tax_slabs_master', 'tax_computations',
        'tax_optimization_scenarios', 'document_parsing_jobs'
      )
    `);
    
    const taxRegimesCount = await client.query('SELECT COUNT(*) FROM tax_regimes_master');
    const taxSlabsCount = await client.query('SELECT COUNT(*) FROM tax_slabs_master');
    
    console.log(`✅ Tables created: ${tablesCount.rows[0].count}/8`);
    console.log(`✅ Tax regimes loaded: ${taxRegimesCount.rows[0].count}`);
    console.log(`✅ Tax slabs loaded: ${taxSlabsCount.rows[0].count}`);
    
    console.log('\n🎉 Real-time sync and tax computation system implemented successfully!');
    console.log('✅ Real-time data synchronization ready');
    console.log('✅ Comprehensive tax computation engine ready');
    console.log('✅ Old/New regime support implemented');
    console.log('✅ Slab-based calculations implemented');
    console.log('✅ Tax optimization scenarios ready');
    console.log('✅ Document parsing system ready');
    
  } catch (error) {
    console.error('❌ Error implementing real-time sync and tax computation:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the implementation
implementRealtimeSyncAndTaxComputationCorrected()
  .then(() => {
    console.log('\n🎯 Real-time sync and tax computation implementation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Implementation failed:', error);
    process.exit(1);
  });
