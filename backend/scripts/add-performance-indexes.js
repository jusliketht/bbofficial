#!/usr/bin/env node

// =====================================================
// DATABASE PERFORMANCE OPTIMIZATION SCRIPT
// Adds critical indexes for optimal performance
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

// Critical indexes for performance
const PERFORMANCE_INDEXES = [
  // Users table indexes
  {
    name: 'idx_users_email_hash',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_hash ON users(email_hash)',
    description: 'Fast user lookup by email hash'
  },
  {
    name: 'idx_users_role_status',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_status ON users(role, status)',
    description: 'Fast filtering by role and status'
  },
  
  // Filings table indexes
  {
    name: 'idx_filings_user_status',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_filings_user_status ON filings(user_id, status)',
    description: 'Fast filing lookup by user and status'
  },
  {
    name: 'idx_filings_assessment_year',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_filings_assessment_year ON filings(assessment_year)',
    description: 'Fast filtering by assessment year'
  },
  {
    name: 'idx_filings_itr_type',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_filings_itr_type ON filings(itr_type)',
    description: 'Fast filtering by ITR type'
  },
  
  // Income sources indexes
  {
    name: 'idx_income_sources_filing',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_income_sources_filing ON income_sources_detailed(filing_id)',
    description: 'Fast income source lookup by filing'
  },
  {
    name: 'idx_income_sources_type',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_income_sources_type ON income_sources_detailed(source_type)',
    description: 'Fast filtering by income source type'
  },
  
  // Deductions indexes
  {
    name: 'idx_deductions_filing',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deductions_filing ON deductions_breakdown(filing_id)',
    description: 'Fast deduction lookup by filing'
  },
  {
    name: 'idx_deductions_type',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deductions_type ON deductions_breakdown(deduction_type)',
    description: 'Fast filtering by deduction type'
  },
  
  // Tax computation indexes
  {
    name: 'idx_tax_computations_filing',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tax_computations_filing ON tax_computations(filing_id)',
    description: 'Fast tax computation lookup by filing'
  },
  {
    name: 'idx_tax_computations_regime',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tax_computations_regime ON tax_computations(regime)',
    description: 'Fast filtering by tax regime'
  },
  
  // Audit trail indexes
  {
    name: 'idx_audit_events_user_time',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_events_user_time ON audit_events(user_id, created_at)',
    description: 'Fast audit trail lookup by user and time'
  },
  {
    name: 'idx_audit_events_action',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_events_action ON audit_events(action)',
    description: 'Fast filtering by audit action'
  },
  
  // CA assignments indexes
  {
    name: 'idx_ca_assignments_ca',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ca_assignments_ca ON ca_assignments(ca_id)',
    description: 'Fast CA assignment lookup by CA'
  },
  {
    name: 'idx_ca_assignments_client',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ca_assignments_client ON ca_assignments(client_id)',
    description: 'Fast CA assignment lookup by client'
  },
  
  // Service tickets indexes
  {
    name: 'idx_service_tickets_user',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_tickets_user ON service_tickets(user_id)',
    description: 'Fast service ticket lookup by user'
  },
  {
    name: 'idx_service_tickets_status',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_tickets_status ON service_tickets(status)',
    description: 'Fast filtering by ticket status'
  },
  
  // File uploads indexes
  {
    name: 'idx_file_uploads_filing',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_uploads_filing ON file_uploads(filing_id)',
    description: 'Fast file upload lookup by filing'
  },
  {
    name: 'idx_file_uploads_type',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_uploads_type ON file_uploads(file_type)',
    description: 'Fast filtering by file type'
  },
  
  // Chat system indexes
  {
    name: 'idx_chat_messages_room',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at)',
    description: 'Fast chat message lookup by room and time'
  },
  {
    name: 'idx_chat_room_participants_user',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_room_participants_user ON chat_room_participants(user_id)',
    description: 'Fast chat room lookup by user'
  },
  
  // Realtime sync indexes
  {
    name: 'idx_realtime_sync_queue_status',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_sync_queue_status ON realtime_sync_queue(status)',
    description: 'Fast sync queue filtering by status'
  },
  {
    name: 'idx_realtime_sync_queue_created',
    query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_realtime_sync_queue_created ON realtime_sync_queue(created_at)',
    description: 'Fast sync queue filtering by creation time'
  }
];

// Data validation constraints
const VALIDATION_CONSTRAINTS = [
  {
    name: 'chk_filings_assessment_year_format',
    query: `ALTER TABLE filings ADD CONSTRAINT chk_filings_assessment_year_format 
            CHECK (assessment_year ~ '^[0-9]{4}-[0-9]{2}$')`,
    description: 'Validate assessment year format (YYYY-YY)'
  },
  {
    name: 'chk_personal_info_pan_format',
    query: `ALTER TABLE personal_info ADD CONSTRAINT chk_personal_info_pan_format 
            CHECK (pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]$')`,
    description: 'Validate PAN format'
  },
  {
    name: 'chk_bank_accounts_ifsc_format',
    query: `ALTER TABLE bank_accounts ADD CONSTRAINT chk_bank_accounts_ifsc_format 
            CHECK (ifsc_code ~ '^[A-Z]{4}[0-9]{7}$')`,
    description: 'Validate IFSC code format'
  },
  {
    name: 'chk_income_sources_amount_positive',
    query: `ALTER TABLE income_sources_detailed ADD CONSTRAINT chk_income_sources_amount_positive 
            CHECK (amount >= 0)`,
    description: 'Ensure income amounts are non-negative'
  },
  {
    name: 'chk_deductions_amount_positive',
    query: `ALTER TABLE deductions_breakdown ADD CONSTRAINT chk_deductions_amount_positive 
            CHECK (amount >= 0)`,
    description: 'Ensure deduction amounts are non-negative'
  }
];

async function addPerformanceIndexes() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database performance optimization...');
    console.log('=' .repeat(60));
    
    // Add performance indexes
    console.log('\n📊 Adding performance indexes...');
    for (const index of PERFORMANCE_INDEXES) {
      try {
        console.log(`   Adding: ${index.name} - ${index.description}`);
        await client.query(index.query);
        console.log(`   ✅ Success: ${index.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Already exists: ${index.name}`);
        } else {
          console.log(`   ❌ Error: ${index.name} - ${error.message}`);
        }
      }
    }
    
    // Add validation constraints
    console.log('\n🔒 Adding validation constraints...');
    for (const constraint of VALIDATION_CONSTRAINTS) {
      try {
        console.log(`   Adding: ${constraint.name} - ${constraint.description}`);
        await client.query(constraint.query);
        console.log(`   ✅ Success: ${constraint.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Already exists: ${constraint.name}`);
        } else {
          console.log(`   ❌ Error: ${constraint.name} - ${error.message}`);
        }
      }
    }
    
    // Analyze tables for query optimization
    console.log('\n📈 Analyzing tables for query optimization...');
    const tables = [
      'users', 'filings', 'income_sources_detailed', 'deductions_breakdown',
      'tax_computations', 'audit_events', 'ca_assignments', 'service_tickets',
      'file_uploads', 'chat_messages', 'realtime_sync_queue'
    ];
    
    for (const table of tables) {
      try {
        console.log(`   Analyzing: ${table}`);
        await client.query(`ANALYZE ${table}`);
        console.log(`   ✅ Analyzed: ${table}`);
      } catch (error) {
        console.log(`   ❌ Error analyzing ${table}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database performance optimization completed!');
    console.log('=' .repeat(60));
    
    // Show index statistics
    console.log('\n📊 Index Statistics:');
    const indexStats = await client.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_tup_read DESC
      LIMIT 10
    `);
    
    if (indexStats.rows.length > 0) {
      console.log('   Top 10 most used indexes:');
      indexStats.rows.forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.tablename}.${stat.indexname} (${stat.idx_tup_read} reads)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Performance optimization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await addPerformanceIndexes();
    console.log('\n✅ Database performance optimization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { addPerformanceIndexes, PERFORMANCE_INDEXES, VALIDATION_CONSTRAINTS };
