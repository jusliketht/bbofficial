// =====================================================
// DIGITAL SIGNATURE WORKFLOW COMPONENT
// Burnblack ITR Filing Platform - Module 7 Frontend
// =====================================================

import React, { useState, useEffect } from 'react';
import { Button, Card } from '../UI';
import ESignatureCapture from './ESignatureCapture';
import EVCVerification from './EVCVerification';

/**
 * DigitalSignatureWorkflow Component
 * 
 * Provides unified digital signature workflow with:
 * - Method selection (E-Signature or EVC)
 * - Step-by-step workflow
 * - Integration with filing process
 * - Feature flag controlled activation
 */

const DigitalSignatureWorkflow = ({ 
  filingId,
  userId,
  onComplete,
  onError,
  onCancel,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState('method-selection');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableMethods, setAvailableMethods] = useState({});
  const [error, setError] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [evcData, setEvcData] = useState(null);

  useEffect(() => {
    loadAvailableMethods();
  }, []);

  const loadAvailableMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/esignature/methods');
      const data = await response.json();
      
      if (data.success) {
        setAvailableMethods(data.data);
      } else {
        throw new Error(data.message || 'Failed to load verification methods');
      }
    } catch (error) {
      setError(error.message);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDigitalSignature = async (method, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/esignature/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          filingId,
          method,
          options
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.data.sessionId);
        setSelectedMethod(method);
        
        if (method === 'esignature') {
          setCurrentStep('capture-signature');
        } else if (method === 'evc') {
          setCurrentStep('verify-otp');
          setEvcData({
            evcId: data.data.evcId,
            otpId: data.data.otpId
          });
        }
      } else {
        throw new Error(data.message || 'Failed to initialize digital signature');
      }
    } catch (error) {
      setError(error.message);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processSignature = async (signatureData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/esignature/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          signatureData: {
            ...signatureData,
            ipAddress: await getClientIP(),
            userAgent: navigator.userAgent
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSignatureData(data.data);
        setCurrentStep('completed');
        onComplete?.(data.data);
      } else {
        throw new Error(data.message || 'Failed to process signature');
      }
    } catch (error) {
      setError(error.message);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processEVC = async (otp) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/esignature/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          signatureData: {
            otp,
            ipAddress: await getClientIP(),
            userAgent: navigator.userAgent
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setEvcData(prev => ({ ...prev, ...data.data }));
        setCurrentStep('completed');
        onComplete?.(data.data);
      } else {
        throw new Error(data.message || 'Failed to verify EVC');
      }
    } catch (error) {
      setError(error.message);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/esignature/evc/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();
      
      if (data.success) {
        setEvcData(prev => ({ ...prev, otpId: data.data.otpId }));
      } else {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError(error.message);
      onError?.(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const handleMethodSelection = (method) => {
    if (method === 'esignature') {
      initializeDigitalSignature('esignature');
    } else if (method === 'evc') {
      // For EVC, we need mobile number
      const mobileNumber = prompt('Please enter your mobile number:');
      if (mobileNumber) {
        initializeDigitalSignature('evc', { mobileNumber });
      }
    }
  };

  const renderMethodSelection = () => (
    <Card title="Select Verification Method" className="max-w-md mx-auto">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Choose your preferred method for digital signature verification:
        </p>

        <div className="space-y-3">
          {availableMethods.esignature?.available && (
            <button
              onClick={() => handleMethodSelection('esignature')}
              disabled={isLoading}
              className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">E-Signature</h3>
                  <p className="text-sm text-gray-600">Draw your signature digitally</p>
                </div>
              </div>
            </button>
          )}

          {availableMethods.evc?.available && (
            <button
              onClick={() => handleMethodSelection('evc')}
              disabled={isLoading}
              className="w-full p-4 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">EVC (OTP)</h3>
                  <p className="text-sm text-gray-600">Verify using mobile OTP</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {Object.keys(availableMethods).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No verification methods available</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderSignatureCapture = () => (
    <Card title="Capture Digital Signature" className="max-w-lg mx-auto">
      <ESignatureCapture
        onSignatureCaptured={processSignature}
        onError={setError}
        disabled={isLoading}
      />
    </Card>
  );

  const renderEVCVerification = () => (
    <Card title="EVC Verification" className="max-w-md mx-auto">
      <EVCVerification
        onEVCVerified={processEVC}
        onResendOTP={resendOTP}
        onError={setError}
        mobileNumber={evcData?.mobileNumber}
        disabled={isLoading}
      />
    </Card>
  );

  const renderCompleted = () => (
    <Card title="Digital Signature Complete" className="max-w-md mx-auto">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verification Successful
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Your digital signature has been captured and verified successfully.
        </p>
        <Button
          variant="primary"
          onClick={() => onComplete?.(signatureData || evcData)}
          className="w-full"
        >
          Continue to Filing
        </Button>
      </div>
    </Card>
  );

  const renderError = () => (
    <Card title="Error" className="max-w-md mx-auto">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verification Failed
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {error || 'An error occurred during verification.'}
        </p>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('method-selection')}
            className="flex-1"
          >
            Try Again
          </Button>
          <Button
            variant="primary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );

  if (error) {
    return renderError();
  }

  return (
    <div className={`digital-signature-workflow ${className}`}>
      {currentStep === 'method-selection' && renderMethodSelection()}
      {currentStep === 'capture-signature' && renderSignatureCapture()}
      {currentStep === 'verify-otp' && renderEVCVerification()}
      {currentStep === 'completed' && renderCompleted()}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalSignatureWorkflow;
