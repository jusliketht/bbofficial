// =====================================================
// PERSONAL INFO FORM COMPONENT
// For all ITR forms - Personal information input
// =====================================================

import React, { useState } from 'react';

const PersonalInfoForm = ({ data, onUpdate }) => {
  const [errors, setErrors] = useState({});

  const validatePAN = (pan) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) {
      return 'PAN is required';
    }
    if (!panPattern.test(pan)) {
      return 'Invalid PAN format. Format: ABCDE1234F';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return 'Invalid email format';
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone) {
      return null; // Optional
    }
    if (phone.length !== 10) {
      return 'Phone number must be 10 digits';
    }
    if (!/^\d+$/.test(phone)) {
      return 'Phone number must contain only digits';
    }
    return null;
  };

  const validatePincode = (pincode) => {
    if (!pincode) {
      return null; // Optional
    }
    if (pincode.length !== 6) {
      return 'Pincode must be 6 digits';
    }
    if (!/^\d+$/.test(pincode)) {
      return 'Pincode must contain only digits';
    }
    return null;
  };

  const handleChange = (field, value) => {
    const newErrors = { ...errors };
    let validatedValue = value;

    // Uppercase PAN
    if (field === 'pan') {
      validatedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      const error = validatePAN(validatedValue);
      if (error) {
        newErrors.pan = error;
      } else {
        delete newErrors.pan;
      }
    }

    // Validate email
    if (field === 'email') {
      const error = validateEmail(value);
      if (error) {
        newErrors.email = error;
      } else {
        delete newErrors.email;
      }
    }

    // Validate phone
    if (field === 'phone') {
      validatedValue = value.replace(/\D/g, '').slice(0, 10);
      const error = validatePhone(validatedValue);
      if (error) {
        newErrors.phone = error;
      } else {
        delete newErrors.phone;
      }
    }

    // Validate pincode
    if (field === 'pincode') {
      validatedValue = value.replace(/\D/g, '').slice(0, 6);
      const error = validatePincode(validatedValue);
      if (error) {
        newErrors.pincode = error;
      } else {
        delete newErrors.pincode;
      }
    }

    setErrors(newErrors);
    onUpdate({ [field]: validatedValue || value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data?.pan || ''}
            onChange={(e) => handleChange('pan', e.target.value)}
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.pan
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            placeholder="ABCDE1234F"
          />
          {errors.pan && (
            <p className="mt-1 text-sm text-red-600">{errors.pan}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={data?.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.dateOfBirth
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={data?.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            placeholder="9876543210"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data?.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={data?.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={data?.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={data?.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
          <input
            type="text"
            value={data?.pincode || ''}
            onChange={(e) => handleChange('pincode', e.target.value)}
            maxLength={6}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.pincode
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-orange-500'
            }`}
            placeholder="123456"
          />
          {errors.pincode && (
            <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;

