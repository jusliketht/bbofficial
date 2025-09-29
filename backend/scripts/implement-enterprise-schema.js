-- =====================================================
-- ENTERPRISE-GRADE DATABASE SCHEMA IMPLEMENTATION
-- =====================================================
-- Complete migration script to implement enterprise-grade schema
-- with all ITR forms support and comprehensive data capture

-- =====================================================
-- 1. BACKUP EXISTING DATA (if needed)
-- =====================================================

-- Note: This script will create new tables and modify existing ones
-- Ensure you have backups before running this migration

-- =====================================================
-- 2. CREATE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 3. ITR FORMS DEFINITION (Government Standard)
-- =====================================================

-- ITR Forms Master (All ITR 1-7 forms)
CREATE TABLE IF NOT EXISTS itr_forms_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_type VARCHAR(10) UNIQUE NOT NULL, -- 'ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'
    form_name VARCHAR(100) NOT NULL,
    description TEXT,
    eligibility_criteria JSONB NOT NULL,
    income_sources_supported JSONB NOT NULL, -- Array of supported income sources
    deductions_supported JSONB NOT NULL, -- Array of supported deductions
    sections JSONB NOT NULL, -- Complete form structure
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. COMPREHENSIVE INCOME SOURCES SYSTEM
-- =====================================================

-- Income Source Categories
CREATE TABLE IF NOT EXISTS income_source_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL, -- 'SALARY', 'HOUSE_PROPERTY', 'BUSINESS', 'CAPITAL_GAINS', 'OTHER'
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    itr_forms_supported JSONB NOT NULL, -- Which ITR forms support this category
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detailed Income Sources (Granular level)
CREATE TABLE IF NOT EXISTS income_sources_detailed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_submission_id UUID NOT NULL REFERENCES filing_submissions(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES income_source_categories(id),
    
    -- Source Identification
    source_name VARCHAR(255) NOT NULL, -- 'Salary from ABC Corp', 'Rental Income from Property 1'
    source_type VARCHAR(100) NOT NULL, -- 'salary', 'rental', 'business', 'capital_gains', 'interest', 'dividend'
    
    -- Financial Details
    gross_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    exempt_amount DECIMAL(15,2) DEFAULT 0,
    taxable_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    
    -- Additional Details (JSONB for flexibility)
    source_details JSONB DEFAULT '{}', -- Employer details, property details, etc.
    calculation_method VARCHAR(50), -- 'standard', 'presumptive', 'actual'
    
    -- Data Source Tracking
    data_source VARCHAR(50) NOT NULL, -- 'manual', 'api', 'document_parsing', 'import'
    source_reference VARCHAR(255), -- API response ID, document ID, etc.
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00 for automated data
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_data_source CHECK (data_source IN ('manual', 'api', 'document_parsing', 'import', 'calculation')),
    CONSTRAINT valid_calculation_method CHECK (calculation_method IN ('standard', 'presumptive', 'actual', 'not_applicable'))
);

-- =====================================================
-- 5. SALARY INCOME DETAILED CAPTURE
-- =====================================================

-- Salary Income Sources
CREATE TABLE IF NOT EXISTS salary_income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    income_source_id UUID NOT NULL REFERENCES income_sources_detailed(id) ON DELETE CASCADE,
    
    -- Employer Details
    employer_name VARCHAR(255) NOT NULL,
    employer_pan VARCHAR(10),
    employer_tan VARCHAR(10),
    employer_address JSONB,
    
    -- Salary Components
    basic_salary DECIMAL(15,2) DEFAULT 0,
    hra DECIMAL(15,2) DEFAULT 0,
    special_allowance DECIMAL(15,2) DEFAULT 0,
    bonus DECIMAL(15,2) DEFAULT 0,
    commission DECIMAL(15,2) DEFAULT 0,
    overtime DECIMAL(15,2) DEFAULT 0,
    other_allowances DECIMAL(15,2) DEFAULT 0,
    
    -- Deductions from Salary
    professional_tax DECIMAL(15,2) DEFAULT 0,
    provident_fund DECIMAL(15,2) DEFAULT 0,
    esi DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    
    -- TDS Details
    tds_deducted DECIMAL(15,2) DEFAULT 0,
    tds_certificate_number VARCHAR(50),
    
    -- Form 16 Details
    form_16_received BOOLEAN DEFAULT FALSE,
    form_16_document_id UUID REFERENCES document_uploads(id),
    
    -- Additional Details
    employment_type VARCHAR(50), -- 'permanent', 'contract', 'consultant'
    employment_period_start DATE,
    employment_period_end DATE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_employment_type CHECK (employment_type IN ('permanent', 'contract', 'consultant', 'freelance'))
);

-- =====================================================
-- 6. HOUSE PROPERTY INCOME DETAILED CAPTURE
-- =====================================================

-- House Property Sources
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
    rent_receipts_document_id UUID REFERENCES document_uploads(id),
    
    -- Loan Details
    housing_loan_provider VARCHAR(255),
    loan_account_number VARCHAR(100),
    loan_start_date DATE,
    loan_end_date DATE,
    principal_amount DECIMAL(15,2),
    interest_certificate_document_id UUID REFERENCES document_uploads(id),
    
    -- Co-ownership Details
    ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
    co_owners JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_property_type CHECK (property_type IN ('residential', 'commercial', 'mixed')),
    CONSTRAINT valid_ownership_type CHECK (ownership_type IN ('self_occupied', 'let_out', 'deemed_let_out'))
);

-- =====================================================
-- 7. BUSINESS & PROFESSION INCOME DETAILED CAPTURE
-- =====================================================

-- Business/Profession Sources
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
    books_document_id UUID REFERENCES document_uploads(id),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_business_type CHECK (business_type IN ('business', 'profession')),
    CONSTRAINT valid_presumptive_section CHECK (presumptive_section IN ('44AD', '44ADA', '44AE', 'not_applicable'))
);

-- =====================================================
-- 8. CAPITAL GAINS DETAILED CAPTURE
-- =====================================================

-- Capital Gains Sources
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
    purchase_document_id UUID REFERENCES document_uploads(id),
    sale_document_id UUID REFERENCES document_uploads(id),
    exemption_document_id UUID REFERENCES document_uploads(id),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_asset_category CHECK (asset_category IN ('short_term', 'long_term')),
    CONSTRAINT valid_exemption_section CHECK (exemption_section IN ('54', '54B', '54D', '54EC', '54F', '54G', '54GA', 'not_applicable'))
);

-- =====================================================
-- 9. OTHER INCOME SOURCES DETAILED CAPTURE
-- =====================================================

-- Other Income Sources
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
    supporting_document_id UUID REFERENCES document_uploads(id),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_income_type CHECK (income_type IN ('interest', 'dividend', 'pension', 'family_pension', 'royalty', 'other')),
    CONSTRAINT valid_interest_type CHECK (interest_type IN ('savings', 'fixed_deposit', 'bonds', 'nsc', 'ppf', 'other', 'not_applicable')),
    CONSTRAINT valid_dividend_type CHECK (dividend_type IN ('equity', 'preference', 'mutual_fund', 'not_applicable')),
    CONSTRAINT valid_pension_type CHECK (pension_type IN ('government', 'private', 'family', 'not_applicable'))
);

-- =====================================================
-- 10. COMPREHENSIVE DEDUCTIONS SYSTEM
-- =====================================================

-- Deduction Categories
CREATE TABLE IF NOT EXISTS deduction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code VARCHAR(50) UNIQUE NOT NULL, -- 'STANDARD', '80C', '80D', '80G', '80E', '80TTA', '80TTB', '80U', '80DD', '80DDB', '80EE', '80EEA', '80EEB', '80GGA', '80GGC', '80GG', '80RRB', '80QQB', '80IA', '80IAB', '80IC', '80ID', '80IE', '80JJA', '80JJAA', '80LA', '80P', '80Q', '80RR', '80RRB', '80TTA', '80TTB', '80U', '80V', '80VV'
    category_name VARCHAR(100) NOT NULL,
    section_number VARCHAR(10) NOT NULL,
    description TEXT,
    max_amount DECIMAL(15,2),
    itr_forms_supported JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detailed Deductions
CREATE TABLE IF NOT EXISTS deductions_detailed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_submission_id UUID NOT NULL REFERENCES filing_submissions(id) ON DELETE CASCADE,
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
);

-- =====================================================
-- 11. SECTION 80C DEDUCTIONS DETAILED
-- =====================================================

-- Section 80C Deductions
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
    investment_document_id UUID REFERENCES document_uploads(id),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_investment_type CHECK (investment_type IN ('ppf', 'elss', 'nsc', 'life_insurance', 'pension_fund', 'home_loan_principal', 'sukanya_samriddhi', 'other'))
);

-- =====================================================
-- 12. SECTION 80D MEDICAL INSURANCE DETAILED
-- =====================================================

-- Section 80D Medical Insurance
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
    insurance_document_id UUID REFERENCES document_uploads(id),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_insurance_type CHECK (insurance_type IN ('self', 'family', 'parents', 'senior_citizen_parents'))
);

-- =====================================================
-- 13. API INTEGRATION SYSTEM
-- =====================================================

-- API Integrations
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
);

-- API Data Sync Logs
CREATE TABLE IF NOT EXISTS api_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES api_integrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
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
);

-- =====================================================
-- 14. DOCUMENT PARSING SYSTEM
-- =====================================================

-- Document Parsing Jobs
CREATE TABLE IF NOT EXISTS document_parsing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
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
);

-- =====================================================
-- 15. DATA VALIDATION AND VERIFICATION
-- =====================================================

-- Data Validation Rules
CREATE TABLE IF NOT EXISTS data_validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) UNIQUE NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'income', 'deduction', 'calculation', 'cross_validation'
    rule_description TEXT,
    validation_logic JSONB NOT NULL,
    error_message TEXT,
    severity VARCHAR(20) DEFAULT 'error', -- 'error', 'warning', 'info'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Validation Results
CREATE TABLE IF NOT EXISTS data_validation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filing_submission_id UUID NOT NULL REFERENCES filing_submissions(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES data_validation_rules(id),
    
    -- Validation Details
    validation_status VARCHAR(20) NOT NULL, -- 'passed', 'failed', 'warning'
    validation_message TEXT,
    affected_fields JSONB DEFAULT '[]',
    
    -- Audit
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_validation_status CHECK (validation_status IN ('passed', 'failed', 'warning', 'skipped'))
);

-- =====================================================
-- 16. INDEXES FOR PERFORMANCE
-- =====================================================

-- Income Sources Indexes
CREATE INDEX IF NOT EXISTS idx_income_sources_detailed_filing_id ON income_sources_detailed(filing_submission_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_detailed_category_id ON income_sources_detailed(category_id);
CREATE INDEX IF NOT EXISTS idx_income_sources_detailed_data_source ON income_sources_detailed(data_source);
CREATE INDEX IF NOT EXISTS idx_salary_income_sources_income_source_id ON salary_income_sources(income_source_id);
CREATE INDEX IF NOT EXISTS idx_house_property_sources_income_source_id ON house_property_sources(income_source_id);
CREATE INDEX IF NOT EXISTS idx_business_profession_sources_income_source_id ON business_profession_sources(income_source_id);
CREATE INDEX IF NOT EXISTS idx_capital_gains_sources_income_source_id ON capital_gains_sources(income_source_id);
CREATE INDEX IF NOT EXISTS idx_other_income_sources_income_source_id ON other_income_sources(income_source_id);

-- Deductions Indexes
CREATE INDEX IF NOT EXISTS idx_deductions_detailed_filing_id ON deductions_detailed(filing_submission_id);
CREATE INDEX IF NOT EXISTS idx_deductions_detailed_category_id ON deductions_detailed(category_id);
CREATE INDEX IF NOT EXISTS idx_section_80c_deductions_deduction_id ON section_80c_deductions(deduction_id);
CREATE INDEX IF NOT EXISTS idx_section_80d_deductions_deduction_id ON section_80d_deductions(deduction_id);

-- API Integration Indexes
CREATE INDEX IF NOT EXISTS idx_api_integrations_integration_type ON api_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_api_sync_logs_integration_id ON api_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_api_sync_logs_user_id ON api_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_sync_logs_sync_status ON api_sync_logs(sync_status);

-- Document Parsing Indexes
CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_document_id ON document_parsing_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_user_id ON document_parsing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_document_parsing_jobs_parsing_status ON document_parsing_jobs(parsing_status);

-- Validation Indexes
CREATE INDEX IF NOT EXISTS idx_data_validation_results_filing_id ON data_validation_results(filing_submission_id);
CREATE INDEX IF NOT EXISTS idx_data_validation_results_rule_id ON data_validation_results(rule_id);
CREATE INDEX IF NOT EXISTS idx_data_validation_results_status ON data_validation_results(validation_status);

-- =====================================================
-- 17. INITIAL DATA SETUP
-- =====================================================

-- Insert ITR Forms Master Data
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
 '{"sections": ["personal_info", "income", "deductions", "tax_computation", "capital_gains"]}'),

('ITR-3', 'ITR-3', 'For individuals and HUFs having income from business or profession',
 '{"income_sources": ["business", "profession"]}',
 '["business_profession", "salary", "house_property", "capital_gains", "other_income"]',
 '["standard", "80c", "80d", "80g", "80e", "80tta", "80ttb", "80u", "80dd", "80ddb", "80ia", "80iab", "80ic", "80id", "80ie"]',
 '{"sections": ["personal_info", "income", "deductions", "tax_computation", "business_profession"]}'),

('ITR-4', 'Sugam', 'For individuals, HUFs and Firms having presumptive income from business and profession',
 '{"income_sources": ["presumptive_business", "presumptive_profession"]}',
 '["business_profession", "salary", "house_property", "other_income"]',
 '["standard", "80c", "80d", "80g", "80e", "80tta", "80ttb"]',
 '{"sections": ["personal_info", "income", "deductions", "tax_computation", "presumptive_taxation"]}'),

('ITR-5', 'ITR-5', 'For persons other than individual, HUF, company and person filing ITR-7',
 '{"entity_types": ["partnership", "llp", "aop", "boi", "artificial_juridical_person"]}',
 '["business_profession", "house_property", "capital_gains", "other_income"]',
 '["standard", "80c", "80d", "80g", "80e", "80tta", "80ttb", "80u", "80dd", "80ddb", "80ia", "80iab", "80ic", "80id", "80ie"]',
 '{"sections": ["entity_info", "income", "deductions", "tax_computation"]}'),

('ITR-6', 'ITR-6', 'For companies other than companies claiming exemption under section 11',
 '{"entity_types": ["company"]}',
 '["business_profession", "house_property", "capital_gains", "other_income"]',
 '["standard", "80ia", "80iab", "80ic", "80id", "80ie", "80jja", "80jjaa"]',
 '{"sections": ["company_info", "income", "deductions", "tax_computation"]}'),

('ITR-7', 'ITR-7', 'For persons including companies required to furnish return under section 139(4A) or section 139(4B) or section 139(4C) or section 139(4D)',
 '{"entity_types": ["trust", "institution", "political_party", "electoral_trust"]}',
 '["business_profession", "house_property", "capital_gains", "other_income"]',
 '["standard", "80g", "80gga", "80ggc"]',
 '{"sections": ["entity_info", "income", "deductions", "tax_computation"]}')
ON CONFLICT (form_type) DO NOTHING;

-- Insert Income Source Categories
INSERT INTO income_source_categories (category_code, category_name, description, itr_forms_supported) VALUES
('SALARY', 'Salary Income', 'Income from salary and wages', '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
('HOUSE_PROPERTY', 'House Property Income', 'Income from house property', '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
('BUSINESS_PROFESSION', 'Business & Profession Income', 'Income from business or profession', '["ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]'),
('CAPITAL_GAINS', 'Capital Gains', 'Income from capital gains', '["ITR-2", "ITR-3", "ITR-5", "ITR-6", "ITR-7"]'),
('OTHER_INCOME', 'Other Income', 'Income from other sources', '["ITR-1", "ITR-2", "ITR-3", "ITR-4", "ITR-5", "ITR-6", "ITR-7"]')
ON CONFLICT (category_code) DO NOTHING;

-- Insert Deduction Categories
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
ON CONFLICT (category_code) DO NOTHING;

-- =====================================================
-- 18. VERIFICATION AND COMPLETION
-- =====================================================

-- Verify all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'itr_forms_master', 'income_source_categories', 'income_sources_detailed',
        'salary_income_sources', 'house_property_sources', 'business_profession_sources',
        'capital_gains_sources', 'other_income_sources', 'deduction_categories',
        'deductions_detailed', 'section_80c_deductions', 'section_80d_deductions',
        'api_integrations', 'api_sync_logs', 'document_parsing_jobs',
        'data_validation_rules', 'data_validation_results'
    );
    
    IF table_count = 16 THEN
        RAISE NOTICE '✅ Enterprise schema implementation completed successfully!';
        RAISE NOTICE '📊 Created % enterprise-grade tables', table_count;
        RAISE NOTICE '🎯 All ITR forms (1-7) supported';
        RAISE NOTICE '💰 Comprehensive income sources and deductions captured';
        RAISE NOTICE '🔗 API integration and document parsing ready';
        RAISE NOTICE '✅ Data validation and audit trails implemented';
    ELSE
        RAISE EXCEPTION '❌ Schema implementation failed. Expected 16 tables, found %', table_count;
    END IF;
END $$;
