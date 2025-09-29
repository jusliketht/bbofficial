import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle,
  AlertCircle,
  Edit,
  FileText,
  Calculator,
  Upload,
  ArrowLeft,
  ArrowRight,
  Shield,
  Users,
  DollarSign,
  Building,
  TrendingUp,
  Download,
  Printer,
  Mail,
  Eye,
  AlertTriangle,
  RefreshCw,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../services/api';

const ReviewValidation = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch filing data
  const { data: filingData, isLoading: filingLoading } = useQuery(
    ['filing-review', filingId],
    () => api.get(`/api/filing/${filingId}`).then(res => res.data),
    {
      enabled: !!filingId,
      onError: (error) => {
        toast.error('Failed to load filing data');
      }
    }
  );

  // Fetch tax computation
  const { data: taxComputation, isLoading: taxLoading, refetch: refetchTax } = useQuery(
    ['tax-computation', filingId],
    () => api.get(`/api/tax/compute?filing_id=${filingId}`).then(res => res.data),
    {
      enabled: !!filingId,
      onError: (error) => {
        console.error('Failed to load tax computation:', error);
      }
    }
  );

  // Fetch documents
  const { data: documents } = useQuery(
    ['documents', filingId],
    () => api.get(`/api/upload/documents/${filingId}`).then(res => res.data.data),
    {
      enabled: !!filingId
    }
  );

  // Validate filing mutation
  const validateMutation = useMutation(
    async () => {
      const response = await api.post('/eligibility/validate', {
        intakeData: filingData?.intake_data
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (data.isValid) {
          setValidationErrors([]);
          toast.success('All validations passed!');
        } else {
          setValidationErrors(data.errors);
          toast.error('Please fix validation errors');
        }
      },
      onError: (error) => {
        toast.error('Validation failed');
        console.error('Validation error:', error);
      }
    }
  );

  // Submit filing mutation
  const submitMutation = useMutation(
    async (filingMethod) => {
      const response = await api.post('/filing/submit', {
        filingId,
        filingMethod
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Filing submitted successfully!');
        navigate(`/acknowledgment/${filingId}`, {
          state: { ackNumber: data.acknowledgmentNumber }
        });
      },
      onError: (error) => {
        toast.error('Filing submission failed');
        console.error('Submission error:', error);
      }
    }
  );

  const sections = [
    { id: 'overview', title: 'Overview', icon: Eye, color: 'blue' },
    { id: 'personal', title: 'Personal Info', icon: Users, color: 'green' },
    { id: 'income', title: 'Income Sources', icon: DollarSign, color: 'purple' },
    { id: 'deductions', title: 'Deductions', icon: Shield, color: 'orange' },
    { id: 'documents', title: 'Documents', icon: Upload, color: 'indigo' },
    { id: 'tax', title: 'Tax Calculation', icon: Calculator, color: 'red' },
    { id: 'review', title: 'Final Review', icon: CheckCircle, color: 'emerald' }
  ];

  const getSectionColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      indigo: 'bg-indigo-500',
      red: 'bg-red-500',
      emerald: 'bg-emerald-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const handleSectionEdit = (sectionId) => {
    // Navigate to the appropriate section for editing
    switch (sectionId) {
      case 'personal':
        navigate(`/intake/${filingId}?step=1`);
        break;
      case 'income':
        navigate(`/intake/${filingId}?step=2`);
        break;
      case 'deductions':
        navigate(`/intake/${filingId}?step=3`);
        break;
      case 'documents':
        navigate(`/documents/${filingId}`);
        break;
      case 'tax':
        navigate(`/tax-summary/${filingId}`);
        break;
      default:
        break;
    }
  };

  const handleValidate = () => {
    validateMutation.mutate();
  };

  const handleSubmit = async (filingMethod) => {
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(filingMethod);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Filing Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filingData?.itr_type || 'ITR-1'}
            </div>
            <div className="text-sm text-gray-600">ITR Type</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filingData?.assessment_year || '2024-25'}
            </div>
            <div className="text-sm text-gray-600">Assessment Year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {taxComputation?.totalTax ? `₹${taxComputation.totalTax.toLocaleString()}` : 'Calculating...'}
            </div>
            <div className="text-sm text-gray-600">Total Tax</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Status</h3>
        <div className="space-y-3">
          {sections.slice(1, -1).map(section => (
            <div key={section.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full ${getSectionColor(section.color)} flex items-center justify-center mr-3`}>
                  <section.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{section.title}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-green-600">Complete</span>
                <button
                  onClick={() => handleSectionEdit(section.id)}
                  className="ml-3 text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleValidate}
            disabled={validateMutation.isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {validateMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Validate Filing
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </button>
          <button
            onClick={() => {/* Download JSON */}}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <button
            onClick={() => handleSectionEdit('personal')}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-sm text-gray-900">{filingData?.personal_info?.name || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PAN</label>
            <p className="mt-1 text-sm text-gray-900">{filingData?.personal_info?.pan || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhaar</label>
            <p className="mt-1 text-sm text-gray-900">{filingData?.personal_info?.aadhaar || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile</label>
            <p className="mt-1 text-sm text-gray-900">{filingData?.personal_info?.mobile || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncomeSources = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Income Sources</h3>
          <button
            onClick={() => handleSectionEdit('income')}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {filingData?.income_sources?.salary && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Salary Income</span>
              <span className="text-green-600 font-semibold">
                ₹{filingData.income_sources.salary.amount?.toLocaleString() || 0}
              </span>
            </div>
          )}
          {filingData?.income_sources?.house_property && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">House Property</span>
              <span className="text-green-600 font-semibold">
                ₹{filingData.income_sources.house_property.amount?.toLocaleString() || 0}
              </span>
            </div>
          )}
          {filingData?.income_sources?.business && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Business Income</span>
              <span className="text-green-600 font-semibold">
                ₹{filingData.income_sources.business.amount?.toLocaleString() || 0}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTaxCalculation = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tax Calculation</h3>
          <button
            onClick={() => handleSectionEdit('tax')}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {taxLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Calculating tax...</span>
          </div>
        ) : taxComputation ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ₹{taxComputation.grossIncome?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-blue-700">Gross Income</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ₹{taxComputation.netTax?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-green-700">Net Tax Payable</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Tax Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taxable Income</span>
                  <span>₹{taxComputation.taxableIncome?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Amount</span>
                  <span>₹{taxComputation.taxAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cess (4%)</span>
                  <span>₹{taxComputation.cess?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total Tax</span>
                  <span>₹{taxComputation.totalTax?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tax calculation not available
          </div>
        )}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
          <button
            onClick={() => handleSectionEdit('documents')}
            className="text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">{doc.fileName}</div>
                    <div className="text-sm text-gray-600">
                      {doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {doc.status === 'processed' && (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    doc.status === 'processed' ? 'bg-green-100 text-green-800' :
                    doc.status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No documents uploaded
          </div>
        )}
      </div>
    </div>
  );

  const renderFinalReview = () => (
    <div className="space-y-6">
      {/* Validation Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Summary</h3>

        {validationErrors.length > 0 ? (
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-sm text-green-700">All validations passed!</span>
          </div>
        )}
      </div>

      {/* Filing Declaration */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Declaration</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <input type="checkbox" className="mt-1 mr-3" />
            <div className="text-sm text-gray-700">
              I hereby declare that to the best of my knowledge and belief, the information given in this return and in the schedules, statements and documents enclosed is correct and complete.
            </div>
          </div>
          <div className="flex items-start">
            <input type="checkbox" className="mt-1 mr-3" />
            <div className="text-sm text-gray-700">
              I have been authorized by the assessee to sign and submit this return in accordance with the provisions of section 140 of the Income-tax Act, 1961.
            </div>
          </div>
        </div>
      </div>

      {/* Filing Options */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Filing Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/net-banking/${filingId}`)}
            disabled={validationErrors.length > 0}
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Net Banking</div>
            <div className="text-sm text-gray-600">File through bank</div>
          </button>
          <button
            onClick={() => navigate(`/aadhaar-otp/${filingId}`)}
            disabled={validationErrors.length > 0}
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
          >
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Aadhaar OTP</div>
            <div className="text-sm text-gray-600">Verify with Aadhaar</div>
          </button>
          <button
            onClick={() => navigate(`/dsc-filing/${filingId}`)}
            disabled={validationErrors.length > 0}
            className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Digital Signature</div>
            <div className="text-sm text-gray-600">Use DSC certificate</div>
          </button>
        </div>
      </div>
    </div>
  );

  if (filingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading filing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Review & Submit</h1>
              <p className="text-lg text-gray-600 mt-2">
                Review your ITR filing before final submission
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Filing ID</div>
              <div className="font-mono text-lg font-semibold">{filingId}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mr-3" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'personal' && renderPersonalInfo()}
            {activeSection === 'income' && renderIncomeSources()}
            {activeSection === 'documents' && renderDocuments()}
            {activeSection === 'tax' && renderTaxCalculation()}
            {activeSection === 'review' && renderFinalReview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewValidation;
