// =====================================================
// CONSENT SERVICE
// Manages consent capture, validation, and history
// =====================================================

const Consent = require('../../models/Consent');
const { v4: uuidv4 } = require('uuid');
const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

class ConsentService {
  /**
   * Capture consent
   * @param {object} consentData - Consent data
   * @param {string} userId - User ID giving consent
   * @returns {Promise<object>} Created consent record
   */
  async captureConsent(consentData, userId) {
    try {
      const {
        returnVersionId,
        scope,
        level = 'global',
        fieldPath = null,
        expiresAt = null,
        metadata = {},
      } = consentData;

      if (!scope) {
        throw new AppError('Consent scope is required', 400);
      }

      // Check if consent already exists for this scope/level
      const existingConsent = await Consent.findOne({
        where: {
          returnVersionId,
          scope,
          level,
          fieldPath: fieldPath || null,
          status: 'given',
        },
        order: [['version', 'DESC']],
      });

      let consentId;
      let version = 1;

      if (existingConsent) {
        // Revoke previous version
        await existingConsent.update({
          status: 'revoked',
          revokedAt: new Date(),
          revokedBy: userId,
        });

        consentId = existingConsent.consentId;
        version = existingConsent.version + 1;
      } else {
        // Create new consent ID
        consentId = uuidv4();
      }

      // Create new consent version
      const consent = await Consent.create({
        consentId,
        returnVersionId,
        scope,
        level,
        fieldPath,
        version,
        givenBy: userId,
        timestamp: new Date(),
        status: 'given',
        expiresAt,
        metadata: {
          ...metadata,
          ipAddress: metadata.ipAddress || null,
          userAgent: metadata.userAgent || null,
          consentText: metadata.consentText || this.getDefaultConsentText(scope),
        },
        previousVersionId: existingConsent?.id || null,
      });

      enterpriseLogger.info('Consent captured', {
        consentId: consent.id,
        scope,
        level,
        returnVersionId,
        userId,
      });

      return consent;
    } catch (error) {
      if (error instanceof AppError) throw error;
      enterpriseLogger.error('Failed to capture consent', {
        error: error.message,
        userId,
        stack: error.stack,
      });
      throw new AppError(`Failed to capture consent: ${error.message}`, 500);
    }
  }

  /**
   * Revoke consent
   * @param {string} consentId - Consent ID (UUID)
   * @param {string} userId - User ID revoking consent
   * @returns {Promise<object>} Updated consent record
   */
  async revokeConsent(consentId, userId) {
    try {
      const consent = await Consent.findByPk(consentId);
      if (!consent) {
        throw new AppError('Consent not found', 404);
      }

      if (consent.status !== 'given') {
        throw new AppError('Consent is not active', 400);
      }

      // Create new version with revoked status
      const revokedConsent = await Consent.create({
        consentId: consent.consentId,
        returnVersionId: consent.returnVersionId,
        scope: consent.scope,
        level: consent.level,
        fieldPath: consent.fieldPath,
        version: consent.version + 1,
        givenBy: consent.givenBy,
        timestamp: consent.timestamp,
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: userId,
        expiresAt: consent.expiresAt,
        metadata: consent.metadata,
        previousVersionId: consent.id,
      });

      // Update original consent
      await consent.update({
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: userId,
      });

      enterpriseLogger.info('Consent revoked', {
        consentId: consent.id,
        revokedConsentId: revokedConsent.id,
        userId,
      });

      return revokedConsent;
    } catch (error) {
      if (error instanceof AppError) throw error;
      enterpriseLogger.error('Failed to revoke consent', {
        consentId,
        userId,
        error: error.message,
      });
      throw new AppError(`Failed to revoke consent: ${error.message}`, 500);
    }
  }

  /**
   * Validate consent
   * @param {string} returnVersionId - Return version ID
   * @param {string} scope - Consent scope
   * @param {string} level - Consent level
   * @param {string} fieldPath - Field path (if per-field)
   * @returns {Promise<boolean>} True if valid consent exists
   */
  async validateConsent(returnVersionId, scope, level = 'global', fieldPath = null) {
    try {
      const consent = await Consent.findOne({
        where: {
          returnVersionId,
          scope,
          level,
          fieldPath: fieldPath || null,
          status: 'given',
        },
        order: [['version', 'DESC']],
      });

      if (!consent) {
        return false;
      }

      // Check if expired
      if (consent.expiresAt && new Date() > consent.expiresAt) {
        await consent.update({ status: 'expired' });
        return false;
      }

      return true;
    } catch (error) {
      enterpriseLogger.error('Failed to validate consent', {
        returnVersionId,
        scope,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get consent history
   * @param {string} consentId - Consent ID (UUID)
   * @returns {Promise<array>} Array of consent versions
   */
  async getConsentHistory(consentId) {
    try {
      const consents = await Consent.findAll({
        where: { consentId },
        order: [['version', 'ASC']],
        include: [
          {
            model: require('../../models/User'),
            as: 'giver',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      return consents;
    } catch (error) {
      enterpriseLogger.error('Failed to get consent history', {
        consentId,
        error: error.message,
      });
      throw new AppError(`Failed to get consent history: ${error.message}`, 500);
    }
  }

  /**
   * Get all consents for a return version
   * @param {string} returnVersionId - Return version ID
   * @returns {Promise<array>} Array of active consents
   */
  async getVersionConsents(returnVersionId) {
    try {
      const consents = await Consent.findAll({
        where: {
          returnVersionId,
          status: 'given',
        },
        order: [['scope', 'ASC'], ['level', 'ASC']],
      });

      // Filter out expired consents
      const validConsents = consents.filter(consent => {
        if (consent.expiresAt && new Date() > consent.expiresAt) {
          return false;
        }
        return true;
      });

      return validConsents;
    } catch (error) {
      enterpriseLogger.error('Failed to get version consents', {
        returnVersionId,
        error: error.message,
      });
      throw new AppError(`Failed to get consents: ${error.message}`, 500);
    }
  }

  /**
   * Get default consent text for a scope
   */
  getDefaultConsentText(scope) {
    const texts = {
      filing: 'I consent to file my Income Tax Return using the provided information.',
      data_sharing: 'I consent to share my data with authorized tax authorities and service providers.',
      e_sign: 'I consent to electronically sign my Income Tax Return.',
      document_access: 'I consent to access and process my uploaded documents for tax filing purposes.',
      auto_fill: 'I consent to automatically fill my return using data from AIS, Form26AS, and other authorized sources.',
      ai_recommendations: 'I consent to receive AI-powered tax optimization recommendations.',
    };

    return texts[scope] || 'I consent to the requested action.';
  }
}

module.exports = ConsentService;

