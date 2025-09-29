import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Crown, Building2, UserCog, UserCheck, User, 
  Eye, EyeOff, Mail, Lock, ArrowRight, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import enterpriseDebugger from '../../services/EnterpriseDebugger';

// Role configuration with enterprise branding
const ROLES = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'System-wide access and platform oversight',
    icon: Crown,
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-red-600',
    credentials: { email: 'admin@burnblack.com', password: 'admin123' },
    dashboardRoute: '/admin/super'
  },
  {
    id: 'platform_admin',
    name: 'Platform Administrator', 
    description: 'Platform operations and user management',
    icon: Building2,
    color: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-purple-600',
    credentials: { email: 'platform@burnblack.com', password: 'admin123' },
    dashboardRoute: '/admin/platform'
  },
  {
    id: 'ca_firm_admin',
    name: 'CA Firm Administrator',
    description: 'Firm management and staff oversight',
    icon: UserCog,
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-600',
    credentials: { email: 'ca@burnblack.com', password: 'admin123' },
    dashboardRoute: '/firm/dashboard'
  },
  {
    id: 'ca',
    name: 'Chartered Accountant',
    description: 'Professional tax filing and client services',
    icon: UserCheck,
    color: 'bg-green-600 hover:bg-green-700',
    textColor: 'text-green-600',
    credentials: { email: 'chartered@burnblack.com', password: 'admin123' },
    dashboardRoute: '/ca/clients'
  },
  {
    id: 'user',
    name: 'End User',
    description: 'Personal tax filing and family management',
    icon: User,
    color: 'bg-primary-600 hover:bg-primary-700',
    textColor: 'text-primary-600',
    credentials: { email: 'user@burnblack.com', password: 'admin123' },
    dashboardRoute: '/dashboard'
  }
];

const ConsolidatedLogin = ({ 
  variant = 'role-based', // 'role-based' | 'manual' | 'hybrid'
  defaultRole = null,
  showOAuth = false,
  onSuccess = () => {}
}) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // UI State
  const [activeVariant, setActiveVariant] = useState(variant);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: defaultRole || 'user'
  });

  // Handle role-based login
  const handleRoleLogin = useCallback(async (role) => {
    setIsLoading(true);
    setLoadingRole(role.id);
    
    try {
      enterpriseDebugger.info('ConsolidatedLogin', 'Role-based login attempt', {
        roleId: role.id,
        roleName: role.name
      });
      
      const response = await login({
        email: role.credentials.email,
        password: role.credentials.password
      });
      
      toast.success(`Welcome back, ${response.user.full_name}! Redirecting to ${role.name} dashboard...`);
      
      // Call success callback
      onSuccess(response.user, role);
      
      // Navigate to role-specific dashboard
      setTimeout(() => {
        navigate(role.dashboardRoute);
      }, 1500);
      
    } catch (error) {
      enterpriseDebugger.error('ConsolidatedLogin', 'Role-based login failed', {
        roleId: role.id,
        error: error.message
      });
      
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  }, [login, navigate, onSuccess]);

  // Handle manual login
  const handleManualLogin = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      enterpriseDebugger.info('ConsolidatedLogin', 'Manual login attempt', {
        email: formData.email,
        role: formData.role
      });
      
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      toast.success(`Welcome back, ${response.user.full_name}!`);
      
      // Call success callback
      onSuccess(response.user, { id: response.user.role });
      
      // Navigate based on user role
      const userRole = ROLES.find(r => r.id === response.user.role);
      const dashboardRoute = userRole?.dashboardRoute || '/dashboard';
      
      setTimeout(() => {
        navigate(dashboardRoute);
      }, 1500);
      
    } catch (error) {
      enterpriseDebugger.error('ConsolidatedLogin', 'Manual login failed', {
        email: formData.email,
        error: error.message
      });
      
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, login, navigate, onSuccess]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Quick fill credentials for testing
  const handleQuickFill = useCallback((role) => {
    setFormData({
      email: role.credentials.email,
      password: role.credentials.password,
      role: role.id
    });
  }, []);

  // Render role-based login buttons
  const renderRoleButtons = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Role
        </h2>
        <p className="text-gray-600">
          Select your role to access the appropriate dashboard
        </p>
      </div>
      
      {ROLES.map((role) => {
        const Icon = role.icon;
        const isLoadingThisRole = loadingRole === role.id;
        
        return (
          <button
            key={role.id}
            onClick={() => handleRoleLogin(role)}
            disabled={isLoading}
            className={`
              w-full p-4 rounded-lg border-2 border-transparent
              ${role.color} text-white
              hover:scale-[1.02] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:scale-100
              flex items-center justify-between
            `}
          >
            <div className="flex items-center space-x-3">
              <Icon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">{role.name}</div>
                <div className="text-sm opacity-90">{role.description}</div>
              </div>
            </div>
            
            {isLoadingThisRole ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        );
      })}
    </div>
  );

  // Render manual login form
  const renderManualForm = () => (
    <form onSubmit={handleManualLogin} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sign In to BurnBlack
        </h2>
        <p className="text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your email"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {ROLES.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Sign In</span>
          </>
        )}
      </button>

      {/* Quick Fill Buttons for Testing */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center mb-3">
          Quick fill for testing:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.slice(0, 4).map(role => (
            <button
              key={role.id}
              type="button"
              onClick={() => handleQuickFill(role)}
              className={`text-xs p-2 rounded border-2 transition-colors ${role.textColor} border-current bg-opacity-10 hover:bg-opacity-20`}
            >
              {role.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </form>
  );

  // Render variant switcher
  const renderVariantSwitcher = () => (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-100 rounded-lg p-1 flex">
        <button
          onClick={() => setActiveVariant('role-based')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeVariant === 'role-based'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Role-Based
        </button>
        <button
          onClick={() => setActiveVariant('manual')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeVariant === 'manual'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manual Login
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">BurnBlack</h1>
            <p className="text-gray-600">Enterprise Tax Platform</p>
          </div>

          {/* Variant Switcher for Hybrid Mode */}
          {variant === 'hybrid' && renderVariantSwitcher()}

          {/* Content based on variant */}
          {(variant === 'role-based' || (variant === 'hybrid' && activeVariant === 'role-based')) && renderRoleButtons()}
          {(variant === 'manual' || (variant === 'hybrid' && activeVariant === 'manual')) && renderManualForm()}

          {/* OAuth Section (if enabled) */}
          {showOAuth && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">
                Or continue with
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = 'http://localhost:3002/api/auth/google'}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Need help? <a href="/support" className="text-primary-600 hover:text-primary-700">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedLogin;
