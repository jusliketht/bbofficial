// =====================================================
// PERSONAL INFO FORM COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { Button } from '../Common/Button';
import { Card } from '../Common/Card';
import Tooltip from '../Common/Tooltip';
import { enterpriseLogger } from '../../utils/logger';

const PersonalInfoForm = ({ data = {}, onChange, onNext, onPrevious, isFirstStep = true, isLastStep = false }) => {
  const [formData, setFormData] = useState({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    fullName: data.fullName || '',
    panNumber: data.panNumber || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || '',
    maritalStatus: data.maritalStatus || '',
    fatherName: data.fatherName || '',
    motherName: data.motherName || '',
    spouseName: data.spouseName || '',
    address: {
      residential: data.address?.residential || '',
      permanent: data.address?.permanent || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      pincode: data.address?.pincode || '',
      country: data.address?.country || 'India'
    },
    contact: {
      phone: data.contact?.phone || '',
      email: data.contact?.email || '',
      alternatePhone: data.contact?.alternatePhone || ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';

    // Format validations
    if (formData.panNumber && !validatePAN(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    if (formData.contact.phone && !validatePhone(formData.contact.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits starting with 6-9)';
    }

    if (formData.contact.email && !validateEmail(formData.contact.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Age validation
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'Must be 18 years or older to file ITR';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleNext = async () => {
    setIsValidating(true);
    const isValid = validateForm();
    
    if (isValid) {
      enterpriseLogger.info('Personal info form validated successfully');
      onNext && onNext();
    } else {
      enterpriseLogger.warn('Personal info form validation failed', { errors });
    }
    setIsValidating(false);
  };

  const handlePrevious = () => {
    onPrevious && onPrevious();
  };

  return (
    <div className="personal-info-form">
      <Card className="form-card">
        <div className="form-header">
          <h2>Personal Information</h2>
          <p>Please provide your personal details for ITR filing</p>
        </div>

        <div className="form-content">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  First Name *
                  <Tooltip content="Enter your first name as per PAN card">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last Name *
                  <Tooltip content="Enter your last name as per PAN card">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="panNumber">
                PAN Number *
                <Tooltip content="10-character alphanumeric PAN (e.g., ABCDE1234F)">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                className={errors.panNumber ? 'error' : ''}
                placeholder="ABCDE1234F"
                maxLength="10"
              />
              {errors.panNumber && <span className="error-message">{errors.panNumber}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">
                  Date of Birth *
                  <Tooltip content="Date of birth as per PAN card">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Gender *
                  <Tooltip content="Select your gender">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-message">{errors.gender}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="maritalStatus">
                Marital Status *
                <Tooltip content="Your marital status as on March 31st of the assessment year">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                className={errors.maritalStatus ? 'error' : ''}
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widow">Widow/Widower</option>
                <option value="divorced">Divorced</option>
              </select>
              {errors.maritalStatus && <span className="error-message">{errors.maritalStatus}</span>}
            </div>
          </div>

          {/* Family Information */}
          <div className="form-section">
            <h3>Family Information</h3>
            
            <div className="form-group">
              <label htmlFor="fatherName">
                Father's Name
                <Tooltip content="Father's name as per PAN card">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="fatherName"
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                placeholder="Enter father's name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="motherName">
                Mother's Name
                <Tooltip content="Mother's name as per PAN card">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="motherName"
                type="text"
                value={formData.motherName}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
                placeholder="Enter mother's name"
              />
            </div>

            {formData.maritalStatus === 'married' && (
              <div className="form-group">
                <label htmlFor="spouseName">
                  Spouse's Name
                  <Tooltip content="Spouse's name (required if married)">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <input
                  id="spouseName"
                  type="text"
                  value={formData.spouseName}
                  onChange={(e) => handleInputChange('spouseName', e.target.value)}
                  placeholder="Enter spouse's name"
                />
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number *
                <Tooltip content="10-digit mobile number">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => handleNestedInputChange('contact', 'phone', e.target.value)}
                className={errors.phone ? 'error' : ''}
                placeholder="9876543210"
                maxLength="10"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address *
                <Tooltip content="Valid email address for communication">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="email"
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleNestedInputChange('contact', 'email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="alternatePhone">
                Alternate Phone
                <Tooltip content="Optional alternate contact number">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="alternatePhone"
                type="tel"
                value={formData.contact.alternatePhone}
                onChange={(e) => handleNestedInputChange('contact', 'alternatePhone', e.target.value)}
                placeholder="9876543210"
                maxLength="10"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section">
            <h3>Address Information</h3>
            
            <div className="form-group">
              <label htmlFor="residentialAddress">
                Residential Address *
                <Tooltip content="Complete residential address">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <textarea
                id="residentialAddress"
                value={formData.address.residential}
                onChange={(e) => handleNestedInputChange('address', 'residential', e.target.value)}
                placeholder="Enter your complete residential address"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">
                  City *
                  <Tooltip content="City of residence">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State *
                  <Tooltip content="State of residence">
                    <span className="help-icon">?</span>
                  </Tooltip>
                </label>
                <input
                  id="state"
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">
                PIN Code *
                <Tooltip content="6-digit postal code">
                  <span className="help-icon">?</span>
                </Tooltip>
              </label>
              <input
                id="pincode"
                type="text"
                value={formData.address.pincode}
                onChange={(e) => handleNestedInputChange('address', 'pincode', e.target.value)}
                placeholder="123456"
                maxLength="6"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          {!isFirstStep && (
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={isValidating}
            >
              Previous
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isValidating}
            loading={isValidating}
          >
            {isLastStep ? 'Review & Submit' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PersonalInfoForm;
