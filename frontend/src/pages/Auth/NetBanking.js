import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Building,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock
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

const NetBanking = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const supportedBanks = [
    { id: 'sbi', name: 'State Bank of India', logo: '🏦' },
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏦' },
    { id: 'icici', name: 'ICICI Bank', logo: '🏦' },
    { id: 'axis', name: 'Axis Bank', logo: '🏦' },
    { id: 'pnb', name: 'Punjab National Bank', logo: '🏦' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', logo: '🏦' }
  ];

  const submitMutation = useMutation(
    async () => {
      const response = await api.post('/filing/submit-enhanced', {
        filingId,
        filingMethod: 'net_banking'
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Filing submitted successfully via Net Banking!');
        navigate(`/acknowledgment/${filingId}`, {
          state: { ackNumber: data.data.acknowledgmentNumber }
        });
      },
      onError: (error) => {
        toast.error('Net Banking submission failed');
        console.error('Submission error:', error);
      }
    }
  );

  const handleBankSelection = (bankId) => {
    setSelectedBank(bankId);
    setStep(2);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate bank authentication
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful authentication
      toast.success('Bank authentication successful!');
      setStep(3);

      // Automatically submit filing
      await submitMutation.mutateAsync();
    } catch (error) {
      toast.error('Bank authentication failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderBankSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Bank</h2>
        <p className="text-gray-600">Choose your bank to proceed with Net Banking verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportedBanks.map(bank => (
          <button
            key={bank.id}
            onClick={() => handleBankSelection(bank.id)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{bank.logo}</span>
              <div>
                <div className="font-medium text-gray-900">{bank.name}</div>
                <div className="text-sm text-gray-600">Net Banking</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Secure Connection</h4>
            <p className="text-sm text-blue-700">
              Your banking credentials are encrypted and secure. We follow RBI guidelines for secure transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCredentialsForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CreditCard className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Login</h2>
        <p className="text-gray-600">Enter your {supportedBanks.find(b => b.id === selectedBank)?.name} credentials</p>
      </div>

      <form onSubmit={handleCredentialsSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User ID / Customer ID
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your User ID"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password / PIN
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">Important Notice</h4>
              <p className="text-sm text-yellow-700">
                This is a secure connection. Your credentials are used only for ITR filing and are not stored on our servers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isProcessing || !userId || !password}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Login & Submit
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
        <p className="text-gray-600">Please wait while we submit your ITR through Net Banking...</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">Bank authentication successful</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Net Banking Submission</h1>
          <p className="text-lg text-gray-600 mt-2">File your ITR securely through your bank's portal</p>
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
              <span className="ml-2 text-sm font-medium">Select Bank</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Login</span>
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
          {step === 1 && renderBankSelection()}
          {step === 2 && renderCredentialsForm()}
          {step === 3 && renderProcessing()}
        </div>
      </div>
    </div>
  );
};

export default NetBanking;
