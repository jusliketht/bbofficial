// =====================================================
// ITR CONTROLLER - CANONICAL FILING SYSTEM
// Handles create/validate/submit for all ITR types
// =====================================================

const { sequelize } = require('../config/database');
const { query: dbQuery } = require('../utils/dbQuery');
const enterpriseLogger = require('../utils/logger');
const validationEngine = require('../services/core/ValidationEngine');
const taxComputationEngine = require('../services/core/TaxComputationEngine');
const serviceTicketService = require('../services/business/ServiceTicketService');
const sseNotificationService = require('../services/utils/NotificationService');
const taxAuditChecker = require('../services/business/TaxAuditChecker');
const eVerificationService = require('../services/business/EVerificationService');
const refundTrackingService = require('../services/business/RefundTrackingService');
const dataMatchingService = require('../services/business/DataMatchingService');
const DiscrepancyResolution = require('../models/DiscrepancyResolution');

class ITRController {
  constructor() {
    this.validationEngine = validationEngine;
    this.taxComputationEngine = taxComputationEngine;
  }

  // =====================================================
  // CREATE DRAFT
  // =====================================================

  async createDraft(req, res) {
    try {
      const userId = req.user.userId;
      const { itrType, formData } = req.body;

      // Validate ITR type
      const validTypes = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'];
      if (!validTypes.includes(itrType)) {
        return res.status(400).json({
          error: 'Invalid ITR type. Must be ITR-1, ITR-2, ITR-3, or ITR-4',
        });
      }

      // Validate form data
      const validation = this.validationEngine.validate(itrType.replace('-', '').toLowerCase(), formData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      // Create filing first
      const createFilingQuery = `
        INSERT INTO itr_filings (user_id, itr_type, assessment_year, status, created_at)
        VALUES ($1, $2, $3, 'draft', NOW())
        RETURNING id
      `;

      const filing = await dbQuery(createFilingQuery, [
        userId,
        itrType,
        '2024-25', // Default assessment year
      ]);

      // Create draft
      const createDraftQuery = `
        INSERT INTO itr_drafts (filing_id, step, data, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, step, created_at
      `;

      const draft = await dbQuery(createDraftQuery, [
        filing.rows[0].id,
        'personal_info', // Default step
        JSON.stringify(formData),
      ]);

      enterpriseLogger.info('ITR draft created', {
        userId,
        itrType,
        draftId: draft.rows[0].id,
        filingId: filing.rows[0].id,
      });

      // Auto-create service ticket for filing support
      try {
        const filingData = {
          id: filing.rows[0].id,
          userId,
          itrType,
          memberId: null, // Will be set if filing for family member
        };

        await serviceTicketService.autoCreateFilingTicket(filingData);

        enterpriseLogger.info('Auto-generated service ticket created for filing', {
          filingId: filing.rows[0].id,
          userId,
          itrType,
        });
      } catch (ticketError) {
        // Don't fail the draft creation if ticket creation fails
        enterpriseLogger.error('Failed to auto-create service ticket', {
          error: ticketError.message,
          filingId: filing.rows[0].id,
          userId,
        });
      }

      res.status(201).json({
        message: 'Draft created successfully',
        draft: {
          id: draft.rows[0].id,
          filingId: filing.rows[0].id,
          step: draft.rows[0].step,
          itrType: itrType,
          status: 'draft',
          createdAt: draft.rows[0].created_at,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Draft creation failed', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // UPDATE DRAFT
  // =====================================================

  async updateDraft(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { formData } = req.body;

      // Get draft to determine ITR type (join with itr_filings to get user_id)
      const getDraftQuery = `
        SELECT d.id, f.itr_type
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;
      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({ error: 'Draft not found' });
      }

      const itrType = draft.rows[0].itr_type;

      // Validate form data
      const validation = this.validationEngine.validate(itrType.replace('-', '').toLowerCase(), formData);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      // Update draft (join with itr_filings to verify user_id)
      const updateDraftQuery = `
        UPDATE itr_drafts d
        SET data = $1, updated_at = NOW()
        FROM itr_filings f
        WHERE d.filing_id = f.id 
          AND d.id = $2 
          AND f.user_id = $3
        RETURNING d.id, f.itr_type, d.updated_at
      `;

      const result = await dbQuery(updateDraftQuery, [
        JSON.stringify(formData),
        draftId,
        userId,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found or not editable',
        });
      }

      enterpriseLogger.info('ITR draft updated', {
        userId,
        draftId,
        itrType: result.rows[0].itr_type,
      });

      res.json({
        success: true,
        message: 'Draft updated successfully',
        draft: {
          id: result.rows[0].id,
          itrType: result.rows[0].itr_type,
          updatedAt: result.rows[0].updated_at,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Draft update failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // VALIDATE DRAFT
  // =====================================================

  async validateDraft(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;

      // Get draft
      const getDraftQuery = `
        SELECT id, itr_type, form_data, status
        FROM itr_drafts 
        WHERE id = $1 AND user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].form_data);
      const itrType = draft.rows[0].itr_type;
      const normalizedItrType = itrType.replace('-', '').toLowerCase();

      // Validate form data
      const validation = this.validationEngine.validateAll(formData, normalizedItrType);

      // Additional ITR-specific validation
      const itrSpecificValidation = this.validationEngine.validateITRSpecific(itrType, formData);

      const allValid = validation.isValid && itrSpecificValidation.isValid;
      const allErrors = [...validation.errors, ...itrSpecificValidation.errors];
      const allWarnings = [...validation.warnings, ...itrSpecificValidation.warnings];

      enterpriseLogger.info('Draft validation completed', {
        userId,
        draftId,
        itrType,
        isValid: allValid,
        errorCount: allErrors.length,
        warningCount: allWarnings.length,
      });

      res.json({
        isValid: allValid,
        errors: allErrors,
        warnings: allWarnings,
        details: {
          general: validation,
          itrSpecific: itrSpecificValidation,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Draft validation failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // COMPUTE TAX
  // =====================================================

  async computeTax(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;

      // Get draft
      const getDraftQuery = `
        SELECT id, itr_type, form_data, status
        FROM itr_drafts 
        WHERE id = $1 AND user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].form_data);
      const itrType = draft.rows[0].itr_type;

      // Compute tax
      // Prepare filing data with itrType
      const filingData = { ...formData, itrType };
      const taxComputation = await this.taxComputationEngine.computeTax(filingData, formData.assessmentYear || '2024-25');

      enterpriseLogger.info('Tax computation completed', {
        userId,
        draftId,
        itrType,
        totalTax: taxComputation.totalTax,
        refund: taxComputation.refund,
      });

      res.json({
        message: 'Tax computation completed',
        computation: taxComputation,
      });
    } catch (error) {
      enterpriseLogger.error('Tax computation failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // SUBMIT ITR
  // =====================================================

  async submitITR(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;

      // Get draft (join with itr_filings to verify user_id)
      const getDraftQuery = `
        SELECT d.id, d.data, f.itr_type, f.status
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      if (draft.rows[0].status !== 'draft') {
        return res.status(400).json({
          error: 'Draft is not in draft status',
        });
      }

      const draftData = draft.rows[0].data;
      const formData = typeof draftData === 'string' ? JSON.parse(draftData) : draftData;
      const itrType = draft.rows[0].itr_type;

      // Final validation
      const normalizedItrType = itrType.replace('-', '').toLowerCase();
      const validation = this.validationEngine.validateAll(formData, normalizedItrType);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors,
        });
      }

      // ITR-specific validations
      const itrSpecificValidation = this.validationEngine.validateITRSpecific(itrType, formData);
      if (!itrSpecificValidation.isValid) {
        return res.status(400).json({
          error: 'ITR-specific validation failed',
          details: itrSpecificValidation.errors,
          warnings: itrSpecificValidation.warnings,
        });
      }

      // ITR-3 specific validations
      if (itrType === 'ITR-3' || itrType === 'ITR3') {
        // Check audit applicability
        const auditCheck = taxAuditChecker.checkAuditApplicability(formData);
        if (auditCheck.applicable) {
          // Validate audit report if applicable
          const auditValidation = taxAuditChecker.validateAuditReport(formData.auditInfo);
          if (!auditValidation.isValid) {
            return res.status(400).json({
              error: 'Audit information validation failed',
              details: auditValidation.errors,
              auditReasons: auditCheck.reasons,
            });
          }
        }

        // Validate balance sheet if maintained
        if (formData.balanceSheet?.hasBalanceSheet) {
          const assetsTotal = formData.balanceSheet.assets?.total || 0;
          const liabilitiesTotal = formData.balanceSheet.liabilities?.total || 0;
          if (Math.abs(assetsTotal - liabilitiesTotal) > 0.01) {
            return res.status(400).json({
              error: 'Balance sheet is not balanced',
              details: {
                assetsTotal,
                liabilitiesTotal,
                difference: Math.abs(assetsTotal - liabilitiesTotal),
              },
            });
          }
        }
      }

      // ITR-4 specific validations (presumptive taxation)
      if (itrType === 'ITR-4' || itrType === 'ITR4') {
        const businessIncome = formData.income?.businessIncome || formData.income?.presumptiveBusiness || 0;
        const professionalIncome = formData.income?.professionalIncome || formData.income?.presumptiveProfessional || 0;
        
        // Validate presumptive limits
        if (businessIncome > 2000000) {
          return res.status(400).json({
            error: 'ITR-4 business income cannot exceed ₹20 lakh. Please use ITR-3 for higher business income.',
          });
        }
        
        if (professionalIncome > 500000) {
          return res.status(400).json({
            error: 'ITR-4 professional income cannot exceed ₹5 lakh. Please use ITR-3 for higher professional income.',
          });
        }
      }

      // Compute final tax
      // Prepare filing data with itrType
      const filingData = { ...formData, itrType };
      const taxComputation = await this.taxComputationEngine.computeTax(filingData, formData.assessmentYear || '2024-25');

      // Create ITR filing record
      const createFilingQuery = `
        INSERT INTO itr_filings (user_id, itr_type, json_payload, status, submitted_at, assessment_year)
        VALUES ($1, $2, $3, 'submitted', NOW(), $4)
        RETURNING id, itr_type, status, submitted_at, assessment_year
      `;

      const assessmentYear = formData.assessmentYear || '2024-25';
      const filing = await dbQuery(createFilingQuery, [
        userId,
        itrType,
        JSON.stringify(formData),
        assessmentYear,
      ]);

      const filingId = filing.rows[0].id;

      // Update draft status
      const updateDraftQuery = `
        UPDATE itr_drafts 
        SET status = 'submitted', updated_at = NOW()
        WHERE id = $1
      `;

      await dbQuery(updateDraftQuery, [draftId]);

      // Create invoice draft if not exists
      let invoiceId = null;
      try {
        const checkInvoiceQuery = `
          SELECT id FROM invoices WHERE filing_id = $1
        `;
        const existingInvoice = await dbQuery(checkInvoiceQuery, [filingId]);

        if (existingInvoice.rows.length === 0) {
          // Generate invoice number
          const invoiceNumber = `INV-ITR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          const invoiceDate = new Date();
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

          // Calculate invoice amount (default pricing - can be customized)
          const baseAmount = 500; // Base ITR filing fee
          const itrTypeMultiplier = {
            'ITR-1': 1,
            'ITR-2': 1.5,
            'ITR-3': 2,
            'ITR-4': 1.5,
          };
          const invoiceAmount = baseAmount * (itrTypeMultiplier[itrType] || 1);

          const createInvoiceQuery = `
            INSERT INTO invoices (
              user_id, filing_id, invoice_number, invoice_date, due_date,
              status, payment_status, subtotal, total_amount, currency, description
            )
            VALUES ($1, $2, $3, $4, $5, 'draft', 'pending', $6, $6, 'INR', $7)
            RETURNING id, invoice_number
          `;

          const invoice = await dbQuery(createInvoiceQuery, [
            userId,
            filingId,
            invoiceNumber,
            invoiceDate.toISOString().split('T')[0],
            dueDate.toISOString().split('T')[0],
            invoiceAmount,
            `ITR Filing for ${itrType} - Assessment Year ${assessmentYear}`,
          ]);

          invoiceId = invoice.rows[0].id;

          enterpriseLogger.info('Invoice draft created for filing', {
            filingId,
            invoiceId: invoice.rows[0].id,
            invoiceNumber: invoice.rows[0].invoice_number,
            amount: invoiceAmount,
          });
        } else {
          invoiceId = existingInvoice.rows[0].id;
        }
      } catch (invoiceError) {
        // Don't fail filing submission if invoice creation fails
        enterpriseLogger.error('Failed to create invoice for filing', {
          error: invoiceError.message,
          filingId,
          userId,
        });
      }

      enterpriseLogger.info('ITR submitted successfully', {
        userId,
        draftId,
        filingId,
        itrType,
        invoiceId,
      });

      // Send SSE notification for filing submission
      sseNotificationService.sendFilingStatusUpdate(userId, {
        id: filingId,
        itrType: filing.rows[0].itr_type,
        oldStatus: 'draft',
        newStatus: 'submitted',
        submittedAt: filing.rows[0].submitted_at,
      });

      // Send submission confirmation email
      try {
        const EmailService = require('../services/integration/EmailService');
        
        // Get user email
        const getUserQuery = `SELECT email, full_name FROM users WHERE id = $1`;
        const userResult = await dbQuery(getUserQuery, [userId]);
        
        if (userResult.rows.length > 0 && userResult.rows[0].email) {
          const userEmail = userResult.rows[0].email;
          
          // Generate acknowledgment number (mock for now - would come from ERI in production)
          const acknowledgmentNumber = `ACK-${filingId}-${Date.now().toString().slice(-6)}`;
          
          // Update filing with acknowledgment number
          await dbQuery(
            `UPDATE itr_filings SET acknowledgment_number = $1 WHERE id = $2`,
            [acknowledgmentNumber, filingId]
          );
          
          // Generate download URL
          const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/filings/${filingId}/acknowledgment/pdf`;
          
          // Send email
          await EmailService.sendSubmissionConfirmationEmail(
            userEmail,
            filingId,
            acknowledgmentNumber,
            downloadUrl
          );
          
          enterpriseLogger.info('Submission confirmation email sent', {
            userId,
            filingId,
            email: userEmail,
          });
        }
      } catch (emailError) {
        // Don't fail submission if email fails
        enterpriseLogger.error('Failed to send submission confirmation email', {
          error: emailError.message,
          userId,
          filingId,
        });
      }

      res.status(201).json({
        message: 'ITR submitted successfully',
        filing: {
          id: filingId,
          itrType: filing.rows[0].itr_type,
          status: filing.rows[0].status,
          submittedAt: filing.rows[0].submitted_at,
          assessmentYear: filing.rows[0].assessment_year,
          invoiceId,
        },
        taxComputation,
      });
    } catch (error) {
      enterpriseLogger.error('ITR submission failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // E-VERIFICATION METHODS
  // =====================================================

  async sendAadhaarOTP(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { aadhaarNumber } = req.body;

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.sendAadhaarOTP(pan, aadhaarNumber);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Send Aadhaar OTP failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to send Aadhaar OTP',
      });
    }
  }

  async verifyAadhaarOTP(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { aadhaarNumber, otp } = req.body;

      if (!otp || otp.length !== 6) {
        return res.status(400).json({
          error: 'Invalid OTP format. OTP must be 6 digits',
        });
      }

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;
      const filingId = draft.rows[0].filing_id;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.verifyAadhaarOTP(pan, aadhaarNumber, otp);

      if (result.verified) {
        await eVerificationService.storeVerificationDetails(
          filingId,
          'AADHAAR_OTP',
          result
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Verify Aadhaar OTP failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Aadhaar OTP verification failed',
      });
    }
  }

  async verifyNetBanking(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { bankDetails, credentials } = req.body;

      if (!bankDetails || !credentials) {
        return res.status(400).json({
          error: 'Bank details and credentials are required',
        });
      }

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;
      const filingId = draft.rows[0].filing_id;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.verifyNetBanking(pan, bankDetails, credentials);

      if (result.verified) {
        await eVerificationService.storeVerificationDetails(
          filingId,
          'NETBANKING',
          result
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Net Banking verification failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Net Banking verification failed',
      });
    }
  }

  async verifyDSC(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { dscDetails } = req.body;

      if (!dscDetails) {
        return res.status(400).json({
          error: 'DSC details are required',
        });
      }

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;
      const filingId = draft.rows[0].filing_id;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.verifyDSC(pan, dscDetails);

      if (result.verified) {
        await eVerificationService.storeVerificationDetails(
          filingId,
          'DSC',
          result
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('DSC verification failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'DSC verification failed',
      });
    }
  }

  async verifyDemat(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { dematCredentials } = req.body;

      if (!dematCredentials || !dematCredentials.dpId || !dematCredentials.clientId) {
        return res.status(400).json({
          error: 'DP ID and Client ID are required',
        });
      }

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;
      const filingId = draft.rows[0].filing_id;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.verifyDemat(pan, dematCredentials);

      if (result.verified) {
        await eVerificationService.storeVerificationDetails(
          filingId,
          'DEMAT',
          result
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Demat verification failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Demat verification failed',
      });
    }
  }

  async sendBankEVC(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { bankDetails } = req.body;

      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc) {
        return res.status(400).json({
          error: 'Account number and IFSC code are required',
        });
      }

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.sendBankEVC(pan, bankDetails);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Send Bank EVC failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to send Bank EVC',
      });
    }
  }

  async verifyBankEVC(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;
      const { bankDetails, evc } = req.body;

      if (!evc || evc.length !== 6) {
        return res.status(400).json({
          error: 'Invalid EVC format. EVC must be 6 digits',
        });
      }

      if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifsc) {
        return res.status(400).json({
          error: 'Account number and IFSC code are required',
        });
      }

      // Get draft and filing info
      const getDraftQuery = `
        SELECT d.id, f.id as filing_id, f.json_payload
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE d.id = $1 AND f.user_id = $2
      `;

      const draft = await dbQuery(getDraftQuery, [draftId, userId]);

      if (draft.rows.length === 0) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      const formData = JSON.parse(draft.rows[0].json_payload || '{}');
      const pan = formData.personal_info?.pan || formData.personalInfo?.pan;
      const filingId = draft.rows[0].filing_id;

      if (!pan) {
        return res.status(400).json({
          error: 'PAN not found in filing data',
        });
      }

      const result = await eVerificationService.verifyBankEVC(pan, bankDetails, evc);

      if (result.verified) {
        await eVerificationService.storeVerificationDetails(
          filingId,
          'BANK_EVC',
          result
        );
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Bank EVC verification failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Bank EVC verification failed',
      });
    }
  }

  async getVerificationStatus(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const status = await eVerificationService.getVerificationStatus(filingId);

      res.json({
        success: true,
        verification: status,
      });
    } catch (error) {
      enterpriseLogger.error('Get verification status failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get verification status',
      });
    }
  }

  // =====================================================
  // GET USER DRAFTS
  // =====================================================

  async getUserDrafts(req, res) {
    try {
      const userId = req.user.userId;
      const { status } = req.query;

      let query = `
        SELECT d.id, d.step, d.is_completed, d.last_saved_at, d.created_at, d.updated_at,
               f.itr_type, f.status, f.assessment_year, f.id as filing_id
        FROM itr_drafts d
        JOIN itr_filings f ON d.filing_id = f.id
        WHERE f.user_id = $1
      `;
      const params = [userId];

      if (status) {
        query += ' AND f.status = $2';
        params.push(status);
      }

      query += ' ORDER BY d.created_at DESC';

      const drafts = await dbQuery(query, params);

      res.json({
        drafts: drafts.rows.map(draft => ({
          id: draft.id,
          itrType: draft.itr_type,
          status: draft.status,
          createdAt: draft.created_at,
          updatedAt: draft.updated_at,
        })),
      });
    } catch (error) {
      enterpriseLogger.error('Get drafts failed', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // GET USER FILINGS
  // =====================================================

  async getUserFilings(req, res) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role || 'END_USER';
      const { status } = req.query;

      // Get user details for role-based filtering
      const User = require('../models/User');
      const user = await User.findByPk(userId);

      let query = '';
      let params = [];

      // Role-based query construction
      if (userRole === 'END_USER') {
        // END_USER: Own filings + invoice status
        query = `
          SELECT 
            f.id, f.itr_type, f.status, f.submitted_at, f.assessment_year,
            f.created_at, f.updated_at, f.paused_at, f.resumed_at,
            i.id as invoice_id, i.invoice_number, i.status as invoice_status,
            i.payment_status, i.total_amount as invoice_amount, i.due_date
          FROM itr_filings f
          LEFT JOIN invoices i ON f.id = i.filing_id
          WHERE f.user_id = $1
        `;
        params = [userId];
      } else if (['CA', 'CA_FIRM_ADMIN', 'PREPARER', 'REVIEWER'].includes(userRole)) {
        // CA/CA_FIRM: Assigned client filings + review status + billing info
        query = `
          SELECT 
            f.id, f.itr_type, f.status, f.submitted_at, f.assessment_year,
            f.created_at, f.updated_at, f.paused_at, f.review_status,
            f.assigned_to, f.firm_id,
            u.id as client_id, u.full_name as client_name,
            u.pan_number as client_pan,
            assigned_user.full_name as assigned_to_name,
            i.id as invoice_id, i.invoice_number, i.status as invoice_status,
            i.payment_status, i.total_amount as invoice_amount
          FROM itr_filings f
          LEFT JOIN users u ON f.user_id = u.id
          LEFT JOIN users assigned_user ON f.assigned_to = assigned_user.id
          LEFT JOIN invoices i ON f.id = i.filing_id
          WHERE (f.firm_id = $1 OR f.assigned_to = $2)
        `;
        params = [user?.caFirmId || userId, userId];
      } else if (['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(userRole)) {
        // ADMIN: All filings + platform stats + revenue data
        query = `
          SELECT 
            f.id, f.itr_type, f.status, f.submitted_at, f.assessment_year,
            f.created_at,
            u.id as user_id, u.full_name as user_name, u.email as user_email,
            firm.id as firm_id, firm.name as firm_name,
            i.id as invoice_id, i.invoice_number, i.total_amount as invoice_amount,
            i.status as invoice_status
          FROM itr_filings f
          LEFT JOIN users u ON f.user_id = u.id
          LEFT JOIN ca_firms firm ON f.firm_id = firm.id
          LEFT JOIN invoices i ON f.id = i.filing_id
          WHERE 1=1
        `;
        params = [];
      } else {
        // Default: Own filings only
        query = `
          SELECT id, itr_type, status, submitted_at, assessment_year, created_at, updated_at
          FROM itr_filings 
          WHERE user_id = $1
        `;
        params = [userId];
      }

      if (status) {
        const paramIndex = params.length + 1;
        if (userRole === 'END_USER') {
          query += ` AND f.status = $${paramIndex}`;
        } else if (['CA', 'CA_FIRM_ADMIN', 'PREPARER', 'REVIEWER'].includes(userRole)) {
          query += ` AND f.status = $${paramIndex}`;
        } else if (['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(userRole)) {
          query += ` AND f.status = $${paramIndex}`;
        } else {
          query += ` AND status = $${paramIndex}`;
        }
        params.push(status);
      }

      // Use appropriate ORDER BY based on query structure
      if (query.includes('FROM itr_filings f') || query.includes('LEFT JOIN')) {
        query += ' ORDER BY f.created_at DESC';
      } else {
        query += ' ORDER BY created_at DESC';
      }

      const filings = await dbQuery(query, params);

      // Format response based on role
      const formattedFilings = filings.rows.map(filing => {
        const baseFiling = {
          id: filing.id,
          itrType: filing.itr_type,
          status: filing.status,
          submittedAt: filing.submitted_at,
          assessmentYear: filing.assessment_year,
          createdAt: filing.created_at,
          updatedAt: filing.updated_at,
        };

        if (userRole === 'END_USER') {
          return {
            ...baseFiling,
            pausedAt: filing.paused_at,
            resumedAt: filing.resumed_at,
            invoice: filing.invoice_id ? {
              id: filing.invoice_id,
              invoiceNumber: filing.invoice_number,
              status: filing.invoice_status,
              paymentStatus: filing.payment_status,
              amount: filing.invoice_amount,
              dueDate: filing.due_date,
            } : null,
          };
        } else if (['CA', 'CA_FIRM_ADMIN', 'PREPARER', 'REVIEWER'].includes(userRole)) {
          return {
            ...baseFiling,
            pausedAt: filing.paused_at,
            client: {
              id: filing.client_id,
              name: filing.client_name,
              pan: filing.client_pan,
            },
            assignedTo: filing.assigned_to ? {
              id: filing.assigned_to,
              name: filing.assigned_to_name,
            } : null,
            reviewStatus: filing.review_status,
            invoice: filing.invoice_id ? {
              id: filing.invoice_id,
              invoiceNumber: filing.invoice_number,
              status: filing.invoice_status,
              paymentStatus: filing.payment_status,
              amount: filing.invoice_amount,
            } : null,
          };
        } else if (['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(userRole)) {
          return {
            ...baseFiling,
            user: {
              id: filing.user_id,
              name: filing.user_name,
              email: filing.user_email,
            },
            firm: filing.firm_id ? {
              id: filing.firm_id,
              name: filing.firm_name,
            } : null,
            invoice: filing.invoice_id ? {
              id: filing.invoice_id,
              invoiceNumber: filing.invoice_number,
              amount: filing.invoice_amount,
              status: filing.invoice_status,
            } : null,
          };
        }

        return baseFiling;
      });

      res.json({
        filings: formattedFilings,
      });
    } catch (error) {
      enterpriseLogger.error('Get filings failed', {
        error: error.message,
        userId: req.user?.userId,
        stack: error.stack,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // PAUSE FILING
  // =====================================================

  async pauseFiling(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { reason } = req.body;

      // Get filing
      const getFilingQuery = `
        SELECT id, user_id, status, json_payload
        FROM itr_filings 
        WHERE id = $1 AND user_id = $2
      `;

      const filing = await dbQuery(getFilingQuery, [filingId, userId]);

      if (filing.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const filingData = filing.rows[0];

      // Check if filing can be paused
      if (!['draft'].includes(filingData.status)) {
        return res.status(400).json({
          error: `Filing cannot be paused. Current status: ${filingData.status}`,
        });
      }

      // Save draft before pausing (if jsonPayload exists)
      if (filingData.json_payload) {
        // Draft is already saved in jsonPayload
        enterpriseLogger.info('Draft data preserved before pause', {
          filingId,
          userId,
        });
      }

      // Update filing status to paused
      const pauseQuery = `
        UPDATE itr_filings 
        SET status = 'paused', paused_at = NOW(), pause_reason = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, status, paused_at, pause_reason
      `;

      const result = await dbQuery(pauseQuery, [reason || null, filingId]);

      enterpriseLogger.info('Filing paused', {
        filingId,
        userId,
        reason,
        pausedAt: result.rows[0].paused_at,
      });

      res.json({
        success: true,
        message: 'Filing paused successfully',
        filing: {
          id: result.rows[0].id,
          status: result.rows[0].status,
          pausedAt: result.rows[0].paused_at,
          pauseReason: result.rows[0].pause_reason,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Pause filing failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
        stack: error.stack,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // RESUME FILING
  // =====================================================

  async resumeFiling(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Get filing
      const getFilingQuery = `
        SELECT id, user_id, status, json_payload
        FROM itr_filings 
        WHERE id = $1 AND user_id = $2
      `;

      const filing = await dbQuery(getFilingQuery, [filingId, userId]);

      if (filing.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const filingData = filing.rows[0];

      // Check if filing can be resumed
      if (filingData.status !== 'paused') {
        return res.status(400).json({
          error: `Filing cannot be resumed. Current status: ${filingData.status}`,
        });
      }

      // Update filing status to draft
      const resumeQuery = `
        UPDATE itr_filings 
        SET status = 'draft', resumed_at = NOW(), updated_at = NOW()
        WHERE id = $1
        RETURNING id, status, resumed_at
      `;

      const result = await dbQuery(resumeQuery, [filingId]);

      enterpriseLogger.info('Filing resumed', {
        filingId,
        userId,
        resumedAt: result.rows[0].resumed_at,
      });

      res.json({
        success: true,
        message: 'Filing resumed successfully',
        filing: {
          id: result.rows[0].id,
          status: result.rows[0].status,
          resumedAt: result.rows[0].resumed_at,
          formData: filingData.json_payload ? JSON.parse(filingData.json_payload) : null,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Resume filing failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
        stack: error.stack,
      });
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // =====================================================
  // REFUND TRACKING METHODS
  // =====================================================

  async getRefundStatus(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const refundStatus = await refundTrackingService.getRefundStatus(filingId);

      res.json({
        success: true,
        refund: refundStatus,
      });
    } catch (error) {
      enterpriseLogger.error('Get refund status failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get refund status',
      });
    }
  }

  async getRefundHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { assessmentYear } = req.query;

      const refundHistory = await refundTrackingService.getRefundHistory(userId, assessmentYear);

      res.json({
        success: true,
        refunds: refundHistory,
      });
    } catch (error) {
      enterpriseLogger.error('Get refund history failed', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get refund history',
      });
    }
  }

  async updateRefundBankAccount(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { bankAccount } = req.body;

      if (!bankAccount) {
        return res.status(400).json({
          error: 'Bank account details are required',
        });
      }

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const refundStatus = await refundTrackingService.updateRefundBankAccount(filingId, bankAccount);

      res.json({
        success: true,
        refund: refundStatus,
      });
    } catch (error) {
      enterpriseLogger.error('Update refund bank account failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to update refund bank account',
      });
    }
  }

  async requestRefundReissue(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { reason, bankAccount } = req.body;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      // Update bank account if provided
      if (bankAccount) {
        await refundTrackingService.updateRefundBankAccount(filingId, bankAccount);
      }

      // Update status to processing
      const refundStatus = await refundTrackingService.updateRefundStatus(filingId, 'processing', {
        message: `Refund re-issue requested: ${reason || 'No reason provided'}`,
      });

      enterpriseLogger.info('Refund re-issue requested', {
        filingId,
        userId,
        reason,
      });

      res.json({
        success: true,
        message: 'Refund re-issue request submitted successfully',
        refund: refundStatus,
      });
    } catch (error) {
      enterpriseLogger.error('Request refund reissue failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to request refund reissue',
      });
    }
  }

  // =====================================================
  // DISCREPANCY HANDLING METHODS
  // =====================================================

  async getDiscrepancies(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id, json_payload FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const formData = JSON.parse(verify.rows[0].json_payload || '{}');
      
      // Get uploaded data (would come from document uploads)
      const uploadedData = formData.uploadedData || {};

      // Compare data
      const discrepancies = dataMatchingService.compareData(formData, uploadedData, 'income');
      
      // Group discrepancies
      const grouped = dataMatchingService.groupDiscrepancies(discrepancies);

      res.json({
        success: true,
        discrepancies,
        grouped,
        summary: {
          total: discrepancies.length,
          critical: discrepancies.filter(d => d.severity === 'critical').length,
          warning: discrepancies.filter(d => d.severity === 'warning').length,
          info: discrepancies.filter(d => d.severity === 'info').length,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Get discrepancies failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get discrepancies',
      });
    }
  }

  async resolveDiscrepancy(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { discrepancyId, fieldPath, resolutionAction, resolvedValue, explanation } = req.body;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      // Get discrepancy details (would be passed in request or fetched)
      const discrepancy = req.body.discrepancy || {};

      // Create resolution record
      const resolution = await DiscrepancyResolution.create({
        filingId,
        discrepancyId: discrepancyId || fieldPath,
        fieldPath,
        manualValue: discrepancy.manualValue,
        sourceValue: discrepancy.uploadedValue || discrepancy.sourceValue,
        resolvedValue: resolvedValue || (resolutionAction === 'accept_source' ? discrepancy.uploadedValue : discrepancy.manualValue),
        resolutionAction,
        explanation,
        resolvedBy: userId,
      });

      enterpriseLogger.info('Discrepancy resolved', {
        filingId,
        fieldPath,
        resolutionAction,
        resolvedBy: userId,
      });

      res.json({
        success: true,
        resolution,
      });
    } catch (error) {
      enterpriseLogger.error('Resolve discrepancy failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to resolve discrepancy',
      });
    }
  }

  async bulkResolveDiscrepancies(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { discrepancyIds, resolutionAction, resolvedValue, explanation } = req.body;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      // Bulk resolve
      const result = dataMatchingService.bulkResolve(discrepancyIds, resolutionAction, resolvedValue);

      // Create resolution records
      const resolutions = [];
      for (const resolved of result.resolved) {
        const resolution = await DiscrepancyResolution.create({
          filingId,
          discrepancyId: resolved.id,
          fieldPath: resolved.id,
          resolutionAction,
          resolvedValue: resolved.customValue,
          explanation,
          resolvedBy: userId,
        });
        resolutions.push(resolution);
      }

      enterpriseLogger.info('Bulk discrepancies resolved', {
        filingId,
        count: resolutions.length,
        resolvedBy: userId,
      });

      res.json({
        success: true,
        resolved: resolutions,
        failed: result.failed,
        totalResolved: result.totalResolved,
      });
    } catch (error) {
      enterpriseLogger.error('Bulk resolve discrepancies failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to bulk resolve discrepancies',
      });
    }
  }

  async getDiscrepancySuggestions(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id, json_payload FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const formData = JSON.parse(verify.rows[0].json_payload || '{}');
      const uploadedData = formData.uploadedData || {};

      // Get discrepancies
      const discrepancies = dataMatchingService.compareData(formData, uploadedData, 'income');

      // Get suggestions for each discrepancy
      const suggestions = discrepancies.map(discrepancy => ({
        discrepancy,
        suggestion: dataMatchingService.suggestResolution(discrepancy, formData),
      }));

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      enterpriseLogger.error('Get discrepancy suggestions failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get discrepancy suggestions',
      });
    }
  }

  async getDiscrepancyHistory(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const verifyQuery = `
        SELECT id FROM itr_filings WHERE id = $1 AND user_id = $2
      `;
      const verify = await dbQuery(verifyQuery, [filingId, userId]);

      if (verify.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      const history = await dataMatchingService.getDiscrepancyHistory(filingId);

      res.json({
        success: true,
        history,
      });
    } catch (error) {
      enterpriseLogger.error('Get discrepancy history failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get discrepancy history',
      });
    }
  }

  // =====================================================
  // PREVIOUS YEAR COPY
  // =====================================================

  /**
   * Get available previous year filings
   * GET /api/itr/previous-years
   */
  async getAvailablePreviousYears(req, res) {
    try {
      const userId = req.user.userId;
      const { memberId, currentAssessmentYear } = req.query;

      const previousYearCopyService = require('../services/business/PreviousYearCopyService');

      const previousYears = await previousYearCopyService.getAvailablePreviousYears(
        userId,
        memberId || null,
        currentAssessmentYear || '2024-25'
      );

      res.status(200).json({
        success: true,
        previousYears,
        count: previousYears.length,
      });
    } catch (error) {
      enterpriseLogger.error('Get available previous years failed', {
        error: error.message,
        userId: req.user?.userId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get available previous years',
      });
    }
  }

  /**
   * Get previous year data for preview
   * GET /api/itr/previous-years/:filingId
   */
  async getPreviousYearData(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const previousYearCopyService = require('../services/business/PreviousYearCopyService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Previous year filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to this filing',
        });
      }

      const previousYearData = await previousYearCopyService.getPreviousYearData(filingId);

      res.status(200).json({
        success: true,
        data: previousYearData,
      });
    } catch (error) {
      enterpriseLogger.error('Get previous year data failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get previous year data',
      });
    }
  }

  /**
   * Copy data from previous year to current filing
   * POST /api/itr/filings/:filingId/copy-from-previous
   */
  async copyFromPreviousYear(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { sourceFilingId, sections, reviewData } = req.body;

      // Validate required fields
      if (!sourceFilingId || !sections || !Array.isArray(sections)) {
        return res.status(400).json({
          error: 'Missing required fields: sourceFilingId and sections array',
        });
      }

      // Verify user owns target filing
      const verifyTargetQuery = `
        SELECT user_id, status FROM itr_filings WHERE id = $1
      `;
      const verifyTargetResult = await dbQuery(verifyTargetQuery, [filingId]);

      if (verifyTargetResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Target filing not found',
        });
      }

      if (verifyTargetResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to target filing',
        });
      }

      // Check if target filing can be modified
      const targetStatus = verifyTargetResult.rows[0].status;
      if (!['draft', 'paused', 'rejected'].includes(targetStatus)) {
        return res.status(400).json({
          error: 'Cannot copy to a filing that is already submitted',
        });
      }

      // If source is not 'eri', verify user owns source filing
      if (sourceFilingId !== 'eri') {
        const verifySourceQuery = `
          SELECT user_id FROM itr_filings WHERE id = $1
        `;
        const verifySourceResult = await dbQuery(verifySourceQuery, [sourceFilingId]);

        if (verifySourceResult.rows.length === 0) {
          return res.status(404).json({
            error: 'Source filing not found',
          });
        }

        if (verifySourceResult.rows[0].user_id !== userId) {
          return res.status(403).json({
            error: 'Unauthorized access to source filing',
          });
        }
      }

      const previousYearCopyService = require('../services/business/PreviousYearCopyService');

      const result = await previousYearCopyService.applyCopy(
        filingId,
        sourceFilingId,
        sections,
        reviewData || null
      );

      res.status(200).json({
        success: true,
        message: 'Data copied successfully',
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Copy from previous year failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to copy from previous year',
      });
    }
  }

  // =====================================================
  // TAX PAYMENT - CHALLAN GENERATION
  // =====================================================

  /**
   * Generate tax payment challan
   * POST /api/itr/filings/:filingId/taxes-paid/challan
   */
  async generateChallan(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const challanData = req.body;

      const taxPaymentService = require('../services/business/TaxPaymentService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      const result = await taxPaymentService.generateChallan(filingId, challanData);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Generate challan failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to generate challan',
      });
    }
  }

  // =====================================================
  // FOREIGN ASSETS (SCHEDULE FA)
  // =====================================================

  /**
   * Get foreign assets for a filing
   * GET /api/itr/filings/:filingId/foreign-assets
   */
  async getForeignAssets(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const ForeignAssetsService = require('../services/business/ForeignAssetsService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Foreign Assets are allowed for ITR-2 and ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-2' && itrType !== 'ITR2' && itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Foreign assets are not applicable for ${itrType}. This feature is only available for ITR-2 and ITR-3.`,
        });
      }

      const result = await ForeignAssetsService.getForeignAssets(filingId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Get foreign assets failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get foreign assets',
      });
    }
  }

  /**
   * Add foreign asset
   * POST /api/itr/filings/:filingId/foreign-assets
   */
  async addForeignAsset(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const assetData = req.body;

      const ForeignAssetsService = require('../services/business/ForeignAssetsService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Foreign Assets are allowed for ITR-2 and ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-2' && itrType !== 'ITR2' && itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Foreign assets are not applicable for ${itrType}. This feature is only available for ITR-2 and ITR-3.`,
        });
      }

      const result = await ForeignAssetsService.addForeignAsset(filingId, userId, assetData);

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Add foreign asset failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to add foreign asset',
      });
    }
  }

  /**
   * Update foreign asset
   * PUT /api/itr/filings/:filingId/foreign-assets/:assetId
   */
  async updateForeignAsset(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId, assetId } = req.params;
      const assetData = req.body;

      const ForeignAssetsService = require('../services/business/ForeignAssetsService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Foreign Assets are allowed for ITR-2 and ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-2' && itrType !== 'ITR2' && itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Foreign assets are not applicable for ${itrType}. This feature is only available for ITR-2 and ITR-3.`,
        });
      }

      const result = await ForeignAssetsService.updateForeignAsset(assetId, userId, assetData);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Update foreign asset failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
        assetId: req.params.assetId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to update foreign asset',
      });
    }
  }

  /**
   * Delete foreign asset
   * DELETE /api/itr/filings/:filingId/foreign-assets/:assetId
   */
  async deleteForeignAsset(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId, assetId } = req.params;

      const ForeignAssetsService = require('../services/business/ForeignAssetsService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Foreign Assets are allowed for ITR-2 and ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-2' && itrType !== 'ITR2' && itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Foreign assets are not applicable for ${itrType}. This feature is only available for ITR-2 and ITR-3.`,
        });
      }

      const result = await ForeignAssetsService.deleteForeignAsset(assetId, userId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Delete foreign asset failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
        assetId: req.params.assetId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to delete foreign asset',
      });
    }
  }

  /**
   * Upload foreign asset document
   * POST /api/itr/filings/:filingId/foreign-assets/:assetId/documents
   */
  async uploadForeignAssetDocument(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId, assetId } = req.params;
      const { documentUrl, documentType } = req.body;

      const ForeignAsset = require('../models/ForeignAsset');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get asset and verify ownership
      const asset = await ForeignAsset.findByPk(assetId);
      if (!asset || asset.filingId !== filingId) {
        return res.status(404).json({
          error: 'Foreign asset not found',
        });
      }

      if (asset.userId !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to asset',
        });
      }

      // Add document
      await asset.addDocument(documentUrl, documentType);

      res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        asset: {
          id: asset.id,
          supportingDocuments: asset.supportingDocuments,
        },
      });
    } catch (error) {
      enterpriseLogger.error('Upload foreign asset document failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
        assetId: req.params.assetId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to upload document',
      });
    }
  }

  // =====================================================
  // TAX SIMULATION (WHAT-IF ANALYSIS)
  // =====================================================

  /**
   * Simulate tax scenario
   * POST /api/itr/filings/:filingId/simulate
   */
  async simulateTaxScenario(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { scenario, baseFormData } = req.body;

      const TaxSimulationService = require('../services/business/TaxSimulationService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      const result = await TaxSimulationService.simulateScenario(filingId, scenario);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Simulate tax scenario failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to simulate scenario',
      });
    }
  }

  /**
   * Compare multiple scenarios
   * POST /api/itr/filings/:filingId/compare-scenarios
   */
  async compareScenarios(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { scenarios } = req.body;

      const TaxSimulationService = require('../services/business/TaxSimulationService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      const result = await TaxSimulationService.compareScenarios(filingId, scenarios);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Compare scenarios failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to compare scenarios',
      });
    }
  }

  /**
   * Apply simulation to actual filing
   * POST /api/itr/filings/:filingId/apply-simulation
   */
  async applySimulation(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { scenarioId, changes } = req.body;

      const TaxSimulationService = require('../services/business/TaxSimulationService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      const result = await TaxSimulationService.applySimulation(filingId, scenarioId, changes);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Apply simulation failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to apply simulation',
      });
    }
  }

  /**
   * Get optimization opportunities
   * GET /api/itr/filings/:filingId/optimization-opportunities
   */
  async getOptimizationOpportunities(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const TaxSimulationService = require('../services/business/TaxSimulationService');
      const ITRFiling = require('../models/ITRFiling');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get filing data
      const filing = await ITRFiling.findByPk(filingId);
      const formData = filing.jsonPayload || {};
      const itrType = filing.itrType || 'ITR-1';

      const result = await TaxSimulationService.getOptimizationOpportunities(formData, itrType);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      enterpriseLogger.error('Get optimization opportunities failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get optimization opportunities',
      });
    }
  }

  // =====================================================
  // PDF EXPORT
  // =====================================================

  /**
   * Export draft as PDF
   * GET /api/itr/drafts/:draftId/export/pdf
   */
  async exportDraftPDF(req, res) {
    try {
      const userId = req.user.userId;
      const { draftId } = req.params;

      const PDFGenerationService = require('../services/core/PDFGenerationService');
      const ITRFiling = require('../models/ITRFiling');
      const Draft = require('../models/Draft');

      // Get draft
      const draft = await Draft.findByPk(draftId);
      if (!draft) {
        return res.status(404).json({
          error: 'Draft not found',
        });
      }

      // Verify user owns this draft
      const filing = await ITRFiling.findByPk(draft.filingId);
      if (!filing || filing.userId !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to draft',
        });
      }

      const formData = draft.formData || draft.data || {};
      const itrType = filing.itrType || formData.itrType || 'ITR-1';

      // Get tax computation if available
      let taxComputation = null;
      try {
        const TaxComputationEngine = require('../services/core/TaxComputationEngine');
        const filingData = { ...formData, itrType };
        taxComputation = await TaxComputationEngine.computeTax(
          filingData,
          formData.assessmentYear || '2024-25',
          filing.assessmentYear || '2024-25'
        );
      } catch (error) {
        enterpriseLogger.warn('Could not compute tax for PDF', { error: error.message });
      }

      // Generate PDF
      const pdfBuffer = await PDFGenerationService.generateITRDraftPDF(
        draft.filingId || draftId,
        formData,
        taxComputation
      );

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="itr-draft-${draftId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      enterpriseLogger.error('Export draft PDF failed', {
        error: error.message,
        userId: req.user?.userId,
        draftId: req.params.draftId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to export PDF',
      });
    }
  }

  /**
   * Export tax computation as PDF
   * GET /api/itr/filings/:filingId/tax-computation/pdf
   */
  async exportTaxComputationPDF(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const PDFGenerationService = require('../services/core/PDFGenerationService');
      const ITRFiling = require('../models/ITRFiling');
      const TaxComputationEngine = require('../services/core/TaxComputationEngine');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get filing data
      const filing = await ITRFiling.findByPk(filingId);
      const formData = filing.jsonPayload || {};
      const itrType = filing.itrType || 'ITR-1';
      const assessmentYear = filing.assessmentYear || '2024-25';

      // Compute tax
      const filingData = { ...formData, itrType };
      const taxComputation = await TaxComputationEngine.computeTax(
        filingData,
        assessmentYear
      );

      // Generate PDF
      const pdfBuffer = await PDFGenerationService.generateTaxComputationPDF(
        taxComputation,
        formData
      );

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="tax-computation-${filingId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      enterpriseLogger.error('Export tax computation PDF failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to export PDF',
      });
    }
  }

  /**
   * Export discrepancy report as PDF
   * GET /api/itr/filings/:filingId/discrepancies/pdf
   */
  async exportDiscrepancyPDF(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const PDFGenerationService = require('../services/core/PDFGenerationService');
      const DiscrepancyService = require('../services/business/DiscrepancyService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get discrepancies
      const discrepancies = await DiscrepancyService.getDiscrepancies(filingId, userId);

      // Generate PDF
      const pdfBuffer = await PDFGenerationService.generateDiscrepancyReportPDF(
        discrepancies.discrepancies || [],
        filingId
      );

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="discrepancy-report-${filingId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      enterpriseLogger.error('Export discrepancy PDF failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to export PDF',
      });
    }
  }

  /**
   * Send discrepancy report via email
   * POST /api/itr/filings/:filingId/discrepancies/email
   */
  async sendDiscrepancyReportEmail(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email address is required',
        });
      }

      const EmailService = require('../services/integration/EmailService');
      const DiscrepancyService = require('../services/business/DiscrepancyService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get discrepancies
      const discrepancies = await DiscrepancyService.getDiscrepancies(filingId, userId);
      const discrepancyList = discrepancies.discrepancies || [];

      // Generate report URL
      const reportUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/filings/${filingId}/discrepancies`;

      // Send email
      await EmailService.sendDiscrepancyReportEmail(email, filingId, discrepancyList, reportUrl);

      enterpriseLogger.info('Discrepancy report email sent', {
        userId,
        filingId,
        email,
        discrepancyCount: discrepancyList.length,
      });

      res.json({
        success: true,
        message: 'Discrepancy report email sent successfully',
      });
    } catch (error) {
      enterpriseLogger.error('Send discrepancy report email failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to send email',
      });
    }
  }

  /**
   * Share draft with CA or another user for review
   * POST /api/itr/drafts/:filingId/share
   */
  async shareDraft(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { recipientEmail, caEmail, message } = req.body;
      const email = recipientEmail || caEmail; // Support both field names

      if (!email) {
        return res.status(400).json({
          error: 'Recipient email is required',
        });
      }

      const EmailService = require('../services/integration/EmailService');
      const User = require('../models/User');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type, assessment_year FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get sharer details
      const sharer = await User.findByPk(userId);
      if (!sharer) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Generate share link (in production, this would be a secure, temporary token)
      const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/filing/${filingId}/review?token=TEMP_SHARE_TOKEN`;

      // Send email notification
      await EmailService.sendDraftSharingEmail(
        recipientEmail,
        filingId,
        sharer.fullName || sharer.email,
        shareLink
      );

      enterpriseLogger.info('Draft shared successfully', {
        userId,
        filingId,
        recipientEmail: email,
        shareLink,
      });

      res.json({
        success: true,
        message: 'Draft shared successfully',
        shareLink,
      });
    } catch (error) {
      enterpriseLogger.error('Share draft failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to share draft',
      });
    }
  }

  // =====================================================
  // INCOME ENDPOINTS
  // =====================================================

  /**
   * Get house property income
   * GET /api/itr/filings/:filingId/income/house-property
   */
  async getHouseProperty(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - House Property is allowed for ITR-1 and ITR-2
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-1' && itrType !== 'ITR1' && itrType !== 'ITR-2' && itrType !== 'ITR2') {
        return res.status(400).json({
          error: `House property income is not applicable for ${itrType}. This income type is only available for ITR-1 and ITR-2.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const houseProperty = jsonPayload.income?.houseProperty || { properties: [] };

      res.json({
        success: true,
        properties: houseProperty.properties || [],
        totalIncome: houseProperty.totalIncome || 0,
        totalLoss: houseProperty.totalLoss || 0,
      });
    } catch (error) {
      enterpriseLogger.error('Get house property failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update house property income
   * PUT /api/itr/filings/:filingId/income/house-property
   */
  async updateHouseProperty(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const housePropertyData = req.body;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - House Property is allowed for ITR-1 and ITR-2
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-1' && itrType !== 'ITR1' && itrType !== 'ITR-2' && itrType !== 'ITR2') {
        return res.status(400).json({
          error: `House property income is not applicable for ${itrType}. This income type is only available for ITR-1 and ITR-2.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      jsonPayload.income.houseProperty = housePropertyData;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({ success: true, message: 'House property updated successfully' });
    } catch (error) {
      enterpriseLogger.error('Update house property failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get capital gains income
   * GET /api/itr/filings/:filingId/income/capital-gains
   */
  async getCapitalGains(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - Capital Gains is only allowed for ITR-2
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-2' && itrType !== 'ITR2') {
        return res.status(400).json({
          error: `Capital gains income is not applicable for ${itrType}. This income type is only available for ITR-2.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const capitalGains = jsonPayload.income?.capitalGains || {
        hasCapitalGains: false,
        stcgDetails: [],
        ltcgDetails: [],
      };

      res.json({
        success: true,
        ...capitalGains,
        totalSTCG: capitalGains.stcgDetails?.reduce((sum, e) => sum + (e.gainAmount || 0), 0) || 0,
        totalLTCG: capitalGains.ltcgDetails?.reduce((sum, e) => sum + (e.gainAmount || 0), 0) || 0,
      });
    } catch (error) {
      enterpriseLogger.error('Get capital gains failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update capital gains income
   * PUT /api/itr/filings/:filingId/income/capital-gains
   */
  async updateCapitalGains(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const capitalGainsData = req.body;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - Capital Gains is only allowed for ITR-2
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-2' && itrType !== 'ITR2') {
        return res.status(400).json({
          error: `Capital gains income is not applicable for ${itrType}. This income type is only available for ITR-2.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      jsonPayload.income.capitalGains = capitalGainsData;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({ success: true, message: 'Capital gains updated successfully' });
    } catch (error) {
      enterpriseLogger.error('Update capital gains failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get AIS rental income data
   * GET /api/itr/filings/:filingId/ais/rental-income
   */
  async getAISRentalIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { assessmentYear = '2024-25' } = req.query;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // TODO: Integrate with actual AIS service to fetch rental income
      // For now, return structure that can be populated
      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const aisData = jsonPayload.aisData || {};

      res.json({
        success: true,
        rentalIncome: aisData.rentalIncome || [],
        summary: {
          totalRentalIncome: (aisData.rentalIncome || []).reduce((sum, r) => sum + (r.amount || 0), 0),
          properties: (aisData.rentalIncome || []).length,
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      enterpriseLogger.error('Get AIS rental income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Apply AIS rental income data to house property form
   * POST /api/itr/filings/:filingId/income/house-property/apply-ais
   */
  async applyAISRentalIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { properties } = req.body;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      if (!jsonPayload.income.houseProperty) jsonPayload.income.houseProperty = { properties: [] };

      // Merge AIS properties with existing properties
      const existingProperties = jsonPayload.income.houseProperty.properties || [];
      const mergedProperties = [...existingProperties, ...properties];

      jsonPayload.income.houseProperty.properties = mergedProperties;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({
        success: true,
        message: 'AIS rental income data applied successfully',
        propertiesAdded: properties.length,
      });
    } catch (error) {
      enterpriseLogger.error('Apply AIS rental income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Process rent receipts OCR for house property
   * POST /api/itr/filings/:filingId/income/house-property/ocr-rent-receipts
   */
  async processRentReceiptsOCR(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { receipts, propertyId } = req.body;

      if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Receipts array is required',
        });
      }

      // Verify filing ownership
      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Process receipts (in production, this would call OCR service)
      const processedReceipts = receipts.map((receipt, index) => {
        // Mock processing - in production, integrate with actual OCR service
        return {
          receiptId: receipt.receiptId || `receipt-${index}`,
          fileName: receipt.fileName || `receipt-${index}.pdf`,
          success: true,
          extractedData: {
            landlordName: receipt.extractedData?.landlordName || 'Extracted Landlord Name',
            propertyAddress: receipt.extractedData?.propertyAddress || 'Extracted Property Address',
            rentAmount: receipt.extractedData?.rentAmount || 25000,
            period: receipt.extractedData?.period || 'January 2024',
            receiptDate: receipt.extractedData?.receiptDate || new Date().toISOString().split('T')[0],
            receiptNumber: receipt.extractedData?.receiptNumber || `R${index + 1}`,
            tdsDeducted: receipt.extractedData?.tdsDeducted || 0,
          },
          confidence: receipt.confidence || 0.85,
        };
      });

      // Update filing with processed receipts
      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      if (!jsonPayload.income.houseProperty) jsonPayload.income.houseProperty = { properties: [] };

      // Link receipts to property if propertyId provided
      if (propertyId !== undefined) {
        const properties = jsonPayload.income.houseProperty.properties || [];
        const propertyIndex = properties.findIndex(p => p.id === propertyId);
        if (propertyIndex >= 0) {
          if (!properties[propertyIndex].receipts) {
            properties[propertyIndex].receipts = [];
          }
          properties[propertyIndex].receipts.push(...processedReceipts);
          jsonPayload.income.houseProperty.properties = properties;
        }
      }

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      enterpriseLogger.info('Rent receipts OCR processed', {
        userId,
        filingId,
        receiptCount: processedReceipts.length,
        propertyId,
      });

      res.json({
        success: true,
        message: `${processedReceipts.length} rent receipt(s) processed successfully`,
        receipts: processedReceipts,
        totalProcessed: processedReceipts.length,
      });

    } catch (error) {
      enterpriseLogger.error('Process rent receipts OCR failed', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * Get AIS capital gains data
   * GET /api/itr/filings/:filingId/ais/capital-gains
   */
  async getAISCapitalGains(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { assessmentYear = '2024-25' } = req.query;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // TODO: Integrate with actual AIS service to fetch capital gains
      // For now, return structure that can be populated
      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const aisData = jsonPayload.aisData || {};

      res.json({
        success: true,
        capitalGains: aisData.capitalGains || [],
        summary: {
          totalSTCG: (aisData.capitalGains || []).filter((g) => g.holdingPeriod < 365).reduce((sum, g) => sum + (g.gainAmount || 0), 0),
          totalLTCG: (aisData.capitalGains || []).filter((g) => g.holdingPeriod >= 365).reduce((sum, g) => sum + (g.gainAmount || 0), 0),
          transactions: (aisData.capitalGains || []).length,
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      enterpriseLogger.error('Get AIS capital gains failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Apply AIS capital gains data to capital gains form
   * POST /api/itr/filings/:filingId/income/capital-gains/apply-ais
   */
  async applyAISCapitalGains(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { stcgEntries, ltcgEntries } = req.body;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      if (!jsonPayload.income.capitalGains) {
        jsonPayload.income.capitalGains = {
          hasCapitalGains: true,
          stcgDetails: [],
          ltcgDetails: [],
        };
      }

      // Merge AIS entries with existing entries
      const existingSTCG = jsonPayload.income.capitalGains.stcgDetails || [];
      const existingLTCG = jsonPayload.income.capitalGains.ltcgDetails || [];
      const mergedSTCG = [...existingSTCG, ...(stcgEntries || [])];
      const mergedLTCG = [...existingLTCG, ...(ltcgEntries || [])];

      jsonPayload.income.capitalGains.stcgDetails = mergedSTCG;
      jsonPayload.income.capitalGains.ltcgDetails = mergedLTCG;
      jsonPayload.income.capitalGains.hasCapitalGains = mergedSTCG.length > 0 || mergedLTCG.length > 0;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({
        success: true,
        message: 'AIS capital gains data applied successfully',
        stcgEntriesAdded: (stcgEntries || []).length,
        ltcgEntriesAdded: (ltcgEntries || []).length,
      });
    } catch (error) {
      enterpriseLogger.error('Apply AIS capital gains failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get AIS business income data
   * GET /api/itr/filings/:filingId/ais/business-income
   */
  async getAISBusinessIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { assessmentYear = '2024-25' } = req.query;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // TODO: Integrate with actual AIS service to fetch business income
      // For now, return structure that can be populated
      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const aisData = jsonPayload.aisData || {};
      const businessIncome = aisData.businessIncome || [];

      const totalGrossReceipts = businessIncome.reduce((sum, b) => sum + (b.pnl?.grossReceipts || 0), 0);
      const totalTDS = businessIncome.reduce((sum, b) => sum + (b.pnl?.tdsDeducted || 0), 0);

      res.json({
        success: true,
        businessIncome: businessIncome,
        summary: {
          totalGrossReceipts: totalGrossReceipts,
          totalTDS: totalTDS,
          businesses: businessIncome.length,
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      enterpriseLogger.error('Get AIS business income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Apply AIS business income data to business income form
   * POST /api/itr/filings/:filingId/income/business/apply-ais
   */
  async applyAISBusinessIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { businesses } = req.body;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      if (!jsonPayload.income.business) jsonPayload.income.business = { businesses: [] };

      // Merge AIS businesses with existing businesses
      const existingBusinesses = jsonPayload.income.business.businesses || [];
      const mergedBusinesses = [...existingBusinesses, ...(businesses || [])];

      jsonPayload.income.business.businesses = mergedBusinesses;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({
        success: true,
        message: 'AIS business income data applied successfully',
        businessesAdded: (businesses || []).length,
      });
    } catch (error) {
      enterpriseLogger.error('Apply AIS business income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get AIS professional income data
   * GET /api/itr/filings/:filingId/ais/professional-income
   */
  async getAISProfessionalIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { assessmentYear = '2024-25' } = req.query;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // TODO: Integrate with actual AIS service to fetch professional income
      // For now, return structure that can be populated
      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const aisData = jsonPayload.aisData || {};
      const professionalIncome = aisData.professionalIncome || [];

      const totalProfessionalFees = professionalIncome.reduce((sum, p) => sum + (p.pnl?.professionalFees || 0), 0);
      const totalTDS = professionalIncome.reduce((sum, p) => sum + (p.pnl?.tdsDeducted || 0), 0);

      res.json({
        success: true,
        professionalIncome: professionalIncome,
        summary: {
          totalProfessionalFees: totalProfessionalFees,
          totalTDS: totalTDS,
          professions: professionalIncome.length,
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      });
    } catch (error) {
      enterpriseLogger.error('Get AIS professional income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Apply AIS professional income data to professional income form
   * POST /api/itr/filings/:filingId/income/professional/apply-ais
   */
  async applyAISProfessionalIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const { professions } = req.body;

      const verifyQuery = `SELECT user_id, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      if (!jsonPayload.income.professional) jsonPayload.income.professional = { professions: [] };

      // Merge AIS professions with existing professions
      // Note: Frontend uses 'professions' but backend getProfessionalIncome returns 'activities'
      // We'll use 'professions' to match frontend expectations
      const existingProfessions = jsonPayload.income.professional.professions || jsonPayload.income.professional.activities || [];
      const mergedProfessions = [...existingProfessions, ...(professions || [])];

      jsonPayload.income.professional.professions = mergedProfessions;
      // Also update activities for backward compatibility
      jsonPayload.income.professional.activities = mergedProfessions;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({
        success: true,
        message: 'AIS professional income data applied successfully',
        professionsAdded: (professions || []).length,
      });
    } catch (error) {
      enterpriseLogger.error('Apply AIS professional income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get business income
   * GET /api/itr/filings/:filingId/income/business
   */
  async getBusinessIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - Business Income is allowed for ITR-3 and ITR-4
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3' && itrType !== 'ITR-4' && itrType !== 'ITR4') {
        return res.status(400).json({
          error: `Business income is not applicable for ${itrType}. This income type is only available for ITR-3 and ITR-4.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const businessIncome = jsonPayload.income?.business || { businesses: [] };

      res.json({
        success: true,
        businesses: businessIncome.businesses || [],
        totalIncome: businessIncome.totalIncome || 0,
      });
    } catch (error) {
      enterpriseLogger.error('Get business income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update business income
   * PUT /api/itr/filings/:filingId/income/business
   */
  async updateBusinessIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const businessIncomeData = req.body;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - Business Income is allowed for ITR-3 and ITR-4
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3' && itrType !== 'ITR-4' && itrType !== 'ITR4') {
        return res.status(400).json({
          error: `Business income is not applicable for ${itrType}. This income type is only available for ITR-3 and ITR-4.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      jsonPayload.income.business = businessIncomeData;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({ success: true, message: 'Business income updated successfully' });
    } catch (error) {
      enterpriseLogger.error('Update business income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get professional income
   * GET /api/itr/filings/:filingId/income/professional
   */
  async getProfessionalIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - Professional Income is only allowed for ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Professional income is not applicable for ${itrType}. This income type is only available for ITR-3.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const professionalIncome = jsonPayload.income?.professional || { activities: [] };

      res.json({
        success: true,
        activities: professionalIncome.activities || [],
        totalIncome: professionalIncome.totalIncome || 0,
      });
    } catch (error) {
      enterpriseLogger.error('Get professional income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update professional income
   * PUT /api/itr/filings/:filingId/income/professional
   */
  async updateProfessionalIncome(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const professionalIncomeData = req.body;

      const verifyQuery = `SELECT user_id, itr_type, json_payload FROM itr_filings WHERE id = $1`;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({ error: 'Filing not found' });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Validate ITR type - Professional Income is only allowed for ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Professional income is not applicable for ${itrType}. This income type is only available for ITR-3.`,
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      if (!jsonPayload.income) jsonPayload.income = {};
      jsonPayload.income.professional = professionalIncomeData;

      const updateQuery = `UPDATE itr_filings SET json_payload = $1, updated_at = NOW() WHERE id = $2`;
      await dbQuery(updateQuery, [JSON.stringify(jsonPayload), filingId]);

      res.json({ success: true, message: 'Professional income updated successfully' });
    } catch (error) {
      enterpriseLogger.error('Update professional income failed', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get balance sheet
   * GET /api/itr/filings/:filingId/balance-sheet
   */
  async getBalanceSheet(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const BalanceSheetService = require('../services/business/BalanceSheetService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Balance Sheet is only allowed for ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Balance sheet is not applicable for ${itrType}. This feature is only available for ITR-3.`,
        });
      }

      const balanceSheet = await BalanceSheetService.getBalanceSheet(filingId);

      res.json({
        success: true,
        balanceSheet,
      });
    } catch (error) {
      enterpriseLogger.error('Get balance sheet failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get balance sheet',
      });
    }
  }

  /**
   * Get audit information
   * GET /api/itr/filings/:filingId/audit-information
   */
  async getAuditInformation(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const AuditInformationService = require('../services/business/AuditInformationService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Audit Information is only allowed for ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Audit information is not applicable for ${itrType}. This feature is only available for ITR-3.`,
        });
      }

      const auditInfo = await AuditInformationService.getAuditInformation(filingId);

      res.json({
        success: true,
        auditInfo,
        applicability: auditInfo.applicability,
      });
    } catch (error) {
      enterpriseLogger.error('Get audit information failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to get audit information',
      });
    }
  }

  /**
   * Update audit information
   * PUT /api/itr/filings/:filingId/audit-information
   */
  async updateAuditInformation(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const auditData = req.body;

      const AuditInformationService = require('../services/business/AuditInformationService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Audit Information is only allowed for ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Audit information is not applicable for ${itrType}. This feature is only available for ITR-3.`,
        });
      }

      const updated = await AuditInformationService.updateAuditInformation(filingId, auditData);

      res.json({
        success: true,
        auditInfo: updated,
        message: 'Audit information updated successfully',
      });
    } catch (error) {
      enterpriseLogger.error('Update audit information failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to update audit information',
      });
    }
  }

  /**
   * Check audit applicability
   * POST /api/itr/filings/:filingId/audit-information/check-applicability
   */
  async checkAuditApplicability(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const AuditInformationService = require('../services/business/AuditInformationService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, json_payload FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      const jsonPayload = verifyResult.rows[0].json_payload || {};
      const applicability = AuditInformationService.checkAuditApplicability(
        jsonPayload.income?.business,
        jsonPayload.income?.professional
      );

      res.json({
        success: true,
        ...applicability,
      });
    } catch (error) {
      enterpriseLogger.error('Check audit applicability failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to check audit applicability',
      });
    }
  }

  /**
   * Update balance sheet
   * PUT /api/itr/filings/:filingId/balance-sheet
   */
  async updateBalanceSheet(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;
      const balanceSheetData = req.body;

      const BalanceSheetService = require('../services/business/BalanceSheetService');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id, itr_type FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Validate ITR type - Balance Sheet is only allowed for ITR-3
      const itrType = verifyResult.rows[0].itr_type;
      if (itrType !== 'ITR-3' && itrType !== 'ITR3') {
        return res.status(400).json({
          error: `Balance sheet is not applicable for ${itrType}. This feature is only available for ITR-3.`,
        });
      }

      const updated = await BalanceSheetService.updateBalanceSheet(filingId, balanceSheetData);

      res.json({
        success: true,
        balanceSheet: updated,
        message: 'Balance sheet updated successfully',
      });
    } catch (error) {
      enterpriseLogger.error('Update balance sheet failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to update balance sheet',
      });
    }
  }

  /**
   * Export acknowledgment as PDF
   * GET /api/itr/filings/:filingId/acknowledgment/pdf
   */
  async exportAcknowledgmentPDF(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      const PDFGenerationService = require('../services/core/PDFGenerationService');
      const ITRFiling = require('../models/ITRFiling');

      // Verify user owns this filing
      const verifyQuery = `
        SELECT user_id FROM itr_filings WHERE id = $1
      `;
      const verifyResult = await dbQuery(verifyQuery, [filingId]);

      if (verifyResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Filing not found',
        });
      }

      if (verifyResult.rows[0].user_id !== userId) {
        return res.status(403).json({
          error: 'Unauthorized access to filing',
        });
      }

      // Get filing data
      const filing = await ITRFiling.findByPk(filingId);
      
      if (!filing.acknowledgmentNumber) {
        return res.status(400).json({
          error: 'Filing not yet acknowledged',
        });
      }

      const acknowledgmentData = {
        acknowledgmentNumber: filing.acknowledgmentNumber,
        submittedAt: filing.submittedAt,
        itrType: filing.itrType,
        assessmentYear: filing.assessmentYear,
        eVerificationStatus: filing.eVerificationStatus || 'Pending',
      };

      // Generate PDF
      const pdfBuffer = await PDFGenerationService.generateAcknowledgmentPDF(acknowledgmentData);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="acknowledgment-${filingId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      enterpriseLogger.error('Export acknowledgment PDF failed', {
        error: error.message,
        userId: req.user?.userId,
        filingId: req.params.filingId,
      });
      res.status(error.statusCode || 500).json({
        error: error.message || 'Failed to export PDF',
      });
    }
  }
}

module.exports = ITRController;