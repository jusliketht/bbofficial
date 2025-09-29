import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Plus, Edit, Trash2, Save, X, AlertCircle, CheckCircle, 
  Calendar, FileText, Shield, Users, UserPlus, UserMinus 
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import userDashboardService from '../../services/userDashboardService';
import { EnterpriseButton, EnterpriseInput, EnterpriseCard, EnterpriseAlert } from '../DesignSystem/EnterpriseComponents';
import { SmartTooltip, InlineHelp } from '../DesignSystem/SmartTooltip';

/**
 * Family Member Management System
 * 
 * Features:
 * - Add/Edit/Delete family members
 * - PAN verification
 * - Relationship validation
 * - Dependent status management
 * - Real-time validation
 * - Enterprise-grade UI/UX
 */

const FamilyMemberManagement = ({ userId, onClose = null, className = '' }) => {
  const [members, setMembers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    relationship: '',
    pan_number: '',
    aadhaar_number: '',
    date_of_birth: '',
    is_dependent: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  // Fetch family members
  const { data: familyData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['familyMembers', userId],
    queryFn: () => userDashboardService.familyMembersService.getFamilyMembers(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add family member mutation
  const addMemberMutation = useMutation({
    mutationFn: (memberData) => userDashboardService.familyMembersService.addFamilyMember(memberData),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMembers', userId]);
      resetForm();
      setIsAdding(false);
    },
    onError: (error) => {
      setErrors({ general: 'Failed to add family member. Please try again.' });
    }
  });

  // Update family member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => userDashboardService.familyMembersService.updateFamilyMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMembers', userId]);
      resetForm();
      setEditingId(null);
    },
    onError: (error) => {
      setErrors({ general: 'Failed to update family member. Please try again.' });
    }
  });

  // Delete family member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (id) => userDashboardService.familyMembersService.deleteFamilyMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['familyMembers', userId]);
    },
    onError: (error) => {
      setErrors({ general: 'Failed to delete family member. Please try again.' });
    }
  });

  // Update members when data changes
  useEffect(() => {
    if (familyData?.data) {
      setMembers(familyData.data);
    }
  }, [familyData]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.relationship) {
      newErrors.relationship = 'Relationship is required';
    }

    if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number)) {
      newErrors.pan_number = 'Invalid PAN format';
    }

    if (formData.aadhaar_number && !/^[0-9]{12}$/.test(formData.aadhaar_number)) {
      newErrors.aadhaar_number = 'Invalid Aadhaar format';
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    // Check for duplicate PAN
    const existingPan = members.find(member => 
      member.pan_number === formData.pan_number && 
      member.id !== editingId
    );
    if (existingPan) {
      newErrors.pan_number = 'PAN number already exists for another family member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, members, editingId]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      first_name: '',
      last_name: '',
      relationship: '',
      pan_number: '',
      aadhaar_number: '',
      date_of_birth: '',
      is_dependent: false
    });
    setErrors({});
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (editingId) {
        await updateMemberMutation.mutateAsync({
          id: editingId,
          data: formData
        });
      } else {
        await addMemberMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (member) => {
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name || '',
      relationship: member.relationship,
      pan_number: member.pan_number || '',
      aadhaar_number: member.aadhaar_number || '',
      date_of_birth: member.date_of_birth || '',
      is_dependent: member.is_dependent || false
    });
    setEditingId(member.id);
    setIsAdding(true);
  };

  // Handle delete
  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete ${member.first_name} ${member.last_name}?`)) {
      await deleteMemberMutation.mutateAsync(member.id);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setEditingId(null);
  };

  // Relationship options
  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'other', label: 'Other' }
  ];

  // Get relationship icon
  const getRelationshipIcon = (relationship) => {
    switch (relationship) {
      case 'spouse': return '💕';
      case 'child': return '👶';
      case 'parent': return '👴';
      case 'sibling': return '👫';
      default: return '👤';
    }
  };

  // Get relationship color
  const getRelationshipColor = (relationship) => {
    switch (relationship) {
      case 'spouse': return 'bg-pink-100 text-pink-800';
      case 'child': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'sibling': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingMembers) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Family Members
          </h2>
          <p className="text-gray-600 mt-1">
            Manage family members for ITR filing (Maximum 5 members)
          </p>
        </div>
        
        {!isAdding && members.length < 5 && (
          <EnterpriseButton
            onClick={() => setIsAdding(true)}
            variant="primary"
            size="md"
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </EnterpriseButton>
        )}
      </div>

      {/* Error Alert */}
      {errors.general && (
        <EnterpriseAlert
          type="error"
          title="Error"
          message={errors.general}
          onClose={() => setErrors({ ...errors, general: null })}
        />
      )}

      {/* Family Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{getRelationshipIcon(member.relationship)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {member.first_name} {member.last_name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRelationshipColor(member.relationship)}`}>
                    {member.relationship}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  title="Edit member"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  title="Delete member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {member.pan_number && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>PAN: {member.pan_number}</span>
                </div>
              )}
              
              {member.date_of_birth && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>DOB: {new Date(member.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
              
              {member.is_dependent && (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Dependent</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EnterpriseCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Family Member' : 'Add New Family Member'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <InlineHelp term="first_name">
                    <EnterpriseInput
                      label="First Name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      error={errors.first_name}
                      placeholder="Enter first name"
                      required
                    />
                  </InlineHelp>

                  {/* Last Name */}
                  <EnterpriseInput
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Relationship */}
                  <InlineHelp term="relationship">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship
                      </label>
                      <select
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select relationship</option>
                        {relationshipOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.relationship && (
                        <p className="text-red-600 text-sm mt-1">{errors.relationship}</p>
                      )}
                    </div>
                  </InlineHelp>

                  {/* Date of Birth */}
                  <InlineHelp term="date_of_birth">
                    <EnterpriseInput
                      label="Date of Birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      error={errors.date_of_birth}
                    />
                  </InlineHelp>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* PAN Number */}
                  <InlineHelp term="pan_number">
                    <EnterpriseInput
                      label="PAN Number"
                      value={formData.pan_number}
                      onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                      error={errors.pan_number}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </InlineHelp>

                  {/* Aadhaar Number */}
                  <InlineHelp term="aadhaar_number">
                    <EnterpriseInput
                      label="Aadhaar Number"
                      value={formData.aadhaar_number}
                      onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value.replace(/\D/g, '') })}
                      error={errors.aadhaar_number}
                      placeholder="123456789012"
                      maxLength={12}
                    />
                  </InlineHelp>
                </div>

                {/* Dependent Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_dependent"
                    checked={formData.is_dependent}
                    onChange={(e) => setFormData({ ...formData, is_dependent: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_dependent" className="text-sm font-medium text-gray-700">
                    This person is financially dependent on me
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <EnterpriseButton
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </EnterpriseButton>
                  
                  <EnterpriseButton
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{editingId ? 'Update Member' : 'Add Member'}</span>
                  </EnterpriseButton>
                </div>
              </form>
            </EnterpriseCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {members.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
        >
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Family Members Added</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add family members to include them in your ITR filing. You can add up to 5 family members.
          </p>
          <EnterpriseButton
            onClick={() => setIsAdding(true)}
            variant="primary"
            size="md"
            className="flex items-center space-x-2 mx-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add First Member</span>
          </EnterpriseButton>
        </motion.div>
      )}
    </div>
  );
};

export default FamilyMemberManagement;
