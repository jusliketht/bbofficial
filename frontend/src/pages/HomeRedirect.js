/**
 * HomeRedirect Component - Smart Role-Based Routing
 * Determines the correct dashboard based on user role
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomeRedirect = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Determining your dashboard...</p>
        </div>
      </div>
    );
  }

  // This case should theoretically not be hit if it's a protected route,
  // but it's good practice to handle it.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // THE CORE LOGIC - Role-based redirection
  switch (user.role) {
    case 'SUPER_ADMIN':
    case 'PLATFORM_ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    
    case 'CA_FIRM_ADMIN':
      return <Navigate to="/firm/dashboard" replace />;
      
    case 'CA':
      return <Navigate to="/ca/clients" replace />;
      
    case 'END_USER':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export default HomeRedirect;
