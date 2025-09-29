import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

// Removed schema - using IsolatedLoginForm instead

// Completely isolated Login component to prevent re-renders
const Login = memo(() => {
  console.log('🔍 Login component rendering...');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  // Don't use useAuth hook to prevent re-renders
  const navigate = useNavigate();
  const location = useLocation();

  // Removed form-related code - using IsolatedLoginForm instead

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

  // Trust indicators - memoized to prevent re-renders
  const trustStats = useMemo(() => [
    { value: "50K+", label: "Happy Users", icon: Users },
    { value: "₹2.5Cr+", label: "Refunds Processed", icon: TrendingUp },
    { value: "99.9%", label: "Success Rate", icon: CheckCircle },
    { value: "24/7", label: "Support", icon: Clock }
  ], []);

  // Animation for feature carousel - optimized with useCallback
  const updateFeature = useCallback(() => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  }, [features.length]);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(updateFeature, 3000);
    return () => clearInterval(interval);
  }, [updateFeature]);

  // Removed old onSubmit - using IsolatedLoginForm instead

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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
        <div className="relative z-10 flex flex-col justify-center px-8 xl:px-12 py-12">
          {/* Logo & Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">BurnBlack</h1>
                <p className="text-primary-100 text-sm">Enterprise ITR Platform</p>
              </div>
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight">
              Secure ITR Filing
              <br />
              <span className="text-primary-200">Made Simple</span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              Experience the future of tax filing with AI-powered insights, 
              real-time validation, and maximum refund optimization.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 mb-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center text-white"
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  {React.createElement(features[currentFeature].icon, { 
                    className: "w-6 h-6" 
                  })}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{features[currentFeature].title}</h3>
                  <p className="text-primary-100 text-sm">{features[currentFeature].description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 pt-8 border-t border-white/20"
          >
            <p className="text-primary-200 text-sm mb-4">Trusted by thousands of users</p>
            <div className="grid grid-cols-2 gap-4">
              {trustStats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-primary-200 mr-2" />
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                  </div>
                  <div className="text-primary-200 text-xs">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-primary-300/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8 xl:px-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600 text-sm lg:text-base">
              Sign in to your BurnBlack account
            </p>
          </div>

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
              disabled={isLoading}
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
              <div className="w-full border-t border-neutral-200"></div>
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
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={isLocked}
                      className={`appearance-none relative block w-full pl-10 pr-3 py-3 border placeholder-neutral-400 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 ${
                        errors.email ? 'border-error-300' : 'border-neutral-300'
                      }`}
                      placeholder="Enter your email address"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <div className="mt-2 flex items-center text-error-600 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.email.message}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      disabled={isLocked}
                      className={`appearance-none relative block w-full pl-10 pr-10 py-3 border placeholder-neutral-400 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 ${
                        errors.password ? 'border-error-300' : 'border-neutral-300'
                      }`}
                      placeholder="Enter your password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-2 flex items-center text-error-600 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {errors.password.message}
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                {loginAttempts > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <EnterpriseAlert
                      variant="warning"
                      className="p-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5" />
                      <div className="flex-1">
                          <p className="text-sm font-medium text-warning-800">
                          {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}
                        </p>
                        {loginAttempts >= 3 && (
                            <p className="text-sm text-warning-700 mt-1">
                            Account will be locked after {5 - loginAttempts} more attempts
                          </p>
                        )}
                      </div>
                    </div>
                    </EnterpriseAlert>
                  </motion.div>
                )}

                {/* Options Row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <EnterpriseButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading || isLocked}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <EnterpriseSpinner size="sm" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </EnterpriseButton>
                </div>
              </form>
            </EnterpriseCard>
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
                Create account
              </Link>
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-success-400 rounded-full"></div>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-secondary-400 rounded-full"></div>
                <span>ERI Certified</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BurnBlack</h1>
              <p className="text-primary-100 text-sm">Enterprise ITR Platform</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
            Secure ITR Filing Made Simple
          </h2>
          <p className="text-primary-100 text-sm leading-relaxed">
            Experience the future of tax filing with AI-powered insights and maximum refund optimization.
          </p>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 px-6 py-8">
          <div className="max-w-sm mx-auto">
            {/* Mobile Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-neutral-600 text-sm">
                Sign in to your BurnBlack account
              </p>
              </div>

            {/* Mobile Form - Same as desktop but with mobile-optimized spacing */}
            <div className="space-y-6">
              {/* Gmail Login */}
              <EnterpriseCard className="bg-white border-neutral-200 p-4">
                <div className="text-center mb-3">
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                    Quick Login
                  </h3>
                  <p className="text-neutral-600 text-xs">
                    Sign in with Google
                  </p>
                </div>
                
                <EnterpriseButton
                  type="button"
                  disabled={isLoading}
                  variant="secondary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </EnterpriseButton>
                
                <div className="mt-3 text-center">
                  <p className="text-xs text-neutral-500">
                    Coming soon
                  </p>
                </div>
              </EnterpriseCard>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-neutral-50 text-neutral-500">Or continue with email</span>
                </div>
              </div>

              {/* Main Form */}
              <EnterpriseCard className="bg-white border-neutral-200 p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email-mobile" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-neutral-400" />
                      </div>
                      <input
                        id="email-mobile"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        disabled={isLocked}
                        className={`appearance-none relative block w-full pl-9 pr-3 py-2.5 border placeholder-neutral-400 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 ${
                          errors.email ? 'border-error-300' : 'border-neutral-300'
                        }`}
                        placeholder="Enter your email"
                        {...register('email')}
                      />
                    </div>
                    {errors.email && (
                      <div className="mt-1 flex items-center text-error-600 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password-mobile" className="block text-sm font-medium text-neutral-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-neutral-400" />
                      </div>
                      <input
                        id="password-mobile"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        disabled={isLocked}
                        className={`appearance-none relative block w-full pl-9 pr-8 py-2.5 border placeholder-neutral-400 text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-50 disabled:text-neutral-500 ${
                          errors.password ? 'border-error-300' : 'border-neutral-300'
                        }`}
                        placeholder="Enter your password"
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="mt-1 flex items-center text-error-600 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {errors.password.message}
                      </div>
                    )}
                  </div>

                  {/* Security Notice */}
                  {loginAttempts > 0 && (
                    <div className="bg-warning-50 border border-warning-200 rounded-lg p-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-warning-800">
                            {loginAttempts} failed attempt{loginAttempts > 1 ? 's' : ''}
                          </p>
                          {loginAttempts >= 3 && (
                            <p className="text-xs text-warning-700 mt-0.5">
                              Account will be locked after {5 - loginAttempts} more attempts
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options Row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center">
                      <input
                        id="remember-me-mobile"
                        name="remember-me"
                        type="checkbox"
                        className="h-3 w-3 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                      />
                      <label htmlFor="remember-me-mobile" className="ml-1.5 block text-xs text-neutral-700">
                        Remember me
                      </label>
                    </div>
                    <div className="text-xs">
                      <Link
                        to="/forgot-password"
                        className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
              </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <EnterpriseButton
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isLoading || isLocked}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <EnterpriseSpinner size="sm" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </EnterpriseButton>
                  </div>
                </form>
              </EnterpriseCard>

              {/* Mobile Footer */}
              <div className="text-center pt-2">
                <p className="text-xs text-neutral-600">
                  New to BurnBlack?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Create account
                  </Link>
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-success-400 rounded-full"></div>
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-secondary-400 rounded-full"></div>
                    <span>ERI Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent re-renders
  // Since Login component doesn't take props, this should always return true
  return true;
});

export default Login;