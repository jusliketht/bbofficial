// =====================================================
// FORM-16 AGGREGATION SERVICE
// Aggregates multiple Form-16 documents into a single consolidated salary snapshot
// =====================================================

const { Document } = require('../../models');
const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');

class Form16AggregationService {
  /**
   * Aggregate multiple Form-16 documents into a single consolidated salary snapshot
   * @param {string} userId - User ID
   * @param {string} assessmentYear - Assessment year (e.g., '2024-25')
   * @param {string} filingId - Optional filing ID to filter documents
   * @returns {Promise<object>} Aggregated salary snapshot
   */
  async aggregateForm16s(userId, assessmentYear, filingId = null) {
    try {
      enterpriseLogger.info('Aggregating Form-16 documents', {
        userId,
        assessmentYear,
        filingId,
      });

      // Build query conditions
      const whereConditions = {
        userId,
        category: 'FORM_16',
        isDeleted: false,
      };

      if (filingId) {
        whereConditions.filingId = filingId;
      }

      // Fetch Form-16 documents
      const form16Documents = await Document.findAll({
        where: whereConditions,
        order: [['created_at', 'ASC']], // Order by creation date
      });

      if (!form16Documents || form16Documents.length === 0) {
        enterpriseLogger.info('No Form-16 documents found', { userId, assessmentYear });
        return this.createEmptySnapshot();
      }

      enterpriseLogger.info(`Found ${form16Documents.length} Form-16 document(s)`, {
        userId,
        assessmentYear,
      });

      // Extract and aggregate data from each Form-16
      const employers = [];
      const salaryBreakdown = {
        basic: 0,
        hra: 0,
        allowances: 0,
        otherAllowances: 0,
        specialAllowances: 0,
        lta: 0,
        medicalAllowance: 0,
        transportAllowance: 0,
      };

      let totalGrossSalary = 0;
      let totalTDS = 0;
      let totalProfessionalTax = 0;
      let totalStandardDeduction = 0;

      for (const doc of form16Documents) {
        try {
          const form16Data = this.extractForm16Data(doc);
          if (!form16Data) {
            enterpriseLogger.warn('Failed to extract Form-16 data', {
              documentId: doc.id,
              filename: doc.filename,
            });
            continue;
          }

          // Add employer info
          if (form16Data.employer) {
            employers.push({
              name: form16Data.employer.name || '',
              tan: form16Data.employer.tan || '',
              pan: form16Data.employer.pan || '',
              grossSalary: parseFloat(form16Data.salary?.grossSalary || form16Data.salary || 0),
              tds: parseFloat(form16Data.tds || 0),
              professionalTax: parseFloat(form16Data.professionalTax || 0),
              standardDeduction: parseFloat(form16Data.standardDeduction || 0),
              period: form16Data.period || { from: null, to: null },
              documentId: doc.id,
            });
          }

          // Aggregate salary components
          const grossSalary = parseFloat(form16Data.salary?.grossSalary || form16Data.salary || 0);
          totalGrossSalary += grossSalary;

          // Aggregate salary breakdown
          if (form16Data.salaryBreakdown) {
            salaryBreakdown.basic += parseFloat(form16Data.salaryBreakdown.basic || 0);
            salaryBreakdown.hra += parseFloat(form16Data.salaryBreakdown.hra || 0);
            salaryBreakdown.allowances += parseFloat(form16Data.salaryBreakdown.allowances || 0);
            salaryBreakdown.otherAllowances += parseFloat(form16Data.salaryBreakdown.otherAllowances || 0);
            salaryBreakdown.specialAllowances += parseFloat(form16Data.salaryBreakdown.specialAllowances || 0);
            salaryBreakdown.lta += parseFloat(form16Data.salaryBreakdown.lta || 0);
            salaryBreakdown.medicalAllowance += parseFloat(form16Data.salaryBreakdown.medicalAllowance || 0);
            salaryBreakdown.transportAllowance += parseFloat(form16Data.salaryBreakdown.transportAllowance || 0);
          }

          // Aggregate TDS and taxes
          totalTDS += parseFloat(form16Data.tds || 0);
          totalProfessionalTax += parseFloat(form16Data.professionalTax || 0);
          totalStandardDeduction += parseFloat(form16Data.standardDeduction || 0);
        } catch (error) {
          enterpriseLogger.error('Error processing Form-16 document', {
            documentId: doc.id,
            filename: doc.filename,
            error: error.message,
          });
          // Continue with other documents even if one fails
        }
      }

      // Ensure standard deduction doesn't exceed limit (50000 per year)
      totalStandardDeduction = Math.min(totalStandardDeduction, 50000);

      const aggregatedSnapshot = {
        totalGrossSalary,
        totalTDS,
        totalProfessionalTax,
        totalStandardDeduction,
        employers,
        salaryBreakdown,
        assessmentYear,
        aggregatedAt: new Date().toISOString(),
      };

      // Validate aggregation
      const validationResult = this.validateAggregation(aggregatedSnapshot);
      if (!validationResult.isValid) {
        enterpriseLogger.warn('Form-16 aggregation validation warnings', {
          warnings: validationResult.warnings,
        });
      }

      enterpriseLogger.info('Form-16 aggregation completed', {
        userId,
        assessmentYear,
        totalEmployers: employers.length,
        totalGrossSalary,
        totalTDS,
      });

      return aggregatedSnapshot;
    } catch (error) {
      enterpriseLogger.error('Form-16 aggregation failed', {
        userId,
        assessmentYear,
        error: error.message,
        stack: error.stack,
      });
      throw new AppError(`Failed to aggregate Form-16 documents: ${error.message}`, 500);
    }
  }

  /**
   * Extract Form-16 data from document
   * @param {Document} document - Document model instance
   * @returns {object|null} Extracted Form-16 data or null if extraction fails
   */
  extractForm16Data(document) {
    try {
      // Try to get data from extractedMetadata first
      if (document.extractedMetadata && typeof document.extractedMetadata === 'object') {
        const metadata = document.extractedMetadata;
        if (metadata.salary || metadata.employer || metadata.tds) {
          return {
            salary: metadata.salary || {},
            salaryBreakdown: metadata.salaryBreakdown || {},
            employer: metadata.employer || {},
            tds: metadata.tds || 0,
            professionalTax: metadata.professionalTax || 0,
            standardDeduction: metadata.standardDeduction || 0,
            period: metadata.period || {},
          };
        }
      }

      // Try OCR result as fallback
      if (document.ocrResult && typeof document.ocrResult === 'object') {
        const ocrData = document.ocrResult;
        if (ocrData.extractedData) {
          return {
            salary: ocrData.extractedData.salary || {},
            salaryBreakdown: ocrData.extractedData.salaryBreakdown || {},
            employer: ocrData.extractedData.employer || {},
            tds: ocrData.extractedData.tds || 0,
            professionalTax: ocrData.extractedData.professionalTax || 0,
            standardDeduction: ocrData.extractedData.standardDeduction || 0,
            period: ocrData.extractedData.period || {},
          };
        }
      }

      // If no extracted data found, return null
      return null;
    } catch (error) {
      enterpriseLogger.error('Error extracting Form-16 data from document', {
        documentId: document.id,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Merge salary components from multiple employers
   * @param {...object} employers - Employer salary data objects
   * @returns {object} Merged salary breakdown
   */
  mergeSalaryComponents(...employers) {
    const merged = {
      basic: 0,
      hra: 0,
      allowances: 0,
      otherAllowances: 0,
      specialAllowances: 0,
      lta: 0,
      medicalAllowance: 0,
      transportAllowance: 0,
    };

    for (const employer of employers) {
      if (employer.salaryBreakdown) {
        merged.basic += parseFloat(employer.salaryBreakdown.basic || 0);
        merged.hra += parseFloat(employer.salaryBreakdown.hra || 0);
        merged.allowances += parseFloat(employer.salaryBreakdown.allowances || 0);
        merged.otherAllowances += parseFloat(employer.salaryBreakdown.otherAllowances || 0);
        merged.specialAllowances += parseFloat(employer.salaryBreakdown.specialAllowances || 0);
        merged.lta += parseFloat(employer.salaryBreakdown.lta || 0);
        merged.medicalAllowance += parseFloat(employer.salaryBreakdown.medicalAllowance || 0);
        merged.transportAllowance += parseFloat(employer.salaryBreakdown.transportAllowance || 0);
      }
    }

    return merged;
  }

  /**
   * Consolidate TDS across employers
   * @param {Array} employers - Array of employer objects
   * @returns {object} Consolidated TDS data
   */
  consolidateTDS(employers) {
    const consolidated = {
      totalTDS: 0,
      employerWiseTDS: [],
    };

    for (const employer of employers) {
      const tds = parseFloat(employer.tds || 0);
      consolidated.totalTDS += tds;
      consolidated.employerWiseTDS.push({
        employerName: employer.name || '',
        tan: employer.tan || '',
        tds,
      });
    }

    return consolidated;
  }

  /**
   * Validate aggregated snapshot
   * @param {object} aggregatedSnapshot - Aggregated salary snapshot
   * @returns {object} Validation result with isValid flag and warnings
   */
  validateAggregation(aggregatedSnapshot) {
    const warnings = [];
    let isValid = true;

    // Check if totals match sum of components
    const sumOfEmployerSalaries = aggregatedSnapshot.employers.reduce(
      (sum, emp) => sum + (parseFloat(emp.grossSalary) || 0),
      0
    );

    const difference = Math.abs(sumOfEmployerSalaries - aggregatedSnapshot.totalGrossSalary);
    if (difference > 1) { // Allow 1 rupee difference for rounding
      warnings.push({
        type: 'TOTAL_MISMATCH',
        message: `Sum of employer salaries (${sumOfEmployerSalaries}) doesn't match total gross salary (${aggregatedSnapshot.totalGrossSalary})`,
        difference,
      });
    }

    // Validate TDS doesn't exceed salary
    if (aggregatedSnapshot.totalTDS > aggregatedSnapshot.totalGrossSalary) {
      warnings.push({
        type: 'TDS_EXCEEDS_SALARY',
        message: `Total TDS (${aggregatedSnapshot.totalTDS}) exceeds total gross salary (${aggregatedSnapshot.totalGrossSalary})`,
      });
      isValid = false;
    }

    // Check for duplicate employers (same TAN)
    const tanCounts = {};
    for (const emp of aggregatedSnapshot.employers) {
      if (emp.tan) {
        tanCounts[emp.tan] = (tanCounts[emp.tan] || 0) + 1;
      }
    }

    for (const [tan, count] of Object.entries(tanCounts)) {
      if (count > 1) {
        warnings.push({
          type: 'DUPLICATE_EMPLOYER',
          message: `Duplicate employer found with TAN: ${tan} (appears ${count} times)`,
          tan,
        });
      }
    }

    // Validate standard deduction limit
    if (aggregatedSnapshot.totalStandardDeduction > 50000) {
      warnings.push({
        type: 'STANDARD_DEDUCTION_EXCEEDS_LIMIT',
        message: `Standard deduction (${aggregatedSnapshot.totalStandardDeduction}) exceeds limit of 50000`,
      });
    }

    return {
      isValid,
      warnings,
    };
  }

  /**
   * Create empty snapshot structure
   * @returns {object} Empty aggregated snapshot
   */
  createEmptySnapshot() {
    return {
      totalGrossSalary: 0,
      totalTDS: 0,
      totalProfessionalTax: 0,
      totalStandardDeduction: 0,
      employers: [],
      salaryBreakdown: {
        basic: 0,
        hra: 0,
        allowances: 0,
        otherAllowances: 0,
        specialAllowances: 0,
        lta: 0,
        medicalAllowance: 0,
        transportAllowance: 0,
      },
      aggregatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new Form16AggregationService();

