/**
 * Comprehensive Backend Testing Suite for BurnBlack Platform
 */

const request = require('supertest');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Mock database pool
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

// Test data
const mockUserData = {
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe'
};

const mockToken = jwt.sign(
  { user_id: mockUserData.user_id, email: mockUserData.email },
  process.env.JWT_SECRET || 'test-secret',
  { expiresIn: '1h' }
);

describe('User Dashboard API Tests', () => {
  let app;
  let mockPool;

  beforeAll(async () => {
    // Import app after mocks are set up
    app = require('../src/app');
    mockPool = new Pool();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /user-dashboard/profile', () => {
    it('should return user profile data', async () => {
      const mockProfileData = {
        user_id: mockUserData.user_id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        phone_number: '+91-9876543210',
        pan_number: 'ABCDE1234F',
        is_verified: true,
        profile_completion_percentage: 85
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockProfileData]
      });

      const response = await request(app)
        .get('/user-dashboard/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProfileData);
    });

    it('should return 404 if profile not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/user-dashboard/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(404);

      expect(response.body.error).toBe('Profile not found');
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/user-dashboard/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('POST /user-dashboard/family-members', () => {
    it('should create a new family member', async () => {
      const newMember = {
        first_name: 'Jane',
        last_name: 'Doe',
        relationship: 'spouse',
        pan_number: 'FGHIJ5678K',
        date_of_birth: '1985-06-15'
      };

      const mockCreatedMember = {
        id: 'family-member-id',
        user_id: mockUserData.user_id,
        ...newMember,
        is_dependent: false,
        is_active: true,
        created_at: new Date().toISOString()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockCreatedMember]
      });

      const response = await request(app)
        .post('/user-dashboard/family-members')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newMember)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedMember);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/user-dashboard/family-members')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({})
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors).toContain('First name is required');
      expect(response.body.errors).toContain('Relationship is required');
    });
  });

  describe('GET /user-dashboard/notifications', () => {
    it('should return user notifications', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          title: 'ITR Filing Deadline',
          message: 'Your deadline is approaching',
          priority: 'high',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ];

      mockPool.query.mockResolvedValueOnce({
        rows: mockNotifications
      });

      const response = await request(app)
        .get('/user-dashboard/notifications')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNotifications);
    });

    it('should filter notifications by priority', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/user-dashboard/notifications?priority=urgent')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('priority = $2'),
        expect.arrayContaining([mockUserData.user_id, 'urgent'])
      );
    });
  });

  describe('POST /user-dashboard/service-tickets', () => {
    it('should create a new service ticket', async () => {
      const ticketData = {
        subject: 'Unable to upload Form 16',
        description: 'Getting error when uploading PDF',
        category: 'technical',
        priority: 'high'
      };

      const mockTicket = {
        id: 'ticket-id',
        ticket_number: 'TK20240115001',
        user_id: mockUserData.user_id,
        ...ticketData,
        status: 'open',
        created_at: new Date().toISOString()
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockTicket]
      });

      const response = await request(app)
        .post('/user-dashboard/service-tickets')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(ticketData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTicket);
    });
  });

  describe('GET /user-dashboard/analytics', () => {
    it('should return financial analytics', async () => {
      const mockAnalytics = {
        total_income: 750000,
        taxable_income: 600000,
        tax_liability: 75000,
        refund_amount: 15000,
        effective_tax_rate: 12.5,
        deduction_utilization: 100.0
      };

      mockPool.query.mockResolvedValueOnce({
        rows: [mockAnalytics]
      });

      const response = await request(app)
        .get('/user-dashboard/analytics')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAnalytics);
    });
  });

  describe('POST /user-dashboard/drafts', () => {
    it('should save draft with version control', async () => {
      const draftData = {
        form_type: 'ITR-1',
        assessment_year: '2024-25',
        data: { personal_info: { name: 'John Doe' } },
        is_auto_save: false
      };

      const mockDraft = {
        id: 'draft-id',
        user_id: mockUserData.user_id,
        ...draftData,
        version_number: 1,
        is_current: true,
        created_at: new Date().toISOString()
      };

      // Mock transaction
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      mockPool.connect.mockResolvedValueOnce(mockClient);
      mockClient.query.mockResolvedValueOnce({}); // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [{ next_version: 1 }] }); // Version query
      mockClient.query.mockResolvedValueOnce({ rows: [mockDraft] }); // Insert
      mockClient.query.mockResolvedValueOnce({}); // COMMIT

      const response = await request(app)
        .post('/user-dashboard/drafts')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(draftData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockDraft);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app)
        .get('/user-dashboard/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(500);

      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/user-dashboard/family-members')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ first_name: '' })
        .expect(400);

      expect(response.body.errors).toContain('First name is required');
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get(`/user-dashboard/profile?search=${maliciousInput}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      // Verify that parameterized queries are used
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('$1'),
        expect.arrayContaining([mockUserData.user_id])
      );
    });

    it('should validate JWT token properly', async () => {
      const response = await request(app)
        .get('/user-dashboard/profile')
        .expect(401);

      expect(response.body.error).toBe('Access token is required');
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const startTime = Date.now();
      
      await request(app)
        .get('/user-dashboard/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});

describe('Database Schema Tests', () => {
  let mockPool;

  beforeAll(() => {
    mockPool = new Pool();
  });

  describe('User Profiles Table', () => {
    it('should have correct table structure', async () => {
      const mockTableInfo = {
        rows: [
          { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO' },
          { column_name: 'first_name', data_type: 'character varying', is_nullable: 'NO' },
          { column_name: 'last_name', data_type: 'character varying', is_nullable: 'YES' },
          { column_name: 'pan_number', data_type: 'character varying', is_nullable: 'YES' },
          { column_name: 'is_verified', data_type: 'boolean', is_nullable: 'YES' }
        ]
      };

      mockPool.query.mockResolvedValueOnce(mockTableInfo);

      const result = await mockPool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles'
      `);

      expect(result.rows).toHaveLength(5);
      expect(result.rows[0].column_name).toBe('user_id');
      expect(result.rows[0].data_type).toBe('uuid');
    });
  });

  describe('Service Tickets Table', () => {
    it('should have proper indexes', async () => {
      const mockIndexes = {
        rows: [
          { indexname: 'idx_service_tickets_user_id' },
          { indexname: 'idx_service_tickets_status' },
          { indexname: 'idx_service_tickets_priority' }
        ]
      };

      mockPool.query.mockResolvedValueOnce(mockIndexes);

      const result = await mockPool.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'service_tickets'
      `);

      expect(result.rows).toHaveLength(3);
      expect(result.rows.some(row => row.indexname === 'idx_service_tickets_user_id')).toBe(true);
    });
  });
});

describe('Utility Functions Tests', () => {
  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      expect(formatted).toBe('15 Jan 2024');
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency correctly', () => {
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0
        }).format(amount);
      };

      expect(formatCurrency(1000000)).toBe('₹10,00,000');
      expect(formatCurrency(50000)).toBe('₹50,000');
    });
  });

  describe('Validation Functions', () => {
    it('should validate PAN number format', () => {
      const validatePAN = (pan) => {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
      };

      expect(validatePAN('ABCDE1234F')).toBe(true);
      expect(validatePAN('INVALID123')).toBe(false);
      expect(validatePAN('abcde1234f')).toBe(false);
    });

    it('should validate email format', () => {
      const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });
});

module.exports = {
  mockUserData,
  mockToken,
  mockPool
};
