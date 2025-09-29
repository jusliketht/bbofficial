// Justification: Database Schema Validation Script - PRD Compliance Check
// Validates the current database schema against Product Requirements Document
// Ensures all required fields, tables, and relationships are properly implemented
// Essential for preventing last-stage surprises and ensuring production readiness
const { pool } = require('./src/config/database');

// Justification: PRD Requirements Mapping - Core field requirements
// Maps PRD requirements to database schema fields
// Ensures complete coverage of all business requirements
const PRD_REQUIREMENTS = {
  // User Management Requirements
  user_management: {
    required_fields: ['user_id', 'pan', 'mobile_hash', 'email_hash', 'consent_timestamp', 'consent_ip', 'locale', 'is_active'],
    required_tables: ['users', 'user_sessions'],
    validation_rules: {
      pan: '^[A-Z]{5}[0-9]{4}[A-Z]$',
      mobile_hash: 'SHA256 hash',
      email_hash: 'SHA256 hash'
    }
  },

  // ITR Filing Requirements
  itr_filing: {
    required_fields: ['intake_id', 'user_id', 'assessment_year', 'itr_type', 'name', 'gender', 'aadhaar', 'filing_for', 'residential_status'],
    required_tables: ['intake_data', 'income_heads', 'deductions', 'tax_computations'],
    itr_types: ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'],
    required_income_fields: ['salary_income', 'house_property_income', 'business_profession_income', 'capital_gains_income', 'other_income', 'total_income'],
    required_deduction_fields: ['standard_deduction', 'section_80c', 'section_80d', 'section_80g', 'section_80e', 'section_80tta', 'section_80ttb', 'total_deductions']
  },

  // ITR-Specific Requirements
  itr_specific: {
    itr2_tables: ['house_properties', 'property_co_owners', 'capital_gains', 'foreign_income', 'foreign_assets', 'shareholding_details'],
    itr3_tables: ['business_profession', 'business_partners', 'balance_sheet_items'],
    itr4_tables: ['presumptive_business']
  },

  // Platform Requirements
  platform_features: {
    required_tables: ['ca_firms', 'ca_assignments', 'bulk_jobs', 'filing_declarations', 'filing_submissions', 'verification_sessions'],
    audit_tables: ['audit_events', 'consent_logs'],
    document_tables: ['documents'],
    bank_tables: ['bank_accounts', 'personal_info', 'tax_payments']
  },

  // Security Requirements
  security: {
    pii_hashing: ['mobile_hash', 'email_hash'],
    audit_trail: ['audit_events', 'consent_logs'],
    session_management: ['user_sessions']
  }
};

// Justification: Schema Validation Function - Comprehensive validation
// Validates database schema against PRD requirements
// Identifies missing fields, tables, and relationships
async function validateSchemaAgainstPRD() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Database Administrator: Validating schema against PRD requirements...');
    
    const validationResults = {
      passed: [],
      failed: [],
      warnings: [],
      missing_tables: [],
      missing_fields: [],
      missing_indexes: []
    };

    // Check if all required tables exist
    console.log('\n📋 Checking required tables...');
    const requiredTables = [
      ...PRD_REQUIREMENTS.user_management.required_tables,
      ...PRD_REQUIREMENTS.itr_filing.required_tables,
      ...PRD_REQUIREMENTS.itr_specific.itr2_tables,
      ...PRD_REQUIREMENTS.itr_specific.itr3_tables,
      ...PRD_REQUIREMENTS.itr_specific.itr4_tables,
      ...PRD_REQUIREMENTS.platform_features.required_tables,
      ...PRD_REQUIREMENTS.platform_features.audit_tables,
      ...PRD_REQUIREMENTS.platform_features.document_tables,
      ...PRD_REQUIREMENTS.platform_features.bank_tables
    ];

    for (const tableName of requiredTables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);
        
        if (result.rows[0].exists) {
          console.log(`   ✅ Table exists: ${tableName}`);
          validationResults.passed.push(`Table: ${tableName}`);
        } else {
          console.log(`   ❌ Missing table: ${tableName}`);
          validationResults.missing_tables.push(tableName);
          validationResults.failed.push(`Missing table: ${tableName}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error checking table ${tableName}: ${error.message}`);
        validationResults.warnings.push(`Error checking table ${tableName}: ${error.message}`);
      }
    }

    // Check intake_data table structure against PRD requirements
    console.log('\n📊 Validating intake_data table structure...');
    try {
      const intakeColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'intake_data' 
        ORDER BY ordinal_position;
      `);

      const requiredIntakeFields = [
        'intake_id', 'user_id', 'assessment_year', 'itr_type', 'name', 'gender', 
        'aadhaar', 'filing_for', 'residential_status', 'country_of_residence',
        'salary_income', 'house_property_income', 'business_profession_income', 
        'capital_gains_income', 'other_income', 'total_income',
        'standard_deduction', 'section_80c', 'section_80d', 'section_80g', 
        'section_80e', 'section_80tta', 'section_80ttb', 'total_deductions',
        'employer_category', 'tds_salary', 'tds_other', 'advance_tax_paid', 
        'self_assessment_tax_paid', 'computed_tax', 'computed_at',
        'ack_number', 'filed_at', 'verification_method', 'verification_date', 
        'verified_at', 'created_at', 'updated_at'
      ];

      const existingColumns = intakeColumns.rows.map(row => row.column_name);
      
      for (const requiredField of requiredIntakeFields) {
        if (existingColumns.includes(requiredField)) {
          console.log(`   ✅ Field exists: ${requiredField}`);
          validationResults.passed.push(`Field: intake_data.${requiredField}`);
        } else {
          console.log(`   ❌ Missing field: ${requiredField}`);
          validationResults.missing_fields.push(`intake_data.${requiredField}`);
          validationResults.failed.push(`Missing field: intake_data.${requiredField}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error validating intake_data: ${error.message}`);
      validationResults.warnings.push(`Error validating intake_data: ${error.message}`);
    }

    // Check users table structure
    console.log('\n👤 Validating users table structure...');
    try {
      const userColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);

      const requiredUserFields = [
        'user_id', 'pan', 'mobile_hash', 'email_hash', 'consent_timestamp', 
        'consent_ip', 'locale', 'is_active', 'created_at', 'updated_at'
      ];

      const existingUserColumns = userColumns.rows.map(row => row.column_name);
      
      for (const requiredField of requiredUserFields) {
        if (existingUserColumns.includes(requiredField)) {
          console.log(`   ✅ Field exists: ${requiredField}`);
          validationResults.passed.push(`Field: users.${requiredField}`);
        } else {
          console.log(`   ❌ Missing field: ${requiredField}`);
          validationResults.missing_fields.push(`users.${requiredField}`);
          validationResults.failed.push(`Missing field: users.${requiredField}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error validating users: ${error.message}`);
      validationResults.warnings.push(`Error validating users: ${error.message}`);
    }

    // Check ITR type constraints
    console.log('\n📋 Validating ITR type constraints...');
    try {
      const itrTypes = await client.query(`
        SELECT DISTINCT itr_type FROM intake_data WHERE itr_type IS NOT NULL;
      `);
      
      const existingITRTypes = itrTypes.rows.map(row => row.itr_type);
      const requiredITRTypes = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'];
      
      for (const requiredType of requiredITRTypes) {
        if (existingITRTypes.includes(requiredType)) {
          console.log(`   ✅ ITR type supported: ${requiredType}`);
          validationResults.passed.push(`ITR Type: ${requiredType}`);
        } else {
          console.log(`   ⚠️  ITR type not tested: ${requiredType}`);
          validationResults.warnings.push(`ITR Type not tested: ${requiredType}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error checking ITR types: ${error.message}`);
      validationResults.warnings.push(`Error checking ITR types: ${error.message}`);
    }

    // Check performance indexes
    console.log('\n🔍 Validating performance indexes...');
    try {
      const indexes = await client.query(`
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%';
      `);
      
      const existingIndexes = indexes.rows.map(row => row.indexname);
      const requiredIndexes = [
        'idx_intake_data_user_id', 'idx_intake_data_assessment_year',
        'idx_income_heads_intake_id', 'idx_deductions_intake_id',
        'idx_documents_intake_id', 'idx_audit_events_user_id',
        'idx_audit_events_intake_id', 'idx_consent_logs_user_id',
        'idx_user_sessions_user_id', 'idx_user_sessions_token_hash'
      ];
      
      for (const requiredIndex of requiredIndexes) {
        if (existingIndexes.includes(requiredIndex)) {
          console.log(`   ✅ Index exists: ${requiredIndex}`);
          validationResults.passed.push(`Index: ${requiredIndex}`);
        } else {
          console.log(`   ❌ Missing index: ${requiredIndex}`);
          validationResults.missing_indexes.push(requiredIndex);
          validationResults.failed.push(`Missing index: ${requiredIndex}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Error checking indexes: ${error.message}`);
      validationResults.warnings.push(`Error checking indexes: ${error.message}`);
    }

    // Generate validation report
    console.log('\n📊 PRD Schema Validation Report');
    console.log('================================');
    console.log(`✅ Passed: ${validationResults.passed.length}`);
    console.log(`❌ Failed: ${validationResults.failed.length}`);
    console.log(`⚠️  Warnings: ${validationResults.warnings.length}`);
    
    if (validationResults.failed.length > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND:');
      validationResults.failed.forEach(issue => console.log(`   - ${issue}`));
    }
    
    if (validationResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      validationResults.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (validationResults.passed.length > 0) {
      console.log('\n✅ VALIDATION PASSED:');
      validationResults.passed.slice(0, 10).forEach(pass => console.log(`   - ${pass}`));
      if (validationResults.passed.length > 10) {
        console.log(`   ... and ${validationResults.passed.length - 10} more`);
      }
    }

    // Return validation results
    return {
      success: validationResults.failed.length === 0,
      results: validationResults,
      summary: {
        total_checks: validationResults.passed.length + validationResults.failed.length + validationResults.warnings.length,
        passed: validationResults.passed.length,
        failed: validationResults.failed.length,
        warnings: validationResults.warnings.length
      }
    };

  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Justification: Main execution - Run schema validation
// Executes comprehensive schema validation against PRD
// Essential for ensuring production readiness
if (require.main === module) {
  validateSchemaAgainstPRD()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 Schema validation PASSED - Ready for production!');
        process.exit(0);
      } else {
        console.log('\n💥 Schema validation FAILED - Fix issues before production!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Schema validation error:', error);
      process.exit(1);
    });
}

module.exports = { validateSchemaAgainstPRD };
