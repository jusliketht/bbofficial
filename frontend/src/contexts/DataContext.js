// DataContext
// Provides data management context for the entire application

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { apiService } from '../services/apiService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [itrData, setItrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/users/profile');
      setUserData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItrData = useCallback(async (itrId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get(`/itr/${itrId}`);
      setItrData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserData = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.put('/users/profile', data);
      setUserData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItrData = useCallback(async (itrId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.put(`/itr/${itrId}`, data);
      setItrData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setUserData(null);
    setItrData(null);
    setError(null);
  }, []);

  const value = useMemo(() => ({
    userData,
    itrData,
    loading,
    error,
    fetchUserData,
    fetchItrData,
    updateUserData,
    updateItrData,
    clearData
  }), [userData, itrData, loading, error, fetchUserData, fetchItrData, updateUserData, updateItrData, clearData]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
