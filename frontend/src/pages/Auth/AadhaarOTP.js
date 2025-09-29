import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Smartphone,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../services/api';
import { 
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseStatCard,
  EnterpriseInput
} from '../../components/DesignSystem/EnterpriseComponents';

const AadhaarOTP = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const submitMutation = useMutation(
    async () => {
      const response = await api.post('/filing/submit-enhanced', {
        filingId,
        filingMethod: 'aadhaar_otp'
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Filing submitted successfully via Aadhaar OTP!');
        navigate(`/acknowledgment/${filingId}`, {
          state: { ackNumber: data.data.acknowledgmentNumber }
        });
      },
      onError: (error) => {
        toast.error('Aadhaar OTP submission failed');
        console.error('Submission error:', error);
      }
    }
  );

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatAadhaar = (value) => {
    // Remove non-digits and limit to 12 characters
    const digits = value.replace(/\D/g, '').slice(0, 12);
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadhaarChange = (e) => {
    const formatted = formatAadhaar(e.target.value);
    setAadhaarNumber(formatted);
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();

    if (aadhaarNumber.replace(/\s/g, '').length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setIsRequestingOTP(true);

    try {
      // Simulate OTP request to UIDAI
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('OTP sent to your registered mobile number!');
      setOtpRequested(true);
      setStep(2);
      setCountdown(300); // 5 minutes countdown
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock OTP verification (accept any 6-digit OTP for demo)
      if (otp.length === 6) {
        toast.success('OTP verified successfully!');
        setStep(3);

        // Automatically submit filing
        await submitMutation.mutateAsync();
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsRequestingOTP(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('OTP resent successfully!');
      setCountdown(300);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const renderAadhaarForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Smartphone className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Aadhaar OTP Verification</h2>
        <p className="text-gray-600">Verify your identity using Aadhaar OTP for secure filing</p>
      </div>

      <form onSubmit={handleRequestOTP} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aadhaar Number
          </label>
          <input
            type="text"
            value={aadhaarNumber}
            onChange={handleAadhaarChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
            placeholder="XXXX XXXX XXXX"
            maxLength="14" // 12 digits + 2 spaces
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter your 12-digit Aadhaar number</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Secure Verification</h4>
              <p className="text-sm text-blue-700">
                OTP will be sent to the mobile number registered with your Aadhaar card. This ensures secure verification as per UIDAI guidelines.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isRequestingOTP || aadhaarNumber.replace(/\s/g, '').length !== 12}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isRequestingOTP ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Requesting OTP...
            </>
          ) : (
            <>
              <Key className="w-5 h-5 mr-2" />
              Send OTP
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderOTPForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
        <p className="text-gray-600">Enter the 6-digit OTP sent to your registered mobile</p>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-600 mb-4">
          OTP sent to mobile number linked with Aadhaar ending in XXXX XXXX {aadhaarNumber.slice(-4)}
        </div>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Enter 6-digit OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
            placeholder="000000"
            maxLength="6"
            required
          />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || isRequestingOTP}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 text-sm"
          >
            {countdown > 0 ? (
              `Resend OTP in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
            ) : (
              'Resend OTP'
            )}
          </button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">OTP Expiry</h4>
              <p className="text-sm text-yellow-700">
                OTP is valid for 5 minutes. Please enter it before it expires.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isVerifyingOTP || otp.length !== 6}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isVerifyingOTP ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Verify & Submit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Filing</h2>
        <p className="text-gray-600">Please wait while we submit your ITR using Aadhaar verification...</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">Aadhaar OTP verified</span>
          </div>
          <div className="flex items-center">
            <RefreshCw className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
            <span className="text-sm text-gray-700">Submitting to Income Tax Department</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Review
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Aadhaar OTP Submission</h1>
          <p className="text-lg text-gray-600 mt-2">File your ITR securely using Aadhaar OTP verification</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Enter Aadhaar</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Verify OTP</span>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Submit</span>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border p-8">
          {step === 1 && renderAadhaarForm()}
          {step === 2 && renderOTPForm()}
          {step === 3 && renderProcessing()}
        </div>
      </div>
    </div>
  );
};

export default AadhaarOTP;
