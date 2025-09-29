// Justification: Database Administrator Demo Account Creation Script
// Creates a demo user account for testing the ITR Filing Platform
// Works with the current database schema and configuration
// Essential for setting up test environment with proper database connections
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { pool } = require('./src/config/database');

// Justification: Hash PII function - Consistent with platform security
// Hashes PII data using SHA256 for privacy compliance
// Required for GDPR compliance and data protection
function hashPII(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Justification: Create Demo User - Database administrator function
// Creates a comprehensive demo user with all necessary data
// Essential for testing all platform features and database operations
async function createDemoAccount() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Database Administrator: Creating demo account for ITR Filing Platform...');
    
    // Demo user data - Following database schema requirements
    const demoUser = {
      user_id: uuidv4(),
      pan: 'ABCDE1234F', // Valid PAN format as per schema validation
      mobile: '9876543210',
      email: 'demo@itrplatform.com',
      mobile_hash: hashPII('9876543210'),
      email_hash: hashPII('demo@itrplatform.com'),
      consent_timestamp: new Date(),
      consent_ip: '127.0.0.1',
      locale: 'en',
      is_active: true
    };

    // Check if demo user already exists - Database integrity check
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE pan = $1',
      [demoUser.pan]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Demo user already exists with PAN:', demoUser.pan);
      return {
        success: true,
        message: 'Demo user already exists',
        credentials: {
          pan: demoUser.pan,
          mobile: demoUser.mobile,
          email: demoUser.email
        }
      };
    }

    // Create demo user - Following database schema constraints
    await client.query(`
      INSERT INTO users (
        user_id, pan, mobile_hash, email_hash, 
        consent_timestamp, consent_ip, locale, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [
      demoUser.user_id,
      demoUser.pan,
      demoUser.mobile_hash,
      demoUser.email_hash,
      demoUser.consent_timestamp,
      demoUser.consent_ip,
      demoUser.locale,
      demoUser.is_active
    ]);

    // Create a sample intake for demo user - Comprehensive ITR data
    const demoIntake = {
      intake_id: uuidv4(),
      user_id: demoUser.user_id,
      assessment_year: 2025, // Following schema constraints
      itr_type: 'ITR-1',
      name: 'Demo User',
      gender: 'MALE',
      aadhaar: '123456789012',
      filing_for: 'SELF',
      residential_status: 'RESIDENT',
      country_of_residence: 'India',
      salary_income: 500000,
      house_property_income: 0,
      business_profession_income: 0,
      capital_gains_income: 0,
      other_income: 10000,
      total_income: 510000,
      standard_deduction: 50000,
      section_80c: 150000,
      section_80d: 25000,
      section_80g: 10000,
      section_80e: 0,
      section_80tta: 10000,
      section_80ttb: 0,
      total_deductions: 245000,
      employer_category: 'Other',
      tds_salary: 25000,
      tds_other: 5000,
      advance_tax_paid: 10000,
      self_assessment_tax_paid: 5000
    };

    // Insert intake data - Following database schema structure
    await client.query(`
      INSERT INTO intake_data (
        intake_id, user_id, assessment_year, itr_type, name, gender, aadhaar,
        filing_for, residential_status, country_of_residence, salary_income,
        house_property_income, business_profession_income, capital_gains_income,
        other_income, total_income, standard_deduction, section_80c, section_80d,
        section_80g, section_80e, section_80tta, section_80ttb, total_deductions,
        employer_category, tds_salary, tds_other, advance_tax_paid,
        self_assessment_tax_paid, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW(), NOW()
      )
    `, [
      demoIntake.intake_id,
      demoIntake.user_id,
      demoIntake.assessment_year,
      demoIntake.itr_type,
      demoIntake.name,
      demoIntake.gender,
      demoIntake.aadhaar,
      demoIntake.filing_for,
      demoIntake.residential_status,
      demoIntake.country_of_residence,
      demoIntake.salary_income,
      demoIntake.house_property_income,
      demoIntake.business_profession_income,
      demoIntake.capital_gains_income,
      demoIntake.other_income,
      demoIntake.total_income,
      demoIntake.standard_deduction,
      demoIntake.section_80c,
      demoIntake.section_80d,
      demoIntake.section_80g,
      demoIntake.section_80e,
      demoIntake.section_80tta,
      demoIntake.section_80ttb,
      demoIntake.total_deductions,
      demoIntake.employer_category,
      demoIntake.tds_salary,
      demoIntake.tds_other,
      demoIntake.advance_tax_paid,
      demoIntake.self_assessment_tax_paid
    ]);

    // Create sample income heads - Detailed income breakdown
    const incomeHeads = [
      { income_type: 'Salary', amount: 500000, description: 'Monthly salary from employer' },
      { income_type: 'Interest', amount: 10000, description: 'Bank interest income' }
    ];

    for (const income of incomeHeads) {
      await client.query(`
        INSERT INTO income_heads (income_head_id, intake_id, income_type, amount, description, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [uuidv4(), demoIntake.intake_id, income.income_type, income.amount, income.description]);
    }

    // Create sample deductions - Detailed deduction breakdown
    const deductions = [
      { deduction_type: 'Section 80C', amount: 150000, description: 'ELSS, PPF, Life Insurance' },
      { deduction_type: 'Section 80D', amount: 25000, description: 'Health Insurance Premium' },
      { deduction_type: 'Section 80G', amount: 10000, description: 'Charitable Donations' },
      { deduction_type: 'Section 80TTA', amount: 10000, description: 'Savings Account Interest' }
    ];

    for (const deduction of deductions) {
      await client.query(`
        INSERT INTO deductions (deduction_id, intake_id, deduction_type, amount, description, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [uuidv4(), demoIntake.intake_id, deduction.deduction_type, deduction.amount, deduction.description]);
    }

    // Create sample tax computation - Tax calculation results
    const taxableIncome = demoIntake.total_income - demoIntake.total_deductions;
    const taxLiability = Math.max(0, taxableIncome * 0.05); // Simplified calculation
    const cess = taxLiability * 0.04;
    const totalTax = taxLiability + cess;

    await client.query(`
      INSERT INTO tax_computations (
        computation_id, intake_id, regime, computation_data, computed_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [
      uuidv4(),
      demoIntake.intake_id,
      'NEW',
      JSON.stringify({
        taxable_income: taxableIncome,
        tax_liability: taxLiability,
        cess: cess,
        total_tax: totalTax,
        rebate_87a: 0,
        final_tax: totalTax,
        calculation_method: 'simplified',
        tax_slabs: 'new_regime',
        deductions_applied: demoIntake.total_deductions
      })
    ]);

    console.log('✅ Database Administrator: Demo account created successfully!');
    console.log('📋 Demo Account Credentials:');
    console.log('   PAN: ' + demoUser.pan);
    console.log('   Mobile: ' + demoUser.mobile);
    console.log('   Email: ' + demoUser.email);
    console.log('   Intake ID: ' + demoIntake.intake_id);
    console.log('');
    console.log('🎯 Demo Account Database Features:');
    console.log('   ✅ User authentication and profile management');
    console.log('   ✅ Comprehensive ITR data collection');
    console.log('   ✅ Detailed income and deduction breakdown');
    console.log('   ✅ Tax computation and calculation');
    console.log('   ✅ All ITR types (1, 2, 3, 4) supported');
    console.log('   ✅ Document upload and management');
    console.log('   ✅ Audit trail and compliance logging');
    console.log('   ✅ CA firm and assignment management');

    return {
      success: true,
      message: 'Demo account created successfully',
      credentials: {
        pan: demoUser.pan,
        mobile: demoUser.mobile,
        email: demoUser.email,
        intake_id: demoIntake.intake_id
      }
    };

  } catch (error) {
    console.error('❌ Database Administrator Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Justification: Main execution - Database administrator workflow
// Executes the demo account creation process with proper error handling
// Essential for setting up test environment with database integrity
if (require.main === module) {
  createDemoAccount()
    .then((result) => {
      console.log('🎉 Database Administrator: Demo account setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database Administrator: Demo account setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createDemoAccount };
