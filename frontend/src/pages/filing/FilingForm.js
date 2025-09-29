import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Smartphone,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../services/api';

const FilingForm = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  
  // State management for filing workflow
  const [currentStep, setCurrentStep] = useState(1); // Justification: Multi-step workflow requires step tracking
  const [selectedVerificationMethod, setSelectedVerificationMethod] = useState(''); // Justification: User must choose verification method
  const [acceptedDeclarations, setAcceptedDeclarations] = useState([]); // Justification: Track which declarations user has accepted
  const [otp, setOtp] = useState(''); // Justification: Store OTP input for verification
  const [showOtpInput, setShowOtpInput] = useState(false); // Justification: Conditional rendering of OTP input
  const [verificationSession, setVerificationSession] = useState(null); // Justification: Store verification session data

  // Fetch filing details - Justification: Need filing info for validation and display
  const { data: filing, isLoading: filingLoading } = useQuery(
    ['filing', filingId],
    () => apiClient.get(`/filing/${filingId}`),
    {
      onError: (error) => {
        toast.error('Failed to load filing details');
      },
    }
  );

  // Fetch filing validation - Justification: Must validate before allowing submission
  const { data: validation } = useQuery(
    ['filing-validation', filingId],
    () => apiClient.get(`/filing/${filingId}/validate`),
    {
      onError: (error) => {
        console.error('Failed to load validation:', error);
      },
    }
  );

  // Fetch declaration - Justification: Required legal declarations for filing
  const { data: declaration } = useQuery(
    ['filing-declaration', filingId],
    () => apiClient.get(`/filing/${filingId}/declaration`),
    {
      onError: (error) => {
        console.error('Failed to load declaration:', error);
      },
    }
  );

  // Initiate verification mutation - Justification: Required for e-verification process
  const initiateVerificationMutation = useMutation(
    async (method) => {
      return apiClient.post(`/filing/${filingId}/verify`, { method });
    },
    {
      onSuccess: (data) => {
        setVerificationSession(data.verification);
        setShowOtpInput(data.verification.data.requiresOTP);
        toast.success('Verification initiated successfully!');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to initiate verification');
      },
    }
  );

  // Verify OTP mutation - Justification: Required for Aadhaar OTP verification
  const verifyOtpMutation = useMutation(
    async () => {
      return apiClient.post(`/filing/verify-otp`, { 
        sessionId: verificationSession.sessionId, 
        otp 
      });
    },
    {
      onSuccess: () => {
        toast.success('OTP verified successfully!');
        setCurrentStep(4); // Move to final submission step
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to verify OTP');
      },
    }
  );

  // Submit filing mutation - Justification: Final submission to ERI
  const submitFilingMutation = useMutation(
    async () => {
      return apiClient.post(`/filing/${filingId}/submit`, {
        verificationMethod: selectedVerificationMethod
      });
    },
    {
      onSuccess: (data) => {
        toast.success('Filing submitted successfully!');
        navigate(`/acknowledgment/${filingId}`, { 
          state: { ackNumber: data.submission.ackNumber } 
        });
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to submit filing');
      },
    }
  );

  // Handle declaration acceptance - Justification: User must accept all required declarations
  const handleDeclarationToggle = (declarationIndex) => {
    setAcceptedDeclarations(prev => {
      if (prev.includes(declarationIndex)) {
        return prev.filter(index => index !== declarationIndex);
      } else {
        return [...prev, declarationIndex];
      }
    });
  };

  // Handle verification method selection - Justification: User must choose verification method
  const handleVerificationMethodSelect = (method) => {
    setSelectedVerificationMethod(method);
    initiateVerificationMutation.mutate(method);
  };

  // Handle OTP submission - Justification: Required for Aadhaar verification
  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    verifyOtpMutation.mutate();
  };

  // Handle final submission - Justification: Final step in filing process
  const handleFinalSubmission = () => {
    if (acceptedDeclarations.length !== declaration?.declaration?.declarations.length) {
      toast.error('Please accept all declarations');
      return;
    }
    if (!selectedVerificationMethod) {
      toast.error('Please select a verification method');
      return;
    }
    submitFilingMutation.mutate();
  };

  // Loading state - Justification: Better UX during data fetching
  if (filingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Validation error state - Justification: Prevent submission if filing is not eligible
  if (validation?.validation && !validation.validation.isEligible) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-red-800">Filing Not Eligible</h3>
              <p className="text-sm text-red-700 mt-1">
                Please complete the following requirements before filing:
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validation.validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <button
              onClick={() => navigate(`/intake/${filingId}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Intake
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - Justification: Clear navigation and context */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">File ITR</h1>
                <p className="text-sm text-gray-600">
                  {filing?.filing?.itr_type} - AY {filing?.filing?.assessment_year}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Steps - Justification: Show user progress through filing workflow */}
        <div className="px-6 py-4">
          <div className="flex items-center">
            {[
              { step: 1, name: 'Validation', icon: CheckCircle },
              { step: 2, name: 'Declaration', icon: Shield },
              { step: 3, name: 'Verification', icon: Smartphone },
              { step: 4, name: 'Submit', icon: FileText }
            ].map((stepInfo, index) => {
              const isActive = currentStep === stepInfo.step;
              const isCompleted = currentStep > stepInfo.step;
              
              return (
                <div key={stepInfo.step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isActive ? 'bg-primary-600 text-white' :
                    isCompleted ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{stepInfo.step}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-primary-600' :
                    isCompleted ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {stepInfo.name}
                  </span>
                  {index < 3 && (
                    <div className={`ml-4 h-px w-8 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 1: Validation - Justification: Show validation status and warnings */}
      {currentStep === 1 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filing Validation</h2>
          
          {validation?.validation && (
            <div className="space-y-4">
              {/* Eligibility Status */}
              <div className={`p-4 rounded-lg ${
                validation.validation.isEligible 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {validation.validation.isEligible ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  )}
                  <div>
                    <h3 className={`text-sm font-medium ${
                      validation.validation.isEligible ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {validation.validation.isEligible ? 'Filing Eligible' : 'Filing Not Eligible'}
                    </h3>
                    <p className={`text-sm ${
                      validation.validation.isEligible ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {validation.validation.isEligible 
                        ? 'Your filing meets all requirements' 
                        : 'Please address the issues below'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {validation.validation.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings</h4>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {validation.validation.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Documents */}
              {validation.validation.requiredDocuments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Recommended Documents</h4>
                  <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    {validation.validation.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!validation?.validation?.isEligible}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Declaration
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Declaration - Justification: Legal requirement for filing */}
      {currentStep === 2 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Legal Declarations</h2>
          
          {declaration?.declaration && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Filing Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Name:</span> {declaration.declaration.userName}
                  </div>
                  <div>
                    <span className="font-medium">PAN:</span> {declaration.declaration.pan}
                  </div>
                  <div>
                    <span className="font-medium">ITR Type:</span> {declaration.declaration.itrType}
                  </div>
                  <div>
                    <span className="font-medium">Assessment Year:</span> {declaration.declaration.assessmentYear}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Please accept the following declarations:</h3>
                {declaration.declaration.declarations.map((declarationText, index) => (
                  <div key={index} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`declaration-${index}`}
                      checked={acceptedDeclarations.includes(index)}
                      onChange={() => handleDeclarationToggle(index)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor={`declaration-${index}`} className="ml-3 text-sm text-gray-700">
                      {declarationText}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={acceptedDeclarations.length !== declaration?.declaration?.declarations.length}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Verification
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Verification - Justification: E-verification is mandatory for filing */}
      {currentStep === 3 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">E-Verification</h2>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose your preferred verification method. This is required to complete your filing.
            </p>

            {/* Verification Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Aadhaar OTP */}
              <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                selectedVerificationMethod === 'AADHAAR_OTP' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => handleVerificationMethodSelect('AADHAAR_OTP')}>
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Aadhaar OTP</h3>
                    <p className="text-xs text-gray-500">OTP sent to registered mobile</p>
                  </div>
                </div>
              </div>

              {/* Digital Signature */}
              <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                selectedVerificationMethod === 'DSC' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => handleVerificationMethodSelect('DSC')}>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Digital Signature</h3>
                    <p className="text-xs text-gray-500">Use DSC certificate</p>
                  </div>
                </div>
              </div>

              {/* Net Banking */}
              <div className={`border-2 rounded-lg p-4 cursor-pointer ${
                selectedVerificationMethod === 'NETBANKING' 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => handleVerificationMethodSelect('NETBANKING')}>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Net Banking</h3>
                    <p className="text-xs text-gray-500">Bank account verification</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Input */}
            {showOtpInput && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Enter OTP</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Enter the 6-digit OTP sent to your registered mobile number
                </p>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    maxLength={6}
                  />
                  <button
                    onClick={handleOtpSubmit}
                    disabled={otp.length !== 6 || verifyOtpMutation.isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyOtpMutation.isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!selectedVerificationMethod}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Submit
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Submission - Justification: Final confirmation before submission */}
      {currentStep === 4 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Final Submission</h2>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Ready to Submit</h3>
                  <p className="text-sm text-green-700">
                    Your filing is ready for submission to the Income Tax Department
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Filing Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">ITR Type:</span> {filing?.filing?.itr_type}
                </div>
                <div>
                  <span className="font-medium">Assessment Year:</span> {filing?.filing?.assessment_year}
                </div>
                <div>
                  <span className="font-medium">Verification Method:</span> {selectedVerificationMethod}
                </div>
                <div>
                  <span className="font-medium">Status:</span> Ready to Submit
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    By clicking "Submit Filing", you confirm that all information provided is true and complete. 
                    The filing will be submitted to the Income Tax Department and cannot be modified after submission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <button
              onClick={handleFinalSubmission}
              disabled={submitFilingMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitFilingMutation.isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Filing
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilingForm;
