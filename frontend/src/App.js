// =====================================================
// MAIN APP COMPONENT - CLEAN ROUTE STRUCTURE
// Minimal routes for User Onboarding and ITR Detection
// =====================================================

import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core components (keep synchronous - needed immediately)
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Styles (keep synchronous)
import './styles/GlobalStyles.css';

// Simple loading component
const RouteLoader = ({ message = 'Loading...' }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <p>{message}</p>
  </div>
);

// Lazy load all route components for code splitting
// Public routes
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const HomeRedirect = lazy(() => import('./pages/HomeRedirect'));

// Auth components
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage'));
const MobileOTPSignup = lazy(() => import('./pages/Auth/MobileOTPSignup'));
const EmailVerification = lazy(() => import('./pages/Auth/EmailVerification'));
const MobileVerification = lazy(() => import('./pages/Auth/MobileVerification'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const GoogleOAuthSuccess = lazy(() => import('./pages/Auth/GoogleOAuthSuccess'));
const GoogleOAuthError = lazy(() => import('./pages/Auth/GoogleOAuthError'));
const GoogleOAuthLinkRequired = lazy(() => import('./pages/Auth/GoogleOAuthLinkRequired'));

// Admin components (minimal)
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const GSTINLookupPage = lazy(() => import('./pages/Admin/GSTINLookupPage'));

// User pages
const UserDashboard = lazy(() => import('./pages/Dashboard/UserDashboard'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));

// ITR Determination
const ITRDeterminationWizard = lazy(() => import('./pages/Filing/ITRDetermination/ITRDeterminationWizard'));
const PANVerification = lazy(() => import('./pages/ITR/PANVerification'));
const ITRDetermination = lazy(() => import('./pages/ITR/ITRDetermination'));
const IncomeSourcesSelection = lazy(() => import('./pages/ITR/IncomeSourcesSelection'));
const ITR3EntryCeremony = lazy(() => import('./pages/ITR/ITR3EntryCeremony'));

// Legal pages
const TermsPage = lazy(() => import('./pages/Legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/Legal/PrivacyPage'));

// Main App Component
const AppContent = () => {
  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteLoader message="Loading landing page..." />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteLoader message="Loading login..." />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<RouteLoader message="Loading signup..." />}>
              <SignupPage />
            </Suspense>
          }
        />
        <Route
          path="/signup/mobile"
          element={
            <Suspense fallback={<RouteLoader message="Loading mobile signup..." />}>
              <MobileOTPSignup />
            </Suspense>
          }
        />
        <Route
          path="/email-verification"
          element={
            <Suspense fallback={<RouteLoader message="Loading email verification..." />}>
              <EmailVerification />
            </Suspense>
          }
        />
        <Route
          path="/mobile-verification"
          element={
            <Suspense fallback={<RouteLoader message="Loading mobile verification..." />}>
              <MobileVerification />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<RouteLoader message="Loading forgot password..." />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<RouteLoader message="Loading reset password..." />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route
          path="/auth/google/success"
          element={
            <Suspense fallback={<RouteLoader message="Processing authentication..." />}>
              <GoogleOAuthSuccess />
            </Suspense>
          }
        />
        <Route
          path="/auth/google/error"
          element={
            <Suspense fallback={<RouteLoader message="Loading authentication error..." />}>
              <GoogleOAuthError />
            </Suspense>
          }
        />
        <Route
          path="/auth/google/link-required"
          element={
            <Suspense fallback={<RouteLoader message="Loading account linking..." />}>
              <GoogleOAuthLinkRequired />
            </Suspense>
          }
        />
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<RouteLoader message="Loading admin login..." />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<RouteLoader message="Loading terms..." />}>
              <TermsPage />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<RouteLoader message="Loading privacy policy..." />}>
              <PrivacyPage />
            </Suspense>
          }
        />

        {/* GSTIN Lookup Route - PUBLIC for testing */}
        <Route
          path="/gstin-lookup"
          element={
            <Suspense fallback={<RouteLoader message="Loading GSTIN lookup..." />}>
              <GSTINLookupPage />
            </Suspense>
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Smart redirector - determines correct dashboard based on role */}
          <Route
            path="/home"
            element={
              <Suspense fallback={<RouteLoader message="Redirecting..." />}>
                <HomeRedirect />
              </Suspense>
            }
          />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading dashboard..." />}>
                  <UserDashboard />
                </Suspense>
              </Layout>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading profile..." />}>
                  <ProfilePage />
                </Suspense>
              </Layout>
            }
          />

          {/* ITR Determination Flow */}
          <Route
            path="/filing/start"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading filing wizard..." />}>
                  <ITRDeterminationWizard />
                </Suspense>
              </Layout>
            }
          />
          <Route
            path="/itr/verify-identity"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading PAN verification..." />}>
                  <PANVerification />
                </Suspense>
              </Layout>
            }
          />
          <Route
            path="/itr/determination"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading ITR determination..." />}>
                  <ITRDetermination />
                </Suspense>
              </Layout>
            }
          />
          <Route
            path="/itr/confirm-sources"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading income sources..." />}>
                  <IncomeSourcesSelection />
                </Suspense>
              </Layout>
            }
          />
          <Route
            path="/itr/start"
            element={
              <Layout>
                <Suspense fallback={<RouteLoader message="Loading ITR ceremony..." />}>
                  <ITR3EntryCeremony />
                </Suspense>
              </Layout>
            }
          />
        </Route>

        {/* Catch all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Root App Component
const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
