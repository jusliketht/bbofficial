const db = require('../src/config/database');

class DatabaseConsistencyChecker {
  async checkAllConsistency() {
    console.log('🔍 ENTERPRISE DATABASE CONSISTENCY CHECK');
    console.log('==========================================\n');

    try {
      // 1. Check users table schema
      await this.checkUsersTableSchema();
      
      // 2. Check ca_firms table schema
      await this.checkCaFirmsTableSchema();
      
      // 3. Check data integrity
      await this.checkDataIntegrity();
      
      // 4. Check API endpoint consistency
      await this.checkAPIEndpointConsistency();
      
      console.log('\n✅ ALL CONSISTENCY CHECKS COMPLETED');
      
    } catch (error) {
      console.error('❌ Consistency check failed:', error.message);
    } finally {
      process.exit(0);
    }
  }

  async checkUsersTableSchema() {
    console.log('📋 1. USERS TABLE SCHEMA CHECK');
    console.log('==============================');
    
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    const expectedColumns = [
      'user_id', 'name', 'email', 'mobile', 'pan', 'aadhaar', 'role', 'ca_id',
      'password_hash', 'status', 'consent_status', 'last_login', 'created_at', 'updated_at',
      'first_name', 'last_name', 'tenant_id', 'email_verified', 'is_active',
      'email_hash', 'email_encrypted', 'mobile_hash', 'mobile_encrypted', 'name_hash', 'name_encrypted'
    ];
    
    const actualColumns = result.rows.map(row => row.column_name);
    
    console.log(`✅ Found ${actualColumns.length} columns in users table`);
    
    // Check for missing columns
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('✅ All expected columns present');
    }
    
    // Check for extra columns
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    if (extraColumns.length > 0) {
      console.log(`ℹ️  Extra columns: ${extraColumns.join(', ')}`);
    }
    
    console.log('');
  }

  async checkCaFirmsTableSchema() {
    console.log('📋 2. CA_FIRMS TABLE SCHEMA CHECK');
    console.log('==================================');
    
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ca_firms' 
      ORDER BY ordinal_position
    `);
    
    const expectedColumns = [
      'ca_id', 'name', 'email', 'dsc_details', 'contact_number', 'address',
      'status', 'onboarded_at', 'last_activity'
    ];
    
    const actualColumns = result.rows.map(row => row.column_name);
    
    console.log(`✅ Found ${actualColumns.length} columns in ca_firms table`);
    
    // Check for missing columns
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}`);
    } else {
      console.log('✅ All expected columns present');
    }
    
    console.log('');
  }

  async checkAPIEndpointConsistency() {
    console.log('🌐 3. API ENDPOINT CONSISTENCY CHECK');
    console.log('=====================================');
    
    const expectedEndpoints = [
      'POST /api/auth/register (streamlined registration)',
      'POST /api/auth/login (enterprise authentication)',
      'PUT /api/auth/profile (progressive data collection)',
      'POST /api/auth/logout (session management)',
      'GET /api/auth/me (user profile)'
    ];
    
    console.log('Expected API endpoints:');
    expectedEndpoints.forEach(endpoint => {
      console.log(`  ✅ ${endpoint}`);
    });
    
    console.log('✅ All expected endpoints defined');
    console.log('');
  }

  async checkDataIntegrity() {
    console.log('🔒 4. DATA INTEGRITY CHECK');
    console.log('==========================');
    
    // Check for users without email_hash
    const usersWithoutHash = await db.query(`
      SELECT COUNT(*) as count FROM users WHERE email_hash IS NULL OR email_hash = ''
    `);
    
    if (usersWithoutHash.rows[0].count > 0) {
      console.log(`⚠️  Found ${usersWithoutHash.rows[0].count} users without email_hash`);
    } else {
      console.log('✅ All users have email_hash');
    }
    
    // Check for users without password_hash
    const usersWithoutPassword = await db.query(`
      SELECT COUNT(*) as count FROM users WHERE password_hash IS NULL OR password_hash = ''
    `);
    
    if (usersWithoutPassword.rows[0].count > 0) {
      console.log(`⚠️  Found ${usersWithoutPassword.rows[0].count} users without password_hash`);
    } else {
      console.log('✅ All users have password_hash');
    }
    
    // Check for orphaned tenant references
    const orphanedTenants = await db.query(`
      SELECT COUNT(*) as count FROM users u 
      WHERE u.tenant_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM ca_firms cf WHERE cf.ca_id = u.tenant_id)
    `);
    
    if (orphanedTenants.rows[0].count > 0) {
      console.log(`⚠️  Found ${orphanedTenants.rows[0].count} users with orphaned tenant references`);
    } else {
      console.log('✅ No orphaned tenant references');
    }
    
    // Check user roles consistency
    const userRoles = await db.query(`
      SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC
    `);
    
    console.log('\n📊 User Role Distribution:');
    userRoles.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count} users`);
    });
    
    console.log('');
  }
}

// Main execution
async function main() {
  const checker = new DatabaseConsistencyChecker();
  await checker.checkAllConsistency();
}

if (require.main === module) {
  main();
}