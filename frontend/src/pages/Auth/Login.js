/**
 * Enterprise-Grade Role-Based Login Page
 * Single screen, no scrolling, role-specific login buttons
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Users, CheckCircle, TrendingUp, Clock,
  Crown, Building2, UserCheck, UserCog, User,
  LogIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

// Role definitions with icons, descriptions, and specific business flows
const ROLES = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    businessFlow: 'Platform oversight, system monitoring, CA firm approvals, escalations',
    useCase: 'Monitor platform health, approve CA firms, handle system escalations',
    icon: Crown,
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-red-600',
    credentials: { email: 'admin@burnblack.com', password: 'admin123' },
    dashboardRoute: '/dashboard/super-admin'
  },
  {
    id: 'platform_admin',
    name: 'Platform Administrator',
    description: 'Platform-wide administration with limited system access',
    businessFlow: 'Platform management, user oversight, compliance monitoring',
    useCase: 'Manage platform users, monitor compliance, handle platform-level issues',
    icon: Building2,
    color: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-purple-600',
    credentials: { email: 'platform@burnblack.com', password: 'admin123' },
    dashboardRoute: '/dashboard/platform-admin'
  },
  {
    id: 'ca_firm_admin',
    name: 'CA Firm Administrator',
    description: 'Firm-level administration with full firm access',
    businessFlow: 'Firm management, CA staff oversight, client portfolio management',
    useCase: 'Manage CA staff, oversee client portfolios, handle firm-level operations',
    icon: UserCog,
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-600',
    credentials: { email: 'ca@burnblack.com', password: 'admin123' },
    dashboardRoute: '/dashboard/ca-firm-admin'
  },
  {
    id: 'ca',
    name: 'Chartered Accountant',
    description: 'CA with client management and filing capabilities',
    businessFlow: 'Client filing, document review, tax computation, e-signature',
    useCase: 'File ITRs for clients, review documents, compute taxes, handle e-signatures',
    icon: UserCheck,
    color: 'bg-green-600 hover:bg-green-700',
    textColor: 'text-green-600',
    credentials: { email: 'chartered@burnblack.com', password: 'admin123' },
    dashboardRoute: '/dashboard/ca'
  },
  {
    id: 'user',
    name: 'End User',
    description: 'Regular user with basic filing capabilities',
    businessFlow: 'Self-filing, family management, document upload, refund tracking',
    useCase: 'File own ITR, manage family filings, track refunds, upload documents',
    icon: User,
    color: 'bg-primary-600 hover:bg-primary-700',
    textColor: 'text-primary-600',
    credentials: { email: 'user@burnblack.com', password: 'admin123' },
    dashboardRoute: '/dashboard/user'
  }
];

// Ultra-isolated Login component - compact and enterprise-grade
const Login = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingRole, setLoadingRole] = React.useState(null);

  const handleRoleLogin = async (role) => {
    setIsLoading(true);
    setLoadingRole(role.id);
    
    try {
      const response = await authService.login(
        role.credentials.email,
        role.credentials.password
      );

      toast.success(`Welcome back, ${response.user.full_name}! Redirecting to ${role.name} dashboard...`);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Navigate to generic dashboard (RoleBasedDashboard will handle role-specific routing)
      window.location.href = '/dashboard';

    } catch (error) {
      toast.error(`Login failed for ${role.name}: ${error.message || 'Please check your credentials.'}`);
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">BurnBlack</h1>
                <p className="text-neutral-600 text-sm">Enterprise Tax Platform</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Secure ITR Filing Made Simple
            </h2>
            <p className="text-neutral-600 text-lg mb-8">
              Experience the future of tax filing with AI-powered insights and maximum refund optimization.
            </p>
            
            {/* Trust Stats - Compact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="text-xl font-bold text-neutral-900">50K+</span>
                </div>
                <p className="text-sm text-neutral-600">Happy Users</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  <span className="text-xl font-bold text-neutral-900">₹2.5Cr+</span>
                </div>
                <p className="text-sm text-neutral-600">Refunds Processed</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                  <span className="text-xl font-bold text-neutral-900">99.9%</span>
                </div>
                <p className="text-sm text-neutral-600">Success Rate</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span className="text-xl font-bold text-neutral-900">24/7</span>
                </div>
                <p className="text-sm text-neutral-600">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Role-Based Login */}
        <div className="w-full max-w-2xl mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200">
            
            {/* Mobile Logo */}
            <div className="text-center mb-6 lg:hidden">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">BurnBlack</h1>
                  <p className="text-neutral-600 text-xs">Enterprise Tax Platform</p>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Choose Your Role
              </h2>
              <p className="text-neutral-600 text-sm">
                Select your role to access the appropriate dashboard
              </p>
            </div>

            {/* Role Selection Grid - Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                const isRoleLoading = loadingRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleLogin(role)}
                    disabled={isLoading}
                    className={`${role.color} text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-1.5 bg-white/20 rounded-md mb-1">
                        <IconComponent className="w-3 h-3" />
                      </div>
                      <h3 className="font-medium text-xs leading-tight">{role.name}</h3>
                      {isRoleLoading && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mt-1"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Manual Login Option */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-4">
                  Prefer to login manually?
                </p>
                <Link
                  to="/manual-login"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-medium text-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Manual Login
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-neutral-600">
                New to BurnBlack?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Security Badges */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Shield className="w-3 h-3" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <CheckCircle className="w-3 h-3" />
                <span>ERI Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;