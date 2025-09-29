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

async function implementAdditionalTables() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Implementing additional income and deduction tables...');
    
    // =====================================================
    // 1. HOUSE PROPERTY INCOME DETAILED CAPTURE
    // =====================================================
    console.log('🏠 Creating House Property Sources...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS house_property_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        income_source_id UUID NOT NULL REFERENCES income_sources_detailed(id) ON DELETE CASCADE,
        
        -- Property Details
        property_address JSONB NOT NULL,
        property_type VARCHAR(50) NOT NULL, -- 'residential', 'commercial', 'mixed'
        ownership_type VARCHAR(50) NOT NULL, -- 'self_occupied', 'let_out', 'deemed_let_out'
        
        -- Financial Details
        annual_value DECIMAL(15,2) DEFAULT 0,
        municipal_taxes DECIMAL(15,2) DEFAULT 0,
        standard_deduction DECIMAL(15,2) DEFAULT 0,
        interest_on_housing_loan DECIMAL(15,2) DEFAULT 0,
        
        -- Rental Details (if let out)
        rent_received DECIMAL(15,2) DEFAULT 0,
        unrealized_rent DECIMAL(15,2) DEFAULT 0,
        rent_receipts_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Loan Details
        housing_loan_provider VARCHAR(255),
        loan_account_number VARCHAR(100),
        loan_start_date DATE,
        loan_end_date DATE,
        principal_amount DECIMAL(15,2),
        interest_certificate_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Co-ownership Details
        ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
        co_owners JSONB DEFAULT '[]',
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_property_type CHECK (property_type IN ('residential', 'commercial', 'mixed')),
        CONSTRAINT valid_ownership_type CHECK (ownership_type IN ('self_occupied', 'let_out', 'deemed_let_out'))
      )
    `);
    console.log('✅ House Property Sources created');
    
    // =====================================================
    // 2. BUSINESS & PROFESSION INCOME DETAILED CAPTURE
    // =====================================================
    console.log('💼 Creating Business/Profession Sources...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_profession_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        income_source_id UUID NOT NULL REFERENCES income_sources_detailed(id) ON DELETE CASCADE,
        
        -- Business Details
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL, -- 'business', 'profession'
        nature_of_business TEXT,
        business_code VARCHAR(10), -- NIC code
        
        -- Financial Details
        gross_receipts DECIMAL(15,2) DEFAULT 0,
        gross_profit DECIMAL(15,2) DEFAULT 0,
        total_expenses DECIMAL(15,2) DEFAULT 0,
        net_profit DECIMAL(15,2) DEFAULT 0,
        
        -- Presumptive Taxation
        presumptive_section VARCHAR(20), -- '44AD', '44ADA', '44AE'
        presumptive_income DECIMAL(15,2) DEFAULT 0,
        turnover_received_via_account_payee DECIMAL(15,2) DEFAULT 0,
        turnover_received_by_other_modes DECIMAL(15,2) DEFAULT 0,
        
        -- Audit Details
        audit_required BOOLEAN DEFAULT FALSE,
        auditor_name VARCHAR(255),
        auditor_membership_number VARCHAR(50),
        auditor_firm_registration_number VARCHAR(50),
        
        -- Books of Accounts
        books_maintained BOOLEAN DEFAULT FALSE,
        books_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_business_type CHECK (business_type IN ('business', 'profession')),
        CONSTRAINT valid_presumptive_section CHECK (presumptive_section IN ('44AD', '44ADA', '44AE', 'not_applicable'))
      )
    `);
    console.log('✅ Business/Profession Sources created');
    
    // =====================================================
    // 3. CAPITAL GAINS DETAILED CAPTURE
    // =====================================================
    console.log('📈 Creating Capital Gains Sources...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS capital_gains_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        income_source_id UUID NOT NULL REFERENCES income_sources_detailed(id) ON DELETE CASCADE,
        
        -- Asset Details
        asset_type VARCHAR(100) NOT NULL, -- 'equity_shares', 'mutual_funds', 'property', 'bonds', 'crypto'
        asset_description TEXT,
        asset_category VARCHAR(50) NOT NULL, -- 'short_term', 'long_term'
        
        -- Transaction Details
        date_of_purchase DATE,
        date_of_sale DATE,
        cost_of_acquisition DECIMAL(15,2) DEFAULT 0,
        cost_of_improvement DECIMAL(15,2) DEFAULT 0,
        sale_consideration DECIMAL(15,2) DEFAULT 0,
        transfer_expenses DECIMAL(15,2) DEFAULT 0,
        
        -- Calculation Details
        indexed_cost_of_acquisition DECIMAL(15,2) DEFAULT 0,
        indexed_cost_of_improvement DECIMAL(15,2) DEFAULT 0,
        long_term_capital_gain DECIMAL(15,2) DEFAULT 0,
        short_term_capital_gain DECIMAL(15,2) DEFAULT 0,
        
        -- Exemptions
        exemption_claimed DECIMAL(15,2) DEFAULT 0,
        exemption_section VARCHAR(20), -- '54', '54B', '54D', '54EC', '54F', '54G', '54GA'
        exemption_details JSONB DEFAULT '{}',
        
        -- Securities Details (for shares/MFs)
        isin VARCHAR(12),
        folio_number VARCHAR(100),
        broker_name VARCHAR(255),
        broker_pan VARCHAR(10),
        
        -- Property Details (for real estate)
        property_address JSONB,
        registration_number VARCHAR(100),
        
        -- Documents
        purchase_document_id UUID REFERENCES document_uploads(upload_id),
        sale_document_id UUID REFERENCES document_uploads(upload_id),
        exemption_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_asset_category CHECK (asset_category IN ('short_term', 'long_term')),
        CONSTRAINT valid_exemption_section CHECK (exemption_section IN ('54', '54B', '54D', '54EC', '54F', '54G', '54GA', 'not_applicable'))
      )
    `);
    console.log('✅ Capital Gains Sources created');
    
    // =====================================================
    // 4. OTHER INCOME SOURCES DETAILED CAPTURE
    // =====================================================
    console.log('💰 Creating Other Income Sources...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS other_income_sources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        income_source_id UUID NOT NULL REFERENCES income_sources_detailed(id) ON DELETE CASCADE,
        
        -- Income Type
        income_type VARCHAR(100) NOT NULL, -- 'interest', 'dividend', 'pension', 'family_pension', 'royalty', 'other'
        income_description TEXT,
        
        -- Financial Details
        gross_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        exempt_amount DECIMAL(15,2) DEFAULT 0,
        taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        tds_deducted DECIMAL(15,2) DEFAULT 0,
        
        -- Source Details
        payer_name VARCHAR(255),
        payer_pan VARCHAR(10),
        payer_tan VARCHAR(10),
        
        -- Interest Details
        interest_type VARCHAR(50), -- 'savings', 'fixed_deposit', 'bonds', 'nsc', 'ppf', 'other'
        bank_name VARCHAR(255),
        account_number VARCHAR(100),
        
        -- Dividend Details
        company_name VARCHAR(255),
        dividend_type VARCHAR(50), -- 'equity', 'preference', 'mutual_fund'
        
        -- Pension Details
        pension_type VARCHAR(50), -- 'government', 'private', 'family'
        pension_authority VARCHAR(255),
        
        -- Documents
        supporting_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_income_type CHECK (income_type IN ('interest', 'dividend', 'pension', 'family_pension', 'royalty', 'other')),
        CONSTRAINT valid_interest_type CHECK (interest_type IN ('savings', 'fixed_deposit', 'bonds', 'nsc', 'ppf', 'other', 'not_applicable')),
        CONSTRAINT valid_dividend_type CHECK (dividend_type IN ('equity', 'preference', 'mutual_fund', 'not_applicable')),
        CONSTRAINT valid_pension_type CHECK (pension_type IN ('government', 'private', 'family', 'not_applicable'))
      )
    `);
    console.log('✅ Other Income Sources created');
    
    // =====================================================
    // 5. COMPREHENSIVE DEDUCTIONS SYSTEM
    // =====================================================
    console.log('📝 Creating Deduction Categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS deduction_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_code VARCHAR(50) UNIQUE NOT NULL,
        category_name VARCHAR(100) NOT NULL,
        section_number VARCHAR(10) NOT NULL,
        description TEXT,
        max_amount DECIMAL(15,2),
        itr_forms_supported JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Deduction Categories created');
    
    console.log('📝 Creating Detailed Deductions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS deductions_detailed (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filing_submission_id UUID NOT NULL REFERENCES filing_submissions(submission_id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES deduction_categories(id),
        
        -- Deduction Details
        deduction_name VARCHAR(255) NOT NULL,
        deduction_type VARCHAR(100) NOT NULL,
        claimed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        max_allowed_amount DECIMAL(15,2),
        allowed_amount DECIMAL(15,2) DEFAULT 0,
        
        -- Data Source Tracking
        data_source VARCHAR(50) NOT NULL,
        source_reference VARCHAR(255),
        confidence_score DECIMAL(3,2),
        
        -- Additional Details
        deduction_details JSONB DEFAULT '{}',
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_deduction_data_source CHECK (data_source IN ('manual', 'api', 'document_parsing', 'import', 'calculation'))
      )
    `);
    console.log('✅ Detailed Deductions created');
    
    // =====================================================
    // 6. SECTION 80C DEDUCTIONS DETAILED
    // =====================================================
    console.log('💎 Creating Section 80C Deductions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS section_80c_deductions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deduction_id UUID NOT NULL REFERENCES deductions_detailed(id) ON DELETE CASCADE,
        
        -- Investment Details
        investment_type VARCHAR(100) NOT NULL, -- 'ppf', 'elss', 'nsc', 'life_insurance', 'pension_fund', 'home_loan_principal', 'sukanya_samriddhi', 'other'
        investment_description TEXT,
        
        -- Financial Details
        investment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        maturity_amount DECIMAL(15,2) DEFAULT 0,
        maturity_date DATE,
        
        -- Provider Details
        provider_name VARCHAR(255),
        provider_pan VARCHAR(10),
        policy_number VARCHAR(100),
        account_number VARCHAR(100),
        
        -- Documents
        investment_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_investment_type CHECK (investment_type IN ('ppf', 'elss', 'nsc', 'life_insurance', 'pension_fund', 'home_loan_principal', 'sukanya_samriddhi', 'other'))
      )
    `);
    console.log('✅ Section 80C Deductions created');
    
    // =====================================================
    // 7. SECTION 80D MEDICAL INSURANCE DETAILED
    // =====================================================
    console.log('🏥 Creating Section 80D Deductions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS section_80d_deductions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deduction_id UUID NOT NULL REFERENCES deductions_detailed(id) ON DELETE CASCADE,
        
        -- Insurance Details
        insurance_type VARCHAR(50) NOT NULL, -- 'self', 'family', 'parents', 'senior_citizen_parents'
        insurance_company VARCHAR(255) NOT NULL,
        policy_number VARCHAR(100) NOT NULL,
        premium_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        
        -- Coverage Details
        coverage_amount DECIMAL(15,2) DEFAULT 0,
        policy_start_date DATE,
        policy_end_date DATE,
        
        -- Beneficiary Details
        beneficiary_name VARCHAR(255),
        beneficiary_relationship VARCHAR(50),
        
        -- Documents
        insurance_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_insurance_type CHECK (insurance_type IN ('self', 'family', 'parents', 'senior_citizen_parents'))
      )
    `);
    console.log('✅ Section 80D Deductions created');
    
    // =====================================================
    // 8. ADDITIONAL DEDUCTION SECTIONS
    // =====================================================
    console.log('📋 Creating Additional Deduction Sections...');
    
    // Section 80G Deductions (Donations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS section_80g_deductions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deduction_id UUID NOT NULL REFERENCES deductions_detailed(id) ON DELETE CASCADE,
        
        -- Donation Details
        donation_type VARCHAR(50) NOT NULL, -- 'cash', 'kind', 'corpus', 'specific'
        donee_name VARCHAR(255) NOT NULL,
        donee_registration_number VARCHAR(50),
        donee_address JSONB,
        
        -- Financial Details
        donation_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        eligible_amount DECIMAL(15,2) DEFAULT 0,
        deduction_percentage DECIMAL(5,2) DEFAULT 100.00,
        
        -- Documents
        donation_receipt_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_donation_type CHECK (donation_type IN ('cash', 'kind', 'corpus', 'specific'))
      )
    `);
    console.log('✅ Section 80G Deductions created');
    
    // Section 80E Deductions (Education Loan Interest)
    await client.query(`
      CREATE TABLE IF NOT EXISTS section_80e_deductions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deduction_id UUID NOT NULL REFERENCES deductions_detailed(id) ON DELETE CASCADE,
        
        -- Loan Details
        lender_name VARCHAR(255) NOT NULL,
        lender_pan VARCHAR(10),
        loan_account_number VARCHAR(100),
        loan_amount DECIMAL(15,2) DEFAULT 0,
        
        -- Education Details
        student_name VARCHAR(255) NOT NULL,
        student_relationship VARCHAR(50) NOT NULL,
        course_name VARCHAR(255),
        institution_name VARCHAR(255),
        
        -- Financial Details
        interest_paid DECIMAL(15,2) NOT NULL DEFAULT 0,
        loan_start_date DATE,
        loan_end_date DATE,
        
        -- Documents
        loan_certificate_document_id UUID REFERENCES document_uploads(upload_id),
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_student_relationship CHECK (student_relationship IN ('self', 'spouse', 'children', 'parents'))
      )
    `);
    console.log('✅ Section 80E Deductions created');
    
    // =====================================================
    // 9. CREATE INDEXES FOR PERFORMANCE
    // =====================================================
    console.log('🔍 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_house_property_sources_income_source_id ON house_property_sources(income_source_id)',
      'CREATE INDEX IF NOT EXISTS idx_business_profession_sources_income_source_id ON business_profession_sources(income_source_id)',
      'CREATE INDEX IF NOT EXISTS idx_capital_gains_sources_income_source_id ON capital_gains_sources(income_source_id)',
      'CREATE INDEX IF NOT EXISTS idx_other_income_sources_income_source_id ON other_income_sources(income_source_id)',
      'CREATE INDEX IF NOT EXISTS idx_deductions_detailed_filing_id ON deductions_detailed(filing_submission_id)',
      'CREATE INDEX IF NOT EXISTS idx_deductions_detailed_category_id ON deductions_detailed(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_section_80c_deductions_deduction_id ON section_80c_deductions(deduction_id)',
      'CREATE INDEX IF NOT EXISTS idx_section_80d_deductions_deduction_id ON section_80d_deductions(deduction_id)',
      'CREATE INDEX IF NOT EXISTS idx_section_80g_deductions_deduction_id ON section_80g_deductions(deduction_id)',
      'CREATE INDEX IF NOT EXISTS idx_section_80e_deductions_deduction_id ON section_80e_deductions(deduction_id)'
    ];
    
    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Performance indexes created');
    
    // =====================================================
    // 10. INSERT INITIAL DATA
    // =====================================================
    console.log('📝 Inserting initial deduction categories...');
    
    await client.query(`
      INSERT INTO deduction_categories (category_code, category_name, section_number, description, max_amount, itr_forms_supported) VALUES
      ('STANDARD', 'Standard Deduction', '16', 'Standard deduction from salary', 50000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80C', 'Section 80C', '80C', 'Deduction for certain investments and payments', 150000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80D', 'Section 80D', '80D', 'Deduction for medical insurance premium', 25000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80G', 'Section 80G', '80G', 'Deduction for donations', 0, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80E', 'Section 80E', '80E', 'Deduction for interest on education loan', 0, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80TTA', 'Section 80TTA', '80TTA', 'Deduction for interest on savings account', 10000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80TTB', 'Section 80TTB', '80TTB', 'Deduction for interest on deposits for senior citizens', 50000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80U', 'Section 80U', '80U', 'Deduction for persons with disability', 125000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80DD', 'Section 80DD', '80DD', 'Deduction for maintenance of handicapped dependent', 75000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
      ('80DDB', 'Section 80DDB', '80DDB', 'Deduction for medical treatment of specified diseases', 40000, '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]')
      ON CONFLICT (category_code) DO NOTHING
    `);
    console.log('✅ Deduction categories inserted');
    
    console.log('\n🎉 Additional tables implementation completed successfully!');
    console.log('✅ All income source tables created');
    console.log('✅ Comprehensive deductions system created');
    console.log('✅ Performance indexes created');
    console.log('✅ Initial data loaded');
    
  } catch (error) {
    console.error('❌ Error implementing additional tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the implementation
implementAdditionalTables()
  .then(() => {
    console.log('\n🎯 Additional tables implementation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Implementation failed:', error);
    process.exit(1);
  });
