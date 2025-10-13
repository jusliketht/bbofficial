// =====================================================
// WELCOME MODAL - FIRST-TIME LOGIN EXPERIENCE
// Welcoming, personal, and incredibly simple onboarding
// =====================================================

import React, { useState, useEffect } from 'react';
import { X, Shield, Clock } from 'lucide-react';
import api from '../../services/api';

const WelcomeModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    panNumber: '',
    dateOfBirth: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [panValid, setPanValid] = useState(false);

  // PAN format validation
  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  // Real-time PAN validation
  useEffect(() => {
    if (formData.panNumber) {
      const isValid = validatePAN(formData.panNumber);
      setPanValid(isValid);
      setErrors(prev => ({
        ...prev,
        panNumber: isValid ? '' : 'Please enter a valid PAN number (e.g., ABCDE1234F)'
      }));
    }
  }, [formData.panNumber]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.panNumber) {
      newErrors.panNumber = 'PAN number is required';
    } else if (!validatePAN(formData.panNumber)) {
      newErrors.panNumber = 'Please enter a valid PAN number';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Save profile data and complete onboarding
      const response = await api.post('/api/auth/complete-onboarding', {
        panNumber: formData.panNumber.toUpperCase(),
        dateOfBirth: formData.dateOfBirth
      });

      if (response.data.success) {
        // Close modal and redirect to dashboard
        onClose();
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setErrors({
        general: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user?.fullName?.split(' ')[0] || 'there'}!
            </h2>
            <p className="text-gray-600">
              Let's get your profile started.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* PAN Number */}
          <div className="mb-6">
            <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
              PAN Card Number *
            </label>
            <input
              type="text"
              id="panNumber"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              placeholder="ABCDE1234F"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.panNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${panValid ? 'border-green-300 bg-green-50' : ''}`}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.panNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>
            )}
            {panValid && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Valid PAN format
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="mb-6">
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.dateOfBirth ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>

          {/* Reassurance Text */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Your information is secure
                </p>
                <p className="text-sm text-blue-700">
                  We need this to securely pre-fill your tax data from the ITD portal and save you time. 
                  Your information is always encrypted and protected.
                </p>
              </div>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !panValid || !formData.dateOfBirth}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Setting up your profile...
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Continue to Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;