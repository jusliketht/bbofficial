// =====================================================
// AIS INTEGRATION SERVICE FOR HOUSE PROPERTY
// Fetches and maps AIS rental income data
// =====================================================

import apiClient from '../../../../services/core/APIClient';
import { AISForm26ASService } from '../../../../services/AISForm26ASService';

class HousePropertyAISService {
  constructor() {
    this.basePath = '/api/itr';
    this.aisService = new AISForm26ASService();
  }

  /**
   * Fetch AIS rental income data for a filing
   * @param {string} filingId - Filing ID
   * @param {string} assessmentYear - Assessment year
   * @returns {object} AIS rental income data
   */
  async fetchAISRentalIncome(filingId, assessmentYear = '2024-25') {
    try {
      const response = await apiClient.get(
        `${this.basePath}/filings/${filingId}/ais/rental-income`,
        { params: { assessmentYear } },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch AIS rental income:', error);
      // If endpoint doesn't exist, try to fetch from general AIS data
      return this.fetchFromGeneralAIS(filingId, assessmentYear);
    }
  }

  /**
   * Fetch rental income from general AIS data
   */
  async fetchFromGeneralAIS(filingId, assessmentYear) {
    try {
      // This would typically require authentication token
      // For now, return structure that can be populated
      return {
        success: true,
        rentalIncome: [],
        summary: {
          totalRentalIncome: 0,
          properties: [],
        },
        source: 'ais',
        fetchedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch from general AIS:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch AIS rental income');
    }
  }

  /**
   * Map AIS data to house property structure
   * @param {object} aisData - Raw AIS data
   * @returns {array} Mapped property array
   */
  mapAISToHouseProperty(aisData) {
    const properties = [];

    if (!aisData || !aisData.rentalIncome || !Array.isArray(aisData.rentalIncome)) {
      return properties;
    }

    aisData.rentalIncome.forEach((rental, index) => {
      const property = {
        id: `ais-property-${index}`,
        propertyType: rental.propertyType || 'let_out',
        annualRentalIncome: rental.amount || 0,
        municipalTaxes: rental.municipalTaxes || 0,
        interestOnLoan: rental.interestOnLoan || 0,
        propertyAddress: rental.address || '',
        tdsDeducted: rental.tdsDeducted || 0,
        source: 'ais',
        sourceData: {
          pan: rental.pan,
          section: rental.section || '194I',
          date: rental.date,
          confidence: rental.confidence || 0.9,
        },
      };
      properties.push(property);
    });

    return properties;
  }

  /**
   * Apply AIS data to house property form
   * @param {string} filingId - Filing ID
   * @param {array} properties - Properties to apply
   * @returns {object} Result
   */
  async applyAISData(filingId, properties) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/filings/${filingId}/income/house-property/apply-ais`,
        { properties },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to apply AIS data:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to apply AIS data');
    }
  }

  /**
   * Compare AIS data with existing form data
   * @param {array} aisProperties - Properties from AIS
   * @param {array} formProperties - Properties from form
   * @returns {object} Comparison result with discrepancies
   */
  compareWithFormData(aisProperties, formProperties) {
    const discrepancies = [];
    const matches = [];

    aisProperties.forEach((aisProp) => {
      const matchingFormProp = formProperties.find(
        (formProp) =>
          formProp.propertyAddress === aisProp.propertyAddress ||
          Math.abs((formProp.annualRentalIncome || 0) - (aisProp.annualRentalIncome || 0)) < 1000,
      );

      if (matchingFormProp) {
        // Check for discrepancies
        const rentalDiff = Math.abs(
          (matchingFormProp.annualRentalIncome || 0) - (aisProp.annualRentalIncome || 0),
        );
        if (rentalDiff > 100) {
          discrepancies.push({
            property: aisProp.propertyAddress || 'Unknown',
            field: 'annualRentalIncome',
            formValue: matchingFormProp.annualRentalIncome || 0,
            aisValue: aisProp.annualRentalIncome || 0,
            difference: rentalDiff,
            severity: rentalDiff > 10000 ? 'critical' : rentalDiff > 1000 ? 'warning' : 'info',
          });
        } else {
          matches.push({
            property: aisProp.propertyAddress || 'Unknown',
            formValue: matchingFormProp.annualRentalIncome || 0,
            aisValue: aisProp.annualRentalIncome || 0,
          });
        }
      } else {
        // New property from AIS
        discrepancies.push({
          property: aisProp.propertyAddress || 'Unknown',
          field: 'new_property',
          formValue: null,
          aisValue: aisProp.annualRentalIncome || 0,
          difference: aisProp.annualRentalIncome || 0,
          severity: 'info',
          isNew: true,
        });
      }
    });

    return {
      matches,
      discrepancies,
      summary: {
        totalAISProperties: aisProperties.length,
        totalFormProperties: formProperties.length,
        matches: matches.length,
        discrepancies: discrepancies.length,
      },
    };
  }
}

export const housePropertyAISService = new HousePropertyAISService();

