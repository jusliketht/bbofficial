/**
 * Database Schema Update Script
 * Updates the actual database to match the schema reference
 */

const { Pool } = require('pg');
require('dotenv').config();

class DatabaseSchemaUpdater {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
  }

  async updateSchema() {
    try {
      console.log('🗄️ DATABASE SCHEMA UPDATE');
      console.log('==========================');

      // 1. Update USER_ROLE enum
      await this.updateUserRoleEnum();

      // 2. Update USERS table
      await this.updateUsersTable();

      // 3. Update CA_FIRMS table
      await this.updateCaFirmsTable();

      // 4. Add constraints
      await this.addConstraints();

      console.log('✅ Database schema updated successfully!');
    } catch (error) {
      console.error('❌ Schema update failed:', error.message);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async updateUserRoleEnum() {
    console.log('1. Updating USER_ROLE enum...');
    
    const enumUpdates = [
      "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'platform_admin'",
      "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'senior_ca'",
      "ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest'"
    ];

    for (const query of enumUpdates) {
      try {
        await this.pool.query(query);
        console.log(`   ✅ Added enum value: ${query.split("'")[1]}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Enum value already exists: ${query.split("'")[1]}`);
        } else {
          console.log(`   ❌ Failed to add enum value: ${error.message}`);
        }
      }
    }
  }

  async updateUsersTable() {
    console.log('2. Updating USERS table...');
    
    const columnUpdates = [
      { name: 'first_name', type: 'VARCHAR(100)' },
      { name: 'last_name', type: 'VARCHAR(100)' },
      { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'email_verified', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'mobile_verified', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'pan', type: 'VARCHAR(10)' },
      { name: 'pan_hash', type: 'VARCHAR(64)' },
      { name: 'pan_encrypted', type: 'TEXT' },
      { name: 'aadhaar', type: 'VARCHAR(12)' },
      { name: 'aadhaar_hash', type: 'VARCHAR(64)' },
      { name: 'aadhaar_encrypted', type: 'TEXT' },
      { name: 'registration_type', type: 'VARCHAR(20) DEFAULT \'streamlined\'' },
      { name: 'failed_login_attempts', type: 'INTEGER DEFAULT 0' },
      { name: 'locked_until', type: 'TIMESTAMP' }
    ];

    for (const column of columnUpdates) {
      try {
        const query = `ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
        await this.pool.query(query);
        console.log(`   ✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to add column ${column.name}: ${error.message}`);
      }
    }
  }

  async updateCaFirmsTable() {
    console.log('3. Updating CA_FIRMS table...');
    
    const columnUpdates = [
      { name: 'email_hash', type: 'VARCHAR(64)' },
      { name: 'contact_number_hash', type: 'VARCHAR(64)' },
      { name: 'status', type: 'VARCHAR(20) DEFAULT \'active\'' },
      { name: 'tenant_type', type: 'VARCHAR(20) DEFAULT \'ca_firm\'' },
      { name: 'max_users', type: 'INTEGER DEFAULT 100' },
      { name: 'features', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'onboarded_at', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'last_activity', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'created_by', type: 'UUID REFERENCES users(user_id)' }
    ];

    for (const column of columnUpdates) {
      try {
        const query = `ALTER TABLE ca_firms ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`;
        await this.pool.query(query);
        console.log(`   ✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to add column ${column.name}: ${error.message}`);
      }
    }
  }

  async addConstraints() {
    console.log('4. Adding constraints...');
    
    const constraints = [
      {
        name: 'users_tenant_id_fkey',
        query: 'ALTER TABLE users ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES ca_firms(ca_id)'
      },
      {
        name: 'check_ca_has_tenant',
        query: `ALTER TABLE users ADD CONSTRAINT check_ca_has_tenant 
                CHECK (
                  (role IN ('ca_firm_admin', 'CA', 'senior_ca') AND tenant_id IS NOT NULL) OR
                  (role NOT IN ('ca_firm_admin', 'CA', 'senior_ca'))
                )`
      }
    ];

    for (const constraint of constraints) {
      try {
        await this.pool.query(constraint.query);
        console.log(`   ✅ Added constraint: ${constraint.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Constraint already exists: ${constraint.name}`);
        } else {
          console.log(`   ❌ Failed to add constraint ${constraint.name}: ${error.message}`);
        }
      }
    }
  }

  async verifySchema() {
    try {
      console.log('\n🔍 SCHEMA VERIFICATION');
      console.log('======================');

      // Check users table structure
      const usersQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `;
      const usersResult = await this.pool.query(usersQuery);
      console.log('Users table columns:', usersResult.rows.length);

      // Check ca_firms table structure
      const caFirmsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'ca_firms' 
        ORDER BY ordinal_position
      `;
      const caFirmsResult = await this.pool.query(caFirmsQuery);
      console.log('CA Firms table columns:', caFirmsResult.rows.length);

      // Check user_role enum values
      const enumQuery = `
        SELECT unnest(enum_range(NULL::user_role)) as role_value
      `;
      const enumResult = await this.pool.query(enumQuery);
      console.log('User role enum values:', enumResult.rows.map(r => r.role_value));

      console.log('✅ Schema verification completed!');
    } catch (error) {
      console.error('❌ Schema verification failed:', error.message);
    }
  }
}

// Run the schema update
async function main() {
  const updater = new DatabaseSchemaUpdater();
  await updater.updateSchema();
  await updater.verifySchema();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Schema update failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseSchemaUpdater;
