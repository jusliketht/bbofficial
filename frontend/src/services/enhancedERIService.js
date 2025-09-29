import syncApiClient from './apiService';

/**
 * Enhanced ERI Integration Service
 * Provides frontend integration with government ERI system
 * Essential for official ITR filing and status tracking
 */
class EnhancedERIService {
  constructor() {
    this.baseEndpoint = '/v2/eri';
  }

  /**
   * Submit ITR to government ERI system
   * @param {Object} itrData - Complete ITR data
   * @param {string} verificationMethod - EVC, DSC, or Aadhaar
   * @param {Object} verificationData - Verification details
   * @returns {Promise<Object>} Submission result
   */
  async submitITR(itrData, verificationMethod, verificationData) {
    try {
      const response = await syncApiClient.client.post(`${this.baseEndpoint}/submit`, {
        itrData,
        verificationMethod,
        verificationData
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to submit ITR');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'ITR submission failed');
    }
  }

  /**
   * Check ITR status in government system
   * @param {string} ackNumber - Acknowledgment number
   * @returns {Promise<Object>} Status information
   */
  async checkITRStatus(ackNumber) {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/status/${ackNumber}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to check ITR status');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Status check failed');
    }
  }

  /**
   * Get ITR acknowledgment from government system
   * @param {string} ackNumber - Acknowledgment number
   * @returns {Promise<Object>} Acknowledgment details
   */
  async getITRAcknowledgment(ackNumber) {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/acknowledgment/${ackNumber}`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get ITR acknowledgment');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Acknowledgment retrieval failed');
    }
  }

  /**
   * Get ERI system status and health
   * @returns {Promise<Object>} System status
   */
  async getSystemStatus() {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/system-status`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get system status');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'System status check failed');
    }
  }

  /**
   * Test ERI connectivity and authentication
   * @returns {Promise<Object>} Connectivity test result
   */
  async testConnection() {
    try {
      const response = await syncApiClient.client.post(`${this.baseEndpoint}/test-connection`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Connection test failed');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Connection test failed');
    }
  }

  /**
   * Get available verification methods
   * @returns {Promise<Object>} Verification methods
   */
  async getVerificationMethods() {
    try {
      const response = await syncApiClient.client.get(`${this.baseEndpoint}/verification-methods`);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'Failed to get verification methods');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get verification methods');
    }
  }

  /**
   * Validate verification data based on method
   * @param {string} method - Verification method
   * @param {Object} data - Verification data
   * @returns {Object} Validation result
   */
  validateVerificationData(method, data) {
    const errors = [];

    switch (method) {
      case 'EVC':
        if (!data.evcCode) {
          errors.push('EVC code is required');
        } else if (data.evcCode.length !== 10) {
          errors.push('EVC code must be 10 characters long');
        }
        break;

      case 'DSC':
        if (!data.dscCertificate) {
          errors.push('DSC certificate is required');
        }
        if (!data.dscPassword) {
          errors.push('DSC password is required');
        }
        break;

      case 'Aadhaar':
        if (!data.aadhaarNumber) {
          errors.push('Aadhaar number is required');
        } else if (!/^\d{12}$/.test(data.aadhaarNumber)) {
          errors.push('Aadhaar number must be 12 digits');
        }
        if (!data.otp) {
          errors.push('OTP is required');
        } else if (!/^\d{6}$/.test(data.otp)) {
          errors.push('OTP must be 6 digits');
        }
        break;

      default:
        errors.push(`Unsupported verification method: ${method}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format ITR data for submission
   * @param {Object} itrData - Raw ITR data
   * @returns {Object} Formatted ITR data
   */
  formatITRDataForSubmission(itrData) {
    return {
      itrType: itrData.itrType,
      assessmentYear: itrData.assessmentYear,
      pan: itrData.pan,
      personalInfo: {
        name: itrData.personalInfo.name,
        fatherName: itrData.personalInfo.fatherName,
        dateOfBirth: itrData.personalInfo.dateOfBirth,
        gender: itrData.personalInfo.gender,
        maritalStatus: itrData.personalInfo.maritalStatus,
        address: itrData.personalInfo.address,
        mobile: itrData.personalInfo.mobile,
        email: itrData.personalInfo.email
      },
      incomeData: itrData.incomeData,
      deductionData: itrData.deductionData,
      taxComputation: itrData.taxComputation,
      bankDetails: itrData.bankDetails,
      documents: itrData.documents
    };
  }

  /**
   * Get status display information
   * @param {string} status - ITR status
   * @returns {Object} Status display info
   */
  getStatusDisplayInfo(status) {
    const statusMap = {
      'ERI_SUBMITTED': {
        label: 'Submitted to Government',
        color: 'blue',
        icon: 'upload',
        description: 'Your ITR has been successfully submitted to the government portal'
      },
      'PROCESSING': {
        label: 'Processing',
        color: 'orange',
        icon: 'clock',
        description: 'Your ITR is being processed by the government'
      },
      'ACCEPTED': {
        label: 'Accepted',
        color: 'green',
        icon: 'check-circle',
        description: 'Your ITR has been accepted by the government'
      },
      'REJECTED': {
        label: 'Rejected',
        color: 'red',
        icon: 'x-circle',
        description: 'Your ITR has been rejected. Please check for errors'
      },
      'PENDING': {
        label: 'Pending',
        color: 'yellow',
        icon: 'clock',
        description: 'Your ITR submission is pending'
      },
      'FAILED': {
        label: 'Failed',
        color: 'red',
        icon: 'alert-circle',
        description: 'ITR submission failed. Please try again'
      }
    };

    return statusMap[status] || {
      label: status,
      color: 'gray',
      icon: 'help-circle',
      description: 'Unknown status'
    };
  }

  /**
   * Get processing stage display information
   * @param {string} stage - Processing stage
   * @returns {Object} Stage display info
   */
  getProcessingStageInfo(stage) {
    const stageMap = {
      'SUBMITTED': {
        label: 'Submitted',
        progress: 20,
        description: 'ITR received by government system'
      },
      'VALIDATION': {
        label: 'Validation',
        progress: 40,
        description: 'Validating ITR data and documents'
      },
      'PROCESSING': {
        label: 'Processing',
        progress: 60,
        description: 'Processing tax computation and verification'
      },
      'REVIEW': {
        label: 'Review',
        progress: 80,
        description: 'Under review by tax authorities'
      },
      'COMPLETED': {
        label: 'Completed',
        progress: 100,
        description: 'Processing completed'
      }
    };

    return stageMap[stage] || {
      label: stage,
      progress: 0,
      description: 'Unknown processing stage'
    };
  }
}

// Create singleton instance
const enhancedERIService = new EnhancedERIService();

export default enhancedERIService;
