// =====================================================
// MIGRATION: Create document_templates table
// =====================================================
// Run this script to create the document_templates table
// Usage: node src/scripts/migrations/create-document-templates-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createDocumentTemplatesTable() {
  try {
    enterpriseLogger.info('Creating document_templates table...');
    console.log('\n=== Creating Document Templates Table ===\n');

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'document_templates'
    `);
    
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating document_templates table...');
      await sequelize.query(`
        CREATE TABLE document_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(50) NOT NULL CHECK (type IN ('Form16', 'Form16A', 'Form26AS', 'AIS', 'RentReceipt', 'InvestmentProof', 'BankStatement', 'Other')),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          fields JSONB NOT NULL DEFAULT '[]',
          mapping JSONB DEFAULT '{}',
          ocr_config JSONB DEFAULT '{}',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('✅ document_templates table created');

      // Create indexes
      await sequelize.query(`
        CREATE INDEX idx_document_templates_type ON document_templates(type)
      `);
      console.log('✅ Index on type created');

      await sequelize.query(`
        CREATE INDEX idx_document_templates_is_active ON document_templates(is_active)
      `);
      console.log('✅ Index on is_active created');

      await sequelize.query(`
        CREATE INDEX idx_document_templates_created_by ON document_templates(created_by)
      `);
      console.log('✅ Index on created_by created');

      await sequelize.query(`
        CREATE INDEX idx_document_templates_created_at ON document_templates(created_at)
      `);
      console.log('✅ Index on created_at created');
    } else {
      console.log('document_templates table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('Document templates table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Document templates table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createDocumentTemplatesTable()
    .then(async () => {
      console.log('Migration script completed');
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Migration script failed:', error);
      await sequelize.close();
      process.exit(1);
    });
}

module.exports = createDocumentTemplatesTable;

