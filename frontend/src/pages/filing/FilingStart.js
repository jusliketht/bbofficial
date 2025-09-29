// =====================================================
// FILING START PAGE
// Start new ITR filing process
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  FileText, 
  User, 
  Calendar, 
  ArrowRight,
  CheckCircle,
  Info,
  AlertCircle
} from 'lucide-react';

const FilingStart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedITRType, setSelectedITRType] = useState('');
  const [assessmentYear, setAssessmentYear] = useState('2024-25');

  // Fetch available ITR types from API
  const { data: itrTypesData } = useQuery({
    queryKey: ['itrTypes'],
    queryFn: async () => {
      const response = await api.get('/api/itr/types');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const itrTypes = itrTypesData?.types || [];

  const handleStartFiling = () => {
    if (!selectedITRType) {
      alert('Please select an ITR type');
      return;
    }
    
    // Navigate to the appropriate filing flow
    navigate(`/filing/${selectedITRType}/${assessmentYear}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Start New ITR Filing</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Select ITR Type</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Fill Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Review & Submit</span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Assessment Year Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Year</h3>
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={assessmentYear}
              onChange={(e) => setAssessmentYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
        </div>

        {/* ITR Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select ITR Type</h3>
          <p className="text-sm text-gray-600 mb-6">
            Choose the appropriate ITR form based on your income sources and financial situation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {itrTypes.map((itr) => (
              <div
                key={itr.id}
                onClick={() => setSelectedITRType(itr.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedITRType === itr.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedITRType === itr.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedITRType === itr.id && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{itr.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{itr.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Important Information</h4>
              <ul className="text-sm text-blue-800 mt-2 space-y-1">
                <li>• Ensure you have all required documents ready</li>
                <li>• Verify your PAN details before proceeding</li>
                <li>• You can save your progress and continue later</li>
                <li>• All information will be validated before submission</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleStartFiling}
            disabled={!selectedITRType}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>Start Filing</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default FilingStart;
