// =====================================================
// PREVIOUS YEAR COPY SERVICE
// Service for copying data from previous year ITR filings
// Supports both database and ERI API sources
// =====================================================

const enterpriseLogger = require('../../utils/logger');
const { AppError } = require('../../middleware/errorHandler');
const { query: dbQuery } = require('../../utils/dbQuery');
const eriIntegrationService = require('./ERIIntegrationService');
const ITRFiling = require('../../models/ITRFiling');

class PreviousYearCopyService {
  /**
   * Get available previous year filings for a user
   * @param {string} userId - User ID
   * @param {string} memberId - Member ID (optional, for family members)
   * @param {string} currentAssessmentYear - Current assessment year (e.g., '2024-25')
   * @returns {Promise<Array>} - List of available previous year filings
   */
  async getAvailablePreviousYears(userId, memberId = null, currentAssessmentYear = '2024-25') {
    try {
      enterpriseLogger.info('Fetching available previous years', {
        userId,
        memberId,
        currentAssessmentYear,
      });

      // Extract year from assessment year (e.g., '2024-25' -> 2024)
      const currentYear = parseInt(currentAssessmentYear.split('-')[0]);

      // Query for submitted/acknowledged/processed filings from previous years
      const query = `
        SELECT 
          id,
          itr_type,
          assessment_year,
          status,
          submitted_at,
          acknowledged_at,
          json_payload,
          created_at
        FROM itr_filings
        WHERE user_id = $1
          AND (member_id = $2 OR ($2 IS NULL AND member_id IS NULL))
          AND status IN ('submitted', 'acknowledged', 'processed')
          AND assessment_year < $3
        ORDER BY assessment_year DESC, submitted_at DESC
      `;

      const result = await dbQuery(query, [userId, memberId, currentAssessmentYear]);

      const previousYears = result.rows.map((row) => {
        // Extract summary from json_payload
        const payload = row.json_payload || {};
        const personalInfo = payload.personal_info || payload.personalInfo || {};

        return {
          filingId: row.id,
          itrType: row.itr_type,
          assessmentYear: row.assessment_year,
          status: row.status,
          submittedAt: row.submitted_at,
          acknowledgedAt: row.acknowledged_at,
          createdAt: row.created_at,
          summary: {
            name: personalInfo.name || personalInfo.fullName || 'N/A',
            pan: personalInfo.pan || 'N/A',
            totalIncome: this.extractTotalIncome(payload),
            totalDeductions: this.extractTotalDeductions(payload),
            taxPaid: payload.taxes_paid || payload.taxesPaid || {},
          },
        };
      });

      enterpriseLogger.info('Available previous years fetched', {
        userId,
        count: previousYears.length,
      });

      return previousYears;
    } catch (error) {
      enterpriseLogger.error('Failed to get available previous years', {
        userId,
        memberId,
        error: error.message,
      });
      throw new AppError(`Failed to get available previous years: ${error.message}`, 500);
    }
  }

  /**
   * Get complete previous year data for a filing
   * @param {string} filingId - Filing ID
   * @returns {Promise<object>} - Complete ITR data
   */
  async getPreviousYearData(filingId) {
    try {
      enterpriseLogger.info('Fetching previous year data', { filingId });

      const query = `
        SELECT 
          id,
          user_id,
          member_id,
          itr_type,
          assessment_year,
          status,
          json_payload,
          submitted_at,
          acknowledged_at
        FROM itr_filings
        WHERE id = $1
      `;

      const result = await dbQuery(query, [filingId]);

      if (result.rows.length === 0) {
        throw new AppError('Previous year filing not found', 404);
      }

      const filing = result.rows[0];
      const jsonPayload = filing.json_payload || {};

      return {
        filingId: filing.id,
        userId: filing.user_id,
        memberId: filing.member_id,
        itrType: filing.itr_type,
        assessmentYear: filing.assessment_year,
        status: filing.status,
        submittedAt: filing.submitted_at,
        acknowledgedAt: filing.acknowledged_at,
        data: jsonPayload,
        sections: this.extractSections(jsonPayload),
      };
    } catch (error) {
      enterpriseLogger.error('Failed to get previous year data', {
        filingId,
        error: error.message,
      });
      throw new AppError(`Failed to get previous year data: ${error.message}`, 500);
    }
  }

  /**
   * Fetch previous year data from ERI API
   * @param {string} pan - PAN number
   * @param {string} assessmentYear - Assessment year
   * @returns {Promise<object>} - Previous year data from ERI
   */
  async fetchFromERI(pan, assessmentYear) {
    try {
      enterpriseLogger.info('Fetching previous year data from ERI', { pan, assessmentYear });

      const eriData = await eriIntegrationService.fetchPreviousItrData(pan, assessmentYear);

      if (!eriData || !eriData.previousFiling) {
        throw new AppError('No previous year data found in ERI', 404);
      }

      // Map ERI data to our ITR structure
      return this.mapERIDataToITRFormat(eriData, assessmentYear);
    } catch (error) {
      enterpriseLogger.error('Failed to fetch from ERI', {
        pan,
        assessmentYear,
        error: error.message,
      });
      throw new AppError(`Failed to fetch from ERI: ${error.message}`, 500);
    }
  }

  /**
   * Map previous year data to current year structure
   * @param {object} previousData - Previous year data
   * @param {string} targetITRType - Target ITR type
   * @returns {object} - Mapped data structure
   */
  mapPreviousYearData(previousData, targetITRType) {
    try {
      const sourceData = previousData.data || previousData;
      const mappedData = {
        personal_info: this.mapPersonalInfo(sourceData.personal_info || sourceData.personalInfo),
        income: this.mapIncome(sourceData.income, targetITRType),
        deductions: this.mapDeductions(sourceData.deductions),
        taxes_paid: this.mapTaxesPaid(sourceData.taxes_paid || sourceData.taxesPaid),
        bank_details: this.mapBankDetails(sourceData.bank_details || sourceData.bankDetails),
      };

      // Add metadata
      mappedData.metadata = {
        copiedFrom: previousData.filingId || previousData.assessmentYear,
        copiedAt: new Date().toISOString(),
        sourceAssessmentYear: previousData.assessmentYear,
        sourceITRType: previousData.itrType,
        targetITRType: targetITRType,
      };

      return mappedData;
    } catch (error) {
      enterpriseLogger.error('Failed to map previous year data', {
        error: error.message,
      });
      throw new AppError(`Failed to map previous year data: ${error.message}`, 500);
    }
  }

  /**
   * Apply copied data to target filing
   * @param {string} targetFilingId - Target filing ID
   * @param {string} sourceFilingId - Source filing ID (or 'eri' for ERI source)
   * @param {Array<string>} sectionsToCopy - Sections to copy
   * @param {object} reviewData - Optional reviewed/modified data
   * @returns {Promise<object>} - Updated filing data
   */
  async applyCopy(targetFilingId, sourceFilingId, sectionsToCopy, reviewData = null) {
    try {
      enterpriseLogger.info('Applying copy from previous year', {
        targetFilingId,
        sourceFilingId,
        sectionsToCopy,
      });

      // Get target filing
      const targetQuery = `
        SELECT id, itr_type, json_payload, user_id
        FROM itr_filings
        WHERE id = $1
      `;
      const targetResult = await dbQuery(targetQuery, [targetFilingId]);

      if (targetResult.rows.length === 0) {
        throw new AppError('Target filing not found', 404);
      }

      const targetFiling = targetResult.rows[0];
      const targetPayload = targetFiling.json_payload || {};
      const targetITRType = targetFiling.itr_type;

      // Get source data
      let sourceData;
      if (sourceFilingId === 'eri') {
        // Fetch from ERI (would need PAN from target filing)
        const pan = targetPayload.personal_info?.pan || targetPayload.personalInfo?.pan;
        if (!pan) {
          throw new AppError('PAN not found in target filing', 400);
        }
        // Extract assessment year from source (would need to be passed)
        // For now, assume we're copying from immediate previous year
        const currentYear = new Date().getFullYear();
        const previousYear = `${currentYear - 1}-${String(currentYear).slice(-2)}`;
        sourceData = await this.fetchFromERI(pan, previousYear);
      } else {
        sourceData = await this.getPreviousYearData(sourceFilingId);
      }

      // Map source data to target structure
      const mappedData = this.mapPreviousYearData(sourceData, targetITRType);

      // Merge with review data if provided
      const finalData = reviewData ? { ...mappedData, ...reviewData } : mappedData;

      // Apply only selected sections
      const updatedPayload = { ...targetPayload };
      
      if (sectionsToCopy.includes('personal_info')) {
        updatedPayload.personal_info = finalData.personal_info;
      }
      if (sectionsToCopy.includes('income')) {
        updatedPayload.income = finalData.income;
      }
      if (sectionsToCopy.includes('deductions')) {
        updatedPayload.deductions = finalData.deductions;
      }
      if (sectionsToCopy.includes('taxes_paid')) {
        updatedPayload.taxes_paid = finalData.taxes_paid;
      }
      if (sectionsToCopy.includes('bank_details')) {
        updatedPayload.bank_details = finalData.bank_details;
      }

      // Update metadata
      updatedPayload.metadata = {
        ...(updatedPayload.metadata || {}),
        ...finalData.metadata,
        copiedSections: sectionsToCopy,
      };

      // Update target filing
      const updateQuery = `
        UPDATE itr_filings
        SET json_payload = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, json_payload
      `;

      const updateResult = await dbQuery(updateQuery, [
        JSON.stringify(updatedPayload),
        targetFilingId,
      ]);

      // Also update draft if exists
      const draftUpdateQuery = `
        UPDATE itr_drafts
        SET data = $1, updated_at = NOW()
        WHERE filing_id = $2
        RETURNING id
      `;
      await dbQuery(draftUpdateQuery, [JSON.stringify(updatedPayload), targetFilingId]);

      enterpriseLogger.info('Copy applied successfully', {
        targetFilingId,
        sourceFilingId,
        sectionsCopied: sectionsToCopy.length,
      });

      return {
        success: true,
        filingId: targetFilingId,
        updatedData: updatedPayload,
        sectionsCopied: sectionsToCopy,
      };
    } catch (error) {
      enterpriseLogger.error('Failed to apply copy', {
        targetFilingId,
        sourceFilingId,
        error: error.message,
      });
      throw new AppError(`Failed to apply copy: ${error.message}`, 500);
    }
  }

  // Helper methods

  extractTotalIncome(payload) {
    const income = payload.income || {};
    return (
      (income.salary?.totalSalary || income.salary || 0) +
      (income.houseProperty?.netRentalIncome || income.houseProperty || 0) +
      (income.capitalGains?.shortTerm || income.capitalGains?.longTerm || income.capitalGains || 0) +
      (income.otherSources?.total || income.otherSources || 0) +
      (income.businessIncome?.netProfit || income.businessIncome || 0) +
      (income.professionalIncome?.netIncome || income.professionalIncome || 0)
    );
  }

  extractTotalDeductions(payload) {
    const deductions = payload.deductions || {};
    let total = 0;
    Object.values(deductions).forEach((deduction) => {
      if (typeof deduction === 'object' && deduction.totalAmount) {
        total += deduction.totalAmount || 0;
      } else if (typeof deduction === 'number') {
        total += deduction;
      }
    });
    return total;
  }

  extractSections(payload) {
    return {
      personal_info: !!(payload.personal_info || payload.personalInfo),
      income: !!payload.income,
      deductions: !!payload.deductions,
      taxes_paid: !!(payload.taxes_paid || payload.taxesPaid),
      bank_details: !!(payload.bank_details || payload.bankDetails),
    };
  }

  mapPersonalInfo(personalInfo) {
    if (!personalInfo) return null;

    return {
      pan: personalInfo.pan,
      name: personalInfo.name || personalInfo.fullName,
      dateOfBirth: personalInfo.dateOfBirth || personalInfo.dob,
      address: personalInfo.address,
      city: personalInfo.city,
      state: personalInfo.state,
      pincode: personalInfo.pincode,
      phone: personalInfo.phone || personalInfo.mobile,
      email: personalInfo.email,
      aadhaar: personalInfo.aadhaar,
      // Note: Don't copy dates that are year-specific
    };
  }

  mapIncome(income, targetITRType) {
    if (!income) return {};

    const mapped = {};

    // Salary income
    if (income.salary) {
      mapped.salary = Array.isArray(income.salary) 
        ? income.salary 
        : typeof income.salary === 'object' 
        ? income.salary 
        : { totalSalary: income.salary };
    }

    // House property
    if (income.houseProperty) {
      mapped.houseProperty = Array.isArray(income.houseProperty)
        ? income.houseProperty
        : typeof income.houseProperty === 'object'
        ? income.houseProperty
        : { netRentalIncome: income.houseProperty };
    }

    // Capital gains
    if (income.capitalGains) {
      mapped.capitalGains = typeof income.capitalGains === 'object'
        ? income.capitalGains
        : { shortTerm: 0, longTerm: income.capitalGains };
    }

    // Other sources
    if (income.otherSources) {
      mapped.otherSources = typeof income.otherSources === 'object'
        ? income.otherSources
        : { total: income.otherSources };
    }

    // Business income (for ITR-3/ITR-4)
    if (income.businessIncome && (targetITRType === 'ITR-3' || targetITRType === 'ITR-4')) {
      mapped.businessIncome = income.businessIncome;
    }

    // Professional income (for ITR-3)
    if (income.professionalIncome && targetITRType === 'ITR-3') {
      mapped.professionalIncome = income.professionalIncome;
    }

    return mapped;
  }

  mapDeductions(deductions) {
    if (!deductions) return {};

    // Copy all deduction sections as-is
    return { ...deductions };
  }

  mapTaxesPaid(taxesPaid) {
    if (!taxesPaid) return {};

    return {
      tds: Array.isArray(taxesPaid.tds) ? taxesPaid.tds : [],
      advanceTax: Array.isArray(taxesPaid.advanceTax) ? taxesPaid.advanceTax : [],
      selfAssessmentTax: Array.isArray(taxesPaid.selfAssessmentTax) ? taxesPaid.selfAssessmentTax : [],
      tcs: Array.isArray(taxesPaid.tcs) ? taxesPaid.tcs : [],
    };
  }

  mapBankDetails(bankDetails) {
    if (!bankDetails) return null;

    if (Array.isArray(bankDetails)) {
      return bankDetails;
    }

    return typeof bankDetails === 'object' ? bankDetails : null;
  }

  mapERIDataToITRFormat(eriData, assessmentYear) {
    // Map ERI API response to our ITR structure
    const previousFiling = eriData.previousFiling || {};

    return {
      filingId: 'eri',
      assessmentYear: assessmentYear,
      itrType: eriData.itrType || 'ITR-1',
      status: 'submitted',
      data: {
        personal_info: {
          pan: eriData.pan,
          // ERI might not return full personal info
        },
        income: {
          salary: previousFiling.totalIncome || 0,
        },
        taxes_paid: {
          tds: previousFiling.taxPaid || 0,
        },
      },
      sections: {
        personal_info: !!eriData.pan,
        income: !!previousFiling.totalIncome,
        taxes_paid: !!previousFiling.taxPaid,
      },
    };
  }
}

module.exports = new PreviousYearCopyService();

