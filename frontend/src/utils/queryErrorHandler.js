// React Query Error Handler Integration
// Enhances React Query with our comprehensive error handling

import { parseError, getErrorDisplay, logError, handleApiError } from './errorHandler';

export const queryErrorHandler = (error, query) => {
  const parsedError = handleApiError(error, {
    queryKey: query?.meta?.queryKey,
    endpoint: query?.meta?.endpoint,
    component: query?.meta?.component
  });

  return parsedError;
};

// Enhanced mutation error handler
export const mutationErrorHandler = (error, variables, context) => {
  const parsedError = handleApiError(error, {
    mutation: context?.mutation?.meta?.mutationKey,
    variables,
    component: context?.mutation?.meta?.component
  });

  return parsedError;
};

// Query client configuration with error handling
export const createQueryClientConfig = (toast) => ({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on certain errors
        const parsedError = parseError(error);
        if (parsedError.type === 'authentication' ||
            parsedError.type === 'permission' ||
            parsedError.type === 'validation') {
          return false;
        }

        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        const parsedError = queryErrorHandler(error);
        const display = getErrorDisplay(parsedError);

        if (toast) {
          toast.error(`${display.icon} ${display.title}`, {
            description: display.message,
            duration: parsedError.severity === 'critical' ? 10000 : 5000
          });
        }
      }
    },
    mutations: {
      retry: (failureCount, error) => {
        const parsedError = parseError(error);
        return failureCount < 2 && parsedError.type === 'network';
      },
      retryDelay: 1000,
      onError: (error, variables, context) => {
        const parsedError = mutationErrorHandler(error, variables, context);
        const display = getErrorDisplay(parsedError);

        if (toast && context?.showToast !== false) {
          toast.error(`${display.icon} ${display.title}`, {
            description: display.message,
            duration: parsedError.severity === 'critical' ? 10000 : 5000,
            action: parsedError.type === 'network' ? {
              label: 'Retry',
              onClick: () => context?.mutation?.mutate(variables)
            } : undefined
          });
        }
      }
    }
  }
});

// Hook for handling query errors in components
export const useQueryErrorHandler = () => {
  const handleError = (error, context = {}) => {
    const parsedError = handleApiError(error, context);
    return parsedError;
  };

  const getErrorMessage = (error) => {
    const parsedError = parseError(error);
    const display = getErrorDisplay(parsedError);
    return display;
  };

  return {
    handleError,
    getErrorMessage,
    parseError
  };
};

// Network status aware query configuration
export const networkAwareQueryConfig = {
  enabled: navigator.onLine,
  refetchOnWindowFocus: navigator.onLine,
  refetchOnReconnect: true,
  staleTime: navigator.onLine ? 5 * 60 * 1000 : Infinity, // 5 minutes when online
  cacheTime: navigator.onLine ? 10 * 60 * 1000 : Infinity // 10 minutes when online
};

// Background sync for failed mutations
export const createBackgroundSync = (mutationFn, toast) => {
  const pendingMutations = JSON.parse(localStorage.getItem('pendingMutations') || '[]');

  const addToQueue = (mutationData) => {
    const queue = [...pendingMutations, {
      ...mutationData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    }];
    localStorage.setItem('pendingMutations', JSON.stringify(queue));
    pendingMutations.length = 0;
    pendingMutations.push(...queue);
  };

  const processQueue = async () => {
    if (!navigator.onLine || pendingMutations.length === 0) return;

    const processedIds = [];

    for (const mutation of pendingMutations) {
      try {
        await mutationFn(mutation.data);
        processedIds.push(mutation.id);

        if (toast) {
          toast.success('Pending changes synced successfully');
        }
      } catch (error) {
        mutation.retryCount++;

        // Remove after 3 failed attempts
        if (mutation.retryCount >= 3) {
          processedIds.push(mutation.id);
          console.error('Failed to sync mutation after 3 attempts:', mutation);
        }
      }
    }

    // Remove processed mutations
    const remaining = pendingMutations.filter(m => !processedIds.includes(m.id));
    localStorage.setItem('pendingMutations', JSON.stringify(remaining));
    pendingMutations.length = 0;
    pendingMutations.push(...remaining);
  };

  // Process queue when coming online
  window.addEventListener('online', () => {
    setTimeout(processQueue, 1000); // Small delay to ensure connection is stable
  });

  return {
    addToQueue,
    processQueue,
    getQueueLength: () => pendingMutations.length
  };
};

export default {
  queryErrorHandler,
  mutationErrorHandler,
  createQueryClientConfig,
  useQueryErrorHandler,
  networkAwareQueryConfig,
  createBackgroundSync
};
