// =====================================================
// MINIMAL APP.JS - WORKING BUILD
// =====================================================

import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Core components
import Layout from './components/Layout.js';
import CompactMobileNav from './components/UI/CompactMobileNav.js';
import UserDashboard from './pages/Dashboard/UserDashboard';
import ConsolidatedLogin from './pages/Auth/ConsolidatedLogin';
import Register from './pages/Auth/Register';
import GoogleOAuthSuccess from './pages/Auth/GoogleOAuthSuccess';
import GoogleOAuthError from './pages/Auth/GoogleOAuthError';
import GoogleOAuthLinkRequired from './pages/Auth/GoogleOAuthLinkRequired';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Admin components
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLayout from './components/Admin/AdminLayout';

// CA Firm components
import CAFirmAdminDashboard from './pages/Dashboard/CAFirmAdminDashboard';
import CAStaffDashboard from './pages/Dashboard/CAStaffDashboard';

// Context providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FilingProvider } from './contexts/FilingContext';

// Error boundaries
import ErrorBoundary from './components/ErrorBoundary';

// Styles
import './styles/GlobalStyles.css';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="app">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<ConsolidatedLogin variant="hybrid" showOAuth={true} />} />
          <Route path="/login/role" element={<ConsolidatedLogin variant="role-based" />} />
          <Route path="/login/manual" element={<ConsolidatedLogin variant="manual" />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/super" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/platform" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/firm/dashboard" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <CAFirmAdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ca/clients" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CAStaffDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Google OAuth Routes */}
          <Route path="/auth/google/success" element={<GoogleOAuthSuccess />} />
          <Route path="/auth/google/error" element={<GoogleOAuthError />} />
          <Route path="/auth/google/link-required" element={<GoogleOAuthLinkRequired />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Mobile Navigation */}
        <CompactMobileNav />
      </Router>
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FilingProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </FilingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;