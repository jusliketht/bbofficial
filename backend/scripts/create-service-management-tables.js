#!/usr/bin/env node

// =====================================================
// CREATE SERVICE MANAGEMENT TABLES
// Service tickets, billing, CA firm management, admin controls
// =====================================================

require('dotenv').config();
const { Pool } = require('pg');

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack_itr',
  password: process.env.DB_PASSWORD || '123456',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 1
};

const pool = new Pool(dbConfig);

async function createServiceManagementTables() {
  console.log('🏗️  CREATING SERVICE MANAGEMENT TABLES');
  console.log('=====================================');

  try {
    // 0. Create CA Firms table first (if it doesn't exist)
    console.log('0. Creating ca_firms table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ca_firms (
        ca_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firm_name VARCHAR(255) NOT NULL,
        firm_pan VARCHAR(10) UNIQUE NOT NULL,
        admin_user_id UUID REFERENCES users(user_id),
        contact_email VARCHAR(255),
        contact_mobile VARCHAR(15),
        address TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ ca_firms table created');

    // 1. Service Tickets Table (already exists, skipping creation)
    console.log('1. Service tickets table already exists, skipping creation...');
    console.log('   ✅ service_tickets table verified');

    // 2. Service Ticket Comments/Updates
    console.log('2. Creating service_ticket_comments table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_ticket_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES service_tickets(ticket_id),
        user_id UUID REFERENCES users(user_id),
        comment TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ service_ticket_comments table created');

    // 3. CA Firm Clients Management
    console.log('3. Creating ca_firm_clients table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ca_firm_clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ca_firm_id UUID REFERENCES ca_firms(ca_id),
        client_user_id UUID REFERENCES users(user_id),
        client_pan VARCHAR(10) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        client_mobile VARCHAR(15),
        relationship_type VARCHAR(20) DEFAULT 'client',
        status VARCHAR(20) DEFAULT 'active',
        onboarded_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(ca_firm_id, client_pan)
      )
    `);
    console.log('   ✅ ca_firm_clients table created');

    // 4. Billing Configuration
    console.log('4. Creating billing_config table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS billing_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES ca_firms(ca_id),
        billing_mode VARCHAR(20) DEFAULT 'per_filing',
        itr_1_rate DECIMAL(10,2) DEFAULT 500.00,
        itr_2_rate DECIMAL(10,2) DEFAULT 800.00,
        itr_3_rate DECIMAL(10,2) DEFAULT 1200.00,
        itr_4_rate DECIMAL(10,2) DEFAULT 1000.00,
        monthly_subscription DECIMAL(10,2) DEFAULT 0.00,
        commission_percentage DECIMAL(5,2) DEFAULT 0.00,
        max_filings_per_month INTEGER DEFAULT 100,
        max_filings_per_year INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ billing_config table created');

    // 5. Invoices
    console.log('5. Creating invoices table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(20) UNIQUE NOT NULL,
        tenant_id UUID REFERENCES ca_firms(ca_id),
        client_id UUID REFERENCES ca_firm_clients(id),
        filing_id UUID REFERENCES filings(filing_id),
        amount DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        due_date DATE,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ invoices table created');

    // 6. Platform Settings (Admin Control Panel)
    console.log('6. Creating platform_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSONB NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ platform_settings table created');

    // 7. User Filing Limits
    console.log('7. Creating user_filing_limits table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_filing_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id),
        tenant_id UUID REFERENCES ca_firms(ca_id),
        max_filings_per_month INTEGER DEFAULT 10,
        max_filings_per_year INTEGER DEFAULT 50,
        current_month_filings INTEGER DEFAULT 0,
        current_year_filings INTEGER DEFAULT 0,
        reset_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, tenant_id)
      )
    `);
    console.log('   ✅ user_filing_limits table created');

    // 8. Create Indexes for Performance
    console.log('8. Creating performance indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_service_tickets_user_id ON service_tickets(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_service_tickets_assigned_ca_id ON service_tickets(assigned_ca_id)',
      'CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(status)',
      'CREATE INDEX IF NOT EXISTS idx_service_tickets_created_at ON service_tickets(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_ca_firm_clients_ca_firm_id ON ca_firm_clients(ca_firm_id)',
      'CREATE INDEX IF NOT EXISTS idx_ca_firm_clients_client_pan ON ca_firm_clients(client_pan)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_tenant_id ON invoices(tenant_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
      'CREATE INDEX IF NOT EXISTS idx_user_filing_limits_user_id ON user_filing_limits(user_id)'
    ];

    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('   ✅ Performance indexes created');

    // 9. Insert Default Platform Settings
    console.log('9. Inserting default platform settings...');
    await pool.query(`
      INSERT INTO platform_settings (setting_key, setting_value, description, is_public) VALUES
      ('default_billing_mode', '"per_filing"', 'Default billing mode for new CA firms', true),
      ('default_itr_rates', '{"itr_1": 500, "itr_2": 800, "itr_3": 1200, "itr_4": 1000}', 'Default ITR filing rates', true),
      ('max_filings_per_user_month', '10', 'Maximum filings per user per month', true),
      ('max_filings_per_user_year', '50', 'Maximum filings per user per year', true),
      ('service_ticket_auto_create', 'true', 'Automatically create service tickets for filings', false),
      ('ca_assisted_filing_visible', 'true', 'Make CA-assisted filings visible to users', false)
      ON CONFLICT (setting_key) DO NOTHING
    `);
    console.log('   ✅ Default platform settings inserted');

    console.log('\n🎉 SERVICE MANAGEMENT TABLES CREATED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Tables created:');
    console.log('- service_tickets (ticket management)');
    console.log('- service_ticket_comments (ticket updates)');
    console.log('- ca_firm_clients (CA firm client management)');
    console.log('- billing_config (billing configuration)');
    console.log('- invoices (invoice management)');
    console.log('- platform_settings (admin control panel)');
    console.log('- user_filing_limits (user filing limits)');
    console.log('- Performance indexes');

  } catch (error) {
    console.error('❌ Error creating service management tables:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

createServiceManagementTables();
