const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createServiceTicketSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🎫 Creating Service Ticket Management Schema...');
    
    // Service Tickets Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_tickets (
        ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_number VARCHAR(20) UNIQUE NOT NULL,
        
        -- Ticket Details
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        ticket_type VARCHAR(50) NOT NULL, -- 'filing_support', 'technical_issue', 'billing_query', 'general_inquiry'
        priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
        status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed', 'cancelled'
        
        -- Relationships
        user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        assigned_ca_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
        filing_id UUID REFERENCES filings(filing_id) ON DELETE SET NULL,
        
        -- Resolution Details
        resolution_notes TEXT,
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolved_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        
        -- SLA Tracking
        sla_deadline TIMESTAMP WITH TIME ZONE,
        first_response_at TIMESTAMP WITH TIME ZONE,
        response_time_minutes INTEGER,
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        CONSTRAINT valid_ticket_type CHECK (ticket_type IN ('filing_support', 'technical_issue', 'billing_query', 'general_inquiry', 'pan_verification', 'document_issue')),
        CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'cancelled'))
      )
    `);
    console.log('✅ Service tickets table created');
    
    // Ticket Comments/Messages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_comments (
        comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
        
        -- Comment Details
        message TEXT NOT NULL,
        comment_type VARCHAR(30) NOT NULL DEFAULT 'user_comment', -- 'user_comment', 'ca_response', 'system_note', 'internal_note'
        is_internal BOOLEAN DEFAULT FALSE,
        
        -- Author
        author_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        author_role VARCHAR(50) NOT NULL,
        
        -- Attachments
        attachments JSONB DEFAULT '[]',
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_comment_type CHECK (comment_type IN ('user_comment', 'ca_response', 'system_note', 'internal_note'))
      )
    `);
    console.log('✅ Ticket comments table created');
    
    // Ticket Assignments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_assignments (
        assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
        ca_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        
        -- Assignment Details
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        assigned_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        assignment_notes TEXT,
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        unassigned_at TIMESTAMP WITH TIME ZONE,
        unassigned_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
        
        CONSTRAINT unique_active_assignment UNIQUE (ticket_id, ca_id) WHERE is_active = TRUE
      )
    `);
    console.log('✅ Ticket assignments table created');
    
    // Ticket Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_categories (
        category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        default_priority VARCHAR(20) DEFAULT 'medium',
        sla_hours INTEGER DEFAULT 24,
        is_active BOOLEAN DEFAULT TRUE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT valid_default_priority CHECK (default_priority IN ('low', 'medium', 'high', 'urgent'))
      )
    `);
    console.log('✅ Ticket categories table created');
    
    // Ticket SLA Tracking Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ticket_sla_tracking (
        sla_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES service_tickets(ticket_id) ON DELETE CASCADE,
        
        -- SLA Metrics
        first_response_deadline TIMESTAMP WITH TIME ZONE,
        resolution_deadline TIMESTAMP WITH TIME ZONE,
        first_response_at TIMESTAMP WITH TIME ZONE,
        resolution_at TIMESTAMP WITH TIME ZONE,
        
        -- Performance Metrics
        first_response_time_minutes INTEGER,
        resolution_time_minutes INTEGER,
        sla_breached BOOLEAN DEFAULT FALSE,
        breach_reason TEXT,
        
        -- Audit
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Ticket SLA tracking table created');
    
    // Create Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_service_tickets_user_id ON service_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_service_tickets_status ON service_tickets(status);
      CREATE INDEX IF NOT EXISTS idx_service_tickets_priority ON service_tickets(priority);
      CREATE INDEX IF NOT EXISTS idx_service_tickets_created_at ON service_tickets(created_at);
      CREATE INDEX IF NOT EXISTS idx_service_tickets_assigned_ca ON service_tickets(assigned_ca_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at);
      CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ca_id ON ticket_assignments(ca_id);
      CREATE INDEX IF NOT EXISTS idx_ticket_assignments_active ON ticket_assignments(is_active);
    `);
    console.log('✅ Indexes created');
    
    // Insert default ticket categories
    await client.query(`
      INSERT INTO ticket_categories (category_name, description, default_priority, sla_hours) VALUES
      ('Filing Support', 'ITR filing assistance and guidance', 'high', 4),
      ('Technical Issue', 'Platform technical problems', 'medium', 8),
      ('Billing Query', 'Payment and billing related questions', 'medium', 12),
      ('PAN Verification', 'PAN card verification issues', 'high', 2),
      ('Document Issue', 'Document upload and processing problems', 'medium', 6),
      ('General Inquiry', 'General questions and information', 'low', 24)
      ON CONFLICT (category_name) DO NOTHING
    `);
    console.log('✅ Default ticket categories inserted');
    
    console.log('\n🎉 Service Ticket Management Schema created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating service ticket schema:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the schema creation
createServiceTicketSchema()
  .then(() => {
    console.log('✅ Service ticket schema implementation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Service ticket schema implementation failed:', error);
    process.exit(1);
  });

