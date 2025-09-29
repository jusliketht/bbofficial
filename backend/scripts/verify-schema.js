// Database Schema Verification Script
// Queries actual database schema and verifies against ITR operations

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verifySchema() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 DATABASE SCHEMA VERIFICATION');
    console.log('================================\n');
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 ACTUAL DATABASE TABLES:');
    console.log('==========================');
    tablesResult.rows.forEach(row => {
      console.log(`✅ ${row.table_name} (${row.table_type})`);
    });
    
    console.log(`\n📊 Total Tables: ${tablesResult.rows.length}\n`);
    
    // Get detailed table structures for ITR-related tables
    const itrTables = tablesResult.rows.filter(row => 
      row.table_name.includes('itr') || 
      row.table_name.includes('income') || 
      row.table_name.includes('deduction') ||
      row.table_name.includes('user') ||
      row.table_name.includes('filing')
    );
    
    console.log('🏗️ ITR-RELATED TABLE STRUCTURES:');
    console.log('==================================');
    
    for (const table of itrTables) {
      const columnsResult = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      console.log(`\n--- ${table.table_name.toUpperCase()} ---`);
      columnsResult.rows.forEach(col => {
        let typeInfo = col.data_type;
        if (col.character_maximum_length) {
          typeInfo += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision) {
          typeInfo += `(${col.numeric_precision}${col.numeric_scale ? ',' + col.numeric_scale : ''})`;
        }
        
        const nullable = col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        
        console.log(`  ${col.column_name}: ${typeInfo} ${nullable}${defaultVal}`);
      });
    }
    
    // Get foreign key relationships
    console.log('\n🔗 FOREIGN KEY RELATIONSHIPS:');
    console.log('============================');
    
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    fkResult.rows.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // Get indexes
    console.log('\n📈 DATABASE INDEXES:');
    console.log('====================');
    
    const indexResult = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    indexResult.rows.forEach(idx => {
      console.log(`  ${idx.tablename}.${idx.indexname}`);
    });
    
    console.log(`\n📊 Total Indexes: ${indexResult.rows.length}`);
    
    // Check for ITR-specific data
    console.log('\n📋 ITR FORMS DATA:');
    console.log('==================');
    
    try {
      const itrFormsResult = await client.query('SELECT * FROM itr_forms_master');
      console.log(`ITR Forms Available: ${itrFormsResult.rows.length}`);
      itrFormsResult.rows.forEach(form => {
        console.log(`  - ${form.form_type}: ${form.form_name}`);
      });
    } catch (error) {
      console.log('  ITR Forms Master table not found');
    }
    
    // Check income source categories
    try {
      const incomeCategoriesResult = await client.query('SELECT * FROM income_source_categories');
      console.log(`\nIncome Source Categories: ${incomeCategoriesResult.rows.length}`);
      incomeCategoriesResult.rows.forEach(cat => {
        console.log(`  - ${cat.category_code}: ${cat.category_name}`);
      });
    } catch (error) {
      console.log('\n  Income Source Categories table not found');
    }
    
    // Check deduction categories
    try {
      const deductionCategoriesResult = await client.query('SELECT * FROM deduction_categories');
      console.log(`\nDeduction Categories: ${deductionCategoriesResult.rows.length}`);
      deductionCategoriesResult.rows.forEach(cat => {
        console.log(`  - ${cat.section_code}: ${cat.section_name}`);
      });
    } catch (error) {
      console.log('\n  Deduction Categories table not found');
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Schema verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Stack:', error.stack);
  }
}

verifySchema();
