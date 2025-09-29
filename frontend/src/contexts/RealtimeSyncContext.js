import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// Realtime Sync Context
const RealtimeSyncContext = createContext();

// Realtime sync reducer
const syncReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'SET_INTEGRATIONS':
      return { ...state, integrations: action.payload };
    case 'SET_SYNC_QUEUE':
      return { ...state, syncQueue: action.payload };
    case 'SET_SYNC_HISTORY':
      return { ...state, syncHistory: action.payload };
    case 'SET_IS_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_IS_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'ADD_SYNC_LOG':
      return { ...state, syncHistory: [action.payload, ...state.syncHistory] };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  syncStatus: null,
  integrations: [],
  syncQueue: [],
  syncHistory: [],
  isOnline: navigator.onLine,
  isSyncing: false,
  error: null,
};

// Realtime Sync Provider Component
export const RealtimeSyncProvider = ({ children }) => {
  const [state, dispatch] = useReducer(syncReducer, initialState);
  const queryClient = useQueryClient();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_IS_ONLINE', payload: true });
    const handleOffline = () => dispatch({ type: 'SET_IS_ONLINE', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enterprise-grade authentication check with proper error handling
  const getAuthStatus = useCallback(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;
      
      // Basic token validation (not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = Date.now() >= payload.exp * 1000;
      
      return !isExpired;
    } catch (error) {
      // If token is malformed, clear it and return false
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
  }, []);

  const isAuthenticated = getAuthStatus();

  // Fetch integrations - only when authenticated
  const { data: integrationsData, isLoading: integrationsLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => apiClient.get('/integrations'),
    select: (data) => data.data,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Fetch sync status - only when authenticated
  const { data: syncStatusData, isLoading: syncStatusLoading } = useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => apiClient.get('/sync/status'),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Fetch sync history - only when authenticated
  const { data: syncHistoryData, isLoading: syncHistoryLoading } = useQuery({
    queryKey: ['syncHistory'],
    queryFn: () => apiClient.get('/sync/history'),
    select: (data) => data.data,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Update state when data changes
  useEffect(() => {
    if (integrationsData) {
      dispatch({ type: 'SET_INTEGRATIONS', payload: integrationsData });
    }
  }, [integrationsData]);

  useEffect(() => {
    if (syncStatusData) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: syncStatusData });
    }
  }, [syncStatusData]);

  useEffect(() => {
    if (syncHistoryData) {
      dispatch({ type: 'SET_SYNC_HISTORY', payload: syncHistoryData });
    }
  }, [syncHistoryData]);

  // Add integration mutation
  const addIntegrationMutation = useMutation({
    mutationFn: (integrationData) => apiClient.post('/integrations', integrationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Update integration mutation
  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, ...integrationData }) => apiClient.put(`/api/integrations/${id}`, integrationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/api/integrations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Queue data sync mutation
  const queueDataSyncMutation = useMutation({
    mutationFn: (syncData) => apiClient.post('/sync/queue', syncData),
    onSuccess: (data) => {
      dispatch({ type: 'ADD_SYNC_LOG', payload: data.data });
      queryClient.invalidateQueries(['syncStatus']);
      queryClient.invalidateQueries(['syncHistory']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Trigger sync mutation
  const triggerSyncMutation = useMutation({
    mutationFn: (syncParams) => apiClient.post('/sync/trigger', syncParams),
    onSuccess: () => {
      dispatch({ type: 'SET_IS_SYNCING', payload: true });
      queryClient.invalidateQueries(['syncStatus']);
      queryClient.invalidateQueries(['syncHistory']);
      
      // Reset syncing status after a delay
      setTimeout(() => {
        dispatch({ type: 'SET_IS_SYNCING', payload: false });
      }, 5000);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_IS_SYNCING', payload: false });
    },
  });

  // Sync data function - memoized for performance
  const syncData = useCallback(async (type, data) => {
    try {
      await queueDataSyncMutation.mutateAsync({
        syncType: type,
        syncData: data,
        priority: 1,
      });
    } catch (error) {
      console.error('Sync data error:', error);
      throw error;
    }
  }, [queueDataSyncMutation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger real-time sync - memoized for performance
  const triggerRealtimeSync = useCallback(async (integrationId, syncType = 'all') => {
    try {
      await triggerSyncMutation.mutateAsync({
        integrationId,
        syncType,
      });
    } catch (error) {
      console.error('Trigger sync error:', error);
      throw error;
    }
  }, [triggerSyncMutation]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get sync status for user - memoized for performance
  const getSyncStatus = useCallback(async () => {
    try {
      const response = await apiClient.get('/sync/status');
      return response.data;
    } catch (error) {
      console.error('Get sync status error:', error);
      throw error;
    }
  }, []);

  // Get sync history - memoized for performance
  const getSyncHistory = useCallback(async (limit = 10) => {
    try {
      const response = await apiClient.get(`/sync/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get sync history error:', error);
      throw error;
    }
  }, []);

  // Context value - memoized for enterprise-grade performance
  const value = useMemo(() => ({
    // State
    ...state,
    loading: integrationsLoading || syncStatusLoading || syncHistoryLoading,
    
    // Integration actions
    addIntegration: addIntegrationMutation.mutate,
    updateIntegration: updateIntegrationMutation.mutate,
    deleteIntegration: deleteIntegrationMutation.mutate,
    
    // Sync actions
    syncData,
    triggerRealtimeSync,
    getSyncStatus,
    getSyncHistory,
    
    // Mutations for loading states
    isAddingIntegration: addIntegrationMutation.isPending,
    isUpdatingIntegration: updateIntegrationMutation.isPending,
    isDeletingIntegration: deleteIntegrationMutation.isPending,
    isQueuingSync: queueDataSyncMutation.isPending,
    isTriggeringSync: triggerSyncMutation.isPending,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    // Only include stable values in dependencies - NOT mutation functions
    state,
    integrationsLoading,
    syncStatusLoading,
    syncHistoryLoading,
    // Include memoized functions (they're stable)
    syncData,
    triggerRealtimeSync,
    getSyncStatus,
    getSyncHistory,
    // Include mutation states but not the functions (they're not stable)
    addIntegrationMutation.isPending,
    updateIntegrationMutation.isPending,
    deleteIntegrationMutation.isPending,
    queueDataSyncMutation.isPending,
    triggerSyncMutation.isPending
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Note: Mutation functions (mutate) are intentionally excluded as they cause infinite renders
  ]);

  return (
    <RealtimeSyncContext.Provider value={value}>
      {children}
    </RealtimeSyncContext.Provider>
  );
};

// Custom hook to use realtime sync context
export const useRealtimeSync = () => {
  const context = useContext(RealtimeSyncContext);
  if (!context) {
    throw new Error('useRealtimeSync must be used within a RealtimeSyncProvider');
  }
  return context;
};
