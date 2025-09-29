import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Global error handler for React Query
const handleQueryError = (error) => {
  console.error('Query Error:', error);

  // Handle different types of errors
  if (error?.response?.status === 401) {
    // Handle unauthorized - redirect to login
    toast.error('Session expired. Please login again.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  if (error?.response?.status === 403) {
    toast.error('You do not have permission to perform this action.');
    return;
  }

  if (error?.response?.status === 404) {
    toast.error('The requested resource was not found.');
    return;
  }

  if (error?.response?.status >= 500) {
    toast.error('Server error. Please try again later.');
    return;
  }

  if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
    toast.error('Network error. Please check your connection.');
    return;
  }

  // Generic error message
  const message = error?.response?.data?.message ||
                  error?.message ||
                  'An unexpected error occurred';

  toast.error(message);
};

// Global success handler for mutations
const handleMutationSuccess = (data, variables, context) => {
  // You can add global success handling here if needed
  console.log('Mutation successful:', { data, variables, context });
};

// Global error handler for mutations
const handleMutationError = (error, variables, context) => {
  console.error('Mutation Error:', { error, variables, context });
  handleQueryError(error);
};

// Create QueryClient with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep data in cache for 10 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Show background refetch indicator
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
      // Handle mutation success globally
      onSuccess: handleMutationSuccess,
      // Handle mutation errors globally
      onError: handleMutationError,
    },
  },
});

// Add global query cache event listeners
queryClient.getQueryCache().subscribe((event) => {
  if (process.env.NODE_ENV === 'development') {
    if (event.type === 'added') {
      console.log('🔍 Query added:', event.query.queryKey);
    } else if (event.type === 'removed') {
      console.log('🗑️ Query removed:', event.query.queryKey);
    }
  }
});

// Add global mutation cache event listeners
queryClient.getMutationCache().subscribe((event) => {
  if (process.env.NODE_ENV === 'development') {
    if (event.type === 'added') {
      console.log('🔄 Mutation added:', event.mutation.mutationKey);
    } else if (event.type === 'settled') {
      console.log('✅ Mutation settled:', event.mutation.state.status);
    }
  }
});

// Query key factory for consistent naming
export const queryKeys = {
  // Authentication
  auth: {
    user: ['auth', 'user'],
    profile: ['auth', 'profile'],
  },

  // Dashboard
  dashboard: {
    overview: ['dashboard', 'overview'],
    stats: ['dashboard', 'stats'],
    notifications: ['dashboard', 'notifications'],
  },

  // Services
  services: {
    list: (userId) => ['services', 'list', userId],
    detail: (serviceId) => ['services', 'detail', serviceId],
    documents: (serviceId) => ['services', 'documents', serviceId],
  },

  // Documents
  documents: {
    list: (serviceId) => ['documents', 'list', serviceId],
    detail: (documentId) => ['documents', 'detail', documentId],
    upload: ['documents', 'upload'],
  },

  // Admin
  admin: {
    users: ['admin', 'users'],
    services: ['admin', 'services'],
    dashboard: ['admin', 'dashboard'],
    analytics: ['admin', 'analytics'],
  },
};

// Mutation key factory
export const mutationKeys = {
  auth: {
    login: ['auth', 'login'],
    logout: ['auth', 'logout'],
    refresh: ['auth', 'refresh'],
  },

  services: {
    create: ['services', 'create'],
    update: ['services', 'update'],
    delete: ['services', 'delete'],
  },

  documents: {
    upload: ['documents', 'upload'],
    delete: ['documents', 'delete'],
  },
};

// Utility functions for common query operations
export const queryUtils = {
  // Invalidate related queries
  invalidateUserData: () => {
    queryClient.invalidateQueries(queryKeys.auth.user);
    queryClient.invalidateQueries(queryKeys.auth.profile);
  },

  invalidateServices: (userId) => {
    queryClient.invalidateQueries(queryKeys.services.list(userId));
  },

  invalidateDocuments: (serviceId) => {
    queryClient.invalidateQueries(queryKeys.documents.list(serviceId));
  },

  // Prefetch data
  prefetchUserServices: async (userId) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.services.list(userId),
      queryFn: () => fetchUserServices(userId),
      staleTime: 5 * 60 * 1000,
    });
  },

  // Optimistic updates
  optimisticUpdateService: (serviceId, updates) => {
    queryClient.setQueryData(queryKeys.services.detail(serviceId), (old) => ({
      ...old,
      ...updates,
    }));
  },
};

// Mock data functions (replace with actual API calls)
const fetchUserServices = async (userId) => {
  // This would be replaced with actual API call
  return [];
};

export default queryClient;
