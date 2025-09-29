// =====================================================
// EVC VERIFICATION COMPONENT
// Burnblack ITR Filing Platform - Module 7 Frontend
// =====================================================

import React, { useState, useEffect } from 'react';
import { Button } from '../UI';

/**
 * EVCVerification Component
 * 
 * Provides EVC (Electronic Verification Code) functionality with:
 * - OTP input and validation
 * - Resend OTP capability
 * - Countdown timer
 * - Feature flag controlled activation
 */

const EVCVerification = ({ 
  onEVCVerified, 
  onError, 
  onResendOTP,
  mobileNumber,
  disabled = false,
  className = ''
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      onError?.('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    
    try {
      await onEVCVerified?.(otp);
    } catch (error) {
      onError?.(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await onResendOTP?.();
      setCountdown(60); // 60 seconds countdown
      setCanResend(false);
      setOtp('');
    } catch (error) {
      onError?.(error.message);
    }
  };

  const formatMobileNumber = (number) => {
    if (!number) return '';
    return number.replace(/(\d{5})(\d{5})/, '$1****$2');
  };

  return (
    <div className={`evc-verification ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          EVC Verification
        </h3>
        <p className="text-sm text-gray-600">
          We have sent a 6-digit OTP to your mobile number{' '}
          <span className="font-medium text-gray-900">
            {formatMobileNumber(mobileNumber)}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={handleOTPChange}
            placeholder="000000"
            maxLength={6}
            disabled={disabled || isVerifying}
            className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{
              letterSpacing: '0.5em'
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {countdown > 0 ? (
              <span>
                Resend OTP in {countdown}s
              </span>
            ) : (
              <span className="text-gray-500">
                Didn't receive OTP?
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResendOTP}
            disabled={disabled || !canResend || isVerifying}
          >
            Resend OTP
          </Button>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleVerifyOTP}
          disabled={disabled || !otp || otp.length !== 6 || isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>OTP is valid for 10 minutes</li>
              <li>EVC is valid for 24 hours after verification</li>
              <li>Keep your mobile number accessible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVCVerification;
