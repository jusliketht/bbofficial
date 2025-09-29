import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  X,
  Bot,
  FileText,
  Users,
  CreditCard,
  Calculator,
  Download,
  Upload,
  Shield,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  Save,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient as itrJourneyClient } from '../../services/comprehensiveITRJourneyService';
import { apiClient as businessFlowClient } from '../../services/itrBusinessFlowService';
import { useAuthStore } from '../store/authStore';
import { useHook } from '../../hooks/useAutoSave';
import { Component } from '../../components/ChatInterface';
import { useHook } from '../../hooks/useChatbot';

/**
 * Comprehensive ITR Journey Component
 * Provides complete ITR filing journey with business logic, CA assistance, and billing integration
 * Supports all ITR types (1-7) with manual entry provisions for complex forms
 * Essential for complete tax filing workflow
 */
const ComprehensiveITRJourney = () => {
  const navigate = useNavigate();
  const { journeyId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Chatbot integration
  const { isOpen: isChatOpen, context: chatContext, openChatbot, closeChatbot, updateContext } = useChatbot('itr_journey');

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [selectedITRType, setSelectedITRType] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [caAssignment, setCAAssignment] = useState(null);

  // Auto-save hook
  const {
    isAutoSaving,
    lastSaved,
    isOnline
  } = useOfflineAutoSave(journeyData, 'itr_journey');

  // Journey steps configuration
  const journeySteps = [
    { id: 'pan_verification', title: 'PAN Verification', description: 'Verify your PAN and eligibility', icon: '🔍', color: 'blue' },
    { id: 'itr_selection', title: 'ITR Selection', description: 'Choose the appropriate ITR form', icon: '📋', color: 'green' },
    { id: 'personal_info', title: 'Personal Information', description: 'Enter your personal details', icon: '👤', color: 'purple' },
    { id: 'income_sources', title: 'Income Sources', description: 'Enter your income details', icon: '💰', color: 'orange' },
    { id: 'deductions', title: 'Deductions', description: 'Claim your tax deductions', icon: '📉', color: 'red' },
    { id: 'tax_computation', title: 'Tax Computation', description: 'Calculate your tax liability', icon: '🧮', color: 'indigo' },
    { id: 'review_submit', title: 'Review & Submit', description: 'Review and submit your return', icon: '✅', color: 'green' },
    { id: 'download_json', title: 'Download JSON', description: 'Download your ITR JSON file', icon: '📥', color: 'blue' }
  ];

  // Fetch journey data
  const { data: journey, isLoading: journeyLoading, error: journeyError } = useQuery({
    queryKey: ['itrJourney', journeyId],
    queryFn: () => comprehensiveITRJourneyService.getJourney(journeyId),
    enabled: !!journeyId,
    staleTime: 5 * 60 * 1000
  });

  // Fetch user eligibility
  const { data: eligibilityData } = useQuery({
    queryKey: ['filingEligibility', user?.user_id],
    queryFn: () => itrBusinessFlowService.checkFilingEligibility(user?.user_id),
    enabled: !!user?.user_id,
    staleTime: 10 * 60 * 1000
  });

  // Fetch ITR types
  const { data: itrTypesData } = useQuery({
    queryKey: ['itrTypes'],
    queryFn: () => comprehensiveITRJourneyService.getITRTypes(),
    staleTime: 30 * 60 * 1000
  });

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['userFilingStats', user?.user_id],
    queryFn: () => itrBusinessFlowService.getUserFilingStatistics(user?.user_id),
    enabled: !!user?.user_id,
    staleTime: 5 * 60 * 1000
  });

  // Update journey step mutation
  const updateStepMutation = useMutation({
    mutationFn: ({ section, data }) => 
      comprehensiveITRJourneyService.updateJourneyStep(journeyId, section, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries(['itrJourney', journeyId]);
      toast.success('Step updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update step');
    }
  });

  // Compute tax mutation
  const computeTaxMutation = useMutation({
    mutationFn: () => comprehensiveITRJourneyService.computeTax(journeyId),
    onSuccess: (result) => {
      setPricing(result.data);
      toast.success('Tax computation completed');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to compute tax');
    }
  });

  // Submit journey mutation
  const submitJourneyMutation = useMutation({
    mutationFn: (submissionData) => 
      comprehensiveITRJourneyService.submitJourney(journeyId, submissionData),
    onSuccess: (result) => {
      toast.success('ITR submitted successfully');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit ITR');
    }
  });

  // Generate JSON mutation
  const generateJSONMutation = useMutation({
    mutationFn: () => comprehensiveITRJourneyService.generateITRJSON(journeyId),
    onSuccess: (result) => {
      // Download JSON file
      const blob = new Blob([JSON.stringify(result.data.jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ITR_${journey?.itrType}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('ITR JSON downloaded successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate ITR JSON');
    }
  });

  // Effects
  useEffect(() => {
    if (journey?.data) {
      setJourneyData(journey.data);
    }
  }, [journey]);

  useEffect(() => {
    if (eligibilityData?.data) {
      setEligibility(eligibilityData.data);
    }
  }, [eligibilityData]);

  // Handlers
  const handleStepUpdate = async (section, data) => {
    try {
      await updateStepMutation.mutateAsync({ section, data });
    } catch (error) {
      console.error('Step update error:', error);
    }
  };

  const handleNextStep = () => {
    if (currentStep < journeySteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleITRSelection = (itrType) => {
    setSelectedITRType(itrType);
    setShowPricingModal(true);
  };

  const handleComputeTax = async () => {
    try {
      await computeTaxMutation.mutateAsync();
    } catch (error) {
      console.error('Tax computation error:', error);
    }
  };

  const handleSubmitJourney = async (submissionData) => {
    try {
      await submitJourneyMutation.mutateAsync(submissionData);
    } catch (error) {
      console.error('Journey submission error:', error);
    }
  };

  const handleDownloadJSON = async () => {
    try {
      await generateJSONMutation.mutateAsync();
    } catch (error) {
      console.error('JSON generation error:', error);
    }
  };

  const handleChatbotOpen = () => {
    updateContext('itr_journey', {
      currentStep: journeySteps[currentStep - 1]?.title,
      itrType: selectedITRType,
      journeyId: journeyId
    });
    openChatbot();
  };

  // Render step content
  const renderStepContent = () => {
    const currentStepConfig = journeySteps[currentStep - 1];
    
    switch (currentStepConfig?.id) {
      case 'pan_verification':
        return <PANVerificationStep onNext={handleNextStep} />;
      case 'itr_selection':
        return <ITRSelectionStep onITRSelect={handleITRSelection} />;
      case 'personal_info':
        return <PersonalInfoStep onUpdate={handleStepUpdate} onNext={handleNextStep} />;
      case 'income_sources':
        return <IncomeSourcesStep onUpdate={handleStepUpdate} onNext={handleNextStep} />;
      case 'deductions':
        return <DeductionsStep onUpdate={handleStepUpdate} onNext={handleNextStep} />;
      case 'tax_computation':
        return <TaxComputationStep onCompute={handleComputeTax} onNext={handleNextStep} />;
      case 'review_submit':
        return <ReviewSubmitStep onSubmit={handleSubmitJourney} onNext={handleNextStep} />;
      case 'download_json':
        return <DownloadJSONStep onDownload={handleDownloadJSON} />;
      default:
        return <div className="text-center py-12">Step not found</div>;
    }
  };

  // Loading state
  if (journeyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading ITR journey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (journeyError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load ITR journey</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  ITR Filing Journey
                </h1>
                <p className="text-sm text-gray-500">
                  {journey?.itrType} - {journey?.assessmentYear}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-save indicator */}
              <div className="flex items-center text-sm text-gray-500">
                {isAutoSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                )}
                {isAutoSaving ? 'Saving...' : 'Saved'}
              </div>

              {/* Online/Offline indicator */}
              <div className="flex items-center text-sm">
                {isOnline ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    Offline
                  </div>
                )}
              </div>

              {/* Chatbot button */}
              <button
                onClick={handleChatbotOpen}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <Bot className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Banner */}
      {eligibility && (
        <div className={`bg-${eligibility.canFile ? 'green' : 'red'}-50 border-l-4 border-${eligibility.canFile ? 'green' : 'red'}-400 p-4`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                {eligibility.canFile ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm text-${eligibility.canFile ? 'green' : 'red'}-700`}>
                  {eligibility.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Statistics */}
      {userStats && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.data.limits.remainingFilings}
                </div>
                <div className="text-sm text-gray-500">Filings Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userStats.data.statistics.completedFilings}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.data.statistics.familySessions}
                </div>
                <div className="text-sm text-gray-500">Family Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {userStats.data.statistics.totalFamilyMembers}
                </div>
                <div className="text-sm text-gray-500">Family Members</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
              <div className="space-y-3">
                {journeySteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center p-3 rounded-lg ${
                      index + 1 === currentStep
                        ? 'bg-blue-50 border border-blue-200'
                        : index + 1 < currentStep
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index + 1 < currentStep
                            ? 'bg-green-500 text-white'
                            : index + 1 === currentStep
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {index + 1 < currentStep ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Step Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {journeySteps[currentStep - 1]?.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {journeySteps[currentStep - 1]?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Step {currentStep} of {journeySteps.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6">
                {renderStepContent()}
              </div>

              {/* Step Navigation */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Save & Exit
                    </button>
                  </div>

                  <button
                    onClick={handleNextStep}
                    disabled={currentStep === journeySteps.length}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      {isChatOpen && (
        <ChatInterface
          isOpen={isChatOpen}
          onClose={closeChatbot}
          context={chatContext}
        />
      )}

      {/* Pricing Modal */}
      {showPricingModal && selectedITRType && (
        <PricingModal
          itrType={selectedITRType}
          onClose={() => setShowPricingModal(false)}
          onConfirm={() => {
            setShowPricingModal(false);
            handleNextStep();
          }}
        />
      )}

      {/* Family Modal */}
      {showFamilyModal && (
        <FamilyFilingModal
          onClose={() => setShowFamilyModal(false)}
          onConfirm={(familyData) => {
            setShowFamilyModal(false);
            // Handle family filing creation
          }}
        />
      )}
    </div>
  );
};

// Step Components (simplified for brevity)
const PANVerificationStep = ({ onNext }) => (
  <div className="space-y-6">
    <div className="text-center">
      <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">PAN Verification</h3>
      <p className="text-sm text-gray-500">Verify your PAN and eligibility for ITR filing</p>
    </div>
    {/* PAN verification form would go here */}
    <button
      onClick={onNext}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
    >
      Verify PAN & Continue
    </button>
  </div>
);

const ITRSelectionStep = ({ onITRSelect }) => (
  <div className="space-y-6">
    <div className="text-center">
      <FileText className="h-12 w-12 mx-auto text-green-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Select ITR Type</h3>
      <p className="text-sm text-gray-500">Choose the appropriate ITR form for your income</p>
    </div>
    {/* ITR selection form would go here */}
  </div>
);

const PersonalInfoStep = ({ onUpdate, onNext }) => (
  <div className="space-y-6">
    <div className="text-center">
      <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
      <p className="text-sm text-gray-500">Enter your personal details</p>
    </div>
    {/* Personal info form would go here */}
  </div>
);

const IncomeSourcesStep = ({ onUpdate, onNext }) => (
  <div className="space-y-6">
    <div className="text-center">
      <TrendingUp className="h-12 w-12 mx-auto text-orange-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Income Sources</h3>
      <p className="text-sm text-gray-500">Enter your income details</p>
    </div>
    {/* Income sources form would go here */}
  </div>
);

const DeductionsStep = ({ onUpdate, onNext }) => (
  <div className="space-y-6">
    <div className="text-center">
      <BarChart3 className="h-12 w-12 mx-auto text-red-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Deductions</h3>
      <p className="text-sm text-gray-500">Claim your tax deductions</p>
    </div>
    {/* Deductions form would go here */}
  </div>
);

const TaxComputationStep = ({ onCompute, onNext }) => (
  <div className="space-y-6">
    <div className="text-center">
      <Calculator className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Tax Computation</h3>
      <p className="text-sm text-gray-500">Calculate your tax liability</p>
    </div>
    {/* Tax computation form would go here */}
  </div>
);

const ReviewSubmitStep = ({ onSubmit, onNext }) => (
  <div className="space-y-6">
    <div className="text-center">
      <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Review & Submit</h3>
      <p className="text-sm text-gray-500">Review your ITR before submission</p>
    </div>
    {/* Review and submit form would go here */}
  </div>
);

const DownloadJSONStep = ({ onDownload }) => (
  <div className="space-y-6">
    <div className="text-center">
      <Download className="h-12 w-12 mx-auto text-blue-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Download JSON</h3>
      <p className="text-sm text-gray-500">Download your ITR JSON file</p>
    </div>
    {/* Download JSON form would go here */}
  </div>
);

// Modal Components (simplified)
const PricingModal = ({ itrType, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing for {itrType}</h3>
      {/* Pricing details would go here */}
      <div className="flex justify-end space-x-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Continue
        </button>
      </div>
    </div>
  </div>
);

const FamilyFilingModal = ({ onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Family Filing Session</h3>
      {/* Family filing form would go here */}
      <div className="flex justify-end space-x-3 mt-6">
        <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
          Cancel
        </button>
        <button onClick={() => onConfirm({})} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Create Session
        </button>
      </div>
    </div>
  </div>
);

export default ComprehensiveITRJourney;
