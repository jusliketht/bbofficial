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

async function createDataValidationRules() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating data validation rules for business logic...');
    
    // =====================================================
    // 1. CREATE DATA VALIDATION TABLES
    // =====================================================
    console.log('📋 Creating Data Validation Rules table...');
    await client.query(`
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
      )
    `);
    console.log('✅ Data Validation Rules table created');
    
    console.log('📋 Creating Data Validation Results table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_validation_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filing_submission_id UUID NOT NULL REFERENCES filing_submissions(submission_id) ON DELETE CASCADE,
        rule_id UUID NOT NULL REFERENCES data_validation_rules(id),
        
        -- Validation Details
        validation_status VARCHAR(20) NOT NULL, -- 'passed', 'failed', 'warning'
        validation_message TEXT,
        affected_fields JSONB DEFAULT '[]',
        
        -- Audit
        validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_validation_status CHECK (validation_status IN ('passed', 'failed', 'warning', 'skipped'))
      )
    `);
    console.log('✅ Data Validation Results table created');
    
    // =====================================================
    // 2. INCOME VALIDATION RULES
    // =====================================================
    console.log('💰 Creating Income Validation Rules...');
    
    const incomeValidationRules = [
      {
        rule_name: 'salary_income_range',
        rule_type: 'income',
        rule_description: 'Salary income must be within reasonable range',
        validation_logic: {
          field: 'gross_amount',
          min: 0,
          max: 10000000,
          table: 'income_sources_detailed',
          condition: "source_type = 'salary'"
        },
        error_message: 'Salary income must be between 0 and 1 crore',
        severity: 'error'
      },
      {
        rule_name: 'house_property_annual_value',
        rule_type: 'income',
        rule_description: 'House property annual value validation',
        validation_logic: {
          field: 'annual_value',
          min: 0,
          max: 5000000,
          table: 'house_property_sources'
        },
        error_message: 'House property annual value must be between 0 and 50 lakhs',
        severity: 'error'
      },
      {
        rule_name: 'business_turnover_range',
        rule_type: 'income',
        rule_description: 'Business turnover validation',
        validation_logic: {
          field: 'gross_receipts',
          min: 0,
          max: 100000000,
          table: 'business_profession_sources'
        },
        error_message: 'Business turnover must be between 0 and 10 crores',
        severity: 'error'
      },
      {
        rule_name: 'capital_gains_transaction_dates',
        rule_type: 'income',
        rule_description: 'Capital gains transaction date validation',
        validation_logic: {
          fields: ['date_of_purchase', 'date_of_sale'],
          condition: 'date_of_sale >= date_of_purchase',
          table: 'capital_gains_sources'
        },
        error_message: 'Sale date must be after purchase date',
        severity: 'error'
      },
      {
        rule_name: 'interest_income_range',
        rule_type: 'income',
        rule_description: 'Interest income validation',
        validation_logic: {
          field: 'gross_amount',
          min: 0,
          max: 1000000,
          table: 'other_income_sources',
          condition: "income_type = 'interest'"
        },
        error_message: 'Interest income must be between 0 and 10 lakhs',
        severity: 'error'
      }
    ];
    
    for (const rule of incomeValidationRules) {
      await client.query(`
        INSERT INTO data_validation_rules (rule_name, rule_type, rule_description, validation_logic, error_message, severity)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (rule_name) DO NOTHING
      `, [rule.rule_name, rule.rule_type, rule.rule_description, JSON.stringify(rule.validation_logic), rule.error_message, rule.severity]);
    }
    console.log('✅ Income validation rules created');
    
    // =====================================================
    // 3. DEDUCTION VALIDATION RULES
    // =====================================================
    console.log('📝 Creating Deduction Validation Rules...');
    
    const deductionValidationRules = [
      {
        rule_name: 'section_80c_limit',
        rule_type: 'deduction',
        rule_description: 'Section 80C deduction limit validation',
        validation_logic: {
          field: 'claimed_amount',
          max: 150000,
          table: 'deductions_detailed',
          condition: "category_id IN (SELECT id FROM deduction_categories WHERE category_code = '80C')"
        },
        error_message: 'Section 80C deduction cannot exceed Rs. 1.5 lakh',
        severity: 'error'
      },
      {
        rule_name: 'section_80d_limit',
        rule_type: 'deduction',
        rule_description: 'Section 80D deduction limit validation',
        validation_logic: {
          field: 'claimed_amount',
          max: 25000,
          table: 'deductions_detailed',
          condition: "category_id IN (SELECT id FROM deduction_categories WHERE category_code = '80D')"
        },
        error_message: 'Section 80D deduction cannot exceed Rs. 25,000',
        severity: 'error'
      },
      {
        rule_name: 'section_80tta_limit',
        rule_type: 'deduction',
        rule_description: 'Section 80TTA deduction limit validation',
        validation_logic: {
          field: 'claimed_amount',
          max: 10000,
          table: 'deductions_detailed',
          condition: "category_id IN (SELECT id FROM deduction_categories WHERE category_code = '80TTA')"
        },
        error_message: 'Section 80TTA deduction cannot exceed Rs. 10,000',
        severity: 'error'
      },
      {
        rule_name: 'investment_amount_positive',
        rule_type: 'deduction',
        rule_description: 'Investment amounts must be positive',
        validation_logic: {
          field: 'investment_amount',
          min: 0,
          table: 'section_80c_deductions'
        },
        error_message: 'Investment amount must be positive',
        severity: 'error'
      },
      {
        rule_name: 'insurance_premium_positive',
        rule_type: 'deduction',
        rule_description: 'Insurance premium must be positive',
        validation_logic: {
          field: 'premium_amount',
          min: 0,
          table: 'section_80d_deductions'
        },
        error_message: 'Insurance premium must be positive',
        severity: 'error'
      }
    ];
    
    for (const rule of deductionValidationRules) {
      await client.query(`
        INSERT INTO data_validation_rules (rule_name, rule_type, rule_description, validation_logic, error_message, severity)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (rule_name) DO NOTHING
      `, [rule.rule_name, rule.rule_type, rule.rule_description, JSON.stringify(rule.validation_logic), rule.error_message, rule.severity]);
    }
    console.log('✅ Deduction validation rules created');
    
    // =====================================================
    // 4. CROSS-VALIDATION RULES
    // =====================================================
    console.log('🔄 Creating Cross-Validation Rules...');
    
    const crossValidationRules = [
      {
        rule_name: 'tds_salary_validation',
        rule_type: 'cross_validation',
        rule_description: 'TDS on salary validation',
        validation_logic: {
          rule: 'tds_deducted <= salary_income * 0.1',
          tables: ['salary_income_sources', 'income_sources_detailed'],
          join_condition: 'salary_income_sources.income_source_id = income_sources_detailed.id'
        },
        error_message: 'TDS on salary cannot exceed 10% of salary income',
        severity: 'warning'
      },
      {
        rule_name: 'house_property_rental_consistency',
        rule_type: 'cross_validation',
        rule_description: 'House property rental consistency check',
        validation_logic: {
          rule: 'rent_received <= annual_value',
          table: 'house_property_sources',
          condition: "ownership_type = 'let_out'"
        },
        error_message: 'Rent received cannot exceed annual value',
        severity: 'warning'
      },
      {
        rule_name: 'business_profit_margin',
        rule_type: 'cross_validation',
        rule_description: 'Business profit margin validation',
        validation_logic: {
          rule: 'net_profit <= gross_receipts',
          table: 'business_profession_sources'
        },
        error_message: 'Net profit cannot exceed gross receipts',
        severity: 'error'
      },
      {
        rule_name: 'capital_gains_calculation',
        rule_type: 'cross_validation',
        rule_description: 'Capital gains calculation validation',
        validation_logic: {
          rule: 'sale_consideration >= cost_of_acquisition + cost_of_improvement',
          table: 'capital_gains_sources',
          condition: "asset_category = 'long_term'"
        },
        error_message: 'Sale consideration should be at least equal to cost of acquisition plus improvement',
        severity: 'warning'
      },
      {
        rule_name: 'deduction_total_limit',
        rule_type: 'cross_validation',
        rule_description: 'Total deductions limit validation',
        validation_logic: {
          rule: 'SUM(claimed_amount) <= gross_total_income * 0.3',
          tables: ['deductions_detailed', 'income_sources_detailed'],
          join_condition: 'deductions_detailed.filing_submission_id = income_sources_detailed.filing_submission_id'
        },
        error_message: 'Total deductions cannot exceed 30% of gross total income',
        severity: 'warning'
      }
    ];
    
    for (const rule of crossValidationRules) {
      await client.query(`
        INSERT INTO data_validation_rules (rule_name, rule_type, rule_description, validation_logic, error_message, severity)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (rule_name) DO NOTHING
      `, [rule.rule_name, rule.rule_type, rule.rule_description, JSON.stringify(rule.validation_logic), rule.error_message, rule.severity]);
    }
    console.log('✅ Cross-validation rules created');
    
    // =====================================================
    // 5. CALCULATION VALIDATION RULES
    // =====================================================
    console.log('🧮 Creating Calculation Validation Rules...');
    
    const calculationValidationRules = [
      {
        rule_name: 'taxable_amount_calculation',
        rule_type: 'calculation',
        rule_description: 'Taxable amount calculation validation',
        validation_logic: {
          rule: 'taxable_amount = gross_amount - exempt_amount',
          table: 'income_sources_detailed'
        },
        error_message: 'Taxable amount must equal gross amount minus exempt amount',
        severity: 'error'
      },
      {
        rule_name: 'allowed_deduction_calculation',
        rule_type: 'calculation',
        rule_description: 'Allowed deduction calculation validation',
        validation_logic: {
          rule: 'allowed_amount = LEAST(claimed_amount, max_allowed_amount)',
          table: 'deductions_detailed'
        },
        error_message: 'Allowed deduction must be the minimum of claimed amount and maximum allowed amount',
        severity: 'error'
      },
      {
        rule_name: 'capital_gains_indexation',
        rule_type: 'calculation',
        rule_description: 'Capital gains indexation validation',
        validation_logic: {
          rule: 'indexed_cost_of_acquisition >= cost_of_acquisition',
          table: 'capital_gains_sources',
          condition: "asset_category = 'long_term'"
        },
        error_message: 'Indexed cost of acquisition must be greater than or equal to original cost',
        severity: 'warning'
      },
      {
        rule_name: 'house_property_net_income',
        rule_type: 'calculation',
        rule_description: 'House property net income calculation',
        validation_logic: {
          rule: 'annual_value - municipal_taxes - standard_deduction - interest_on_housing_loan >= 0',
          table: 'house_property_sources'
        },
        error_message: 'House property net income cannot be negative',
        severity: 'warning'
      }
    ];
    
    for (const rule of calculationValidationRules) {
      await client.query(`
        INSERT INTO data_validation_rules (rule_name, rule_type, rule_description, validation_logic, error_message, severity)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (rule_name) DO NOTHING
      `, [rule.rule_name, rule.rule_type, rule.rule_description, JSON.stringify(rule.validation_logic), rule.error_message, rule.severity]);
    }
    console.log('✅ Calculation validation rules created');
    
    // =====================================================
    // 6. CREATE INDEXES FOR VALIDATION TABLES
    // =====================================================
    console.log('🔍 Creating validation indexes...');
    
    const validationIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_data_validation_rules_rule_type ON data_validation_rules(rule_type)',
      'CREATE INDEX IF NOT EXISTS idx_data_validation_rules_is_active ON data_validation_rules(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_data_validation_results_filing_id ON data_validation_results(filing_submission_id)',
      'CREATE INDEX IF NOT EXISTS idx_data_validation_results_rule_id ON data_validation_results(rule_id)',
      'CREATE INDEX IF NOT EXISTS idx_data_validation_results_status ON data_validation_results(validation_status)',
      'CREATE INDEX IF NOT EXISTS idx_data_validation_results_validated_at ON data_validation_results(validated_at)'
    ];
    
    for (const indexQuery of validationIndexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Validation indexes created');
    
    // =====================================================
    // 7. VERIFY VALIDATION RULES CREATION
    // =====================================================
    console.log('📊 Verifying validation rules creation...');
    
    const rulesCount = await client.query('SELECT COUNT(*) FROM data_validation_rules');
    const rulesByType = await client.query(`
      SELECT rule_type, COUNT(*) as count 
      FROM data_validation_rules 
      GROUP BY rule_type 
      ORDER BY rule_type
    `);
    
    console.log(`✅ Total validation rules created: ${rulesCount.rows[0].count}`);
    console.log('📋 Rules by type:');
    rulesByType.rows.forEach(row => {
      console.log(`   - ${row.rule_type}: ${row.count} rules`);
    });
    
    console.log('\n🎉 Data validation rules implementation completed successfully!');
    console.log('✅ Income validation rules created');
    console.log('✅ Deduction validation rules created');
    console.log('✅ Cross-validation rules created');
    console.log('✅ Calculation validation rules created');
    console.log('✅ Performance indexes created');
    
  } catch (error) {
    console.error('❌ Error creating validation rules:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the implementation
createDataValidationRules()
  .then(() => {
    console.log('\n🎯 Data validation rules implementation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Implementation failed:', error);
    process.exit(1);
  });
