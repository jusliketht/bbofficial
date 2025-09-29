import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { CheckCircle, User } from 'lucide-react';

const GoogleOAuthSuccess = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const userParam = searchParams.get('user');

    if (token && refreshToken && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Store tokens and user data
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update auth context immediately
        authContext.setUser(user);
        
        toast.success(`Welcome, ${user.fullName}! Google login successful.`);
        
                // Redirect to appropriate dashboard based on role
                const dashboardRoutes = {
                  'SUPER_ADMIN': '/admin/super',
                  'PLATFORM_ADMIN': '/admin/platform',
                  'CA_FIRM_ADMIN': '/firm/dashboard',
                  'CA': '/ca/clients',
                  'END_USER': '/dashboard'
                };
        
        const dashboardRoute = dashboardRoutes[user.role] || '/dashboard';
        
        console.log('Google OAuth redirect:', {
          user: user,
          role: user.role,
          dashboardRoute: dashboardRoute,
          tokenPresent: !!token,
          refreshTokenPresent: !!refreshToken
        });
        
        setTimeout(() => {
          console.log('Navigating to:', dashboardRoute);
          navigate(dashboardRoute, { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Error processing login. Please try again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } else {
      toast.error('Invalid login response. Please try again.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [searchParams, navigate, authContext]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Google Login Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            You have been successfully authenticated with Google. Redirecting to your dashboard...
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>Setting up your account</span>
          </div>
          
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthSuccess;
