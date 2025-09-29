import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../../services/api';

const ApiTest = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    const results = {};

    try {
      // Test 1: Health Check
      try {
        const health = await api.healthCheck();
        results.health = { success: true, data: health };
      } catch (error) {
        results.health = { success: false, error: error.message };
      }

      // Test 2: User Services (if authenticated)
      if (isAuthenticated && token) {
        try {
          const services = await api.getUserServices();
          results.services = { success: true, data: services };
        } catch (error) {
          results.services = { success: false, error: error.message };
        }
      } else {
        results.services = { success: false, error: 'Not authenticated' };
      }

      // Test 3: User Profile (if authenticated)
      if (isAuthenticated && token) {
        try {
          const profile = await api.getUserProfile();
          results.profile = { success: true, data: profile };
        } catch (error) {
          results.profile = { success: false, error: error.message };
        }
      } else {
        results.profile = { success: false, error: 'Not authenticated' };
      }

    } catch (error) {
      results.general = { success: false, error: error.message };
    }

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
      
      <div className="mb-4">
        <p><strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
        <p><strong>User:</strong> {user?.name || 'None'}</p>
        <p><strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}</p>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Running tests...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} className="border rounded p-3">
              <h3 className="font-medium capitalize">{testName} Test</h3>
              <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? '✅ Success' : '❌ Failed'}
              </p>
              {result.error && (
                <p className="text-sm text-red-500 mt-1">{result.error}</p>
              )}
              {result.data && (
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={runTests}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Tests Again
      </button>
    </div>
  );
};

export default ApiTest;
