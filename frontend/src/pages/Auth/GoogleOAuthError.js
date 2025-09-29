import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const GoogleOAuthError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      toast.error(`Google login failed: ${decodeURIComponent(message)}`);
    } else {
      toast.error('Google login failed. Please try again.');
    }
  }, [searchParams]);

  const handleRetry = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Google Login Failed
          </h1>
          
          <p className="text-gray-600 mb-6">
            There was an error during Google authentication. This could be due to:
          </p>
          
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
            <li>• Google OAuth configuration issues</li>
            <li>• Network connectivity problems</li>
            <li>• User cancelled the authentication</li>
            <li>• Invalid or expired credentials</li>
          </ul>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthError;
