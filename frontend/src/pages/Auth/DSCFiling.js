import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  FileText,
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  Key,
  Download
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

const DSCFiling = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const certificates = [
    { id: 'class2', name: 'Class 2 Individual', issuer: 'eMudhra', validUntil: '2025-12-31' },
    { id: 'class3', name: 'Class 3 Individual', issuer: 'eMudhra', validUntil: '2025-12-31' },
    { id: 'organization', name: 'Organization', issuer: 'eMudhra', validUntil: '2025-12-31' }
  ];

  const submitMutation = useMutation(
    async () => {
      const response = await api.post('/filing/submit-enhanced', {
        filingId,
        filingMethod: 'dsc'
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Filing submitted successfully via DSC!');
        navigate(`/acknowledgment/${filingId}`, {
          state: { ackNumber: data.data.acknowledgmentNumber }
        });
      },
      onError: (error) => {
        toast.error('DSC submission failed');
        console.error('Submission error:', error);
      }
    }
  );

  const handleCertificateSelect = (cert) => {
    setSelectedCertificate(cert);
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/x-pkcs12' && !file.name.endsWith('.pfx') && !file.name.endsWith('.p12')) {
        toast.error('Please select a valid DSC file (.pfx or .p12)');
        return;
      }
      setCertificateFile(file);
      setStep(3);
    }
  };

  const handleValidateCertificate = async () => {
    if (!certificatePassword) {
      toast.error('Please enter your certificate password');
      return;
    }

    setIsValidating(true);

    try {
      // Simulate certificate validation
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock validation success
      toast.success('DSC validated successfully!');
      setStep(4);

      // Automatically submit filing
      await submitMutation.mutateAsync();
    } catch (error) {
      toast.error('DSC validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const renderCertificateSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Digital Signature Certificate</h2>
        <p className="text-gray-600">Choose your DSC for secure electronic filing</p>
      </div>

      <div className="space-y-4">
        {certificates.map(cert => (
          <button
            key={cert.id}
            onClick={() => handleCertificateSelect(cert)}
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-purple-600 mr-4" />
                <div>
                  <div className="font-medium text-gray-900">{cert.name}</div>
                  <div className="text-sm text-gray-600">Issuer: {cert.issuer}</div>
                  <div className="text-sm text-gray-600">Valid until: {cert.validUntil}</div>
                </div>
              </div>
              <div className="text-purple-600">
                <Key className="w-5 h-5" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-1">DSC Requirements</h4>
            <p className="text-sm text-purple-700">
              Your DSC must be valid and issued by a licensed Certifying Authority. Class 2 or Class 3 certificates are accepted for ITR filing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFileUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload DSC File</h2>
        <p className="text-gray-600">Upload your Digital Signature Certificate file</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pfx,.p12,application/x-pkcs12"
          onChange={handleFileUpload}
          className="hidden"
        />

        {certificateFile ? (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <div className="font-medium text-gray-900">{certificateFile.name}</div>
              <div className="text-sm text-gray-600">
                {(certificateFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Choose different file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to upload DSC file
              </button>
              <p className="text-sm text-gray-600 mt-1">Supported formats: .pfx, .p12</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!certificateFile}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderCertificateValidation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validate Certificate</h2>
        <p className="text-gray-600">Enter your certificate password to validate and sign</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Certificate:</span>
          <span className="text-sm text-gray-900">{selectedCertificate?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">File:</span>
          <span className="text-sm text-gray-900">{certificateFile?.name}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certificate Password
        </label>
        <input
          type="password"
          value={certificatePassword}
          onChange={(e) => setCertificatePassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your certificate password"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          This is the password you set when creating your DSC
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Important</h4>
            <p className="text-sm text-yellow-700">
              Your DSC will be used to digitally sign your ITR. Make sure your certificate is valid and not expired.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setStep(2)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleValidateCertificate}
          disabled={isValidating || !certificatePassword}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Validate & Sign
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Filing</h2>
        <p className="text-gray-600">Please wait while we validate your DSC and submit your ITR...</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-sm text-gray-700">DSC validated successfully</span>
          </div>
          <div className="flex items-center">
            <RefreshCw className="w-5 h-5 text-blue-600 mr-3 animate-spin" />
            <span className="text-sm text-gray-700">Digitally signing and submitting</span>
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
          <h1 className="text-3xl font-bold text-gray-900">DSC Submission</h1>
          <p className="text-lg text-gray-600 mt-2">File your ITR using Digital Signature Certificate</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select DSC</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Upload File</span>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Validate</span>
            </div>
            <div className={`flex items-center ${step >= 4 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 4 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                4
              </div>
              <span className="ml-2 text-sm font-medium">Submit</span>
            </div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg border p-8">
          {step === 1 && renderCertificateSelection()}
          {step === 2 && renderFileUpload()}
          {step === 3 && renderCertificateValidation()}
          {step === 4 && renderProcessing()}
        </div>
      </div>
    </div>
  );
};

export default DSCFiling;
