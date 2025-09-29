// =====================================================
// APP CONTEXT
// =====================================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';
import { enterpriseLogger } from '../utils/logger';

// Initial state
const initialState = {
  // Authentication state
  isAuthenticated: false,
  user: null,
  loading: true,
  
  // UI state
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  
  // Feature flags
  features: {
    aiAssist: true,
    ocr: true,
    eriIntegration: true,
    mfa: true
  },
  
  // Filing state
  currentFiling: null,
  filingHistory: [],
  
  // Error state
  error: null
};

// Action types
const ActionTypes = {
  // Authentication actions
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  
  // UI actions
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Feature flag actions
  SET_FEATURES: 'SET_FEATURES',
  TOGGLE_FEATURE: 'TOGGLE_FEATURE',
  
  // Filing actions
  SET_CURRENT_FILING: 'SET_CURRENT_FILING',
  SET_FILING_HISTORY: 'SET_FILING_HISTORY',
  UPDATE_FILING: 'UPDATE_FILING',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Loading actions
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null
      };
      
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload.error
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        currentFiling: null,
        filingHistory: [],
        error: null
      };
      
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user
      };
      
    case ActionTypes.SET_THEME:
      return {
        ...state,
        theme: action.payload.theme
      };
      
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload.notification]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload.id
        )
      };
      
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };
      
    case ActionTypes.SET_FEATURES:
      return {
        ...state,
        features: { ...state.features, ...action.payload.features }
      };
      
    case ActionTypes.TOGGLE_FEATURE:
      return {
        ...state,
        features: {
          ...state.features,
          [action.payload.feature]: !state.features[action.payload.feature]
        }
      };
      
    case ActionTypes.SET_CURRENT_FILING:
      return {
        ...state,
        currentFiling: action.payload.filing
      };
      
    case ActionTypes.SET_FILING_HISTORY:
      return {
        ...state,
        filingHistory: action.payload.history
      };
      
    case ActionTypes.UPDATE_FILING:
      return {
        ...state,
        currentFiling: action.payload.filing,
        filingHistory: state.filingHistory.map(filing =>
          filing.id === action.payload.filing.id ? action.payload.filing : filing
        )
      };
      
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload.error
      };
      
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const userInfo = authService.getUserInfo();
          if (userInfo) {
            dispatch({
              type: ActionTypes.SET_USER,
              payload: { user: userInfo }
            });
          }
        }
        
        // Load feature flags from localStorage
        const savedFeatures = localStorage.getItem('featureFlags');
        if (savedFeatures) {
          try {
            const features = JSON.parse(savedFeatures);
            dispatch({
              type: ActionTypes.SET_FEATURES,
              payload: { features }
            });
          } catch (error) {
            enterpriseLogger.error('Error parsing saved feature flags', {
              error: error.message
            });
          }
        }
        
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          dispatch({
            type: ActionTypes.SET_THEME,
            payload: { theme: savedTheme }
          });
        }
        
        dispatch({
          type: ActionTypes.SET_LOADING,
          payload: { loading: false }
        });
      } catch (error) {
        enterpriseLogger.error('App initialization error', {
          error: error.message
        });
        
        dispatch({
          type: ActionTypes.SET_LOADING,
          payload: { loading: false }
        });
      }
    };

    initializeApp();
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Save feature flags to localStorage when they change
  useEffect(() => {
    localStorage.setItem('featureFlags', JSON.stringify(state.features));
  }, [state.features]);

  // Context value
  const value = {
    state,
    dispatch,
    
    // Authentication actions
    login: async (email, password) => {
      dispatch({ type: ActionTypes.LOGIN_START });
      try {
        const response = await authService.login(email, password);
        if (response.success) {
          dispatch({
            type: ActionTypes.LOGIN_SUCCESS,
            payload: { user: response.user }
          });
        } else {
          dispatch({
            type: ActionTypes.LOGIN_FAILURE,
            payload: { error: response.message }
          });
        }
        return response;
      } catch (error) {
        dispatch({
          type: ActionTypes.LOGIN_FAILURE,
          payload: { error: error.message }
        });
        throw error;
      }
    },
    
    logout: async () => {
      try {
        await authService.logout();
        dispatch({ type: ActionTypes.LOGOUT });
      } catch (error) {
        enterpriseLogger.error('Logout error', { error: error.message });
        // Still clear local state even if logout fails
        dispatch({ type: ActionTypes.LOGOUT });
      }
    },
    
    // UI actions
    setTheme: (theme) => {
      dispatch({
        type: ActionTypes.SET_THEME,
        payload: { theme }
      });
    },
    
    toggleSidebar: () => {
      dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
    },
    
    addNotification: (notification) => {
      const id = Date.now() + Math.random();
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { notification: { ...notification, id } }
      });
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        dispatch({
          type: ActionTypes.REMOVE_NOTIFICATION,
          payload: { id }
        });
      }, 5000);
    },
    
    removeNotification: (id) => {
      dispatch({
        type: ActionTypes.REMOVE_NOTIFICATION,
        payload: { id }
      });
    },
    
    clearNotifications: () => {
      dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
    },
    
    // Feature flag actions
    toggleFeature: (feature) => {
      dispatch({
        type: ActionTypes.TOGGLE_FEATURE,
        payload: { feature }
      });
    },
    
    // Filing actions
    setCurrentFiling: (filing) => {
      dispatch({
        type: ActionTypes.SET_CURRENT_FILING,
        payload: { filing }
      });
    },
    
    setFilingHistory: (history) => {
      dispatch({
        type: ActionTypes.SET_FILING_HISTORY,
        payload: { history }
      });
    },
    
    updateFiling: (filing) => {
      dispatch({
        type: ActionTypes.UPDATE_FILING,
        payload: { filing }
      });
    },
    
    // Error actions
    setError: (error) => {
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: { error }
      });
    },
    
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },
    
    // Loading actions
    setLoading: (loading) => {
      dispatch({
        type: ActionTypes.SET_LOADING,
        payload: { loading }
      });
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Export action types for external use
export { ActionTypes };

export default AppContext;
