// =====================================================
// FILING CONTEXT
// =====================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { enterpriseLogger } from '../utils/logger';

const FilingContext = createContext(null);

export const FilingProvider = ({ children }) => {
  const [filingData, setFilingData] = useState({
    personalInfo: {},
    income: {},
    deductions: {},
    capitalGains: {},
    businessIncome: {},
    presumptiveIncome: {},
    itrType: '',
    status: 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateFilingData = useCallback((newData) => {
    setFilingData(prev => ({
      ...prev,
      ...newData
    }));
    enterpriseLogger.debug('Filing data updated', { newData });
  }, []);

  const saveDraft = useCallback(async (itrType, formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/itr/drafts', {
        itrType,
        formData,
        step: 'personal_info' // Default step
      });

      enterpriseLogger.info('Draft saved successfully', { 
        draftId: response.data.draft.id,
        itrType 
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Failed to save draft', { 
        error: error.message,
        itrType 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDraft = useCallback(async (draftId, step, formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/itr/drafts/${draftId}`, {
        step,
        data: formData
      });

      enterpriseLogger.info('Draft updated successfully', { 
        draftId,
        step 
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Failed to update draft', { 
        error: error.message,
        draftId,
        step 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const validateDraft = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/itr/validate', {
        formData,
        itrType: formData.itrType
      });

      enterpriseLogger.info('Draft validated', { 
        isValid: response.data.isValid,
        errorCount: response.data.errors?.length || 0
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Validation failed', { 
        error: error.message 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const computeTax = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/itr/compute-tax', {
        formData,
        itrType: formData.itrType
      });

      enterpriseLogger.info('Tax computation completed', { 
        totalTax: response.data.computation?.totalTax,
        taxableIncome: response.data.computation?.taxableIncome
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Tax computation failed', { 
        error: error.message 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitITR = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/itr/submit', {
        formData,
        itrType: formData.itrType
      });

      enterpriseLogger.info('ITR submitted successfully', { 
        filingId: response.data.filing?.id,
        ackNumber: response.data.filing?.ackNumber
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('ITR submission failed', { 
        error: error.message 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDraft = useCallback(async (draftId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/itr/drafts/${draftId}`);

      setFilingData(response.data.draft.data);
      
      enterpriseLogger.info('Draft loaded successfully', { 
        draftId,
        step: response.data.draft.step
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Failed to load draft', { 
        error: error.message,
        draftId 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserDrafts = useCallback(async (status = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = status ? { status } : {};
      const response = await apiClient.get('/itr/drafts', { params });

      enterpriseLogger.info('User drafts retrieved', { 
        count: response.data.drafts?.length || 0,
        status 
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Failed to retrieve user drafts', { 
        error: error.message,
        status 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDraft = useCallback(async (draftId) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(`/itr/drafts/${draftId}`);

      enterpriseLogger.info('Draft deleted successfully', { 
        draftId 
      });

      return { success: true };
    } catch (error) {
      enterpriseLogger.error('Failed to delete draft', { 
        error: error.message,
        draftId 
      });
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetFilingData = useCallback(() => {
    setFilingData({
      personalInfo: {},
      income: {},
      deductions: {},
      capitalGains: {},
      businessIncome: {},
      presumptiveIncome: {},
      itrType: '',
      status: 'draft'
    });
    setError(null);
    enterpriseLogger.info('Filing data reset');
  }, []);

  const contextValue = {
    filingData,
    updateFilingData,
    saveDraft,
    updateDraft,
    validateDraft,
    computeTax,
    submitITR,
    loadDraft,
    getUserDrafts,
    deleteDraft,
    resetFilingData,
    loading,
    error
  };

  return (
    <FilingContext.Provider value={contextValue}>
      {children}
    </FilingContext.Provider>
  );
};

export const useFilingContext = () => {
  const context = useContext(FilingContext);
  if (!context) {
    throw new Error('useFilingContext must be used within a FilingProvider');
  }
  return context;
};

export { FilingContext };