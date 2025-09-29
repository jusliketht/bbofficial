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

async function implementEnterpriseSchemaStepByStep() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting enterprise schema implementation step by step...');
    
    // Step 1: Create extensions
    console.log('📦 Creating extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ Extensions created');
    
    // Step 2: Create ITR Forms Master
    console.log('📋 Creating ITR Forms Master...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS itr_forms_master (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        form_type VARCHAR(10) UNIQUE NOT NULL,
        form_name VARCHAR(100) NOT NULL,
        description TEXT,
        eligibility_criteria JSONB NOT NULL,
        income_sources_supported JSONB NOT NULL,
        deductions_supported JSONB NOT NULL,
        sections JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ ITR Forms Master created');
    
    // Step 3: Create Income Source Categories
    console.log('💰 Creating Income Source Categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS income_source_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_code VARCHAR(50) UNIQUE NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        description TEXT,
        itr_forms_supported JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Income Source Categories created');
    
    // Step 4: Create Detailed Income Sources
    console.log('📊 Creating Detailed Income Sources...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS income_sources_detailed (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filing_submission_id UUID NOT NULL REFERENCES filing_submissions(submission_id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES income_source_categories(id),
        source_name VARCHAR(255) NOT NULL,
        source_type VARCHAR(100) NOT NULL,
        gross_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        exempt_amount DECIMAL(15,2) DEFAULT 0,
        taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        source_details JSONB DEFAULT '{}',
        calculation_method VARCHAR(50),
        data_source VARCHAR(50) NOT NULL,
        source_reference VARCHAR(255),
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_data_source CHECK (data_source IN ('manual', 'api', 'document_parsing', 'import', 'calculation')),
        CONSTRAINT valid_calculation_method CHECK (calculation_method IN ('standard', 'presumptive', 'actual', 'not_applicable'))
      )
    `);
    console.log('✅ Detailed Income Sources created');
    
    // Step 5: Create Salary Income Sources
    console.log('💼 Creating Salary Income Sources...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS salary_income_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        income_source_id UUID NOT NULL REFERENCES income_sources_detailed(id) ON DELETE CASCADE,
        employer_name VARCHAR(255) NOT NULL,
        employer_pan VARCHAR(10),
        employer_tan VARCHAR(10),
        employer_address JSONB,
        basic_salary DECIMAL(15,2) DEFAULT 0,
        hra DECIMAL(15,2) DEFAULT 0,
        special_allowance DECIMAL(15,2) DEFAULT 0,
        bonus DECIMAL(15,2) DEFAULT 0,
        commission DECIMAL(15,2) DEFAULT 0,
        overtime DECIMAL(15,2) DEFAULT 0,
        other_allowances DECIMAL(15,2) DEFAULT 0,
        professional_tax DECIMAL(15,2) DEFAULT 0,
        provident_fund DECIMAL(15,2) DEFAULT 0,
        esi DECIMAL(15,2) DEFAULT 0,
        other_deductions DECIMAL(15,2) DEFAULT 0,
        tds_deducted DECIMAL(15,2) DEFAULT 0,
        tds_certificate_number VARCHAR(50),
        form_16_received BOOLEAN DEFAULT FALSE,
        form_16_document_id UUID REFERENCES document_uploads(upload_id),
        employment_type VARCHAR(50),
        employment_period_start DATE,
        employment_period_end DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT valid_employment_type CHECK (employment_type IN ('permanent', 'contract', 'consultant', 'freelance'))
      )
    `);
    console.log('✅ Salary Income Sources created');
    
    // Step 6: Insert initial data
    console.log('📝 Inserting initial data...');
    
    // Insert ITR Forms
    await client.query(`
      INSERT INTO itr_forms_master (form_type, form_name, description, eligibility_criteria, income_sources_supported, deductions_supported, sections) VALUES
      ('ITR-1', 'Sahaj', 'For individuals with income from salary, one house property, other sources', 
       '{"max_income": 500000, "income_sources": ["salary", "house_property", "other"]}',
       '["salary", "house_property", "other_income"]',
       '["standard", "80c", "80d", "80g", "80e", "80tta", "80ttb"]',
       '{"sections": ["personal_info", "income", "deductions", "tax_computation"]}'),
      ('ITR-2', 'ITR-2', 'For individuals and HUFs not having income from business or profession',
       '{"income_sources": ["salary", "house_property", "capital_gains", "other"]}',
       '["salary", "house_property", "capital_gains", "other_income"]',
       '["standard", "80c", "80d", "80g", "80e", "80tta", "80ttb", "80u", "80dd", "80ddb"]',
       '{"sections": ["personal_info", "income", "deductions", "tax_computation", "capital_gains"]}')
      ON CONFLICT (form_type) DO NOTHING
    `);
    
    // Insert Income Source Categories
    await client.query(`
      INSERT INTO income_source_categories (category_code, category_name, description, itr_forms_supported) VALUES
      ('SALARY', 'Salary Income', 'Income from salary and wages', '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('HOUSE_PROPERTY', 'House Property Income', 'Income from house property', '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('BUSINESS_PROFESSION', 'Business & Profession Income', 'Income from business or profession', '["ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('CAPITAL_GAINS', 'Capital Gains', 'Income from capital gains', '["ITR-2", "ITR-3", "ITR-5", "ITR-6", "ITR-7"]'),
      ('OTHER_INCOME', 'Other Income', 'Income from other sources', '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]')
      ON CONFLICT (category_code) DO NOTHING
    `);
    
    console.log('✅ Initial data inserted');
    
    // Step 7: Create indexes
    console.log('🔍 Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_income_sources_detailed_filing_id ON income_sources_detailed(filing_submission_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_income_sources_detailed_category_id ON income_sources_detailed(category_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_salary_income_sources_income_source_id ON salary_income_sources(income_source_id)');
    console.log('✅ Indexes created');
    
    console.log('\n🎉 Enterprise schema implementation completed successfully!');
    console.log('✅ Core tables created');
    console.log('✅ ITR forms loaded');
    console.log('✅ Income source categories loaded');
    console.log('✅ Indexes created');
    
  } catch (error) {
    console.error('❌ Error implementing enterprise schema:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
implementEnterpriseSchemaStepByStep()
  .then(() => {
    console.log('\n🎯 Enterprise schema implementation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
