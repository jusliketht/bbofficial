import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Role-based route component
const RoleBasedRoute = ({ children, allowedRoles, fallbackPath = '/' }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has any of the allowed roles
  const hasPermission = allowedRoles.some(role => 
    user.roles && user.roles.includes(role)
  );
  
  if (!hasPermission) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return children;
};

// Specific role route components
export const AdminRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['admin', 'super_admin']} fallbackPath="/dashboard">
    {children}
  </RoleBasedRoute>
);

export const CARoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['ca', 'senior_ca', 'admin', 'super_admin']} fallbackPath="/dashboard">
    {children}
  </RoleBasedRoute>
);

export const UserRoute = ({ children }) => (
  <RoleBasedRoute allowedRoles={['user', 'ca', 'senior_ca', 'admin', 'super_admin']} fallbackPath="/login">
    {children}
  </RoleBasedRoute>
);

export default RoleBasedRoute;
