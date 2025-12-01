// =====================================================
// FILING PERSON SELECTOR COMPONENT
// First step in ITR filing - select who to file for
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Users, CheckCircle, AlertCircle, ArrowRight, Loader, Plus, X } from 'lucide-react';
import memberService from '../../services/memberService';
import apiClient from '../../services/core/APIClient';
import toast from 'react-hot-toast';
import MemberFormInline from '../Members/MemberFormInline';
import PANVerificationInline from './PANVerificationInline';

const FilingPersonSelector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personType, setPersonType] = useState(null); // 'self', 'family'
  const [selectedFamilyMember, setSelectedFamilyMember] = useState(null);
  const [panStatuses, setPanStatuses] = useState({});
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showPANVerification, setShowPANVerification] = useState(false);
  const [panVerificationPerson, setPanVerificationPerson] = useState(null);

  useEffect(() => {
    loadFamilyMembers();
    checkUserPANStatus();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const response = await memberService.getMembers();
      setFamilyMembers(response.data?.members || []);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  const checkUserPANStatus = async () => {
    if (!user?.panNumber) return;
    try {
      const response = await apiClient.get(`/itr/pan/status/${user.panNumber}`);
      setPanStatuses(prev => ({
        ...prev,
        self: response.data.data,
      }));
    } catch (error) {
      // Silently fail - PAN status check is optional
      setPanStatuses(prev => ({
        ...prev,
        self: { verified: false },
      }));
    }
  };

  const checkFamilyMemberPANStatus = async (memberId, panNumber) => {
    try {
      const response = await apiClient.get(`/itr/pan/status/${panNumber}`);
      setPanStatuses(prev => ({
        ...prev,
        [memberId]: response.data.data,
      }));
      return response.data.data;
    } catch (error) {
      // Return unverified status if check fails
      return { verified: false };
    }
  };

  const handlePersonTypeSelect = (type) => {
    setPersonType(type);
    setSelectedPerson(null);
    setSelectedFamilyMember(null);
    setShowPANVerification(false);
    setPanVerificationPerson(null);

    if (type === 'self') {
      const selfPanStatus = panStatuses.self || { verified: false };
      const hasPAN = !!user?.panNumber;
      const isVerified = selfPanStatus.verified && hasPAN;

      const person = {
        type: 'self',
        id: user?.id,
        name: user?.fullName,
        panNumber: user?.panNumber || '',
        panVerified: isVerified,
        panVerifiedAt: selfPanStatus.verifiedAt,
      };

      setSelectedPerson(person);

      // Auto-show verification form if PAN exists but is not verified
      if (hasPAN && !isVerified) {
        setPanVerificationPerson(person);
        setShowPANVerification(true);
      }
    }
  };

  const handleFamilyMemberSelect = async (member) => {
    setSelectedFamilyMember(member);
    let panStatus = panStatuses[member.id];
    if (!panStatus) {
      panStatus = await checkFamilyMemberPANStatus(member.id, member.panNumber);
    }

    setSelectedPerson({
      type: 'family',
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      panNumber: member.panNumber,
      panVerified: panStatus.verified || member.panVerified,
      panVerifiedAt: panStatus.verifiedAt || member.panVerifiedAt,
      member: member,
    });
  };

  const handleMemberAdded = (newMemberData) => {
    // Reload family members list
    loadFamilyMembers();
    setShowAddMemberForm(false);
    // Auto-select the newly added member
    setTimeout(() => {
      const newMember = {
        id: `new-${Date.now()}`, // Temporary ID, will be updated after reload
        firstName: newMemberData.firstName,
        lastName: newMemberData.lastName,
        panNumber: newMemberData.panNumber,
        relationship: newMemberData.relationship,
        panVerified: newMemberData.panVerified,
        panVerifiedAt: newMemberData.panVerifiedAt,
      };
      handleFamilyMemberSelect(newMember);
    }, 500);
  };

  const handlePANVerified = (verificationResult) => {
    if (!panVerificationPerson) return;

    // Update the person's PAN status
    const updatedPerson = {
      ...panVerificationPerson,
      panVerified: true,
      panVerifiedAt: verificationResult.verifiedAt || new Date().toISOString(),
    };

    setSelectedPerson(updatedPerson);
    setShowPANVerification(false);
    setPanVerificationPerson(null);

    // Update PAN status in state
    if (updatedPerson.type === 'self') {
      setPanStatuses(prev => ({
        ...prev,
        self: { verified: true, verifiedAt: updatedPerson.panVerifiedAt },
      }));
    } else if (updatedPerson.member?.id) {
      setPanStatuses(prev => ({
        ...prev,
        [updatedPerson.member.id]: { verified: true, verifiedAt: updatedPerson.panVerifiedAt },
      }));
    }

    toast.success('PAN verified successfully!');
    // Auto-proceed to data source selection after verification
    setTimeout(() => {
      proceedToDataSourceSelection(updatedPerson);
    }, 1000);
  };

  const proceedToDataSourceSelection = (person) => {
    // Navigate to data source selection
    navigate('/itr/data-source', {
      state: {
        selectedPerson: person,
        verificationResult: {
          isValid: true,
          pan: person.panNumber,
          name: person.name,
        },
      },
    });
  };

  const handleProceed = () => {
    if (!selectedPerson) {
      toast.error('Please select a person to file for');
      return;
    }

    if (!selectedPerson.panNumber) {
      toast.error('PAN number is required');
      return;
    }

    // If PAN not verified, show inline verification
    if (!selectedPerson.panVerified) {
      setPanVerificationPerson(selectedPerson);
      setShowPANVerification(true);
      return;
    }

    // PAN verified, proceed to data source selection
    proceedToDataSourceSelection(selectedPerson);
  };

  const filingOptions = [
    {
      id: 'self',
      title: 'File for Myself',
      description: 'Start a new ITR filing for your own income',
      icon: User,
      color: 'bg-blue-500',
      disabled: false, // Allow even without PAN - will handle in StartFiling page
    },
    {
      id: 'family',
      title: 'File for Family Member',
      description: 'File ITR for a family member',
      icon: Users,
      color: 'bg-green-500',
      disabled: false, // Allow even without members - can add new member
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Who are you filing for?
          </h1>
          <p className="text-gray-600">
            Select the person for whom you want to file the Income Tax Return
          </p>
        </div>

        {/* Filing Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filingOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = personType === option.id;
            const isDisabled = option.disabled;

            return (
              <div
                key={option.id}
                onClick={() => !isDisabled && handlePersonTypeSelect(option.id)}
                className={`
                  bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all
                  ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {option.title}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">
                  {option.description}
                </p>
                {isSelected && (
                  <div className="flex items-center justify-center text-blue-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Family Member Selection */}
        {personType === 'family' && (
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Family Member
                </h3>
                <button
                  onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                  className="flex items-center px-4 py-2 bg-success-500 text-white text-sm font-medium rounded-lg hover:bg-success-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showAddMemberForm ? 'Cancel' : 'Add New Member'}
                </button>
              </div>

              {/* Inline Add Member Form */}
              {showAddMemberForm && (
                <div className="mb-6">
                  <MemberFormInline
                    onSuccess={handleMemberAdded}
                    onCancel={() => setShowAddMemberForm(false)}
                    compact={true}
                  />
                </div>
              )}

              {familyMembers.length === 0 && !showAddMemberForm ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No family members added yet</p>
                  <button
                    onClick={() => setShowAddMemberForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-success-500 text-white text-sm font-medium rounded-lg hover:bg-success-600 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Family Member
                  </button>
                </div>
              ) : familyMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMembers.map((member) => {
                    const memberPanStatus = panStatuses[member.id] || { verified: member.panVerified || false };
                    const isSelected = selectedFamilyMember?.id === member.id;

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleFamilyMemberSelect(member)}
                        className={`
                          p-4 border-2 rounded-lg cursor-pointer transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {member.firstName} {member.lastName}
                            </h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {member.relationship}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-mono">
                              PAN: {member.panNumber}
                            </p>
                          </div>
                          <div className="ml-4">
                            {memberPanStatus.verified ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="ml-1 text-xs">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-orange-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="ml-1 text-xs">Verify PAN</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

            {/* Optional: Link to full member management */}
            {familyMembers.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => navigate('/add-members', { state: { returnTo: '/itr/select-person' } })}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Manage all family members
                </button>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Inline PAN Verification */}
        {showPANVerification && panVerificationPerson && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                PAN Verification Required
              </h3>
              <button
                onClick={() => {
                  setShowPANVerification(false);
                  setPanVerificationPerson(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <PANVerificationInline
              panNumber={panVerificationPerson.panNumber || ''}
              onVerified={handlePANVerified}
              onCancel={() => {
                setShowPANVerification(false);
                setPanVerificationPerson(null);
              }}
              memberType={panVerificationPerson.type === 'self' ? 'self' : 'family'}
              memberId={panVerificationPerson.member?.id}
              compact={true}
            />
          </div>
        )}

        {/* PAN Input/Verification for Self when PAN is missing or unverified (only if not already showing inline verification) */}
        {personType === 'self' && !showPANVerification && (!user?.panNumber || !selectedPerson?.panNumber || !selectedPerson?.panVerified) && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-orange-200 p-6 mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user?.panNumber && !selectedPerson?.panVerified
                  ? 'Verify Your PAN Number'
                  : 'Enter Your PAN Number'}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.panNumber && !selectedPerson?.panVerified
                  ? 'Your PAN number needs to be verified before filing'
                  : 'PAN is required to file your Income Tax Return'}
              </p>
            </div>
            <PANVerificationInline
              panNumber={selectedPerson?.panNumber || user?.panNumber || ''}
              onVerified={(verificationResult) => {
                // Get the PAN number from verification result
                const verifiedPAN = verificationResult?.pan || selectedPerson?.panNumber || user?.panNumber || '';
                // Update selected person with verified PAN
                const updatedPerson = {
                  type: 'self',
                  id: user?.id,
                  name: user?.fullName || verificationResult?.name || selectedPerson?.name || 'Self',
                  panNumber: verifiedPAN,
                  panVerified: true,
                  panVerifiedAt: verificationResult?.verifiedAt || new Date().toISOString(),
                };
                setSelectedPerson(updatedPerson);
                setPanStatuses(prev => ({
                  ...prev,
                  self: { verified: true, verifiedAt: updatedPerson.panVerifiedAt },
                }));
                // Hide verification form after successful verification
                setShowPANVerification(false);
                setPanVerificationPerson(null);
              }}
              onCancel={() => {
                // Don't allow canceling - PAN is required for filing
              }}
              memberType="self"
              compact={false}
            />
          </div>
        )}

        {/* Selected Person Summary */}
        {selectedPerson && selectedPerson.panNumber && selectedPerson.panVerified && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Selected Person
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-900">{selectedPerson.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">PAN Number:</span>
                <span className="font-mono text-gray-900">{selectedPerson.panNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">PAN Status:</span>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              </div>
              {selectedPerson.panVerifiedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified At:</span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedPerson.panVerifiedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proceed Button */}
        {selectedPerson && selectedPerson.panNumber && (
          <div className="flex justify-end">
            <button
              onClick={handleProceed}
              className="flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilingPersonSelector;

