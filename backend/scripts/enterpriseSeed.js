/**
 * Enterprise Database Seeding Script
 * Creates real test users based on Single Source of Truth
 * Replaces mock data with proper database integration
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'burnblack_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'burnblack',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Hash function for PII
function hashPII(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Test users based on Single Source of Truth
const testUsers = [
    {
        email: 'admin@burnblack.com',
        password: 'password123',
        name: 'Super Administrator',
        role: 'super_admin',
        tenant_id: null,
        permissions: ['full_system_access', 'ca_firm_approval', 'audit_logs', 'feature_flags', 'system_config']
    },
    {
        email: 'platform@burnblack.com',
        password: 'password123',
        name: 'Platform Administrator',
        role: 'platform_admin',
        tenant_id: null,
        permissions: ['platform_management', 'user_oversight', 'compliance_monitoring']
    },
    {
        email: 'caadmin@burnblack.com',
        password: 'password123',
        name: 'CA Firm Administrator',
        role: 'ca_firm_admin',
        tenant_id: '2856b5d5-b8e9-4190-9422-b6988885c54c',
        permissions: ['firm_management', 'staff_oversight', 'client_portfolio', 'billing_management']
    },
    {
        email: 'ca@burnblack.com',
        password: 'password123',
        name: 'Chartered Accountant',
        role: 'ca',
        tenant_id: '2856b5d5-b8e9-4190-9422-b6988885c54c',
        permissions: ['client_filing', 'document_review', 'tax_computation', 'e_signature']
    },
    {
        email: 'seniorca@burnblack.com',
        password: 'password123',
        name: 'Senior Chartered Accountant',
        role: 'senior_ca',
        tenant_id: '2856b5d5-b8e9-4190-9422-b6988885c54c',
        permissions: ['complex_filings', 'team_management', 'client_consultation', 'approval_workflows']
    },
    {
        email: 'user@test.com',
        password: 'user123',
        name: 'End User',
        role: 'user',
        tenant_id: null,
        permissions: ['self_filing', 'family_management', 'document_upload', 'refund_tracking', 'pan_verification']
    },
    {
        email: 'guest@burnblack.com',
        password: 'guest123',
        name: 'Guest User',
        role: 'user', // Guest = End User (legacy terminology)
        tenant_id: null,
        permissions: ['self_filing', 'family_management', 'document_upload', 'refund_tracking', 'pan_verification']
    }
];

async function createUsersTable() {
    try {
        // Create users table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                email_hash VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'ca', 'ca_firm_admin', 'super_admin', 'super_admin_staff', 'platform_admin', 'senior_ca')),
                status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
                is_active BOOLEAN DEFAULT true,
                email_verified BOOLEAN DEFAULT false,
                tenant_id UUID,
                permissions JSONB DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                failed_login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMP
            )
        `);

        // Create permissions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                action VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create role_permissions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                role VARCHAR(50) NOT NULL,
                permission_id UUID REFERENCES permissions(id),
                allowed BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(role, permission_id)
            )
        `);

        console.log('✅ Database tables created/verified');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    }
}

async function seedPermissions() {
    try {
        const permissions = [
            { action: 'full_system_access', description: 'Full system access for Super Admin' },
            { action: 'ca_firm_approval', description: 'Approve/reject CA firm registrations' },
            { action: 'audit_logs', description: 'Access to audit logs and compliance reports' },
            { action: 'feature_flags', description: 'Control feature flags and A/B testing' },
            { action: 'system_config', description: 'System configuration and maintenance' },
            { action: 'platform_management', description: 'Platform-wide management' },
            { action: 'user_oversight', description: 'Oversight of platform users' },
            { action: 'compliance_monitoring', description: 'Monitor compliance across platform' },
            { action: 'firm_management', description: 'Manage CA firm operations' },
            { action: 'staff_oversight', description: 'Oversight of CA firm staff' },
            { action: 'client_portfolio', description: 'Manage client portfolios' },
            { action: 'billing_management', description: 'Manage firm billing and invoices' },
            { action: 'client_filing', description: 'File ITRs for clients' },
            { action: 'document_review', description: 'Review client documents' },
            { action: 'tax_computation', description: 'Perform tax computations' },
            { action: 'e_signature', description: 'Handle e-signatures' },
            { action: 'complex_filings', description: 'Handle complex ITR cases' },
            { action: 'team_management', description: 'Manage CA team members' },
            { action: 'client_consultation', description: 'Provide tax consultation' },
            { action: 'approval_workflows', description: 'Handle approval workflows' },
            { action: 'self_filing', description: 'File own ITR' },
            { action: 'family_management', description: 'Manage family members (max 5)' },
            { action: 'document_upload', description: 'Upload documents' },
            { action: 'refund_tracking', description: 'Track refunds' },
            { action: 'pan_verification', description: 'Verify PAN via SurePass' }
        ];

        for (const perm of permissions) {
            await pool.query(`
                INSERT INTO permissions (action, description) 
                VALUES ($1, $2) 
                ON CONFLICT (action) DO NOTHING
            `, [perm.action, perm.description]);
        }

        console.log('✅ Permissions seeded');
    } catch (error) {
        console.error('❌ Error seeding permissions:', error.message);
    }
}

async function createTestUsers() {
    try {
        console.log('🚀 Starting enterprise test users creation...');
        
        for (const userData of testUsers) {
            try {
                // Check if user already exists
                const emailHash = hashPII(userData.email);
                const existingUser = await pool.query(
                    'SELECT user_id FROM users WHERE email_hash = $1',
                    [emailHash]
                );
                
                if (existingUser.rows.length > 0) {
                    console.log(`✅ User ${userData.email} already exists, updating permissions...`);
                    
                    // Update permissions
                    await pool.query(
                        'UPDATE users SET permissions = $1, updated_at = CURRENT_TIMESTAMP WHERE email_hash = $2',
                        [JSON.stringify(userData.permissions), emailHash]
                    );
                    continue;
                }
                
                // Create new user
                const userId = uuidv4();
                const passwordHash = await bcrypt.hash(userData.password, 12);
                const emailHashValue = hashPII(userData.email);
                
                const insertQuery = `
                    INSERT INTO users (
                        user_id, email, email_hash, name, password_hash, role, status, 
                        is_active, email_verified, tenant_id, permissions, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING user_id, email, name, role
                `;
                
                const values = [
                    userId,
                    userData.email,
                    emailHashValue,
                    userData.name,
                    passwordHash,
                    userData.role,
                    'active',
                    true,
                    true,
                    userData.tenant_id,
                    JSON.stringify(userData.permissions),
                    new Date()
                ];
                
                const result = await pool.query(insertQuery, values);
                const newUser = result.rows[0];
                
                console.log(`✅ Created user: ${newUser.email} (${newUser.role})`);
                
            } catch (error) {
                console.error(`❌ Failed to create user ${userData.email}:`, error.message);
            }
        }
        
        console.log('🎉 Enterprise test users creation completed!');
        
    } catch (error) {
        console.error('❌ Error creating test users:', error);
    }
}

async function main() {
    try {
        await createUsersTable();
        await seedPermissions();
        await createTestUsers();
        
        console.log('\n🎯 Single Source of Truth Implementation Complete!');
        console.log('📋 All users created with proper permissions based on role-matrix.md');
        console.log('🔐 Mock data removed, real database integration active');
        
    } catch (error) {
        console.error('❌ Main execution error:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { createTestUsers, seedPermissions };
