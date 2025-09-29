const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

async function verifyDatabaseSchema() {
  console.log('🔍 COMPREHENSIVE DATABASE SCHEMA VERIFICATION');
  console.log('===============================================\n');

  try {
    // 1. Verify Core Tables Structure
    await verifyCoreTables();
    
    // 2. Verify Foreign Key Relationships
    await verifyForeignKeys();
    
    // 3. Verify Indexes and Performance
    await verifyIndexes();
    
    // 4. Verify ITR-Specific Schema Compliance
    await verifyITRSchemaCompliance();
    
    // 5. Verify Data Integrity Constraints
    await verifyConstraints();
    
    // 6. Performance Analysis
    await analyzePerformance();
    
    console.log('\n✅ COMPREHENSIVE VERIFICATION COMPLETED');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

async function verifyCoreTables() {
  console.log('📋 CORE TABLES STRUCTURE VERIFICATION');
  console.log('=====================================\n');
  
  const coreTables = [
    'users', 'filings', 'income_sources_detailed', 'deductions', 
    'house_properties', 'capital_gains', 'tax_computations',
    'service_tickets', 'chat_messages', 'api_integrations'
  ];
  
  for (const table of coreTables) {
    console.log(`\n🔍 Table: ${table}`);
    console.log('─'.repeat(50));
    
    try {
      // Get column information
      const columnsQuery = `
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
        ORDER BY ordinal_position;
      `;
      
      const columns = await pool.query(columnsQuery, [table]);
      
      if (columns.rows.length === 0) {
        console.log(`❌ Table ${table} not found`);
        continue;
      }
      
      console.log('Columns:');
      columns.rows.forEach(col => {
        let typeInfo = col.data_type;
        if (col.character_maximum_length) {
          typeInfo += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision) {
          typeInfo += `(${col.numeric_precision}`;
          if (col.numeric_scale) typeInfo += `,${col.numeric_scale}`;
          typeInfo += ')';
        }
        
        console.log(`  • ${col.column_name}: ${typeInfo} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        if (col.column_default) {
          console.log(`    Default: ${col.column_default}`);
        }
      });
      
      // Get primary key
      const pkQuery = `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY';
      `;
      
      const pk = await pool.query(pkQuery, [table]);
      if (pk.rows.length > 0) {
        console.log(`Primary Key: ${pk.rows.map(r => r.column_name).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Error analyzing ${table}: ${error.message}`);
    }
  }
}

async function verifyForeignKeys() {
  console.log('\n\n🔗 FOREIGN KEY RELATIONSHIPS VERIFICATION');
  console.log('==========================================\n');
  
  const fkQuery = `
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name, kcu.column_name;
  `;
  
  const fks = await pool.query(fkQuery);
  
  console.log('Foreign Key Relationships:');
  fks.rows.forEach(fk => {
    console.log(`  • ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
  });
  
  console.log(`\nTotal Foreign Keys: ${fks.rows.length}`);
}

async function verifyIndexes() {
  console.log('\n\n📊 INDEXES AND PERFORMANCE VERIFICATION');
  console.log('=======================================\n');
  
  const indexQuery = `
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `;
  
  const indexes = await pool.query(indexQuery);
  
  console.log('Database Indexes:');
  indexes.rows.forEach(idx => {
    console.log(`  • ${idx.tablename}.${idx.indexname}`);
    console.log(`    ${idx.indexdef}`);
  });
  
  console.log(`\nTotal Indexes: ${indexes.rows.length}`);
  
  // Check for missing indexes on foreign keys
  console.log('\n🔍 Checking for missing indexes on foreign keys...');
  const missingIndexQuery = `
    SELECT DISTINCT
      tc.table_name,
      kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = tc.table_name 
      AND indexdef LIKE '%' || kcu.column_name || '%'
    );
  `;
  
  const missingIndexes = await pool.query(missingIndexQuery);
  if (missingIndexes.rows.length > 0) {
    console.log('⚠️  Missing indexes on foreign keys:');
    missingIndexes.rows.forEach(missing => {
      console.log(`  • ${missing.table_name}.${missing.column_name}`);
    });
  } else {
    console.log('✅ All foreign keys have indexes');
  }
}

async function verifyITRSchemaCompliance() {
  console.log('\n\n📄 ITR SCHEMA COMPLIANCE VERIFICATION');
  console.log('=====================================\n');
  
  // Check ITR-specific tables and their compliance
  const itrTables = {
    'filings': ['filing_id', 'user_id', 'assessment_year', 'itr_form_type', 'status'],
    'income_sources_detailed': ['source_id', 'filing_id', 'income_type', 'amount', 'tax_deducted'],
    'deductions': ['deduction_id', 'filing_id', 'section_code', 'amount', 'verification_status'],
    'house_properties': ['property_id', 'filing_id', 'property_type', 'annual_value', 'municipal_taxes'],
    'capital_gains': ['gain_id', 'filing_id', 'asset_type', 'sale_amount', 'cost_of_acquisition'],
    'tax_computations': ['computation_id', 'filing_id', 'total_income', 'tax_payable', 'regime_type']
  };
  
  console.log('ITR Schema Compliance Check:');
  
  for (const [table, requiredColumns] of Object.entries(itrTables)) {
    console.log(`\n🔍 Checking ${table}:`);
    
    try {
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `;
      
      const tableExists = await pool.query(tableExistsQuery, [table]);
      
      if (!tableExists.rows[0].exists) {
        console.log(`❌ Table ${table} does not exist`);
        continue;
      }
      
      console.log(`✅ Table ${table} exists`);
      
      // Check required columns
      const columnsQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1;
      `;
      
      const columns = await pool.query(columnsQuery, [table]);
      const existingColumns = columns.rows.map(r => r.column_name);
      
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      const extraColumns = existingColumns.filter(col => !requiredColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  Missing required columns: ${missingColumns.join(', ')}`);
      }
      
      if (extraColumns.length > 0) {
        console.log(`ℹ️  Extra columns: ${extraColumns.join(', ')}`);
      }
      
      if (missingColumns.length === 0) {
        console.log(`✅ All required columns present`);
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${table}: ${error.message}`);
    }
  }
}

async function verifyConstraints() {
  console.log('\n\n🔒 DATA INTEGRITY CONSTRAINTS VERIFICATION');
  console.log('==========================================\n');
  
  const constraintsQuery = `
    SELECT
      tc.table_name,
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type;
  `;
  
  const constraints = await pool.query(constraintsQuery);
  
  const constraintTypes = {};
  constraints.rows.forEach(constraint => {
    if (!constraintTypes[constraint.constraint_type]) {
      constraintTypes[constraint.constraint_type] = [];
    }
    constraintTypes[constraint.constraint_type].push({
      table: constraint.table_name,
      name: constraint.constraint_name,
      column: constraint.column_name
    });
  });
  
  console.log('Constraint Summary:');
  Object.entries(constraintTypes).forEach(([type, items]) => {
    console.log(`\n${type}: ${items.length} constraints`);
    items.forEach(item => {
      console.log(`  • ${item.table}.${item.column} (${item.name})`);
    });
  });
}

async function analyzePerformance() {
  console.log('\n\n⚡ PERFORMANCE ANALYSIS');
  console.log('======================\n');
  
  // Check table sizes
  const sizeQuery = `
    SELECT
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 10;
  `;
  
  const sizes = await pool.query(sizeQuery);
  
  console.log('Largest Tables:');
  sizes.rows.forEach(table => {
    console.log(`  • ${table.tablename}: ${table.size}`);
  });
  
  // Check for potential performance issues
  console.log('\n🔍 Performance Recommendations:');
  
  // Check for tables without primary keys
  const noPkQuery = `
    SELECT t.table_name
    FROM information_schema.tables t
    LEFT JOIN information_schema.table_constraints tc
      ON t.table_name = tc.table_name AND tc.constraint_type = 'PRIMARY KEY'
    WHERE t.table_schema = 'public' AND tc.constraint_name IS NULL;
  `;
  
  const noPkTables = await pool.query(noPkQuery);
  if (noPkTables.rows.length > 0) {
    console.log('⚠️  Tables without primary keys:');
    noPkTables.rows.forEach(table => {
      console.log(`  • ${table.table_name}`);
    });
  }
  
  // Check for tables with many columns (potential normalization issues)
  const manyColumnsQuery = `
    SELECT table_name, COUNT(*) as column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    GROUP BY table_name
    HAVING COUNT(*) > 20
    ORDER BY column_count DESC;
  `;
  
  const manyColumns = await pool.query(manyColumnsQuery);
  if (manyColumns.rows.length > 0) {
    console.log('\n⚠️  Tables with many columns (consider normalization):');
    manyColumns.rows.forEach(table => {
      console.log(`  • ${table.table_name}: ${table.column_count} columns`);
    });
  }
}

// Run the verification
verifyDatabaseSchema().catch(console.error);
