import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/card';
import { Button } from '../../components/UI/button';
import { Input } from '../../components/UI/input';
import { Label } from '../../components/UI/label';
import { Select } from '../../components/UI/select';
import { Alert } from '../../components/UI/alert';
import { Badge } from '../../components/UI/badge';
import { Progress } from '../../components/UI/progress';
import { Loader2, Upload, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { apiClient } from '../../services/enhancedERIService';
import toast from 'react-hot-toast';

/**
 * ERI Integration Component
 * Provides interface for ITR submission to government ERI system
 * Essential for official tax filing and compliance
 */
const ERIIntegration = ({ itrData, onSubmissionComplete }) => {
  const [verificationMethod, setVerificationMethod] = useState('');
  const [verificationData, setVerificationData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [statusCheckResult, setStatusCheckResult] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [verificationMethods, setVerificationMethods] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadVerificationMethods();
    checkSystemStatus();
  }, []);

  /**
   * Load available verification methods
   */
  const loadVerificationMethods = async () => {
    try {
      const result = await enhancedERIService.getVerificationMethods();
      if (result.success) {
        setVerificationMethods(result.data.verificationMethods);
      }
    } catch (error) {
      toast.error('Failed to load verification methods');
    }
  };

  /**
   * Check ERI system status
   */
  const checkSystemStatus = async () => {
    try {
      const result = await enhancedERIService.getSystemStatus();
      if (result.success) {
        setSystemStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to check system status:', error);
    }
  };

  /**
   * Test ERI connection
   */
  const testConnection = async () => {
    try {
      const result = await enhancedERIService.testConnection();
      if (result.success) {
        toast.success('ERI connection successful');
      } else {
        toast.error('ERI connection failed');
      }
    } catch (error) {
      toast.error('ERI connection test failed');
    }
  };

  /**
   * Handle verification method change
   */
  const handleVerificationMethodChange = (method) => {
    setVerificationMethod(method);
    setVerificationData({});
    setErrors({});
  };

  /**
   * Handle verification data change
   */
  const handleVerificationDataChange = (field, value) => {
    setVerificationData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!verificationMethod) {
      newErrors.verificationMethod = 'Please select a verification method';
    }
    
    const validation = enhancedERIService.validateVerificationData(verificationMethod, verificationData);
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        // Map validation errors to specific fields
        if (error.includes('EVC code')) {
          newErrors.evcCode = error;
        } else if (error.includes('DSC certificate')) {
          newErrors.dscCertificate = error;
        } else if (error.includes('DSC password')) {
          newErrors.dscPassword = error;
        } else if (error.includes('Aadhaar number')) {
          newErrors.aadhaarNumber = error;
        } else if (error.includes('OTP')) {
          newErrors.otp = error;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Submit ITR to ERI system
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const formattedITRData = enhancedERIService.formatITRDataForSubmission(itrData);
      
      const result = await enhancedERIService.submitITR(
        formattedITRData,
        verificationMethod,
        verificationData
      );

      if (result.success) {
        setSubmissionResult(result.data);
        toast.success('ITR submitted successfully to government portal');
        
        if (onSubmissionComplete) {
          onSubmissionComplete(result.data);
        }
      } else {
        toast.error(result.message || 'ITR submission failed');
      }
    } catch (error) {
      toast.error(error.message || 'ITR submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check ITR status
   */
  const checkStatus = async () => {
    if (!submissionResult?.ackNumber) {
      toast.error('No acknowledgment number available');
      return;
    }

    setIsCheckingStatus(true);

    try {
      const result = await enhancedERIService.checkITRStatus(submissionResult.ackNumber);
      
      if (result.success) {
        setStatusCheckResult(result.data);
        toast.success('Status updated successfully');
      } else {
        toast.error(result.message || 'Failed to check status');
      }
    } catch (error) {
      toast.error(error.message || 'Status check failed');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /**
   * Download acknowledgment
   */
  const downloadAcknowledgment = async () => {
    if (!submissionResult?.ackNumber) {
      toast.error('No acknowledgment number available');
      return;
    }

    try {
      const result = await enhancedERIService.getITRAcknowledgment(submissionResult.ackNumber);
      
      if (result.success && result.data.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.downloadUrl;
        link.download = `ITR_Acknowledgment_${submissionResult.ackNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Acknowledgment downloaded successfully');
      } else {
        toast.error('Download URL not available');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to download acknowledgment');
    }
  };

  /**
   * Render verification method form
   */
  const renderVerificationForm = () => {
    switch (verificationMethod) {
      case 'EVC':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="evcCode">EVC Code</Label>
              <Input
                id="evcCode"
                type="text"
                placeholder="Enter 10-digit EVC code"
                value={verificationData.evcCode || ''}
                onChange={(e) => handleVerificationDataChange('evcCode', e.target.value)}
                className={errors.evcCode ? 'border-red-500' : ''}
              />
              {errors.evcCode && (
                <p className="text-sm text-red-500 mt-1">{errors.evcCode}</p>
              )}
            </div>
          </div>
        );

      case 'DSC':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dscCertificate">DSC Certificate</Label>
              <Input
                id="dscCertificate"
                type="file"
                accept=".p12,.pfx"
                onChange={(e) => handleVerificationDataChange('dscCertificate', e.target.files[0])}
                className={errors.dscCertificate ? 'border-red-500' : ''}
              />
              {errors.dscCertificate && (
                <p className="text-sm text-red-500 mt-1">{errors.dscCertificate}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dscPassword">DSC Password</Label>
              <Input
                id="dscPassword"
                type="password"
                placeholder="Enter DSC password"
                value={verificationData.dscPassword || ''}
                onChange={(e) => handleVerificationDataChange('dscPassword', e.target.value)}
                className={errors.dscPassword ? 'border-red-500' : ''}
              />
              {errors.dscPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.dscPassword}</p>
              )}
            </div>
          </div>
        );

      case 'Aadhaar':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
              <Input
                id="aadhaarNumber"
                type="text"
                placeholder="Enter 12-digit Aadhaar number"
                value={verificationData.aadhaarNumber || ''}
                onChange={(e) => handleVerificationDataChange('aadhaarNumber', e.target.value)}
                className={errors.aadhaarNumber ? 'border-red-500' : ''}
              />
              {errors.aadhaarNumber && (
                <p className="text-sm text-red-500 mt-1">{errors.aadhaarNumber}</p>
              )}
            </div>
            <div>
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={verificationData.otp || ''}
                onChange={(e) => handleVerificationDataChange('otp', e.target.value)}
                className={errors.otp ? 'border-red-500' : ''}
              />
              {errors.otp && (
                <p className="text-sm text-red-500 mt-1">{errors.otp}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /**
   * Render submission result
   */
  const renderSubmissionResult = () => {
    if (!submissionResult) return null;

    const statusInfo = enhancedERIService.getStatusDisplayInfo(submissionResult.status);

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            ITR Submission Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Acknowledgment Number</Label>
              <p className="text-lg font-mono">{submissionResult.ackNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Submission ID</Label>
              <p className="text-lg font-mono">{submissionResult.submissionId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Status</Label>
              <Badge variant="outline" className={`ml-2 ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {statusInfo.label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Submitted At</Label>
              <p className="text-sm">{new Date(submissionResult.submittedAt).toLocaleString()}</p>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statusInfo.description}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={checkStatus} disabled={isCheckingStatus}>
              {isCheckingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Status...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Check Status
                </>
              )}
            </Button>
            <Button variant="outline" onClick={downloadAcknowledgment}>
              <Download className="mr-2 h-4 w-4" />
              Download Acknowledgment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * Render status check result
   */
  const renderStatusResult = () => {
    if (!statusCheckResult) return null;

    const statusInfo = enhancedERIService.getStatusDisplayInfo(statusCheckResult.status);
    const stageInfo = enhancedERIService.getProcessingStageInfo(statusCheckResult.processingStage);

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            ITR Status Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Current Status</Label>
              <Badge variant="outline" className={`ml-2 ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800' : statusInfo.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {statusInfo.label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Processing Stage</Label>
              <p className="text-sm">{stageInfo.label}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
              <p className="text-sm">{new Date(statusCheckResult.lastUpdated).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Progress</Label>
              <Progress value={stageInfo.progress} className="w-full" />
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {statusInfo.description}
            </AlertDescription>
          </Alert>

          {statusCheckResult.errors && statusCheckResult.errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Errors found:</p>
                  <ul className="list-disc list-inside">
                    {statusCheckResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {statusCheckResult.warnings && statusCheckResult.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Warnings:</p>
                  <ul className="list-disc list-inside">
                    {statusCheckResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ERI System Status</span>
              <Button variant="outline" size="sm" onClick={testConnection}>
                Test Connection
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={systemStatus.system.status === 'operational' ? 'default' : 'destructive'}>
                {systemStatus.system.status}
              </Badge>
              <span className="text-sm text-gray-500">
                Environment: {systemStatus.system.environment}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="verificationMethod">Select Verification Method</Label>
            <Select value={verificationMethod} onValueChange={handleVerificationMethodChange}>
              <SelectTrigger className={errors.verificationMethod ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose verification method" />
              </SelectTrigger>
              <SelectContent>
                {verificationMethods.map((method) => (
                  <SelectItem key={method.method} value={method.method}>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.verificationMethod && (
              <p className="text-sm text-red-500 mt-1">{errors.verificationMethod}</p>
            )}
          </div>

          {verificationMethod && renderVerificationForm()}

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !verificationMethod}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting to Government Portal...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit ITR to Government
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Submission Result */}
      {renderSubmissionResult()}

      {/* Status Check Result */}
      {renderStatusResult()}
    </div>
  );
};

export default ERIIntegration;
