// Comprehensive Database Schema Review
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function comprehensiveSchemaReview() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Comprehensive Database Schema Review');
    console.log('=====================================\n');
    
    // 1. Get all tables
    console.log('1. Checking all tables exist...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Found tables:');
    tables.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });
    console.log('');
    
    // 2. Detailed schema for each table
    console.log('2. Detailed schema for each table:');
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n📋 Table: ${tableName}`);
      
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      columns.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`  ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultVal}`);
      });
    }
    
    // 3. Check foreign key relationships
    console.log('\n3. Foreign key relationships:');
    const foreignKeys = await client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
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
    
    console.log('Foreign key relationships:');
    foreignKeys.rows.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} (${fk.constraint_name})`);
    });
    
    // 4. Check constraints
    console.log('\n4. Table constraints:');
    const constraints = await client.query(`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_type
    `);
    
    console.log('Constraints:');
    constraints.rows.forEach(constraint => {
      if (constraint.constraint_type === 'CHECK') {
        console.log(`  ${constraint.table_name}.${constraint.constraint_name}: ${constraint.check_clause}`);
      } else {
        console.log(`  ${constraint.table_name}.${constraint.constraint_name}: ${constraint.constraint_type}`);
      }
    });
    
    // 5. Check indexes
    console.log('\n5. Indexes:');
    const indexes = await client.query(`
      SELECT 
        tablename, 
        indexname, 
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log('Indexes:');
    indexes.rows.forEach(idx => {
      console.log(`  ${idx.tablename}.${idx.indexname}`);
    });
    
    // 6. Schema issues analysis
    console.log('\n6. Schema Issues Analysis:');
    
    // Check for missing columns that should exist based on migrate.js
    const expectedColumns = {
      'users': ['user_id', 'name', 'email', 'mobile', 'pan', 'aadhaar', 'role', 'ca_id', 'password_hash', 'status', 'consent_status', 'last_login', 'created_at', 'updated_at'],
      'filings': ['filing_id', 'user_id', 'assessment_year', 'filing_for', 'itr_type', 'status', 'ack_number', 'submitted_at', 'created_at', 'updated_at', 'rails_switch_events'],
      'ca_firms': ['ca_id', 'name', 'email', 'dsc_details', 'contact_number', 'address', 'status', 'onboarded_at', 'last_activity'],
      'audit_trail': ['audit_id', 'event_type', 'user_id', 'user_role', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'user_agent', 'level', 'session_id', 'request_id', 'timestamp', 'created_at']
    };
    
    for (const [tableName, expectedCols] of Object.entries(expectedColumns)) {
      const tableExists = tables.rows.find(t => t.table_name === tableName);
      if (!tableExists) {
        console.log(`  ❌ Table '${tableName}' is missing`);
        continue;
      }
      
      const actualColumns = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = $1
      `, [tableName]);
      
      const actualColNames = actualColumns.rows.map(row => row.column_name);
      
      for (const expectedCol of expectedCols) {
        if (!actualColNames.includes(expectedCol)) {
          console.log(`  ❌ Column '${tableName}.${expectedCol}' is missing`);
        }
      }
    }
    
    // 7. Data integrity check
    console.log('\n7. Data integrity check:');
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  ${tableName}: ${countResult.rows[0].count} rows`);
    }
    
  } catch (error) {
    console.error('❌ Schema review failed:', error);
  } finally {
    await client.release();
    await pool.end();
    console.log('\n🔍 Schema review completed');
  }
}

comprehensiveSchemaReview();
