// Justification: Frontend CA Service - Client-side CA operations management
// Provides CA-specific operations, assignments, and bulk processing functionality
// Essential for CA portal operations and B2B functionality
// Supports CA assignments, bulk jobs, and client management

import api from './api';

class CAService {
  // Justification: Get CA Dashboard Data - Retrieve CA dashboard statistics
  // Provides CA dashboard overview and statistics
  // Essential for CA portal dashboard functionality
  async getDashboardData() {
    try {
      const response = await api.get('/ca/dashboard');
      
      if (response.data.success) {
        return {
          data: response.data.data,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get dashboard data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get dashboard data');
    }
  }

  // Justification: Get CA Assignments - Retrieve CA assignments
  // Provides CA assignment management functionality
  // Essential for CA assignment tracking and management
  async getAssignments(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/ca/assignments?${queryParams}`);
      
      if (response.data.success) {
        return {
          assignments: response.data.data.assignments,
          pagination: response.data.data.pagination,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get assignments');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get assignments');
    }
  }

  // Justification: Accept Assignment - Accept CA assignment
  // Provides assignment acceptance functionality
  // Essential for CA assignment workflow
  async acceptAssignment(assignmentId) {
    try {
      const response = await api.post(`/ca/assignments/${assignmentId}/accept`);
      
      if (response.data.success) {
        return {
          assignment: response.data.data.assignment,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to accept assignment');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to accept assignment');
    }
  }

  // Justification: Complete Assignment - Complete CA assignment
  // Provides assignment completion functionality
  // Essential for CA assignment workflow
  async completeAssignment(assignmentId) {
    try {
      const response = await api.post(`/ca/assignments/${assignmentId}/complete`);
      
      if (response.data.success) {
        return {
          assignment: response.data.data.assignment,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to complete assignment');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to complete assignment');
    }
  }

  // Justification: Get Bulk Jobs - Retrieve CA bulk jobs
  // Provides bulk job management functionality
  // Essential for CA bulk processing operations
  async getBulkJobs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/ca/bulk-jobs?${queryParams}`);
      
      if (response.data.success) {
        return {
          jobs: response.data.data.jobs,
          pagination: response.data.data.pagination,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get bulk jobs');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get bulk jobs');
    }
  }

  // Justification: Create Bulk Job - Create new bulk job
  // Provides bulk job creation functionality
  // Essential for CA bulk processing operations
  async createBulkJob(jobData) {
    try {
      const response = await api.post('/ca/bulk-jobs', jobData);
      
      if (response.data.success) {
        return {
          job: response.data.data.job,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to create bulk job');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to create bulk job');
    }
  }

  // Justification: Update Bulk Job - Update bulk job
  // Provides bulk job update functionality
  // Essential for CA bulk processing operations
  async updateBulkJob(jobId, updateData) {
    try {
      const response = await api.put(`/ca/bulk-jobs/${jobId}`, updateData);
      
      if (response.data.success) {
        return {
          job: response.data.data.job,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to update bulk job');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to update bulk job');
    }
  }

  // Justification: Delete Bulk Job - Delete bulk job
  // Provides bulk job deletion functionality
  // Essential for CA bulk processing operations
  async deleteBulkJob(jobId) {
    try {
      const response = await api.delete(`/ca/bulk-jobs/${jobId}`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Bulk job deleted successfully'
        };
      } else {
        throw new Error(response.data.error || 'Failed to delete bulk job');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete bulk job');
    }
  }

  // Justification: Get Bulk Job Status - Get bulk job processing status
  // Provides bulk job status tracking
  // Essential for CA bulk processing monitoring
  async getBulkJobStatus(jobId) {
    try {
      const response = await api.get(`/ca/bulk-jobs/${jobId}/status`);
      
      if (response.data.success) {
        return {
          status: response.data.data.status,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get bulk job status');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get bulk job status');
    }
  }

  // Justification: Upload Bulk Data - Upload bulk data for processing
  // Provides bulk data upload functionality
  // Essential for CA bulk processing operations
  async uploadBulkData(jobId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/ca/bulk-jobs/${jobId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return {
          upload: response.data.data.upload,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to upload bulk data');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to upload bulk data');
    }
  }

  // Justification: Download Bulk Results - Download bulk processing results
  // Provides bulk results download functionality
  // Essential for CA bulk processing operations
  async downloadBulkResults(jobId, format = 'excel') {
    try {
      const response = await api.get(`/ca/bulk-jobs/${jobId}/download?format=${format}`, {
        responseType: 'blob'
      });
      
      return {
        data: response.data,
        filename: `bulk-results-${jobId}.${format}`,
        success: true
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to download bulk results');
    }
  }

  // Justification: Get CA Profile - Get CA profile information
  // Provides CA profile management
  // Essential for CA account management
  async getCAProfile() {
    try {
      const response = await api.get('/ca/profile');
      
      if (response.data.success) {
        return {
          profile: response.data.data.profile,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to get CA profile');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get CA profile');
    }
  }

  // Justification: Update CA Profile - Update CA profile information
  // Provides CA profile update functionality
  // Essential for CA account management
  async updateCAProfile(profileData) {
    try {
      const response = await api.put('/ca/profile', profileData);
      
      if (response.data.success) {
        return {
          profile: response.data.data.profile,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Failed to update CA profile');
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to update CA profile');
    }
  }
}

export const caService = new CAService();
