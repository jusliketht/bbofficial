// =====================================================
// PDF GENERATION SERVICE
// Service for generating PDF documents (drafts, reports, acknowledgments)
// =====================================================

const PDFDocument = require('pdfkit');
const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');
const PDFTemplateEngine = require('./PDFTemplateEngine');

class PDFGenerationService {
  /**
   * Generate ITR draft PDF
   * @param {string} filingId - Filing ID
   * @param {object} formData - Form data
   * @param {object} taxComputation - Tax computation result
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateITRDraftPDF(filingId, formData, taxComputation) {
    try {
      enterpriseLogger.info('Generating ITR draft PDF', { filingId });

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          const chunks = [];
          
          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          // Use template engine to generate PDF content
          PDFTemplateEngine.generateITRDraftContent(doc, formData, taxComputation, filingId);

          doc.end();
        } catch (error) {
          enterpriseLogger.error('Failed to generate ITR draft PDF', {
            filingId,
            error: error.message,
          });
          reject(error);
        }
      });
    } catch (error) {
      enterpriseLogger.error('Failed to generate ITR draft PDF', {
        filingId,
        error: error.message,
      });
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }

  /**
   * Generate tax computation PDF
   * @param {object} taxComputation - Tax computation result
   * @param {object} formData - Form data
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateTaxComputationPDF(taxComputation, formData) {
    try {
      enterpriseLogger.info('Generating tax computation PDF');

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          const chunks = [];
          
          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          PDFTemplateEngine.generateTaxComputationContent(doc, taxComputation, formData);

          doc.end();
        } catch (error) {
          enterpriseLogger.error('Failed to generate tax computation PDF', {
            error: error.message,
          });
          reject(error);
        }
      });
    } catch (error) {
      enterpriseLogger.error('Failed to generate tax computation PDF', {
        error: error.message,
      });
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }

  /**
   * Generate discrepancy report PDF
   * @param {Array} discrepancies - Array of discrepancies
   * @param {string} filingId - Filing ID
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateDiscrepancyReportPDF(discrepancies, filingId) {
    try {
      enterpriseLogger.info('Generating discrepancy report PDF', { filingId, count: discrepancies.length });

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          const chunks = [];
          
          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          PDFTemplateEngine.generateDiscrepancyReportContent(doc, discrepancies, filingId);

          doc.end();
        } catch (error) {
          enterpriseLogger.error('Failed to generate discrepancy report PDF', {
            filingId,
            error: error.message,
          });
          reject(error);
        }
      });
    } catch (error) {
      enterpriseLogger.error('Failed to generate discrepancy report PDF', {
        filingId,
        error: error.message,
      });
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }

  /**
   * Generate acknowledgment PDF
   * @param {object} acknowledgmentData - Acknowledgment data
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateAcknowledgmentPDF(acknowledgmentData) {
    try {
      enterpriseLogger.info('Generating acknowledgment PDF', {
        acknowledgmentNumber: acknowledgmentData.acknowledgmentNumber,
      });

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          const chunks = [];
          
          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          PDFTemplateEngine.generateAcknowledgmentContent(doc, acknowledgmentData);

          doc.end();
        } catch (error) {
          enterpriseLogger.error('Failed to generate acknowledgment PDF', {
            error: error.message,
          });
          reject(error);
        }
      });
    } catch (error) {
      enterpriseLogger.error('Failed to generate acknowledgment PDF', {
        error: error.message,
      });
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }

  /**
   * Generate refund status PDF
   * @param {object} refundData - Refund data
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateRefundStatusPDF(refundData) {
    try {
      enterpriseLogger.info('Generating refund status PDF', {
        refundId: refundData.id,
      });

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          const chunks = [];
          
          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          PDFTemplateEngine.generateRefundStatusContent(doc, refundData);

          doc.end();
        } catch (error) {
          enterpriseLogger.error('Failed to generate refund status PDF', {
            error: error.message,
          });
          reject(error);
        }
      });
    } catch (error) {
      enterpriseLogger.error('Failed to generate refund status PDF', {
        error: error.message,
      });
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }

  /**
   * Generate schedule-specific PDF
   * @param {object} scheduleData - Schedule data
   * @param {string} scheduleType - Schedule type (e.g., 'FA', 'CG', etc.)
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateSchedulePDF(scheduleData, scheduleType) {
    try {
      enterpriseLogger.info('Generating schedule PDF', { scheduleType });

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ margin: 50, size: 'A4' });
          const chunks = [];
          
          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);

          PDFTemplateEngine.generateScheduleContent(doc, scheduleData, scheduleType);

          doc.end();
        } catch (error) {
          enterpriseLogger.error('Failed to generate schedule PDF', {
            scheduleType,
            error: error.message,
          });
          reject(error);
        }
      });
    } catch (error) {
      enterpriseLogger.error('Failed to generate schedule PDF', {
        scheduleType,
        error: error.message,
      });
      throw new AppError(`Failed to generate PDF: ${error.message}`, 500);
    }
  }
}

module.exports = new PDFGenerationService();

