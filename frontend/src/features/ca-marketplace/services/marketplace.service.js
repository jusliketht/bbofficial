// =====================================================
// CA MARKETPLACE SERVICE
// Service for browsing and interacting with CA firms
// =====================================================

import apiClient from '../../../services/core/APIClient';

class CAMarketplaceService {
  constructor() {
    this.basePath = '/api/ca-marketplace';
  }

  /**
   * Get all CA firms for marketplace (public endpoint)
   * @param {object} filters - Filter options (location, specialization, rating, priceRange, search)
   * @param {object} pagination - Pagination options (page, limit)
   * @returns {Promise<object>} CA firms list with pagination
   */
  async getCAFirms(filters = {}, pagination = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters
      if (filters.location) params.append('location', filters.location);
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.search) params.append('search', filters.search);

      // Add pagination
      if (pagination.page) params.append('page', pagination.page);
      if (pagination.limit) params.append('limit', pagination.limit || 12);

      const response = await apiClient.get(
        `${this.basePath}/firms?${params.toString()}`,
        { _skipAuth: true }, // Public endpoint
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get CA firms:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch CA firms');
    }
  }

  /**
   * Get CA firm details by ID
   * @param {string} firmId - CA firm ID
   * @returns {Promise<object>} CA firm details
   */
  async getCAFirmDetails(firmId) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/firms/${firmId}`,
        { _skipAuth: true }, // Public endpoint
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get CA firm details:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch CA firm details');
    }
  }

  /**
   * Send inquiry to CA firm
   * @param {string} firmId - CA firm ID
   * @param {object} inquiryData - Inquiry details (message, filingId, etc.)
   * @returns {Promise<object>} Inquiry response
   */
  async sendInquiry(firmId, inquiryData) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/firms/${firmId}/inquiry`,
        inquiryData,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      throw new Error(error.response?.data?.error || 'Failed to send inquiry');
    }
  }

  /**
   * Book consultation with CA firm
   * @param {string} firmId - CA firm ID
   * @param {object} bookingData - Booking details (date, time, type, etc.)
   * @returns {Promise<object>} Booking response
   */
  async bookConsultation(firmId, bookingData) {
    try {
      const response = await apiClient.post(
        `${this.basePath}/firms/${firmId}/book`,
        bookingData,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to book consultation:', error);
      throw new Error(error.response?.data?.error || 'Failed to book consultation');
    }
  }

  /**
   * Get available time slots for CA firm
   * @param {string} firmId - CA firm ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<object>} Available time slots
   */
  async getAvailableSlots(firmId, date) {
    try {
      const response = await apiClient.get(
        `${this.basePath}/firms/${firmId}/slots?date=${date}`,
        { _skipAuth: true },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get available slots:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch available slots');
    }
  }

  /**
   * Get CA firm reviews
   * @param {string} firmId - CA firm ID
   * @param {object} pagination - Pagination options
   * @returns {Promise<object>} Reviews with pagination
   */
  async getCAFirmReviews(firmId, pagination = {}) {
    try {
      const params = new URLSearchParams();
      if (pagination.page) params.append('page', pagination.page);
      if (pagination.limit) params.append('limit', pagination.limit || 10);

      const response = await apiClient.get(
        `${this.basePath}/firms/${firmId}/reviews?${params.toString()}`,
        { _skipAuth: true },
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get CA firm reviews:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch reviews');
    }
  }
}

export const caMarketplaceService = new CAMarketplaceService();
export default caMarketplaceService;

