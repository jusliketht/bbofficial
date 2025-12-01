// =====================================================
// ITR AUTO-FILL SERVICE
// Frontend service for automatic data prefetch and population
// =====================================================

import apiClient from './core/APIClient';

class ITRAutoFillService {
  constructor() {
    this.prefetchCache = new Map();
  }

  /**
   * Prefetch data from all sources (ERI, AIS, Form26AS)
   * @param {string} pan - PAN number
   * @param {string} assessmentYear - Assessment year (e.g., '2024-25')
   * @returns {Promise<object>} Prefetch data
   */
  async prefetchData(pan, assessmentYear = '2024-25') {
    try {
      const cacheKey = `${pan}-${assessmentYear}`;

      // Check cache first
      if (this.prefetchCache.has(cacheKey)) {
        const cached = this.prefetchCache.get(cacheKey);
        // Cache valid for 5 minutes
        if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
          return cached.data;
        }
      }

      const response = await apiClient.get(`/itr/prefetch/${pan}/${assessmentYear}`);

      if (response.data.success) {
        // Cache the result
        this.prefetchCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });

        return response.data;
      }

      throw new Error(response.data.error || 'Prefetch failed');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to prefetch data';
      throw new Error(errorMessage);
    }
  }

  /**
   * Auto-populate form data from prefetch result
   * @param {object} prefetchData - Prefetch data from API
   * @param {object} currentFormData - Current form data
   * @returns {object} Merged form data with auto-filled values
   */
  autoPopulateFormData(prefetchData, currentFormData = {}) {
    const merged = {
      personalInfo: { ...currentFormData.personalInfo },
      income: { ...currentFormData.income },
      deductions: { ...currentFormData.deductions },
      taxesPaid: { ...currentFormData.taxesPaid },
      bankDetails: { ...currentFormData.bankDetails },
    };

    const autoFilledFields = {
      personalInfo: [],
      income: [],
      deductions: [],
      taxesPaid: [],
      bankDetails: [],
    };

    // Merge personal info
    if (prefetchData.data?.personalInfo) {
      Object.keys(prefetchData.data.personalInfo).forEach(key => {
        if (!merged.personalInfo[key] && prefetchData.data.personalInfo[key]) {
          merged.personalInfo[key] = prefetchData.data.personalInfo[key];
          autoFilledFields.personalInfo.push(key);
        }
      });
    }

    // Merge income
    if (prefetchData.data?.income) {
      Object.keys(prefetchData.data.income).forEach(key => {
        if (!merged.income[key] && prefetchData.data.income[key]) {
          merged.income[key] = prefetchData.data.income[key];
          autoFilledFields.income.push(key);
        }
      });
    }

    // Merge deductions
    if (prefetchData.data?.deductions) {
      Object.keys(prefetchData.data.deductions).forEach(key => {
        if (!merged.deductions[key] && prefetchData.data.deductions[key]) {
          merged.deductions[key] = prefetchData.data.deductions[key];
          autoFilledFields.deductions.push(key);
        }
      });
    }

    // Merge taxes paid
    if (prefetchData.data?.taxesPaid) {
      Object.keys(prefetchData.data.taxesPaid).forEach(key => {
        if (!merged.taxesPaid[key] && prefetchData.data.taxesPaid[key]) {
          merged.taxesPaid[key] = prefetchData.data.taxesPaid[key];
          autoFilledFields.taxesPaid.push(key);
        }
      });
    }

    // Merge bank details
    if (prefetchData.data?.bankDetails) {
      Object.keys(prefetchData.data.bankDetails).forEach(key => {
        if (!merged.bankDetails[key] && prefetchData.data.bankDetails[key]) {
          merged.bankDetails[key] = prefetchData.data.bankDetails[key];
          autoFilledFields.bankDetails.push(key);
        }
      });
    }

    return {
      formData: merged,
      autoFilledFields,
      sources: prefetchData.sources,
    };
  }

  /**
   * Verify prefetch data against current form data
   * @param {object} prefetchData - Prefetch data
   * @param {object} formData - Current form data
   * @returns {Promise<object>} Verification result with discrepancies
   */
  async verifyPrefetchData(prefetchData, formData) {
    try {
      const response = await apiClient.post('/itr/prefetch/verify', {
        prefetchData: prefetchData.data,
        formData,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Verification failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get data source indicator for a field
   * @param {string} section - Section name (e.g., 'income', 'taxesPaid')
   * @param {string} field - Field name
   * @param {object} sources - Sources object from prefetch
   * @param {array} autoFilledFields - Array of auto-filled field names
   * @returns {string|null} Source indicator ('eri', 'ais', 'form26as', 'userProfile', 'manual', null)
   */
  getFieldSource(section, field, sources, autoFilledFields) {
    // Check if field was auto-filled
    if (!autoFilledFields[section]?.includes(field)) {
      return 'manual';
    }

    // Determine source based on data availability
    // Priority: AIS > Form26AS > ERI > UserProfile
    if (sources.ais?.available && (section === 'income' || section === 'taxesPaid')) {
      return 'ais';
    }
    if (sources.form26as?.available && (section === 'income' || section === 'taxesPaid')) {
      return 'form26as';
    }
    if (sources.eri?.available) {
      return 'eri';
    }
    if (sources.userProfile?.available && section === 'personalInfo') {
      return 'userProfile';
    }

    return 'auto-filled';
  }

  /**
   * Clear prefetch cache
   */
  clearCache() {
    this.prefetchCache.clear();
  }

  /**
   * Clear cache for specific PAN and assessment year
   */
  clearCacheFor(pan, assessmentYear) {
    const cacheKey = `${pan}-${assessmentYear}`;
    this.prefetchCache.delete(cacheKey);
  }
}

export default new ITRAutoFillService();

