// =====================================================
// START FILING SCREEN - ITR FILING JOURNEY
// Mobile-first "Whose ITR?" selection screen
// =====================================================

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  User, 
  Users, 
  Plus, 
  CheckCircle, 
  ArrowRight,
  Shield
} from 'lucide-react';
import api from '../../services/api';

const StartFiling = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch filing options
  const { data: filingOptions, isLoading } = useQuery({
    queryKey: ['filingOptions', user?.user_id],
    queryFn: async () => {
      const response = await api.get('/itr/filing-options');
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
  };

  const handleProceedToFiling = () => {
    if (!selectedMember) return;
    
    // Check if PAN is already verified for this member
    const isPANVerified = selectedMember.panVerified || 
                         (selectedMember.type === 'self' && user?.panVerified);
    
    if (isPANVerified) {
      // Skip PAN verification, go directly to ITR selection
      navigate('/itr-selection', {
        state: {
          selectedMember,
          skipPANVerification: true,
          step: 2
        }
      });
    } else {
      // Navigate to PAN verification with selected member
      navigate('/itr/pan-verification', {
        state: {
          selectedMember,
          step: 1
        }
      });
    }
  };

  const handleAddNewMember = () => {
    navigate('/family', {
      state: {
        returnTo: '/itr/start',
        addMember: true
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading filing options...</p>
        </div>
      </div>
    );
  }

  const options = filingOptions?.data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Start ITR Filing</h1>
                <p className="text-xs text-gray-500">Step 1: Select member</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                <Shield className="h-3 w-3" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Step 1 of 4</span>
          <span>25% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Select Member</span>
          <span>Verify PAN</span>
          <span>Select ITR</span>
          <span>Start Filing</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Whose ITR are you filing?</h2>
          <p className="text-sm text-gray-600">
            Select yourself or a family member to start the filing process
          </p>
        </div>

        {/* Self Option */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Yourself</h3>
          <button
            onClick={() => handleMemberSelect(options.self)}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedMember?.id === options.self?.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedMember?.id === options.self?.id ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <User className={`h-5 w-5 ${
                  selectedMember?.id === options.self?.id ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-gray-900">{options.self?.name}</h4>
                <p className="text-sm text-gray-500">{options.self?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Self
                  </span>
                  {options.self?.phone && (
                    <span className="text-xs text-gray-500">{options.self.phone}</span>
                  )}
                </div>
              </div>
              {selectedMember?.id === options.self?.id && (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </button>
        </div>

        {/* Family Members */}
        {options.familyMembers && options.familyMembers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Family Members</h3>
            <div className="space-y-2">
              {options.familyMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberSelect(member)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedMember?.id === member.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMember?.id === member.id ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Users className={`h-5 w-5 ${
                        selectedMember?.id === member.id ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900">{member.firstName} {member.lastName}</h4>
                      <p className="text-sm text-gray-500 capitalize">{member.relationship}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          {member.relationship}
                        </span>
                        {member.panNumber && (
                          <span className="text-xs text-gray-500 font-mono">
                            PAN: {member.panNumber.substring(0, 5)}*****
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedMember?.id === member.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add New Member Option */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Add New Member</h3>
          <button
            onClick={handleAddNewMember}
            className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-200">
                <Plus className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">Add Family Member</h4>
                <p className="text-sm text-gray-500">Add a new family member to file their ITR</p>
              </div>
            </div>
          </button>
        </div>

        {/* Trust Elements */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Secure & Verified</h4>
              <p className="text-xs text-blue-700">
                All data is encrypted and verified directly with Income Tax Department
              </p>
            </div>
          </div>
        </div>

        {/* Microcopy */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Don't worry — you can always switch to another member later if needed
          </p>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleProceedToFiling}
          disabled={!selectedMember}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>Proceed to Filing</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </button>
        
        {selectedMember && (
          <p className="text-xs text-gray-500 text-center mt-2">
            Filing ITR for: <span className="font-medium">{selectedMember.name}</span>
          </p>
        )}
      </div>

      {/* Bottom padding for action bar */}
      <div className="h-24"></div>
    </div>
  );
};

export default StartFiling;
