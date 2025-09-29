// Comprehensive Database Schema Check
const { Pool } = require('pg');

// Use the same database configuration as our application
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function comprehensiveSchemaCheck() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Comprehensive Database Schema Check');
    console.log('=====================================\n');
    
    // 1. Check all tables exist
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
    
    // 2. Check filings table schema
    console.log('2. Checking filings table schema...');
    const filingsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'filings'
      ORDER BY ordinal_position
    `);
    
    console.log('Filings table columns:');
    filingsColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    console.log('');
    
    // 3. Check if ack_number column exists specifically
    console.log('3. Checking ack_number column specifically...');
    const ackNumberCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'filings' AND column_name = 'ack_number'
    `);
    
    if (ackNumberCheck.rows.length > 0) {
      console.log('✅ ack_number column exists:', ackNumberCheck.rows[0]);
    } else {
      console.log('❌ ack_number column does NOT exist');
    }
    console.log('');
    
    // 4. Check all table schemas
    console.log('4. Checking all table schemas...');
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      console.log(`\n📋 Table: ${tableName}`);
      
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    // 5. Check foreign key relationships
    console.log('\n5. Checking foreign key relationships...');
    const foreignKeys = await client.query(`
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
    
    console.log('Foreign key relationships:');
    foreignKeys.rows.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // 6. Check indexes
    console.log('\n6. Checking indexes...');
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
    
    // 7. Test data insertion
    console.log('\n7. Testing basic data insertion...');
    try {
      // Test user insertion
      const testUser = await client.query(`
        INSERT INTO users (user_id, name, email, password_hash, pan, role)
        VALUES (gen_random_uuid(), 'Schema Test User', 'schema@test.com', 'test_hash', 'TEST1234A', 'user')
        RETURNING user_id
      `);
      console.log('✅ User insertion test passed');
      
      // Test filing insertion
      const testFiling = await client.query(`
        INSERT INTO filings (filing_id, user_id, assessment_year, filing_for, itr_type, status)
        VALUES (gen_random_uuid(), $1, '2024-25', 'self', 'ITR-1', 'draft')
        RETURNING filing_id
      `, [testUser.rows[0].user_id]);
      console.log('✅ Filing insertion test passed');
      
      // Test ack_number update
      const updateResult = await client.query(`
        UPDATE filings 
        SET ack_number = 'TEST123456', submitted_at = NOW(), status = 'submitted'
        WHERE filing_id = $1
        RETURNING ack_number
      `, [testFiling.rows[0].filing_id]);
      console.log('✅ ack_number update test passed:', updateResult.rows[0]);
      
      // Clean up test data
      await client.query('DELETE FROM filings WHERE filing_id = $1', [testFiling.rows[0].filing_id]);
      await client.query('DELETE FROM users WHERE user_id = $1', [testUser.rows[0].user_id]);
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.log('❌ Data insertion test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  } finally {
    await client.release();
    await pool.end();
    console.log('\n🔍 Schema check completed');
  }
}

comprehensiveSchemaCheck();
