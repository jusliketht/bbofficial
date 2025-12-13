// =====================================================
// SCHEMA COMPLETENESS VERIFICATION
// Verifies Supabase database schema matches code expectations
// =====================================================

require('dotenv').config();
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');
const { QueryTypes } = require('sequelize');

const verifySchemaCompleteness = async () => {
  try {
    console.log('\n=== Database Schema Verification ===\n');
    
    // Test connection
    console.log('1. Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    const results = {
      tables: { existing: [], missing: [] },
      columns: { existing: [], missing: [], mismatched: [] },
      indexes: { existing: [], missing: [] },
      constraints: { existing: [], missing: [] },
    };
    
    // 2. Check for new tables
    console.log('2. Checking table existence...');
    const tablesResult = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('report_templates', 'system_settings')
      ORDER BY table_name
    `, { type: QueryTypes.SELECT });
    
    // QueryTypes.SELECT returns array directly
    const tables = Array.isArray(tablesResult) ? tablesResult : [];
    const existingTables = tables.map(t => {
      // Handle both object and string results
      if (typeof t === 'string') return t;
      return t.table_name || t;
    });
    const requiredTables = ['report_templates', 'system_settings'];
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} - exists`);
        results.tables.existing.push(table);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
        results.tables.missing.push(table);
      }
    });
    console.log('');
    
    // 3. Check user_profiles columns
    console.log('3. Checking user_profiles table columns...');
    const columnsResult = await sequelize.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_profiles'
      AND column_name IN ('aadhaar_linked', 'aadhaar_verified_at', 'aadhaar_verification_data')
      ORDER BY column_name
    `, { type: QueryTypes.SELECT });
    
    // QueryTypes.SELECT returns array directly
    const columns = Array.isArray(columnsResult) ? columnsResult : [];
    const existingColumns = columns.map(c => {
      if (typeof c === 'string') return c;
      return c.column_name || c;
    });
    const requiredColumns = [
      { name: 'aadhaar_linked', type: 'boolean', nullable: 'NO' },
      { name: 'aadhaar_verified_at', type: 'timestamp without time zone', nullable: 'YES' },
      { name: 'aadhaar_verification_data', type: 'jsonb', nullable: 'YES' },
    ];
    
    requiredColumns.forEach(required => {
      const existing = columns.find(c => c.column_name === required.name);
      if (existing) {
        // Check if data type matches
        const typeMatches = existing.data_type === required.type || 
          (required.type === 'boolean' && existing.data_type === 'boolean') ||
          (required.type === 'timestamp without time zone' && existing.data_type.includes('timestamp')) ||
          (required.type === 'jsonb' && existing.data_type === 'jsonb');
        
        if (typeMatches) {
          console.log(`   ✅ ${required.name} - exists (${existing.data_type})`);
          results.columns.existing.push({ name: required.name, actual: existing });
        } else {
          console.log(`   ⚠️  ${required.name} - exists but type mismatch (expected: ${required.type}, actual: ${existing.data_type})`);
          results.columns.mismatched.push({ name: required.name, expected: required, actual: existing });
        }
      } else {
        console.log(`   ❌ ${required.name} - MISSING`);
        results.columns.missing.push({ name: required.name, expected: required });
      }
    });
    console.log('');
    
    // 4. Check indexes
    console.log('4. Checking indexes...');
    const indexesResult = await sequelize.query(`
      SELECT 
        indexname,
        tablename
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND (
        (tablename = 'system_settings' AND indexname = 'idx_system_settings_category') OR
        (tablename = 'user_profiles' AND indexname LIKE '%aadhaar%')
      )
    `, { type: QueryTypes.SELECT });
    
    // QueryTypes.SELECT returns array directly
    const indexes = Array.isArray(indexesResult) ? indexesResult : [];
    const existingIndexes = indexes.map(i => {
      if (typeof i === 'string') return i;
      return i.indexname || i;
    });
    
    // Check system_settings index
    if (existingTables.includes('system_settings')) {
      if (existingIndexes.includes('idx_system_settings_category')) {
        console.log('   ✅ idx_system_settings_category - exists');
        results.indexes.existing.push('idx_system_settings_category');
      } else {
        console.log('   ⚠️  idx_system_settings_category - MISSING (recommended for performance)');
        results.indexes.missing.push('idx_system_settings_category');
      }
    }
    console.log('');
    
    // 5. Check constraints
    console.log('5. Checking constraints...');
    if (existingTables.includes('system_settings')) {
      const constraintsResult = await sequelize.query(`
        SELECT 
          constraint_name,
          constraint_type
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'system_settings'
        AND constraint_type = 'CHECK'
      `, { type: QueryTypes.SELECT });
      
      // QueryTypes.SELECT returns array directly
      const constraints = Array.isArray(constraintsResult) ? constraintsResult : [];
      
      const hasCategoryCheck = constraints.some(c => 
        c.constraint_name.includes('category') || c.constraint_name.includes('check')
      );
      
      if (hasCategoryCheck) {
        console.log('   ✅ system_settings category CHECK constraint - exists');
        results.constraints.existing.push('system_settings_category_check');
      } else {
        console.log('   ⚠️  system_settings category CHECK constraint - MISSING');
        results.constraints.missing.push('system_settings_category_check');
      }
    }
    console.log('');
    
    // 6. Check foreign keys
    console.log('6. Checking foreign key constraints...');
    if (existingTables.includes('report_templates')) {
      const fksResult = await sequelize.query(`
        SELECT 
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'report_templates'
        AND kcu.column_name = 'created_by'
      `, { type: QueryTypes.SELECT });
      
      // QueryTypes.SELECT returns array directly
      const fks = Array.isArray(fksResult) ? fksResult : [];
      
      if (fks.length > 0) {
        console.log('   ✅ report_templates.created_by foreign key - exists');
        results.constraints.existing.push('report_templates_created_by_fk');
      } else {
        console.log('   ⚠️  report_templates.created_by foreign key - MISSING');
        results.constraints.missing.push('report_templates_created_by_fk');
      }
    }
    
    if (existingTables.includes('system_settings')) {
      const fksResult2 = await sequelize.query(`
        SELECT 
          tc.constraint_name,
          kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'system_settings'
        AND kcu.column_name = 'updated_by'
      `, { type: QueryTypes.SELECT });
      
      // QueryTypes.SELECT returns array directly
      const fks2 = Array.isArray(fksResult2) ? fksResult2 : [];
      
      if (fks2.length > 0) {
        console.log('   ✅ system_settings.updated_by foreign key - exists');
        results.constraints.existing.push('system_settings_updated_by_fk');
      } else {
        console.log('   ⚠️  system_settings.updated_by foreign key - MISSING');
        results.constraints.missing.push('system_settings_updated_by_fk');
      }
    }
    console.log('');
    
    // 7. Summary Report
    console.log('=== Summary Report ===\n');
    
    const totalIssues = 
      results.tables.missing.length +
      results.columns.missing.length +
      results.columns.mismatched.length +
      results.indexes.missing.length +
      results.constraints.missing.length;
    
    if (totalIssues === 0) {
      console.log('✅ Schema is complete! All tables, columns, indexes, and constraints match code expectations.\n');
    } else {
      console.log(`⚠️  Found ${totalIssues} schema issue(s):\n`);
      
      if (results.tables.missing.length > 0) {
        console.log('Missing Tables:');
        results.tables.missing.forEach(table => {
          console.log(`  ❌ ${table}`);
        });
        console.log('');
      }
      
      if (results.columns.missing.length > 0) {
        console.log('Missing Columns (user_profiles):');
        results.columns.missing.forEach(col => {
          console.log(`  ❌ ${col.name} (expected: ${col.expected.type})`);
        });
        console.log('');
      }
      
      if (results.columns.mismatched.length > 0) {
        console.log('Column Type Mismatches:');
        results.columns.mismatched.forEach(col => {
          console.log(`  ⚠️  ${col.name} (expected: ${col.expected.type}, actual: ${col.actual.data_type})`);
        });
        console.log('');
      }
      
      if (results.indexes.missing.length > 0) {
        console.log('Missing Indexes:');
        results.indexes.missing.forEach(idx => {
          console.log(`  ⚠️  ${idx} (recommended for performance)`);
        });
        console.log('');
      }
      
      if (results.constraints.missing.length > 0) {
        console.log('Missing Constraints:');
        results.constraints.missing.forEach(constraint => {
          console.log(`  ⚠️  ${constraint}`);
        });
        console.log('');
      }
      
      console.log('=== Migration Commands ===\n');
      console.log('To fix missing schema elements, run:\n');
      
      if (results.tables.missing.includes('report_templates')) {
        console.log('  node src/scripts/migrations/create-report-templates-table.js');
      }
      if (results.tables.missing.includes('system_settings')) {
        console.log('  node src/scripts/migrations/create-system-settings-table.js');
      }
      if (results.columns.missing.length > 0 || results.columns.mismatched.length > 0) {
        console.log('  node src/scripts/migrations/add-aadhaar-fields.js');
      }
      console.log('');
    }
    
    // Log results
    enterpriseLogger.info('Schema verification completed', {
      tablesMissing: results.tables.missing.length,
      columnsMissing: results.columns.missing.length,
      columnsMismatched: results.columns.mismatched.length,
      indexesMissing: results.indexes.missing.length,
      constraintsMissing: results.constraints.missing.length,
      totalIssues,
    });
    
    process.exit(totalIssues === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Schema verification failed:');
    console.error(`   Error: ${error.message}`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(0, 5).join('\n')}`);
    }
    console.log('\n   Troubleshooting:');
    console.log('   1. Verify database connection in .env file');
    console.log('   2. Check Supabase project is active');
    console.log('   3. Verify database credentials\n');
    
    enterpriseLogger.error('Schema verification failed', {
      error: error.message,
      stack: error.stack,
    });
    
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run verification
if (require.main === module) {
  verifySchemaCompleteness();
}

module.exports = verifySchemaCompleteness;

