// =====================================================
// ADMIN CONTROLLER (USER MANAGEMENT)
// =====================================================

const { User, ServiceTicket, ITRFiling, Document, Invoice, AuditLog, UserSession, PasswordResetToken } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const auditService = require('../services/utils/AuditService');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AdminController {
  /**
   * Get all users with pagination and filters
   * GET /api/admin/users
   */
  async getUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (role) {
        whereClause.role = role;
      }
      if (status) {
        whereClause.status = status;
      }
      if (search) {
        whereClause[Op.or] = [
          { fullName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } },
          { panNumber: { [Op.iLike]: `%${search}%` } },
          { id: { [Op.eq]: search } },
        ];
      }

      // Additional filters
      if (req.query.userType) {
        whereClause.role = req.query.userType;
      }
      if (req.query.registrationDateFrom) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(req.query.registrationDateFrom),
        };
      }
      if (req.query.registrationDateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(req.query.registrationDateTo),
        };
      }
      if (req.query.lastLoginFrom) {
        whereClause.lastLoginAt = {
          ...whereClause.lastLoginAt,
          [Op.gte]: new Date(req.query.lastLoginFrom),
        };
      }
      if (req.query.lastLoginTo) {
        whereClause.lastLoginAt = {
          ...whereClause.lastLoginAt,
          [Op.lte]: new Date(req.query.lastLoginTo),
        };
      }
      if (req.query.emailVerified !== undefined) {
        whereClause.emailVerified = req.query.emailVerified === 'true';
      }
      if (req.query.phoneVerified !== undefined) {
        whereClause.phoneVerified = req.query.phoneVerified === 'true';
      }
      if (req.query.panVerified !== undefined) {
        whereClause.panVerified = req.query.panVerified === 'true';
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id', 'fullName', 'email', 'phone', 'role', 'status',
          'emailVerified', 'phoneVerified', 'createdAt', 'updatedAt',
          'lastLoginAt', 'loginCount',
        ],
      });

      const userList = users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleLabel: this.getRoleLabel(user.role),
        status: user.status,
        statusLabel: this.getStatusLabel(user.status),
        statusColor: this.getStatusColor(user.status),
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        isActive: user.status === 'active',
      }));

      enterpriseLogger.info('Users retrieved via admin API', {
        adminId: req.user.id,
        count: userList.length,
        totalCount: count,
        filters: { role, status, search },
      });

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: userList,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNext: page * limit < count,
            hasPrev: page > 1,
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get users via admin API', {
        error: error.message,
        adminId: req.user?.id,
        query: req.query,
      });
      next(error);
    }
  }

  /**
   * Get user details with statistics
   * GET /api/admin/users/:id
   */
  async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const user = await User.findByPk(id, {
        attributes: [
          'id', 'fullName', 'email', 'phone', 'role', 'status',
          'emailVerified', 'phoneVerified', 'createdAt', 'updatedAt',
          'lastLoginAt', 'loginCount', 'metadata',
        ],
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get user statistics
      const [ticketStats, filingStats, documentStats] = await Promise.all([
        ServiceTicket.getTicketStats(user.id),
        this.getUserFilingStats(user.id),
        Document.getUserStorageStats(user.id),
      ]);

      const userDetails = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleLabel: this.getRoleLabel(user.role),
        status: user.status,
        statusLabel: this.getStatusLabel(user.status),
        statusColor: this.getStatusColor(user.status),
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        metadata: user.metadata,
        statistics: {
          tickets: ticketStats,
          filings: filingStats,
          documents: documentStats,
        },
      };

      enterpriseLogger.info('User details retrieved via admin API', {
        adminId,
        userId: id,
      });

      res.status(200).json({
        success: true,
        message: 'User details retrieved successfully',
        data: userDetails,
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get user details via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Update user status
   * PUT /api/admin/users/:id/status
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user.id;

      if (!status) {
        throw new AppError('Status is required', 400);
      }

      const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
      if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status: ${status}`, 400);
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const oldStatus = user.status;
      user.status = status;
      user.metadata = {
        ...user.metadata,
        statusChangeHistory: [
          ...(user.metadata?.statusChangeHistory || []),
          {
            oldStatus,
            newStatus: status,
            changedBy: adminId,
            reason: reason || 'No reason provided',
            changedAt: new Date().toISOString(),
          },
        ],
      };

      await user.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_status',
        id,
        {
          oldStatus,
          newStatus: status,
          reason,
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User status updated via admin API', {
        adminId,
        userId: id,
        oldStatus,
        newStatus: status,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
        data: {
          userId: id,
          oldStatus,
          newStatus: status,
          reason,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to update user status via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Update user role
   * PUT /api/admin/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role, reason } = req.body;
      const adminId = req.user.id;

      if (!role) {
        throw new AppError('Role is required', 400);
      }

      const validRoles = ['user', 'ca', 'ca_firm_admin', 'admin', 'super_admin'];
      if (!validRoles.includes(role)) {
        throw new AppError(`Invalid role: ${role}`, 400);
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const oldRole = user.role;
      user.role = role;
      user.metadata = {
        ...user.metadata,
        roleChangeHistory: [
          ...(user.metadata?.roleChangeHistory || []),
          {
            oldRole,
            newRole: role,
            changedBy: adminId,
            reason: reason || 'No reason provided',
            changedAt: new Date().toISOString(),
          },
        ],
      };

      await user.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_role',
        id,
        {
          oldRole,
          newRole: role,
          reason,
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User role updated via admin API', {
        adminId,
        userId: id,
        oldRole,
        newRole: role,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: {
          userId: id,
          oldRole,
          newRole: role,
          reason,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to update user role via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get system statistics
   * GET /api/admin/stats
   */
  async getSystemStats(req, res, next) {
    try {
      const adminId = req.user.id;

      const [
        userStats,
        ticketStats,
        filingStats,
        documentStats,
      ] = await Promise.all([
        this.getUserStats(),
        ServiceTicket.getTicketStats(),
        this.getFilingStats(),
        this.getDocumentStats(),
      ]);

      const systemStats = {
        users: userStats,
        tickets: ticketStats,
        filings: filingStats,
        documents: documentStats,
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
        },
      };

      enterpriseLogger.info('System statistics retrieved via admin API', {
        adminId,
      });

      res.status(200).json({
        success: true,
        message: 'System statistics retrieved successfully',
        data: systemStats,
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get system statistics via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get recent activity
   * GET /api/admin/activity
   */
  async getRecentActivity(req, res, next) {
    try {
      const { limit = 50 } = req.query;
      const adminId = req.user.id;

      // Get recent audit logs
      const activities = await AuditLog.findAll({
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
      });

      // Get user info for activities
      const userIds = [...new Set(activities.map(a => a.userId).filter(Boolean))];
      const users = userIds.length > 0 ? await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'fullName', 'email'],
      }) : [];
      const userMap = new Map(users.map(u => [u.id, u]));

      const activityList = activities.map(activity => {
        const user = userMap.get(activity.userId);
        return {
          id: activity.id,
          type: activity.action,
          description: `${activity.action} on ${activity.resource || 'unknown'}`,
          userId: activity.userId,
          userName: user?.fullName,
          userEmail: user?.email,
          timestamp: activity.timestamp,
          ipAddress: activity.ipAddress,
          success: activity.success,
          metadata: activity.metadata,
        };
      });

      enterpriseLogger.info('Recent activity retrieved via admin API', {
        adminId,
        limit,
        count: activityList.length,
      });

      res.status(200).json({
        success: true,
        message: 'Recent activity retrieved successfully',
        data: {
          activities: activityList,
          count: activityList.length,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get recent activity via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard/stats
   */
  async getDashboardStats(req, res, next) {
    try {
      const adminId = req.user.id;

      const [
        userStats,
        filingStats,
        ticketStats,
        documentStats,
      ] = await Promise.all([
        this.getUserStats(),
        this.getFilingStats(),
        ServiceTicket.getTicketStats ? ServiceTicket.getTicketStats() : { totalTickets: 0, openTickets: 0 },
        this.getDocumentStats(),
      ]);

      // Calculate revenue (from invoices)
      const revenueStats = await Invoice.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = \'PAID\' THEN total_amount ELSE 0 END')), 'totalRevenue'],
          [sequelize.fn('SUM', sequelize.literal('CASE WHEN status = \'PAID\' AND created_at >= CURRENT_DATE THEN total_amount ELSE 0 END')), 'todayRevenue'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'PAID\' THEN 1 END')), 'paidInvoices'],
        ],
        raw: true,
      });

      const stats = {
        users: {
          total: userStats.totalUsers,
          active: userStats.activeUsers,
          newToday: 0, // Would need to calculate
        },
        filings: {
          total: filingStats.totalFilings,
          today: 0, // Would need to calculate
          byType: {
            itr1: filingStats.itr1Filings,
            itr2: filingStats.itr2Filings,
            itr3: filingStats.itr3Filings,
            itr4: filingStats.itr4Filings,
          },
        },
        revenue: {
          total: parseFloat(revenueStats[0]?.totalRevenue) || 0,
          today: parseFloat(revenueStats[0]?.todayRevenue) || 0,
          paidInvoices: parseInt(revenueStats[0]?.paidInvoices) || 0,
        },
        tickets: ticketStats,
        documents: documentStats,
      };

      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: {
          stats,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get dashboard stats via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get chart data
   * GET /api/admin/dashboard/charts/:type
   */
  async getChartData(req, res, next) {
    try {
      const { type } = req.params;
      const { dateFrom, dateTo } = req.query;
      const adminId = req.user.id;

      const whereClause = {};
      if (dateFrom) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(dateFrom),
        };
      }
      if (dateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(dateTo),
        };
      }

      let chartData = {};

      switch (type) {
        case 'users':
          // User registration trends
          const users = await User.findAll({
            where: whereClause,
            attributes: [
              [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
              [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true,
          });
          chartData = {
            labels: users.map(u => u.date),
            datasets: [{
              label: 'New Users',
              data: users.map(u => parseInt(u.count)),
            }],
          };
          break;

        case 'filings':
          // Filing trends
          const filings = await ITRFiling.findAll({
            where: whereClause,
            attributes: [
              [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
              [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true,
          });
          chartData = {
            labels: filings.map(f => f.date),
            datasets: [{
              label: 'Filings',
              data: filings.map(f => parseInt(f.count)),
            }],
          };
          break;

        case 'revenue':
          // Revenue trends
          const revenue = await Invoice.findAll({
            where: {
              ...whereClause,
              status: 'PAID',
            },
            attributes: [
              [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
              [sequelize.fn('SUM', sequelize.col('total_amount')), 'amount'],
            ],
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true,
          });
          chartData = {
            labels: revenue.map(r => r.date),
            datasets: [{
              label: 'Revenue',
              data: revenue.map(r => parseFloat(r.amount) || 0),
            }],
          };
          break;

        default:
          throw new AppError(`Invalid chart type: ${type}`, 400);
      }

      res.status(200).json({
        success: true,
        message: 'Chart data retrieved successfully',
        data: {
          type,
          chartData,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get chart data via admin API', {
        error: error.message,
        adminId: req.user?.id,
        type: req.params.type,
      });
      next(error);
    }
  }

  /**
   * Get system alerts
   * GET /api/admin/dashboard/alerts
   */
  async getSystemAlerts(req, res, next) {
    try {
      const adminId = req.user.id;

      const alerts = [];

      // Check for high error rates
      const recentErrors = await AuditLog.count({
        where: {
          success: false,
          timestamp: {
            [Op.gte]: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      if (recentErrors > 10) {
        alerts.push({
          id: 'high-error-rate',
          type: 'error',
          severity: 'high',
          title: 'High Error Rate',
          message: `${recentErrors} errors in the last hour`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for pending CA verifications
      const pendingCAs = await User.count({
        where: {
          role: 'CA',
          status: 'pending',
        },
      });

      if (pendingCAs > 0) {
        alerts.push({
          id: 'pending-ca-verifications',
          type: 'warning',
          severity: 'medium',
          title: 'Pending CA Verifications',
          message: `${pendingCAs} CA accounts pending verification`,
          timestamp: new Date().toISOString(),
        });
      }

      // Check for payment gateway issues (would check actual gateway status)
      alerts.push({
        id: 'payment-gateway-status',
        type: 'info',
        severity: 'low',
        title: 'Payment Gateway',
        message: 'All payment gateways operational',
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'System alerts retrieved successfully',
        data: {
          alerts,
          count: alerts.length,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get system alerts via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get user analytics
   * GET /api/admin/analytics/users
   */
  async getUserAnalytics(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      const adminId = req.user.id;

      const whereClause = {};
      if (dateFrom) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(dateFrom),
        };
      }
      if (dateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(dateTo),
        };
      }

      // User acquisition trends
      const users = await User.findAll({
        where: whereClause,
        attributes: [
          'id',
          'role',
          'status',
          'createdAt',
          'lastLoginAt',
        ],
      });

      const analytics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        byRole: {},
        byStatus: {},
        acquisitionTrends: [],
        retentionRate: 0,
        averageLoginCount: 0,
      };

      users.forEach(user => {
        analytics.byRole[user.role] = (analytics.byRole[user.role] || 0) + 1;
        analytics.byStatus[user.status] = (analytics.byStatus[user.status] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        message: 'User analytics retrieved successfully',
        data: {
          analytics,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get user analytics via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get revenue analytics
   * GET /api/admin/analytics/revenue
   */
  async getRevenueAnalytics(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;
      const adminId = req.user.id;

      const whereClause = { status: 'PAID' };
      if (dateFrom) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(dateFrom),
        };
      }
      if (dateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(dateTo),
        };
      }

      const invoices = await Invoice.findAll({
        where: whereClause,
        attributes: [
          'id',
          'totalAmount',
          'type',
          'createdAt',
        ],
      });

      const analytics = {
        totalRevenue: invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0),
        byType: {},
        trends: [],
        averageTransactionValue: 0,
      };

      invoices.forEach(invoice => {
        analytics.byType[invoice.type] = (analytics.byType[invoice.type] || 0) + parseFloat(invoice.totalAmount || 0);
      });

      analytics.averageTransactionValue = invoices.length > 0
        ? analytics.totalRevenue / invoices.length
        : 0;

      res.status(200).json({
        success: true,
        message: 'Revenue analytics retrieved successfully',
        data: {
          analytics,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get revenue analytics via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/admin/users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, email, phone, panNumber, reason } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const updateData = {};
      if (fullName !== undefined) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (panNumber !== undefined) updateData.panNumber = panNumber;

      await user.update(updateData);

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_profile',
        id,
        {
          updates: updateData,
          reason: reason || 'No reason provided',
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User profile updated via admin API', {
        adminId,
        userId: id,
        updates: updateData,
      });

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully',
        data: {
          userId: id,
          updates: updateData,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to update user profile via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Activate user account
   * POST /api/admin/users/:id/activate
   */
  async activateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const oldStatus = user.status;
      user.status = 'active';
      await user.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_status',
        id,
        {
          oldStatus,
          newStatus: 'active',
          reason: reason || 'Account activated by admin',
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User activated via admin API', {
        adminId,
        userId: id,
      });

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: {
          userId: id,
          status: 'active',
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to activate user via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Deactivate user account
   * POST /api/admin/users/:id/deactivate
   */
  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const oldStatus = user.status;
      user.status = 'inactive';
      await user.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_status',
        id,
        {
          oldStatus,
          newStatus: 'inactive',
          reason: reason || 'Account deactivated by admin',
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User deactivated via admin API', {
        adminId,
        userId: id,
      });

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: {
          userId: id,
          status: 'inactive',
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to deactivate user via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Suspend user account
   * POST /api/admin/users/:id/suspend
   */
  async suspendUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const oldStatus = user.status;
      user.status = 'suspended';
      await user.save();

      // Revoke all sessions
      await UserSession.revokeAllSessions(id);

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_status',
        id,
        {
          oldStatus,
          newStatus: 'suspended',
          reason: reason || 'Account suspended by admin',
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User suspended via admin API', {
        adminId,
        userId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        data: {
          userId: id,
          status: 'suspended',
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to suspend user via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Force password reset
   * POST /api/admin/users/:id/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.authProvider !== 'LOCAL') {
        throw new AppError('Password reset only available for local accounts', 400);
      }

      // Generate reset token
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create reset token record
      await PasswordResetToken.createResetToken(
        user.id,
        resetToken,
        expiresAt,
        req.ip || req.connection.remoteAddress,
        req.headers['user-agent'],
      );

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_password_reset',
        id,
        {
          reason: reason || 'Password reset initiated by admin',
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('Password reset token generated via admin API', {
        adminId,
        userId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset token generated successfully',
        data: {
          userId: id,
          resetToken,
          expiresAt,
          resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to reset password via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Invalidate all user sessions
   * POST /api/admin/users/:id/invalidate-sessions
   */
  async invalidateSessions(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Revoke all sessions
      await UserSession.revokeAllSessions(id);

      // Increment token version to invalidate JWT tokens
      await user.update({
        tokenVersion: user.tokenVersion + 1,
      });

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'user_sessions',
        id,
        {
          reason: reason || 'All sessions invalidated by admin',
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User sessions invalidated via admin API', {
        adminId,
        userId: id,
      });

      res.status(200).json({
        success: true,
        message: 'All user sessions invalidated successfully',
        data: {
          userId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to invalidate sessions via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get user activity log
   * GET /api/admin/users/:id/activity
   */
  async getUserActivity(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get audit logs for user
      const activities = await AuditLog.findAll({
        where: {
          userId: id,
        },
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'user_activity',
        id,
        {
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User activity retrieved via admin API', {
        adminId,
        userId: id,
        count: activities.length,
      });

      res.status(200).json({
        success: true,
        message: 'User activity retrieved successfully',
        data: {
          userId: id,
          activities: activities.map(activity => ({
            id: activity.id,
            action: activity.action,
            resource: activity.resource,
            resourceId: activity.resourceId,
            timestamp: activity.timestamp,
            ipAddress: activity.ipAddress,
            userAgent: activity.userAgent,
            success: activity.success,
            errorMessage: activity.errorMessage,
            metadata: activity.metadata,
          })),
          count: activities.length,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get user activity via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get user's filings
   * GET /api/admin/users/:id/filings
   */
  async getUserFilings(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status, itrType } = req.query;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const offset = (page - 1) * limit;
      const whereClause = { userId: id };

      if (status) {
        whereClause.status = status;
      }
      if (itrType) {
        whereClause.itrType = itrType;
      }

      const { count, rows: filings } = await ITRFiling.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'user_filings',
        id,
        {
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User filings retrieved via admin API', {
        adminId,
        userId: id,
        count: filings.length,
      });

      res.status(200).json({
        success: true,
        message: 'User filings retrieved successfully',
        data: {
          userId: id,
          filings: filings.map(filing => ({
            id: filing.id,
            itrType: filing.itrType,
            assessmentYear: filing.assessmentYear,
            status: filing.status,
            ackNumber: filing.ackNumber,
            createdAt: filing.createdAt,
            submittedAt: filing.submittedAt,
            acknowledgedAt: filing.acknowledgedAt,
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get user filings via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get user's transactions
   * GET /api/admin/users/:id/transactions
   */
  async getUserTransactions(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status, type } = req.query;
      const adminId = req.user.id;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const offset = (page - 1) * limit;
      const whereClause = { userId: id };

      if (status) {
        whereClause.status = status;
      }
      if (type) {
        whereClause.type = type;
      }

      const { count, rows: invoices } = await Invoice.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'user_transactions',
        id,
        {
          userId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('User transactions retrieved via admin API', {
        adminId,
        userId: id,
        count: invoices.length,
      });

      res.status(200).json({
        success: true,
        message: 'User transactions retrieved successfully',
        data: {
          userId: id,
          transactions: invoices.map(invoice => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.totalAmount,
            status: invoice.status,
            type: invoice.type,
            createdAt: invoice.createdAt,
            paidAt: invoice.paidAt,
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get user transactions via admin API', {
        error: error.message,
        adminId: req.user?.id,
        userId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Bulk user operations
   * POST /api/admin/users/bulk
   */
  async bulkOperations(req, res, next) {
    try {
      const { userIds, operation, data } = req.body;
      const adminId = req.user.id;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new AppError('User IDs array is required', 400);
      }

      if (!operation) {
        throw new AppError('Operation is required', 400);
      }

      const validOperations = ['activate', 'deactivate', 'suspend', 'delete'];
      if (!validOperations.includes(operation)) {
        throw new AppError(`Invalid operation: ${operation}`, 400);
      }

      const results = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          const user = await User.findByPk(userId);
          if (!user) {
            errors.push({ userId, error: 'User not found' });
            continue;
          }

          switch (operation) {
            case 'activate':
              user.status = 'active';
              await user.save();
              break;
            case 'deactivate':
              user.status = 'inactive';
              await user.save();
              break;
            case 'suspend':
              user.status = 'suspended';
              await user.save();
              await UserSession.revokeAllSessions(userId);
              break;
            case 'delete':
              // Soft delete by setting status to inactive
              user.status = 'inactive';
              await user.save();
              break;
          }

          // Log audit event
          await auditService.logDataAccess(
            adminId,
            'update',
            `user_bulk_${operation}`,
            userId,
            {
              operation,
              reason: data?.reason || 'Bulk operation by admin',
              userId,
            },
            req.ip,
          );

          results.push({ userId, success: true, operation });
        } catch (error) {
          errors.push({ userId, error: error.message });
        }
      }

      enterpriseLogger.info('Bulk user operation completed via admin API', {
        adminId,
        operation,
        totalUsers: userIds.length,
        successCount: results.length,
        errorCount: errors.length,
      });

      res.status(200).json({
        success: true,
        message: `Bulk ${operation} operation completed`,
        data: {
          operation,
          totalUsers: userIds.length,
          successCount: results.length,
          errorCount: errors.length,
          results,
          errors,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to perform bulk operation via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Export user list
   * GET /api/admin/users/export
   */
  async exportUsers(req, res, next) {
    try {
      const { format = 'csv' } = req.query;
      const adminId = req.user.id;

      // Get all users (or apply filters from query)
      const whereClause = {};
      if (req.query.status) {
        whereClause.status = req.query.status;
      }
      if (req.query.role) {
        whereClause.role = req.query.role;
      }

      const users = await User.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id', 'fullName', 'email', 'phone', 'role', 'status',
          'emailVerified', 'phoneVerified', 'panNumber', 'panVerified',
          'createdAt', 'lastLoginAt', 'loginCount',
        ],
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'export',
        'users',
        null,
        {
          format,
          count: users.length,
        },
        req.ip,
      );

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'ID,Name,Email,Phone,Role,Status,Email Verified,Phone Verified,PAN,PAN Verified,Created At,Last Login,Login Count\n';
        const csvRows = users.map(user => {
          return [
            user.id,
            user.fullName || '',
            user.email || '',
            user.phone || '',
            user.role || '',
            user.status || '',
            user.emailVerified ? 'Yes' : 'No',
            user.phoneVerified ? 'Yes' : 'No',
            user.panNumber || '',
            user.panVerified ? 'Yes' : 'No',
            user.createdAt ? user.createdAt.toISOString() : '',
            user.lastLoginAt ? user.lastLoginAt.toISOString() : '',
            user.loginCount || 0,
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=users_export_${Date.now()}.csv`);
        res.status(200).send(csv);
      } else {
        // Return JSON
        res.status(200).json({
          success: true,
          message: 'Users exported successfully',
          data: {
            users: users.map(user => ({
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              role: user.role,
              status: user.status,
              emailVerified: user.emailVerified,
              phoneVerified: user.phoneVerified,
              panNumber: user.panNumber,
              panVerified: user.panVerified,
              createdAt: user.createdAt,
              lastLoginAt: user.lastLoginAt,
              loginCount: user.loginCount,
            })),
            count: users.length,
          },
        });
      }

      enterpriseLogger.info('Users exported via admin API', {
        adminId,
        format,
        count: users.length,
      });

    } catch (error) {
      enterpriseLogger.error('Failed to export users via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
      const stats = await User.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalUsers'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'active\' THEN 1 END')), 'activeUsers'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'inactive\' THEN 1 END')), 'inactiveUsers'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'suspended\' THEN 1 END')), 'suspendedUsers'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN role = \'END_USER\' THEN 1 END')), 'regularUsers'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN role = \'CA\' THEN 1 END')), 'caUsers'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN role IN (\'SUPER_ADMIN\', \'PLATFORM_ADMIN\') THEN 1 END')), 'adminUsers'],
        ],
        raw: true,
      });

    return {
      totalUsers: parseInt(stats[0].totalUsers) || 0,
      activeUsers: parseInt(stats[0].activeUsers) || 0,
      inactiveUsers: parseInt(stats[0].inactiveUsers) || 0,
      suspendedUsers: parseInt(stats[0].suspendedUsers) || 0,
      regularUsers: parseInt(stats[0].regularUsers) || 0,
      caUsers: parseInt(stats[0].caUsers) || 0,
      adminUsers: parseInt(stats[0].adminUsers) || 0,
    };
  }

  /**
   * Get user filing statistics
   */
  async getUserFilingStats(userId) {
    const stats = await ITRFiling.findAll({
      where: { userId },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'draft\' THEN 1 END')), 'draftFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'submitted\' THEN 1 END')), 'submittedFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'acknowledged\' THEN 1 END')), 'acknowledgedFilings'],
      ],
      raw: true,
    });

    return {
      totalFilings: parseInt(stats[0]?.totalFilings) || 0,
      draftFilings: parseInt(stats[0]?.draftFilings) || 0,
      submittedFilings: parseInt(stats[0]?.submittedFilings) || 0,
      acknowledgedFilings: parseInt(stats[0]?.acknowledgedFilings) || 0,
    };
  }

  /**
   * Get filing statistics
   */
  async getFilingStats() {
    const stats = await ITRFiling.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'draft\' THEN 1 END')), 'draftFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'submitted\' THEN 1 END')), 'submittedFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = \'acknowledged\' THEN 1 END')), 'acknowledgedFilings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN itr_type = \'ITR-1\' THEN 1 END')), 'itr1Filings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN itr_type = \'ITR-2\' THEN 1 END')), 'itr2Filings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN itr_type = \'ITR-3\' THEN 1 END')), 'itr3Filings'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN itr_type = \'ITR-4\' THEN 1 END')), 'itr4Filings'],
      ],
      raw: true,
    });

    return {
      totalFilings: parseInt(stats[0]?.totalFilings) || 0,
      draftFilings: parseInt(stats[0]?.draftFilings) || 0,
      submittedFilings: parseInt(stats[0]?.submittedFilings) || 0,
      acknowledgedFilings: parseInt(stats[0]?.acknowledgedFilings) || 0,
      itr1Filings: parseInt(stats[0]?.itr1Filings) || 0,
      itr2Filings: parseInt(stats[0]?.itr2Filings) || 0,
      itr3Filings: parseInt(stats[0]?.itr3Filings) || 0,
      itr4Filings: parseInt(stats[0]?.itr4Filings) || 0,
    };
  }

  /**
   * Get document statistics
   */
  async getDocumentStats() {
    const stats = await Document.findAll({
      where: { isDeleted: false },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalDocuments'],
        [sequelize.fn('SUM', sequelize.col('size_bytes')), 'totalStorage'],
        [sequelize.fn('COUNT', sequelize.literal('CASE WHEN verification_status = \'VERIFIED\' THEN 1 END')), 'verifiedDocuments'],
      ],
      raw: true,
    });

    return {
      totalDocuments: parseInt(stats[0]?.totalDocuments) || 0,
      totalStorage: parseInt(stats[0]?.totalStorage) || 0,
      verifiedDocuments: parseInt(stats[0]?.verifiedDocuments) || 0,
    };
  }

  /**
   * Get role label
   */
  getRoleLabel(role) {
    const labels = {
      'user': 'End User',
      'ca': 'CA',
      'ca_firm_admin': 'CA Firm Admin',
      'admin': 'Admin',
      'super_admin': 'Super Admin',
    };
    return labels[role] || 'Unknown';
  }

  /**
   * Get status label
   */
  getStatusLabel(status) {
    const labels = {
      'active': 'Active',
      'inactive': 'Inactive',
      'suspended': 'Suspended',
      'pending': 'Pending',
    };
    return labels[status] || 'Unknown';
  }

  /**
   * Get status color
   */
  getStatusColor(status) {
    const colors = {
      'active': 'green',
      'inactive': 'gray',
      'suspended': 'red',
      'pending': 'yellow',
    };
    return colors[status] || 'gray';
  }

  // =====================================================
  // FILING MANAGEMENT METHODS
  // =====================================================

  /**
   * Get all filings with pagination and filters
   * GET /api/admin/filings
   */
  async getFilings(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        itrType,
        assessmentYear,
        regime,
        incomeRangeFrom,
        incomeRangeTo,
        filingDateFrom,
        filingDateTo,
        caId,
        discrepancyStatus,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (status) {
        whereClause.status = status;
      }
      if (itrType) {
        whereClause.itrType = itrType;
      }
      if (assessmentYear) {
        whereClause.assessmentYear = assessmentYear;
      }
      if (filingDateFrom) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(filingDateFrom),
        };
      }
      if (filingDateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(filingDateTo),
        };
      }

      // Search by acknowledgment number, PAN, user name, or filing ID
      if (search) {
        const { User } = require('../models');
        const users = await User.findAll({
          where: {
            [Op.or]: [
              { fullName: { [Op.iLike]: `%${search}%` } },
              { panNumber: { [Op.iLike]: `%${search}%` } },
            ],
          },
          attributes: ['id'],
        });
        const userIds = users.map(u => u.id);

        whereClause[Op.or] = [
          { ackNumber: { [Op.iLike]: `%${search}%` } },
          { id: { [Op.eq]: search } },
          ...(userIds.length > 0 ? [{ userId: { [Op.in]: userIds } }] : []),
        ];
      }

      const { count, rows: filings } = await ITRFiling.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'panNumber'],
          },
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const filingList = filings.map(filing => ({
        id: filing.id,
        userId: filing.userId,
        userName: filing.user?.fullName,
        userEmail: filing.user?.email,
        userPAN: filing.user?.panNumber,
        itrType: filing.itrType,
        assessmentYear: filing.assessmentYear,
        status: filing.status,
        ackNumber: filing.ackNumber,
        createdAt: filing.createdAt,
        submittedAt: filing.submittedAt,
        acknowledgedAt: filing.acknowledgedAt,
        regime: filing.jsonPayload?.regime || 'old',
      }));

      enterpriseLogger.info('Filings retrieved via admin API', {
        adminId: req.user.id,
        count: filingList.length,
        totalCount: count,
        filters: { status, itrType, search },
      });

      res.status(200).json({
        success: true,
        message: 'Filings retrieved successfully',
        data: {
          filings: filingList,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNext: page * limit < count,
            hasPrev: page > 1,
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filings via admin API', {
        error: error.message,
        adminId: req.user?.id,
        query: req.query,
      });
      next(error);
    }
  }

  /**
   * Get filing detail
   * GET /api/admin/filings/:id
   */
  async getFilingDetails(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'phone', 'panNumber'],
          },
        ],
      });

      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'filing',
        id,
        {
          filingId: id,
          userId: filing.userId,
        },
        req.ip,
      );

      enterpriseLogger.info('Filing details retrieved via admin API', {
        adminId,
        filingId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Filing details retrieved successfully',
        data: {
          filing: {
            id: filing.id,
            userId: filing.userId,
            user: filing.user,
            itrType: filing.itrType,
            assessmentYear: filing.assessmentYear,
            status: filing.status,
            ackNumber: filing.ackNumber,
            jsonPayload: filing.jsonPayload,
            createdAt: filing.createdAt,
            updatedAt: filing.updatedAt,
            submittedAt: filing.submittedAt,
            acknowledgedAt: filing.acknowledgedAt,
            metadata: filing.metadata,
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filing details via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Update filing
   * PUT /api/admin/filings/:id
   */
  async updateFiling(req, res, next) {
    try {
      const { id } = req.params;
      const { jsonPayload, reason } = req.body;
      const adminId = req.user.id;

      if (!jsonPayload) {
        throw new AppError('jsonPayload is required', 400);
      }

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      const oldPayload = filing.jsonPayload;
      filing.jsonPayload = jsonPayload;
      filing.metadata = {
        ...filing.metadata,
        adminEdits: [
          ...(filing.metadata?.adminEdits || []),
          {
            editedBy: adminId,
            editedAt: new Date().toISOString(),
            reason: reason || 'No reason provided',
            changes: 'Filing data updated by admin',
          },
        ],
      };
      await filing.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'filing',
        id,
        {
          filingId: id,
          userId: filing.userId,
          reason: reason || 'Filing updated by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Filing updated via admin API', {
        adminId,
        filingId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Filing updated successfully',
        data: {
          filingId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to update filing via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Reprocess filing
   * POST /api/admin/filings/:id/reprocess
   */
  async reprocessFiling(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      // Reset status to draft for reprocessing
      const oldStatus = filing.status;
      filing.status = 'draft';
      filing.metadata = {
        ...filing.metadata,
        reprocessHistory: [
          ...(filing.metadata?.reprocessHistory || []),
          {
            reprocessedBy: adminId,
            reprocessedAt: new Date().toISOString(),
            oldStatus,
            reason: reason || 'Reprocessed by admin',
          },
        ],
      };
      await filing.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'filing_reprocess',
        id,
        {
          filingId: id,
          userId: filing.userId,
          oldStatus,
          reason: reason || 'Filing reprocessed by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Filing reprocessed via admin API', {
        adminId,
        filingId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Filing reprocessed successfully',
        data: {
          filingId: id,
          status: 'draft',
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to reprocess filing via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Cancel filing
   * POST /api/admin/filings/:id/cancel
   */
  async cancelFiling(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      const oldStatus = filing.status;
      filing.status = 'draft';
      filing.metadata = {
        ...filing.metadata,
        cancellationHistory: [
          ...(filing.metadata?.cancellationHistory || []),
          {
            cancelledBy: adminId,
            cancelledAt: new Date().toISOString(),
            oldStatus,
            reason: reason || 'Cancelled by admin',
          },
        ],
      };
      await filing.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'filing_cancel',
        id,
        {
          filingId: id,
          userId: filing.userId,
          oldStatus,
          reason: reason || 'Filing cancelled by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Filing cancelled via admin API', {
        adminId,
        filingId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Filing cancelled successfully',
        data: {
          filingId: id,
          status: 'draft',
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to cancel filing via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get filing audit log
   * GET /api/admin/filings/:id/audit-log
   */
  async getFilingAuditLog(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      // Get audit logs for filing
      const auditLogs = await AuditLog.findAll({
        where: {
          resource: 'filing',
          resourceId: id,
        },
        order: [['timestamp', 'DESC']],
        limit: 100,
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'filing_audit_log',
        id,
        {
          filingId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('Filing audit log retrieved via admin API', {
        adminId,
        filingId: id,
        count: auditLogs.length,
      });

      res.status(200).json({
        success: true,
        message: 'Filing audit log retrieved successfully',
        data: {
          filingId: id,
          auditLogs: auditLogs.map(log => ({
            id: log.id,
            action: log.action,
            userId: log.userId,
            timestamp: log.timestamp,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            success: log.success,
            errorMessage: log.errorMessage,
            metadata: log.metadata,
          })),
          count: auditLogs.length,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filing audit log via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get filing documents
   * GET /api/admin/filings/:id/documents
   */
  async getFilingDocuments(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      // Get documents for filing
      const documents = await Document.findAll({
        where: {
          filingId: id,
        },
        order: [['createdAt', 'DESC']],
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'filing_documents',
        id,
        {
          filingId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('Filing documents retrieved via admin API', {
        adminId,
        filingId: id,
        count: documents.length,
      });

      res.status(200).json({
        success: true,
        message: 'Filing documents retrieved successfully',
        data: {
          filingId: id,
          documents: documents.map(doc => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            uploadDate: doc.createdAt,
            verificationStatus: doc.verificationStatus,
            extractedData: doc.extractedData,
          })),
          count: documents.length,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filing documents via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get filings with issues
   * GET /api/admin/filings/issues
   */
  async getFilingIssues(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Get filings with errors or in problematic states
      const { count, rows: filings } = await ITRFiling.findAndCountAll({
        where: {
          status: {
            [Op.in]: ['rejected', 'draft'],
          },
          [Op.or]: [
            { metadata: { [Op.contains]: { hasErrors: true } } },
            { metadata: { [Op.contains]: { hasDiscrepancies: true } } },
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email'],
          },
        ],
        order: [['updatedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      enterpriseLogger.info('Filing issues retrieved via admin API', {
        adminId: req.user.id,
        count: filings.length,
      });

      res.status(200).json({
        success: true,
        message: 'Filing issues retrieved successfully',
        data: {
          filings: filings.map(filing => ({
            id: filing.id,
            userId: filing.userId,
            userName: filing.user?.fullName,
            userEmail: filing.user?.email,
            itrType: filing.itrType,
            assessmentYear: filing.assessmentYear,
            status: filing.status,
            issues: filing.metadata?.issues || [],
            errors: filing.metadata?.errors || [],
            discrepancies: filing.metadata?.discrepancies || [],
            createdAt: filing.createdAt,
            updatedAt: filing.updatedAt,
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filing issues via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get filing statistics
   * GET /api/admin/filings/stats
   */
  async getFilingStats(req, res, next) {
    try {
      const stats = await this.getFilingStats();

      res.status(200).json({
        success: true,
        message: 'Filing statistics retrieved successfully',
        data: {
          stats,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filing stats via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get filing analytics
   * GET /api/admin/filings/analytics
   */
  async getFilingAnalytics(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;

      const whereClause = {};
      if (dateFrom) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.gte]: new Date(dateFrom),
        };
      }
      if (dateTo) {
        whereClause.createdAt = {
          ...whereClause.createdAt,
          [Op.lte]: new Date(dateTo),
        };
      }

      // Get filing trends
      const filings = await ITRFiling.findAll({
        where: whereClause,
        attributes: [
          'id',
          'itrType',
          'status',
          'assessmentYear',
          'createdAt',
          'submittedAt',
          'acknowledgedAt',
        ],
        order: [['createdAt', 'ASC']],
      });

      // Calculate analytics
      const analytics = {
        totalFilings: filings.length,
        byType: {},
        byStatus: {},
        byRegime: {},
        completionRate: 0,
        averageCompletionTime: 0,
        peakHours: {},
        incomeDistribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
      };

      filings.forEach(filing => {
        // By type
        analytics.byType[filing.itrType] = (analytics.byType[filing.itrType] || 0) + 1;
        // By status
        analytics.byStatus[filing.status] = (analytics.byStatus[filing.status] || 0) + 1;
      });

      // Calculate completion rate
      const completed = filings.filter(f => ['acknowledged', 'processed'].includes(f.status)).length;
      analytics.completionRate = filings.length > 0 ? (completed / filings.length) * 100 : 0;

      enterpriseLogger.info('Filing analytics retrieved via admin API', {
        adminId: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Filing analytics retrieved successfully',
        data: {
          analytics,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get filing analytics via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Export filings
   * GET /api/admin/filings/export
   */
  async exportFilings(req, res, next) {
    try {
      const { format = 'csv' } = req.query;
      const adminId = req.user.id;

      // Get all filings (or apply filters from query)
      const whereClause = {};
      if (req.query.status) {
        whereClause.status = req.query.status;
      }
      if (req.query.itrType) {
        whereClause.itrType = req.query.itrType;
      }

      const filings = await ITRFiling.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['fullName', 'email', 'panNumber'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'export',
        'filings',
        null,
        {
          format,
          count: filings.length,
        },
        req.ip,
      );

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'ID,User Name,User Email,User PAN,ITR Type,Assessment Year,Status,Ack Number,Created At,Submitted At\n';
        const csvRows = filings.map(filing => {
          return [
            filing.id,
            filing.user?.fullName || '',
            filing.user?.email || '',
            filing.user?.panNumber || '',
            filing.itrType || '',
            filing.assessmentYear || '',
            filing.status || '',
            filing.ackNumber || '',
            filing.createdAt ? filing.createdAt.toISOString() : '',
            filing.submittedAt ? filing.submittedAt.toISOString() : '',
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        }).join('\n');

        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=filings_export_${Date.now()}.csv`);
        res.status(200).send(csv);
      } else {
        // Return JSON
        res.status(200).json({
          success: true,
          message: 'Filings exported successfully',
          data: {
            filings: filings.map(filing => ({
              id: filing.id,
              userId: filing.userId,
              userName: filing.user?.fullName,
              userEmail: filing.user?.email,
              userPAN: filing.user?.panNumber,
              itrType: filing.itrType,
              assessmentYear: filing.assessmentYear,
              status: filing.status,
              ackNumber: filing.ackNumber,
              createdAt: filing.createdAt,
              submittedAt: filing.submittedAt,
            })),
            count: filings.length,
          },
        });
      }

      enterpriseLogger.info('Filings exported via admin API', {
        adminId,
        format,
        count: filings.length,
      });

    } catch (error) {
      enterpriseLogger.error('Failed to export filings via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Override validation
   * POST /api/admin/filings/:id/override-validation
   */
  async overrideValidation(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      filing.metadata = {
        ...filing.metadata,
        validationOverridden: true,
        validationOverrideHistory: [
          ...(filing.metadata?.validationOverrideHistory || []),
          {
            overriddenBy: adminId,
            overriddenAt: new Date().toISOString(),
            reason: reason || 'Validation overridden by admin',
          },
        ],
      };
      await filing.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'filing_validation_override',
        id,
        {
          filingId: id,
          userId: filing.userId,
          reason: reason || 'Validation overridden by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Filing validation overridden via admin API', {
        adminId,
        filingId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Validation overridden successfully',
        data: {
          filingId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to override validation via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Flag for review
   * POST /api/admin/filings/:id/flag-review
   */
  async flagForReview(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      filing.metadata = {
        ...filing.metadata,
        flaggedForReview: true,
        flagHistory: [
          ...(filing.metadata?.flagHistory || []),
          {
            flaggedBy: adminId,
            flaggedAt: new Date().toISOString(),
            reason: reason || 'Flagged for review by admin',
          },
        ],
      };
      await filing.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'filing_flag',
        id,
        {
          filingId: id,
          userId: filing.userId,
          reason: reason || 'Filing flagged for review by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Filing flagged for review via admin API', {
        adminId,
        filingId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Filing flagged for review successfully',
        data: {
          filingId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to flag filing for review via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Add admin notes
   * POST /api/admin/filings/:id/add-notes
   */
  async addAdminNotes(req, res, next) {
    try {
      const { id } = req.params;
      const { notes, reason } = req.body;
      const adminId = req.user.id;

      if (!notes) {
        throw new AppError('Notes are required', 400);
      }

      const filing = await ITRFiling.findByPk(id);
      if (!filing) {
        throw new AppError('Filing not found', 404);
      }

      filing.metadata = {
        ...filing.metadata,
        adminNotes: [
          ...(filing.metadata?.adminNotes || []),
          {
            addedBy: adminId,
            addedAt: new Date().toISOString(),
            notes,
            reason: reason || 'Admin notes added',
          },
        ],
      };
      await filing.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'filing_notes',
        id,
        {
          filingId: id,
          userId: filing.userId,
          notes,
        },
        req.ip,
      );

      enterpriseLogger.info('Admin notes added to filing via admin API', {
        adminId,
        filingId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Admin notes added successfully',
        data: {
          filingId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to add admin notes via admin API', {
        error: error.message,
        adminId: req.user?.id,
        filingId: req.params.id,
      });
      next(error);
    }
  }

  // =====================================================
  // DOCUMENT MANAGEMENT METHODS
  // =====================================================

  /**
   * Get all documents with pagination and filters
   * GET /api/admin/documents
   */
  async getDocuments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        type,
        status,
        assessmentYear,
        extractionStatus,
        userId,
        filingId,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Apply filters
      if (type) {
        whereClause.category = type;
      }
      if (status) {
        whereClause.verificationStatus = status;
      }
      if (userId) {
        whereClause.userId = userId;
      }
      if (filingId) {
        whereClause.filingId = filingId;
      }
      whereClause.isDeleted = false;

      // Search by user, document category, or file name
      if (search) {
        const { User } = require('../models');
        const users = await User.findAll({
          where: {
            [Op.or]: [
              { fullName: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } },
            ],
          },
          attributes: ['id'],
        });
        const userIds = users.map(u => u.id);

        whereClause[Op.or] = [
          { filename: { [Op.iLike]: `%${search}%` } },
          { originalFilename: { [Op.iLike]: `%${search}%` } },
          { category: { [Op.iLike]: `%${search}%` } },
          ...(userIds.length > 0 ? [{ userId: { [Op.in]: userIds } }] : []),
        ];
      }

      const { count, rows: documents } = await Document.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Get user info for documents
      const userIds = [...new Set(documents.map(doc => doc.userId).filter(Boolean))];
      const users = userIds.length > 0 ? await User.findAll({
        where: { id: { [Op.in]: userIds } },
        attributes: ['id', 'fullName', 'email'],
      }) : [];
      const userMap = new Map(users.map(u => [u.id, u]));

      const documentList = documents.map(doc => {
        const user = userMap.get(doc.userId);
        return {
          id: doc.id,
          userId: doc.userId,
          userName: user?.fullName,
          userEmail: user?.email,
          filingId: doc.filingId,
          type: doc.category,
          fileName: doc.filename,
          originalFileName: doc.originalFilename,
          fileSize: doc.sizeBytes,
          fileSizeFormatted: doc.getFileSize ? doc.getFileSize() : `${(doc.sizeBytes / 1024).toFixed(2)} KB`,
          verificationStatus: doc.verificationStatus,
          extractedMetadata: doc.extractedMetadata,
          ocrResult: doc.ocrResult,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      });

      enterpriseLogger.info('Documents retrieved via admin API', {
        adminId: req.user.id,
        count: documentList.length,
        totalCount: count,
      });

      res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: {
          documents: documentList,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNext: page * limit < count,
            hasPrev: page > 1,
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get documents via admin API', {
        error: error.message,
        adminId: req.user?.id,
        query: req.query,
      });
      next(error);
    }
  }

  /**
   * Get document detail
   * GET /api/admin/documents/:id
   */
  async getDocumentDetails(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const document = await Document.findByPk(id);

      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Get user info
      const user = document.userId ? await User.findByPk(document.userId, {
        attributes: ['id', 'fullName', 'email'],
      }) : null;

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'document',
        id,
        {
          documentId: id,
          userId: document.userId,
        },
        req.ip,
      );

      enterpriseLogger.info('Document details retrieved via admin API', {
        adminId,
        documentId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Document details retrieved successfully',
        data: {
          document: {
            id: document.id,
            userId: document.userId,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
            } : null,
            filingId: document.filingId,
            type: document.category,
            fileName: document.filename,
            originalFileName: document.originalFilename,
            fileSize: document.sizeBytes,
            fileSizeFormatted: document.getFileSize ? document.getFileSize() : `${(document.sizeBytes / 1024).toFixed(2)} KB`,
            s3Key: document.s3Key,
            localPath: document.localPath,
            mimeType: document.mimeType,
            verificationStatus: document.verificationStatus,
            extractedMetadata: document.extractedMetadata,
            ocrResult: document.ocrResult,
            virusScanResult: document.virusScanResult,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get document details via admin API', {
        error: error.message,
        adminId: req.user?.id,
        documentId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Delete document
   * DELETE /api/admin/documents/:id
   */
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const document = await Document.findByPk(id);
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Soft delete
      document.isDeleted = true;
      await document.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'delete',
        'document',
        id,
        {
          documentId: id,
          userId: document.userId,
          reason: reason || 'Document deleted by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Document deleted via admin API', {
        adminId,
        documentId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        data: {
          documentId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to delete document via admin API', {
        error: error.message,
        adminId: req.user?.id,
        documentId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Reprocess document
   * POST /api/admin/documents/:id/reprocess
   */
  async reprocessDocument(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const document = await Document.findByPk(id);
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Reset verification status for reprocessing
      document.verificationStatus = 'PENDING';
      document.extractedMetadata = {
        ...document.extractedMetadata,
        reprocessHistory: [
          ...(document.extractedMetadata?.reprocessHistory || []),
          {
            reprocessedBy: adminId,
            reprocessedAt: new Date().toISOString(),
            reason: reason || 'Reprocessed by admin',
          },
        ],
      };
      await document.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'document_reprocess',
        id,
        {
          documentId: id,
          userId: document.userId,
          reason: reason || 'Document reprocessed by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Document reprocessed via admin API', {
        adminId,
        documentId: id,
        reason,
      });

      res.status(200).json({
        success: true,
        message: 'Document queued for reprocessing',
        data: {
          documentId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to reprocess document via admin API', {
        error: error.message,
        adminId: req.user?.id,
        documentId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get extracted data
   * GET /api/admin/documents/:id/extracted-data
   */
  async getExtractedData(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const document = await Document.findByPk(id);
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      // Log admin access
      await auditService.logDataAccess(
        adminId,
        'read',
        'document_extracted_data',
        id,
        {
          documentId: id,
        },
        req.ip,
      );

      res.status(200).json({
        success: true,
        message: 'Extracted data retrieved successfully',
        data: {
          documentId: id,
          extractedMetadata: document.extractedMetadata,
          ocrResult: document.ocrResult,
          verificationStatus: document.verificationStatus,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get extracted data via admin API', {
        error: error.message,
        adminId: req.user?.id,
        documentId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Update extracted data
   * PUT /api/admin/documents/:id/extracted-data
   */
  async updateExtractedData(req, res, next) {
    try {
      const { id } = req.params;
      const { extractedMetadata, ocrResult, reason } = req.body;
      const adminId = req.user.id;

      if (!extractedMetadata && !ocrResult) {
        throw new AppError('Extracted metadata or OCR result is required', 400);
      }

      const document = await Document.findByPk(id);
      if (!document) {
        throw new AppError('Document not found', 404);
      }

      const oldMetadata = document.extractedMetadata;
      const oldOcrResult = document.ocrResult;

      if (extractedMetadata) {
        document.extractedMetadata = {
          ...document.extractedMetadata,
          ...extractedMetadata,
          manualEdits: [
            ...(document.extractedMetadata?.manualEdits || []),
            {
              editedBy: adminId,
              editedAt: new Date().toISOString(),
              reason: reason || 'Extracted metadata edited by admin',
              oldData: oldMetadata,
              newData: extractedMetadata,
            },
          ],
        };
      }

      if (ocrResult) {
        document.ocrResult = {
          ...document.ocrResult,
          ...ocrResult,
          manualEdits: [
            ...(document.ocrResult?.manualEdits || []),
            {
              editedBy: adminId,
              editedAt: new Date().toISOString(),
              reason: reason || 'OCR result edited by admin',
              oldData: oldOcrResult,
              newData: ocrResult,
            },
          ],
        };
      }

      await document.save();

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'document_extracted_data',
        id,
        {
          documentId: id,
          userId: document.userId,
          reason: reason || 'Extracted data updated by admin',
        },
        req.ip,
      );

      enterpriseLogger.info('Extracted data updated via admin API', {
        adminId,
        documentId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Extracted data updated successfully',
        data: {
          documentId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to update extracted data via admin API', {
        error: error.message,
        adminId: req.user?.id,
        documentId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get document templates
   * GET /api/admin/documents/templates
   */
  async getDocumentTemplates(req, res, next) {
    try {
      // This would typically query a document_templates table
      // For now, return mock data
      const templates = [
        {
          id: '1',
          type: 'Form16',
          name: 'Standard Form 16',
          description: 'Standard Form 16 template',
          fields: ['employerName', 'pan', 'grossSalary', 'tds'],
          createdAt: new Date().toISOString(),
        },
      ];

      res.status(200).json({
        success: true,
        message: 'Document templates retrieved successfully',
        data: {
          templates,
          count: templates.length,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get document templates via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Create document template
   * POST /api/admin/documents/templates
   */
  async createDocumentTemplate(req, res, next) {
    try {
      const { type, name, description, fields, mapping } = req.body;
      const adminId = req.user.id;

      if (!type || !name || !fields) {
        throw new AppError('Type, name, and fields are required', 400);
      }

      // This would typically create a record in document_templates table
      // For now, return success

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'create',
        'document_template',
        null,
        {
          type,
          name,
        },
        req.ip,
      );

      enterpriseLogger.info('Document template created via admin API', {
        adminId,
        type,
        name,
      });

      res.status(201).json({
        success: true,
        message: 'Document template created successfully',
        data: {
          template: {
            id: 'new-template-id',
            type,
            name,
            description,
            fields,
            mapping,
          },
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to create document template via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update document template
   * PUT /api/admin/documents/templates/:id
   */
  async updateDocumentTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, fields, mapping } = req.body;
      const adminId = req.user.id;

      // This would typically update a record in document_templates table
      // For now, return success

      // Log audit event
      await auditService.logDataAccess(
        adminId,
        'update',
        'document_template',
        id,
        {
          templateId: id,
        },
        req.ip,
      );

      enterpriseLogger.info('Document template updated via admin API', {
        adminId,
        templateId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Document template updated successfully',
        data: {
          templateId: id,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to update document template via admin API', {
        error: error.message,
        adminId: req.user?.id,
        templateId: req.params.id,
      });
      next(error);
    }
  }

  /**
   * Get storage usage stats
   * GET /api/admin/documents/storage
   */
  async getStorageStats(req, res, next) {
    try {
      const stats = await Document.findAll({
        where: { isDeleted: false },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalDocuments'],
          [sequelize.fn('SUM', sequelize.col('size_bytes')), 'totalStorage'],
          [sequelize.fn('AVG', sequelize.col('size_bytes')), 'averageSize'],
        ],
        raw: true,
      });

      const storageStats = {
        totalDocuments: parseInt(stats[0]?.totalDocuments) || 0,
        totalStorage: parseInt(stats[0]?.totalStorage) || 0,
        averageSize: parseInt(stats[0]?.averageSize) || 0,
        totalStorageMB: Math.round((parseInt(stats[0]?.totalStorage) || 0) / (1024 * 1024) * 100) / 100,
      };

      res.status(200).json({
        success: true,
        message: 'Storage statistics retrieved successfully',
        data: {
          storage: storageStats,
        },
      });

    } catch (error) {
      enterpriseLogger.error('Failed to get storage stats via admin API', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }
}

module.exports = new AdminController();
