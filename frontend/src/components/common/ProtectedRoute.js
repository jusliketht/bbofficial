import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading, _hasHydrated, getAuthState, forceHydrationComplete } = useAuthStore();
  const location = useLocation();
  const [hydrationTimeout, setHydrationTimeout] = useState(false);

  // Enterprise-grade debugging
  useEffect(() => {
    console.log('🛡️ ProtectedRoute: Authentication check', {
      isAuthenticated,
      user: user?.name,
      role: user?.role,
      currentPath: location.pathname,
      isLoading,
      _hasHydrated,
      hydrationTimeout
    });
    
    // Get detailed auth state
    if (getAuthState) {
      getAuthState();
    }
  }, [isAuthenticated, user, location.pathname, isLoading, _hasHydrated, getAuthState, hydrationTimeout]);

  // Fallback timeout for hydration - if it takes more than 3 seconds, proceed anyway
  useEffect(() => {
    if (!_hasHydrated && !hydrationTimeout) {
      const timeout = setTimeout(() => {
        console.log('🛡️ ProtectedRoute: Hydration timeout, forcing completion');
        if (forceHydrationComplete) {
          forceHydrationComplete();
        }
        setHydrationTimeout(true);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [_hasHydrated, hydrationTimeout, forceHydrationComplete]);

  // Wait for hydration to complete before making authentication decisions
  if ((!_hasHydrated && !hydrationTimeout) || isLoading) {
    console.log('🛡️ ProtectedRoute: Waiting for hydration/loading, showing loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🛡️ ProtectedRoute: Not authenticated, redirecting to login');
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🛡️ ProtectedRoute: Authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
