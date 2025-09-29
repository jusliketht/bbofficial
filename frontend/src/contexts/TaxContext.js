import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// Tax Computation Context
const TaxContext = createContext();

// Tax computation reducer
const taxReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INCOME_SOURCES':
      return { ...state, incomeSources: action.payload };
    case 'ADD_INCOME_SOURCE':
      return { ...state, incomeSources: [...state.incomeSources, action.payload] };
    case 'UPDATE_INCOME_SOURCE':
      return {
        ...state,
        incomeSources: state.incomeSources.map(source =>
          source.id === action.payload.id ? action.payload : source
        )
      };
    case 'DELETE_INCOME_SOURCE':
      return {
        ...state,
        incomeSources: state.incomeSources.filter(source => source.id !== action.payload)
      };
    case 'SET_DEDUCTIONS':
      return { ...state, deductions: action.payload };
    case 'ADD_DEDUCTION':
      return { ...state, deductions: [...state.deductions, action.payload] };
    case 'UPDATE_DEDUCTION':
      return {
        ...state,
        deductions: state.deductions.map(deduction =>
          deduction.id === action.payload.id ? action.payload : deduction
        )
      };
    case 'DELETE_DEDUCTION':
      return {
        ...state,
        deductions: state.deductions.filter(deduction => deduction.id !== action.payload)
      };
    case 'SET_TAX_COMPUTATION':
      return { ...state, taxComputation: action.payload };
    case 'SET_REGIME_COMPARISON':
      return { ...state, regimeComparison: action.payload };
    case 'SET_OPTIMIZATION_SUGGESTIONS':
      return { ...state, optimizationSuggestions: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  incomeSources: [],
  deductions: [],
  taxComputation: null,
  regimeComparison: null,
  optimizationSuggestions: [],
  loading: false,
  error: null,
};

// Tax Provider Component
export const TaxProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taxReducer, initialState);
  const queryClient = useQueryClient();

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

  // Fetch income sources - only when authenticated
  const { data: incomeSourcesData, isLoading: incomeLoading } = useQuery({
    queryKey: ['incomeSources'],
    queryFn: () => apiClient.get('/income-sources'),
    select: (data) => data.data,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Fetch deductions - only when authenticated
  const { data: deductionsData, isLoading: deductionsLoading } = useQuery({
    queryKey: ['deductions'],
    queryFn: () => apiClient.get('/deductions'),
    select: (data) => data.data,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Fetch tax computation - only when authenticated
  const { data: taxComputationData, isLoading: taxLoading } = useQuery({
    queryKey: ['taxComputation'],
    queryFn: () => apiClient.get('/tax-computation'),
    select: (data) => data.data,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Fetch regime comparison - only when authenticated
  const { data: regimeComparisonData, isLoading: regimeLoading } = useQuery({
    queryKey: ['regimeComparison'],
    queryFn: () => apiClient.get('/regime-comparison'),
    select: (data) => data.data,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Update state when data changes
  useEffect(() => {
    if (incomeSourcesData) {
      dispatch({ type: 'SET_INCOME_SOURCES', payload: incomeSourcesData });
    }
  }, [incomeSourcesData]);

  useEffect(() => {
    if (deductionsData) {
      dispatch({ type: 'SET_DEDUCTIONS', payload: deductionsData });
    }
  }, [deductionsData]);

  useEffect(() => {
    if (taxComputationData) {
      dispatch({ type: 'SET_TAX_COMPUTATION', payload: taxComputationData });
    }
  }, [taxComputationData]);

  useEffect(() => {
    if (regimeComparisonData) {
      dispatch({ type: 'SET_REGIME_COMPARISON', payload: regimeComparisonData });
    }
  }, [regimeComparisonData]);

  // Add income source mutation
  const addIncomeSourceMutation = useMutation({
    mutationFn: (incomeData) => apiClient.post('/income-sources', incomeData),
    onSuccess: (data) => {
      dispatch({ type: 'ADD_INCOME_SOURCE', payload: data.data });
      queryClient.invalidateQueries(['incomeSources']);
      queryClient.invalidateQueries(['taxComputation']);
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Update income source mutation
  const updateIncomeSourceMutation = useMutation({
    mutationFn: ({ id, ...incomeData }) => apiClient.put(`/income-sources/${id}`, incomeData),
    onSuccess: (data) => {
      dispatch({ type: 'UPDATE_INCOME_SOURCE', payload: data.data });
      queryClient.invalidateQueries(['incomeSources']);
      queryClient.invalidateQueries(['taxComputation']);
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Delete income source mutation
  const deleteIncomeSourceMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/income-sources/${id}`),
    onSuccess: (_, id) => {
      dispatch({ type: 'DELETE_INCOME_SOURCE', payload: id });
      queryClient.invalidateQueries(['incomeSources']);
      queryClient.invalidateQueries(['taxComputation']);
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Add deduction mutation
  const addDeductionMutation = useMutation({
    mutationFn: (deductionData) => apiClient.post('/deductions', deductionData),
    onSuccess: (data) => {
      dispatch({ type: 'ADD_DEDUCTION', payload: data.data });
      queryClient.invalidateQueries(['deductions']);
      queryClient.invalidateQueries(['taxComputation']);
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Update deduction mutation
  const updateDeductionMutation = useMutation({
    mutationFn: ({ id, ...deductionData }) => apiClient.put(`/deductions/${id}`, deductionData),
    onSuccess: (data) => {
      dispatch({ type: 'UPDATE_DEDUCTION', payload: data.data });
      queryClient.invalidateQueries(['deductions']);
      queryClient.invalidateQueries(['taxComputation']);
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Delete deduction mutation
  const deleteDeductionMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/deductions/${id}`),
    onSuccess: (_, id) => {
      dispatch({ type: 'DELETE_DEDUCTION', payload: id });
      queryClient.invalidateQueries(['deductions']);
      queryClient.invalidateQueries(['taxComputation']);
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Compute tax mutation
  const computeTaxMutation = useMutation({
    mutationFn: (computationData) => apiClient.post('/tax-computation', computationData),
    onSuccess: (data) => {
      dispatch({ type: 'SET_TAX_COMPUTATION', payload: data.data });
      queryClient.invalidateQueries(['taxComputation']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Compare regimes mutation
  const compareRegimesMutation = useMutation({
    mutationFn: (comparisonData) => apiClient.post('/regime-comparison', comparisonData),
    onSuccess: (data) => {
      dispatch({ type: 'SET_REGIME_COMPARISON', payload: data.data });
      queryClient.invalidateQueries(['regimeComparison']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Save tax computation mutation
  const saveTaxComputationMutation = useMutation({
    mutationFn: (computationData) => apiClient.post('/tax-computation/save', computationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['taxComputation']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Save optimization scenario mutation
  const saveOptimizationScenarioMutation = useMutation({
    mutationFn: (scenarioData) => apiClient.post('/optimization-scenarios', scenarioData),
    onSuccess: () => {
      queryClient.invalidateQueries(['optimizationScenarios']);
    },
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    },
  });

  // Context value
  const value = useMemo(() => ({
    // State
    ...state,
    loading: incomeLoading || deductionsLoading || taxLoading || regimeLoading,
    
    // Income source actions
    addIncomeSource: addIncomeSourceMutation.mutate,
    updateIncomeSource: updateIncomeSourceMutation.mutate,
    deleteIncomeSource: deleteIncomeSourceMutation.mutate,
    
    // Deduction actions
    addDeduction: addDeductionMutation.mutate,
    updateDeduction: updateDeductionMutation.mutate,
    deleteDeduction: deleteDeductionMutation.mutate,
    
    // Tax computation actions
    computeTax: computeTaxMutation.mutate,
    compareRegimes: compareRegimesMutation.mutate,
    saveTaxComputation: saveTaxComputationMutation.mutate,
    saveOptimizationScenario: saveOptimizationScenarioMutation.mutate,
    
    // Mutations for loading states
    isAddingIncome: addIncomeSourceMutation.isPending,
    isUpdatingIncome: updateIncomeSourceMutation.isPending,
    isDeletingIncome: deleteIncomeSourceMutation.isPending,
    isAddingDeduction: addDeductionMutation.isPending,
    isUpdatingDeduction: updateDeductionMutation.isPending,
    isDeletingDeduction: deleteDeductionMutation.isPending,
    isComputingTax: computeTaxMutation.isPending,
    isComparingRegimes: compareRegimesMutation.isPending,
    isSavingComputation: saveTaxComputationMutation.isPending,
    isSavingOptimization: saveOptimizationScenarioMutation.isPending,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    // Only include stable values in dependencies - NOT mutation functions
    state,
    incomeLoading,
    deductionsLoading,
    taxLoading,
    regimeLoading,
    // Include mutation states but not the functions (they're not stable)
    addIncomeSourceMutation.isPending,
    updateIncomeSourceMutation.isPending,
    deleteIncomeSourceMutation.isPending,
    addDeductionMutation.isPending,
    updateDeductionMutation.isPending,
    deleteDeductionMutation.isPending,
    computeTaxMutation.isPending,
    compareRegimesMutation.isPending,
    saveTaxComputationMutation.isPending,
    saveOptimizationScenarioMutation.isPending
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // Note: Mutation functions (mutate) are intentionally excluded as they cause infinite renders
  ]);

  return (
    <TaxContext.Provider value={value}>
      {children}
    </TaxContext.Provider>
  );
};

// Custom hook to use tax context
export const useTaxComputation = () => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTaxComputation must be used within a TaxProvider');
  }
  return context;
};
