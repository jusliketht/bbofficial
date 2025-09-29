// Database Schema Fix Script
// Fixes all identified schema issues from the comprehensive review
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456'
});

async function fixDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Database Schema Fix Script');
    console.log('=============================\n');
    
    // 1. Add missing ca_id column to users table
    console.log('1. Adding ca_id column to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS ca_id UUID REFERENCES ca_firms(ca_id) ON DELETE SET NULL
    `);
    console.log('✅ ca_id column added to users table');
    
    // 2. Fix document_uploads table schema
    console.log('\n2. Fixing document_uploads table schema...');
    
    // Add missing columns to document_uploads
    const missingColumns = [
      'user_id UUID REFERENCES users(user_id) ON DELETE CASCADE',
      'document_type VARCHAR(50)',
      'file_size INTEGER',
      'mime_type VARCHAR(100)',
      'file_path VARCHAR(500)'
    ];
    
    for (const columnDef of missingColumns) {
      const columnName = columnDef.split(' ')[0];
      try {
        await client.query(`ALTER TABLE document_uploads ADD COLUMN IF NOT EXISTS ${columnDef}`);
        console.log(`✅ Added ${columnName} column to document_uploads`);
      } catch (error) {
        console.log(`⚠️ ${columnName} column already exists or error: ${error.message}`);
      }
    }
    
    // 3. Fix intake_data table schema
    console.log('\n3. Fixing intake_data table schema...');
    const intakeColumns = [
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ];
    
    for (const columnDef of intakeColumns) {
      const columnName = columnDef.split(' ')[0];
      try {
        await client.query(`ALTER TABLE intake_data ADD COLUMN IF NOT EXISTS ${columnDef}`);
        console.log(`✅ Added ${columnName} column to intake_data`);
      } catch (error) {
        console.log(`⚠️ ${columnName} column already exists or error: ${error.message}`);
      }
    }
    
    // 4. Add missing indexes
    console.log('\n4. Adding missing indexes...');
    const missingIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_ca_id ON users(ca_id)',
      'CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_document_uploads_document_type ON document_uploads(document_type)',
      'CREATE INDEX IF NOT EXISTS idx_intake_data_created_at ON intake_data(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_intake_data_updated_at ON intake_data(updated_at)'
    ];
    
    for (const indexQuery of missingIndexes) {
      try {
        await client.query(indexQuery);
        console.log(`✅ Index created: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        console.log(`⚠️ Index creation failed: ${error.message}`);
      }
    }
    
    // 5. Update constraints if needed
    console.log('\n5. Updating constraints...');
    
    // Add CHECK constraint for filings.filing_for if missing
    try {
      await client.query(`
        ALTER TABLE filings 
        ADD CONSTRAINT filings_filing_for_check 
        CHECK (filing_for IN ('self', 'family', 'entity'))
      `);
      console.log('✅ Added filing_for check constraint');
    } catch (error) {
      console.log('⚠️ filing_for constraint already exists or error:', error.message);
    }
    
    // Add CHECK constraint for filings.itr_type if missing
    try {
      await client.query(`
        ALTER TABLE filings 
        ADD CONSTRAINT filings_itr_type_check 
        CHECK (itr_type IN ('ITR-1', 'ITR-2', 'ITR-3', 'ITR-4', 'ITR-5', 'ITR-6', 'ITR-7'))
      `);
      console.log('✅ Added itr_type check constraint');
    } catch (error) {
      console.log('⚠️ itr_type constraint already exists or error:', error.message);
    }
    
    // 6. Verify fixes
    console.log('\n6. Verifying fixes...');
    
    // Check if ca_id column exists
    const caIdCheck = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'ca_id'
    `);
    
    if (caIdCheck.rows.length > 0) {
      console.log('✅ ca_id column verified in users table');
    } else {
      console.log('❌ ca_id column still missing from users table');
    }
    
    // Check document_uploads columns
    const docColumns = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'document_uploads'
      ORDER BY column_name
    `);
    
    console.log('Document uploads columns:');
    docColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });
    
    // 7. Test data insertion
    console.log('\n7. Testing data insertion...');
    
    // Test CA firm creation
    try {
      const testCa = await client.query(`
        INSERT INTO ca_firms (name, email, contact_number, address)
        VALUES ('Test CA Firm', 'testca@example.com', '9876543210', 'Test Address')
        RETURNING ca_id
      `);
      console.log('✅ Test CA firm created');
      
      // Test user update with ca_id
      const testUser = await client.query(`
        UPDATE users 
        SET ca_id = $1, role = 'CA' 
        WHERE email = 'test@example.com'
        RETURNING user_id, ca_id, role
      `, [testCa.rows[0].ca_id]);
      
      if (testUser.rows.length > 0) {
        console.log('✅ User updated with CA relationship');
      } else {
        console.log('⚠️ No test user found to update');
      }
      
      // Clean up test data
      await client.query('DELETE FROM ca_firms WHERE ca_id = $1', [testCa.rows[0].ca_id]);
      console.log('✅ Test data cleaned up');
      
    } catch (error) {
      console.log('⚠️ Test data insertion failed:', error.message);
    }
    
    console.log('\n🎉 Database schema fixes completed!');
    
  } catch (error) {
    console.error('❌ Database schema fix failed:', error);
  } finally {
    await client.release();
    await pool.end();
  }
}

fixDatabaseSchema();
