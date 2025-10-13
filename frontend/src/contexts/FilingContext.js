/**
 * FilingContext - Manages ITR filing state across the application
 * Provides centralized state management for filing data, progress, and context
 */

import React, { createContext, useState, useContext } from 'react';

const FilingContext = createContext(null);

export const useFilingContext = () => {
  const context = useContext(FilingContext);
  if (!context) {
    throw new Error('useFilingContext must be used within a FilingProvider');
  }
  return context;
};

export const FilingProvider = ({ children }) => {
  // Filing state
  const [filingData, setFilingData] = useState({
    context: null, // 'self', 'family', 'client'
    userId: null,
    assessmentYear: null,
    personalInfo: {},
    incomeDetails: [],
    deductions: [],
    taxesPaid: [],
    status: 'draft', // 'draft', 'in_progress', 'completed', 'submitted'
    progress: 0, // 0-100
    lastSaved: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset filing data for new filing
  const resetFilingData = () => {
    setFilingData({
      context: null,
      userId: null,
      assessmentYear: null,
      personalInfo: {},
      incomeDetails: [],
      deductions: [],
      taxesPaid: [],
      status: 'draft',
      progress: 0,
      lastSaved: null
    });
    setError(null);
  };

  // Update filing data
  const updateFilingData = (updates) => {
    setFilingData(prev => ({
      ...prev,
      ...updates,
      lastSaved: new Date().toISOString()
    }));
  };

  // Update specific section
  const updateSection = (section, data) => {
    setFilingData(prev => ({
      ...prev,
      [section]: data,
      lastSaved: new Date().toISOString()
    }));
  };

  // Calculate progress based on completed sections
  const calculateProgress = () => {
    let completedSections = 0;
    const totalSections = 5; // personalInfo, incomeDetails, deductions, taxesPaid, review

    if (filingData.personalInfo && Object.keys(filingData.personalInfo).length > 0) {
      completedSections++;
    }
    if (filingData.incomeDetails && filingData.incomeDetails.length > 0) {
      completedSections++;
    }
    if (filingData.deductions && filingData.deductions.length > 0) {
      completedSections++;
    }
    if (filingData.taxesPaid && filingData.taxesPaid.length > 0) {
      completedSections++;
    }
    if (filingData.status === 'completed' || filingData.status === 'submitted') {
      completedSections++;
    }

    return Math.round((completedSections / totalSections) * 100);
  };

  // Save filing data (would integrate with API)
  const saveFilingData = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement API call to save filing data
      // const response = await api.post('/itr/filings', data);
      
      // For now, just update local state
      updateFilingData(data);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for saveFilingData to match ITRFiling.js expectations
  const saveDraft = saveFilingData;

  // Load filing data (would integrate with API)
  const loadFilingData = async (filingId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement API call to load filing data
      // const response = await api.get(`/itr/filings/${filingId}`);
      
      // For now, return mock data
      return { success: true, data: filingData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for loadFilingData to match ITRFiling.js expectations
  const loadDraft = loadFilingData;

  // Placeholder functions for ITRFiling.js compatibility
  const validateDraft = async () => {
    // TODO: Implement validation logic
    return { isValid: true, errors: [], warnings: [] };
  };

  const computeTax = async () => {
    // TODO: Implement tax computation logic
    return { success: true, computation: {} };
  };

  const submitITR = async () => {
    // TODO: Implement ITR submission logic
    return { success: true, submissionId: 'mock-id' };
  };

  const value = {
    // State
    filingData,
    isLoading,
    error,
    
    // Actions
    resetFilingData,
    updateFilingData,
    updateSection,
    calculateProgress,
    saveFilingData,
    loadFilingData,
    
    // ITRFiling.js compatibility
    saveDraft,
    loadDraft,
    validateDraft,
    computeTax,
    submitITR,
    
    // Computed values
    progress: calculateProgress()
  };

  return (
    <FilingContext.Provider value={value}>
      {children}
    </FilingContext.Provider>
  );
};

export default FilingContext;