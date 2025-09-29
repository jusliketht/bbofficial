/**
 * Isolated Login Page Component
 * This component is completely isolated from AuthContext to prevent re-renders
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, EyeOff, Lock, Mail, User, Building2, Shield, Crown, Users, 
  AlertTriangle, CheckCircle, Star, Award, TrendingUp, Clock, 
  Zap, Globe, Smartphone, Monitor, ArrowRight, Sparkles, 
  Heart, Target, Briefcase, Calculator, FileText, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoginAssistant from '../../components/LoginAssistant';
import IsolatedLoginForm from '../../components/IsolatedLoginForm';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseStatCard,
  EnterpriseInput,
  EnterpriseSpinner,
  EnterpriseAlert
} from '../../components/DesignSystem/EnterpriseComponents';

// Completely isolated Login component to prevent re-renders
const Login = memo(() => {
  console.log('🔍 Login component rendering...');
  
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Don't use useAuth hook to prevent re-renders
  const navigate = useNavigate();
  const location = useLocation();

  // Feature highlights for the left side - memoized to prevent re-renders
  const features = useMemo(() => [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "256-bit SSL encryption with multi-factor authentication",
      color: "text-success-600",
      bgColor: "bg-success-50"
    },
    {
      icon: Zap,
      title: "Lightning Fast Filing",
      description: "Complete your ITR in under 15 minutes with our smart prefill",
      color: "text-primary-600",
      bgColor: "bg-primary-50"
    },
    {
      icon: Target,
      title: "Maximum Refunds",
      description: "AI-powered deduction optimization to maximize your tax savings",
      color: "text-warning-600",
      bgColor: "bg-warning-50"
    },
    {
      icon: Award,
      title: "CA-Grade Accuracy",
      description: "99.9% accuracy rate with professional-grade validation",
      color: "text-secondary-600",
      bgColor: "bg-secondary-50"
    }
  ], []);

  // Trust stats - memoized to prevent re-renders
  const trustStats = useMemo(() => [
    { value: "50K+", label: "Happy Users", icon: Users },
    { value: "₹2.5Cr+", label: "Refunds Processed", icon: TrendingUp },
    { value: "99.9%", label: "Success Rate", icon: CheckCircle },
    { value: "24/7", label: "Support", icon: Clock }
  ], []);

  // Optimized feature carousel
  const updateFeature = useCallback(() => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  }, [features.length]);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(updateFeature, 3000);
    return () => clearInterval(interval);
  }, [updateFeature]);

  const handleLoginSuccess = useCallback((response) => {
    console.log('🔑 Login success handler called:', response);
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    
    // Navigate to appropriate dashboard
    const dashboardRoute = response.dashboardRoute;
    const from = location.state?.from?.pathname || dashboardRoute || '/dashboard';
    navigate(from, { replace: true });
    
    // Reload the page to trigger auth context update
    window.location.reload();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">BurnBlack</h1>
                <p className="text-white/80 text-sm">Enterprise Tax Platform</p>
              </div>
            </div>
          </motion.div>

          {/* Feature Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className={`p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${features[currentFeature].bgColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-white/20 ${features[currentFeature].color}`}>
                    {React.createElement(features[currentFeature].icon, { className: "w-6 h-6" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{features[currentFeature].title}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">{features[currentFeature].description}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {trustStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-5 h-5 text-white/80 mr-2" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-primary-300/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8 xl:px-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 lg:hidden"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">BurnBlack</h1>
                <p className="text-neutral-600 text-sm">Enterprise Tax Platform</p>
              </div>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600 text-sm lg:text-base">
              Sign in to your BurnBlack account
            </p>
          </motion.div>

          {/* Gmail Login Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <EnterpriseCard className="bg-white border-neutral-200 p-4">
              <div className="text-center mb-3">
                <h3 className="text-base font-semibold text-neutral-900 mb-1">
                  Quick Login
                </h3>
                <p className="text-neutral-600 text-xs">
                  Sign in with Google for faster access
                </p>
              </div>
              
              <EnterpriseButton
                type="button"
                variant="secondary"
                size="md"
                className="w-full flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </EnterpriseButton>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-neutral-500">
                  Coming soon - Currently in development
                </p>
              </div>
            </EnterpriseCard>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">Or continue with email</span>
            </div>
          </motion.div>

          {/* Main Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <IsolatedLoginForm onLoginSuccess={handleLoginSuccess} />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center pt-6"
          >
            <p className="text-sm text-neutral-600">
              New to BurnBlack?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Create an account
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-500">
              <Link to="/privacy" className="hover:text-neutral-700 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-neutral-700 transition-colors">
                Terms of Service
              </Link>
              <Link to="/help" className="hover:text-neutral-700 transition-colors">
                Help Center
              </Link>
            </div>
          </motion.div>

          {/* Security Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <CheckCircle className="w-4 h-4" />
              <span>ERI Certified</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders
  // Since Login component doesn't take props, this should always return true
  return true;
});

Login.displayName = 'Login';

export default Login;
