// Justification: Frontend Intake Service - Client-side intake data management
// Provides intake data operations, validation, and management functionality
// Essential for income data collection and management
// Supports intake data CRUD operations and validation

import api from './api';

class IntakeService {
  // Justification: Get Intake Data - Retrieve intake data for filing
  // Provides intake data for display and editing
  // Essential for intake data management and display
  async getIntakeData(filingId) {
    try {
      const response = await api.get(`/intake/${filingId}`);
      
      if (response.data.success) {
        return {
          data: response.data.data.intakeData,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get intake data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get intake data');
    }
  }

  // Justification: Save Intake Data - Store intake data for section
  // Provides intake data saving functionality
  // Essential for data persistence and management
  async saveIntakeData(filingId, section, data) {
    try {
      const response = await api.post(`/intake/${filingId}/${section}`, data);
      
      if (response.data.success) {
        return {
          data: response.data.data.intakeData,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to save intake data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to save intake data');
    }
  }

  // Justification: Update Intake Data - Modify existing intake data
  // Provides intake data update functionality
  // Essential for data modification and management
  async updateIntakeData(filingId, section, data) {
    try {
      const response = await api.put(`/intake/${filingId}/${section}`, data);
      
      if (response.data.success) {
        return {
          data: response.data.data.intakeData,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to update intake data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to update intake data');
    }
  }

  // Justification: Delete Intake Data - Remove intake data section
  // Provides intake data deletion functionality
  // Essential for data management and cleanup
  async deleteIntakeData(filingId, section) {
    try {
      const response = await api.delete(`/intake/${filingId}/${section}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Intake data deleted successfully'
        };
      } else {
        throw new Error(response.data.error || 'Failed to delete intake data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete intake data');
    }
  }

  // Justification: Validate Intake Data - Check intake data validity
  // Provides intake data validation
  // Essential for data quality and compliance
  async validateIntakeData(filingId, section, data) {
    try {
      const response = await api.post(`/intake/${filingId}/${section}/validate`, data);
      
      if (response.data.success) {
        return {
          validation: response.data.data.validation,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to validate intake data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to validate intake data');
    }
  }

  // Justification: Get Intake Progress - Retrieve intake completion status
  // Provides intake progress information
  // Essential for progress tracking and user guidance
  async getIntakeProgress(filingId) {
    try {
      const response = await api.get(`/intake/${filingId}/progress`);
      
      if (response.data.success) {
        return {
          progress: response.data.data.progress,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get intake progress');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get intake progress');
    }
  }

  // Justification: Complete Intake - Mark intake as complete
  // Provides intake completion functionality
  // Essential for workflow progression
  async completeIntake(filingId) {
    try {
      const response = await api.post(`/intake/${filingId}/complete`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Intake completed successfully'
        };
      } else {
        throw new Error(response.data.error || 'Failed to complete intake');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to complete intake');
    }
  }

  // Justification: Get Intake Summary - Retrieve intake data summary
  // Provides intake data summary for review
  // Essential for data review and validation
  async getIntakeSummary(filingId) {
    try {
      const response = await api.get(`/intake/${filingId}/summary`);
      
      if (response.data.success) {
        return {
          summary: response.data.data.summary,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get intake summary');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get intake summary');
    }
  }

  // Justification: Export Intake Data - Export intake data
  // Provides intake data export functionality
  // Essential for data portability and backup
  async exportIntakeData(filingId, format = 'json') {
    try {
      const response = await api.get(`/intake/${filingId}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      return {
        data: response.data,
        filename: `intake-data-${filingId}.${format}`,
        success: true
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to export intake data');
    }
  }

  // Justification: Import Intake Data - Import intake data
  // Provides intake data import functionality
  // Essential for data migration and restoration
  async importIntakeData(filingId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/intake/${filingId}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return {
          data: response.data.data.intakeData,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to import intake data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to import intake data');
    }
  }
}

export const intakeService = new IntakeService();
