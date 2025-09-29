import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, 
  Users, 
  Building2, 
  Shield, 
  User, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Lock,
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

// Test user configurations based on actual database users
const TEST_USERS = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    email: 'admin@burnblack.com',
    password: 'password123',
    role: 'super_admin',
    description: 'Full platform control & analytics',
    icon: Crown,
    color: 'bg-purple-500',
    permissions: ['platform_management', 'user_management', 'analytics', 'compliance']
  },
  {
    id: 'ca_firm_admin',
    name: 'CA Firm Admin',
    email: 'firmadmin@burnblack.com',
    password: 'password123',
    role: 'ca_firm_admin',
    description: 'CA firm management & operations',
    icon: Building2,
    color: 'bg-blue-500',
    permissions: ['firm_management', 'staff_management', 'client_management']
  },
  {
    id: 'ca',
    name: 'CA Professional',
    email: 'ca@burnblack.com',
    password: 'password123',
    role: 'CA',
    description: 'CA professional tools & filings',
    icon: Shield,
    color: 'bg-green-500',
    permissions: ['client_filings', 'document_review', 'tax_calculation']
  },
  {
    id: 'client_user',
    name: 'Client User',
    email: 'client@burnblack.com',
    password: 'password123',
    role: 'user',
    description: 'CA-assisted user with tenant',
    icon: User,
    color: 'bg-indigo-500',
    permissions: ['self_filing', 'document_upload', 'tax_calculation', 'ca_assistance']
  },
  {
    id: 'regular_user',
    name: 'Regular User',
    email: 'newuser2@burnblack.com',
    password: 'password123',
    role: 'user',
    description: 'Standard user access & filing',
    icon: User,
    color: 'bg-gray-500',
    permissions: ['self_filing', 'document_upload', 'tax_calculation']
  }
];

const LoginAssistant = ({ onUserSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleUserSelect = async (user) => {
    setIsLoading(true);
    try {
      console.log('🔑 Login Assistant: Auto-login for', user.email);
      
      const response = await login(user.email, user.password);

      console.log('🔑 Login Assistant: Auto-login successful', response);

      // Use the dashboard route from the login response, fallback to intended route or default
      const dashboardRoute = response.dashboardRoute;
      const from = location.state?.from?.pathname || dashboardRoute || '/dashboard';

      toast.success(`Welcome back, ${user.name}! Redirecting to ${user.role} dashboard...`);

      // Add a small delay to ensure state is properly set
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);

    } catch (error) {
      console.error('🔑 Login Assistant: Auto-login failed', error);
      toast.error(error.message || 'Auto-login failed. Please try manual login.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'ca_firm_admin': return 'bg-blue-100 text-blue-800';
      case 'CA': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="backdrop-blur-sm bg-white/90 rounded-2xl shadow-xl border border-white/30 p-6 mb-6">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900">Login Assistant</h3>
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            DEV ONLY
          </div>
        </div>
        <p className="text-gray-600 text-sm">Quick login with test accounts for development</p>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-700">Select Test Account</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Test User Cards */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {TEST_USERS.map((user) => {
            const IconComponent = user.icon;
            return (
              <div
                key={user.id}
                onClick={() => !isLoading && handleUserSelect(user)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-blue-300 hover:scale-[1.02]'
                } ${
                  user.color === 'bg-purple-500' ? 'border-purple-200 bg-purple-50' :
                  user.color === 'bg-blue-500' ? 'border-blue-200 bg-blue-50' :
                  user.color === 'bg-green-500' ? 'border-green-200 bg-green-50' :
                  user.color === 'bg-indigo-500' ? 'border-indigo-200 bg-indigo-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${user.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{user.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{user.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Password:</div>
                    <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {user.password}
                    </div>
                  </div>
                </div>
                
                {/* Permissions */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 3).map((permission, index) => (
                      <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {user.permissions.length > 3 && (
                      <span className="text-xs text-gray-400 px-2 py-1">
                        +{user.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-blue-700 font-medium">Logging in...</span>
          </div>
        </div>
      )}

      {/* Warning Notice */}
      <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-xs font-medium text-red-800">Development Only</p>
            <p className="text-xs text-red-700 mt-1">
              This login assistant will be removed in production. Use only for testing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAssistant;
