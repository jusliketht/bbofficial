// =====================================================
// INLINE MEMBER FORM COMPONENT
// Reusable inline form for adding/editing family members
// =====================================================

import React, { useState } from 'react';
import { X, Save, Loader } from 'lucide-react';
import memberService from '../../services/memberService';
import PANVerificationInline from '../ITR/PANVerificationInline';
import toast from 'react-hot-toast';

const MemberFormInline = ({ onSuccess, onCancel, editingMember = null, compact = false }) => {
  const [formData, setFormData] = useState({
    firstName: editingMember?.firstName || '',
    lastName: editingMember?.lastName || '',
    panNumber: editingMember?.panNumber || '',
    dateOfBirth: editingMember?.dateOfBirth || '',
    relationship: editingMember?.relationship || '',
    phoneNumber: editingMember?.phoneNumber || '',
    email: editingMember?.email || '',
    panVerified: editingMember?.panVerified || false,
    panVerifiedAt: editingMember?.panVerifiedAt || null,
  });
  const [showPANVerification, setShowPANVerification] = useState(false);
  const [panVerificationResult, setPanVerificationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Reset PAN verification if PAN number changes
    if (name === 'panNumber') {
      setPanVerificationResult(null);
      setFormData(prev => ({
        ...prev,
        panVerified: false,
        panVerifiedAt: null,
      }));
    }
  };

  const handlePANVerified = (verificationResult) => {
    setPanVerificationResult(verificationResult);
    setFormData(prev => ({
      ...prev,
      panVerified: true,
      panVerifiedAt: verificationResult.verifiedAt || new Date().toISOString(),
    }));
    setShowPANVerification(false);
    toast.success('PAN verified successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required');
      return;
    }

    if (!formData.panNumber) {
      toast.error('PAN number is required');
      return;
    }

    // Validate PAN format
    if (formData.panNumber.length !== 10) {
      toast.error('PAN number must be 10 characters long');
      return;
    }

    // Require PAN verification before submission
    if (!formData.panVerified) {
      toast.error('Please verify your PAN number before saving');
      setShowPANVerification(true);
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingMember) {
        await memberService.updateMember(editingMember.id, formData);
        toast.success('Family member updated successfully');
      } else {
        await memberService.addMember(formData);
        toast.success('Family member added successfully');
      }

      if (onSuccess) {
        onSuccess(formData);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save family member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PAN Number *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleInputChange}
                maxLength={10}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono uppercase"
                placeholder="ABCDE1234F"
              />
              {formData.panNumber && formData.panNumber.length === 10 && !formData.panVerified && (
                <button
                  type="button"
                  onClick={() => setShowPANVerification(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Verify PAN
                </button>
              )}
            </div>
            {formData.panVerified && (
              <p className="text-xs text-success-600 mt-1 flex items-center">
                <span className="mr-1">✓</span> PAN Verified
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship *
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select relationship</option>
              {relationshipOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* PAN Verification Inline */}
        {showPANVerification && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <PANVerificationInline
              panNumber={formData.panNumber}
              onVerified={handlePANVerified}
              onCancel={() => setShowPANVerification(false)}
              memberType="family"
              compact={true}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editingMember ? 'Update Member' : 'Add Member'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberFormInline;

