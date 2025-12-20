// =====================================================
// MIGRATION: Verify referential integrity
// =====================================================
// Verifies foreign key relationships and documents them.
// Does NOT add constraints if risky - just documents gaps.
//
// Usage:
//   node backend/src/scripts/migrations/verify-referential-integrity.js
//
// Notes:
// - Verification only, no schema changes
// - Documents findings to docs/DB_REFERENTIAL_INTEGRITY.md

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config();

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

async function verifyReferentialIntegrity() {
  try {
    enterpriseLogger.info('Verifying referential integrity...');
    console.log('\n=== Verify Referential Integrity ===\n');

    const findings = {
      verified: [],
      missing: [],
      gaps: [],
      timestamp: new Date().toISOString(),
    };

    // Check itr_drafts.filing_id → itr_filings.id
    console.log('Checking itr_drafts.filing_id → itr_filings.id...');
    try {
      const [constraints] = await sequelize.query(`
        SELECT 
          tc.constraint_name,
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
          AND tc.table_name = 'itr_drafts'
          AND kcu.column_name = 'filing_id';
      `);

      if (constraints.length > 0) {
        findings.verified.push({
          table: 'itr_drafts',
          column: 'filing_id',
          references: 'itr_filings.id',
          constraint: constraints[0].constraint_name,
        });
        console.log('✅ Foreign key exists');
      } else {
        findings.missing.push({
          table: 'itr_drafts',
          column: 'filing_id',
          references: 'itr_filings.id',
          reason: 'No foreign key constraint found',
        });
        console.log('⚠️  Foreign key constraint not found');
      }
    } catch (error) {
      console.log('⚠️  Could not verify itr_drafts.filing_id:', error.message);
    }

    // Check return_versions.return_id → itr_filings.id
    console.log('Checking return_versions.return_id → itr_filings.id...');
    try {
      const [constraints] = await sequelize.query(`
        SELECT 
          tc.constraint_name,
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
          AND tc.table_name = 'return_versions'
          AND kcu.column_name = 'return_id';
      `);

      if (constraints.length > 0) {
        findings.verified.push({
          table: 'return_versions',
          column: 'return_id',
          references: 'itr_filings.id',
          constraint: constraints[0].constraint_name,
        });
        console.log('✅ Foreign key exists');
      } else {
        findings.missing.push({
          table: 'return_versions',
          column: 'return_id',
          references: 'itr_filings.id',
          reason: 'No foreign key constraint found',
        });
        console.log('⚠️  Foreign key constraint not found');
      }
    } catch (error) {
      console.log('⚠️  Could not verify return_versions.return_id:', error.message);
    }

    // Check for orphaned records
    console.log('Checking for orphaned records...');
    try {
      // Check itr_drafts with invalid filing_id
      const [orphanedDrafts] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM itr_drafts d
        LEFT JOIN itr_filings f ON d.filing_id = f.id
        WHERE f.id IS NULL;
      `);

      if (orphanedDrafts[0].count > 0) {
        findings.gaps.push({
          issue: 'Orphaned itr_drafts records',
          count: orphanedDrafts[0].count,
          description: 'itr_drafts records with filing_id that does not exist in itr_filings',
        });
        console.log(`⚠️  Found ${orphanedDrafts[0].count} orphaned itr_drafts records`);
      } else {
        console.log('✅ No orphaned itr_drafts records');
      }

      // Check return_versions with invalid return_id
      const [orphanedVersions] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM return_versions rv
        LEFT JOIN itr_filings f ON rv.return_id = f.id
        WHERE f.id IS NULL;
      `);

      if (orphanedVersions[0].count > 0) {
        findings.gaps.push({
          issue: 'Orphaned return_versions records',
          count: orphanedVersions[0].count,
          description: 'return_versions records with return_id that does not exist in itr_filings',
        });
        console.log(`⚠️  Found ${orphanedVersions[0].count} orphaned return_versions records`);
      } else {
        console.log('✅ No orphaned return_versions records');
      }
    } catch (error) {
      console.log('⚠️  Could not check for orphaned records:', error.message);
    }

    // Document findings
    console.log('\nDocumenting findings...');
    const docPath = path.join(__dirname, '../../../docs/DB_REFERENTIAL_INTEGRITY.md');
    const docDir = path.dirname(docPath);

    // Ensure docs directory exists
    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    const documentation = `# Database Referential Integrity

**Last Verified:** ${findings.timestamp}

## Verified Foreign Key Relationships

${findings.verified.length > 0 
  ? findings.verified.map(fk => `- **${fk.table}.${fk.column}** → **${fk.references}** (constraint: \`${fk.constraint}\`)`).join('\n')
  : 'None found'}

## Missing Foreign Key Constraints

${findings.missing.length > 0 
  ? findings.missing.map(fk => `- **${fk.table}.${fk.column}** → **${fk.references}**\n  - Reason: ${fk.reason}`).join('\n')
  : 'None - all expected foreign keys exist'}

## Data Integrity Gaps

${findings.gaps.length > 0 
  ? findings.gaps.map(gap => `- **${gap.issue}**: ${gap.count} records\n  - ${gap.description}`).join('\n')
  : 'None - no orphaned records found'}

## Future Foreign Key Relationships

### Finance Module (Planned)
- \`invoices.filing_id\` → \`itr_filings.id\`
- \`payments.filing_id\` → \`itr_filings.id\`
- \`refunds.filing_id\` → \`itr_filings.id\`

### Notes
- Foreign key constraints enforce referential integrity at the database level
- Missing constraints may be intentional (soft references) or need to be added
- Orphaned records should be cleaned up before adding constraints
- Domain Core enforces business logic; foreign keys enforce data integrity
`;

    fs.writeFileSync(docPath, documentation, 'utf8');
    console.log(`✅ Documentation written to ${docPath}`);

    console.log('\n✅ Verification completed successfully');
    enterpriseLogger.info('Referential integrity verification completed', {
      verified: findings.verified.length,
      missing: findings.missing.length,
      gaps: findings.gaps.length,
    });

    // Summary
    console.log('\n=== Summary ===');
    console.log(`Verified: ${findings.verified.length}`);
    console.log(`Missing: ${findings.missing.length}`);
    console.log(`Gaps: ${findings.gaps.length}`);
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    enterpriseLogger.error('Referential integrity verification failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyReferentialIntegrity()
    .then(() => {
      console.log('\nVerification script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Verification script failed:', error);
      process.exit(1);
    });
}

module.exports = verifyReferentialIntegrity;

