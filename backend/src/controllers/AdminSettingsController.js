// =====================================================
// ADMIN SETTINGS CONTROLLER
// Handles system configuration and settings management
// =====================================================

const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { QueryTypes } = require('sequelize');

class AdminSettingsController {
  /**
   * Get general settings
   * GET /api/admin/settings/general
   */
  async getGeneralSettings(req, res, next) {
    try {
      const settings = await this.getSettingsByCategory('general');
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to get general settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update general settings
   * PUT /api/admin/settings/general
   */
  async updateGeneralSettings(req, res, next) {
    try {
      const adminId = req.user.id;
      const settings = req.body;

      await this.updateSettings('general', settings, adminId);

      res.status(200).json({
        success: true,
        message: 'General settings updated successfully',
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to update general settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get tax configuration
   * GET /api/admin/settings/tax
   */
  async getTaxSettings(req, res, next) {
    try {
      const settings = await this.getSettingsByCategory('tax');
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to get tax settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update tax configuration
   * PUT /api/admin/settings/tax
   */
  async updateTaxSettings(req, res, next) {
    try {
      const adminId = req.user.id;
      const settings = req.body;

      await this.updateSettings('tax', settings, adminId);

      res.status(200).json({
        success: true,
        message: 'Tax settings updated successfully',
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to update tax settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get security settings
   * GET /api/admin/settings/security
   */
  async getSecuritySettings(req, res, next) {
    try {
      const settings = await this.getSettingsByCategory('security');
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to get security settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update security settings
   * PUT /api/admin/settings/security
   */
  async updateSecuritySettings(req, res, next) {
    try {
      const adminId = req.user.id;
      const settings = req.body;

      await this.updateSettings('security', settings, adminId);

      res.status(200).json({
        success: true,
        message: 'Security settings updated successfully',
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to update security settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get integration settings
   * GET /api/admin/settings/integrations
   */
  async getIntegrationSettings(req, res, next) {
    try {
      const settings = await this.getSettingsByCategory('integrations');
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to get integration settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update integration settings
   * PUT /api/admin/settings/integrations
   */
  async updateIntegrationSettings(req, res, next) {
    try {
      const adminId = req.user.id;
      const settings = req.body;

      await this.updateSettings('integrations', settings, adminId);

      res.status(200).json({
        success: true,
        message: 'Integration settings updated successfully',
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to update integration settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Get notification settings
   * GET /api/admin/settings/notifications
   */
  async getNotificationSettings(req, res, next) {
    try {
      const settings = await this.getSettingsByCategory('notifications');
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to get notification settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Update notification settings
   * PUT /api/admin/settings/notifications
   */
  async updateNotificationSettings(req, res, next) {
    try {
      const adminId = req.user.id;
      const settings = req.body;

      await this.updateSettings('notifications', settings, adminId);

      res.status(200).json({
        success: true,
        message: 'Notification settings updated successfully',
        data: settings,
      });
    } catch (error) {
      enterpriseLogger.error('Failed to update notification settings', {
        error: error.message,
        adminId: req.user?.id,
      });
      next(error);
    }
  }

  /**
   * Helper: Get settings by category
   */
  async getSettingsByCategory(category) {
    const [results] = await sequelize.query(`
      SELECT key, value, updated_by, updated_at
      FROM system_settings
      WHERE category = :category
    `, {
      replacements: { category },
      type: QueryTypes.SELECT,
    });

    const settings = {};
    results.forEach(row => {
      settings[row.key] = row.value;
    });

    return settings;
  }

  /**
   * Helper: Update settings for a category
   */
  async updateSettings(category, settings, adminId) {
    const transaction = await sequelize.transaction();

    try {
      for (const [key, value] of Object.entries(settings)) {
        await sequelize.query(`
          INSERT INTO system_settings (key, value, category, updated_by, updated_at)
          VALUES (:key, :value::jsonb, :category, :adminId, NOW())
          ON CONFLICT (key) 
          DO UPDATE SET 
            value = :value::jsonb,
            updated_by = :adminId,
            updated_at = NOW()
        `, {
          replacements: {
            key,
            value: JSON.stringify(value),
            category,
            adminId,
          },
          type: QueryTypes.INSERT,
          transaction,
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new AdminSettingsController();

