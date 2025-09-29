import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  Calculator,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Users,
  Building,
  TrendingUp,
  Shield,
  Clock,
  Star,
  HelpCircle,
  Download,
  Sparkles,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient as syncApiClient } from '../../services/api';

const ITRSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedITR, setSelectedITR] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [assessmentYear, setAssessmentYear] = useState('2024-25');
  const [showEligibility, setShowEligibility] = useState(false);
  const [userIncomeData, setUserIncomeData] = useState({
    salary: { amount: 0 },
    houseProperty: { amount: 0 },
    business: { amount: 0, turnover: 0 },
    capitalGains: { amount: 0 },
    other: { amount: 0 },
    entityType: 'individual'
  });

  const itrForms = [
    {
      id: 'ITR-1',
      name: 'ITR-1 (Sahaj)',
      description: 'For individuals with salary, pension, or interest income',
      icon: Users,
      color: 'bg-blue-500',
      eligibility: [
        'Salary income',
        'Pension income',
        'Interest income',
        'One house property',
        'Agricultural income up to ₹5,000'
      ],
      notEligible: [
        'Business income',
        'Capital gains',
        'More than one house property',
        'Foreign assets/income',
        'Director of a company'
      ],
      documents: [
        'Form 16',
        'Bank statements',
        'Interest certificates',
        'Rent receipts (if applicable)'
      ],
      processingTime: '3-5 days',
      fee: '₹999',
      popular: true
    },
    {
      id: 'ITR-2',
      name: 'ITR-2',
      description: 'For individuals with capital gains or multiple properties',
      icon: TrendingUp,
      color: 'bg-green-500',
      eligibility: [
        'All ITR-1 conditions',
        'Capital gains',
        'Multiple house properties',
        'Foreign assets/income',
        'Director of a company'
      ],
      notEligible: [
        'Business income',
        'Professional income'
      ],
      documents: [
        'All ITR-1 documents',
        'Sale/purchase deeds',
        'Foreign asset details',
        'Capital gains certificates'
      ],
      processingTime: '5-7 days',
      fee: '₹1,499'
    },
    {
      id: 'ITR-3',
      name: 'ITR-3',
      description: 'For individuals with business or professional income',
      icon: Building,
      color: 'bg-purple-500',
      eligibility: [
        'Business income',
        'Professional income',
        'All ITR-2 conditions'
      ],
      notEligible: [
        'Presumptive taxation (ITR-4)'
      ],
      documents: [
        'All ITR-2 documents',
        'P&L statement',
        'Balance sheet',
        'Audit report (if applicable)',
        'Partnership deed (if applicable)'
      ],
      processingTime: '7-10 days',
      fee: '₹2,499'
    },
    {
      id: 'ITR-4',
      name: 'ITR-4 (Sugam)',
      description: 'For presumptive taxation (business turnover < ₹2 crore)',
      icon: Calculator,
      color: 'bg-orange-500',
      eligibility: [
        'Presumptive business income',
        'Turnover < ₹2 crore',
        'Professional income (gross receipts < ₹50 lakh)'
      ],
      notEligible: [
        'Regular business with books',
        'Turnover > ₹2 crore',
        'Professional receipts > ₹50 lakh'
      ],
      documents: [
        'Bank statements',
        'Cash book (if maintained)',
        'Business details'
      ],
      processingTime: '5-7 days',
      fee: '₹1,999'
    },
    {
      id: 'ITR-5',
      name: 'ITR-5',
      description: 'For partnerships, LLPs, AOPs, and BOIs',
      icon: Building,
      color: 'bg-indigo-500',
      eligibility: [
        'Partnership firm income',
        'LLP income',
        'AOP/BOI income',
        'All ITR-3 conditions'
      ],
      notEligible: [
        'Individual taxpayers',
        'Company entities'
      ],
      documents: [
        'P&L statement',
        'Balance sheet',
        'Partnership deed',
        'Audit report'
      ],
      processingTime: '7-10 days',
      fee: '₹2,999'
    },
    {
      id: 'ITR-6',
      name: 'ITR-6',
      description: 'For companies and corporate entities',
      icon: Building,
      color: 'bg-red-500',
      eligibility: [
        'Company income',
        'Corporate entities',
        'Business income'
      ],
      notEligible: [
        'Individual taxpayers',
        'Partnership firms',
        'Salary income'
      ],
      documents: [
        'P&L statement',
        'Balance sheet',
        'Audit report',
        'Tax audit report'
      ],
      processingTime: '10-14 days',
      fee: '₹3,999'
    },
    {
      id: 'ITR-7',
      name: 'ITR-7',
      description: 'For trusts, political parties, and institutions',
      icon: Shield,
      color: 'bg-teal-500',
      eligibility: [
        'Trust income',
        'Political party income',
        'Institution income',
        'All income sources'
      ],
      notEligible: [
        'Individual taxpayers',
        'Business entities'
      ],
      documents: [
        'Trust deed',
        'Audit report',
        'Donation receipts',
        'Income certificate'
      ],
      processingTime: '7-10 days',
      fee: '₹2,499'
    }
  ];

  const handleITRSelect = (itr) => {
    setSelectedITR(itr);
    setShowDetails(true);
  };

  const handleContinue = () => {
    if (!selectedITR) {
      toast.error('Please select an ITR form to continue');
      return;
    }

    // Navigate to intake form with selected ITR
    navigate('/intake', {
      state: {
        itrType: selectedITR.id,
        assessmentYear: assessmentYear
      }
    });
  };

  const handleBack = () => {
    if (showDetails) {
      setShowDetails(false);
      setSelectedITR(null);
    } else {
      navigate('/dashboard');
    }
  };

  // Eligibility check mutation
  const eligibilityCheckMutation = useMutation(
    async (data) => {
      const response = await api.post('/eligibility/check', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Eligibility check completed!');
        setShowEligibility(true);
      },
      onError: (error) => {
        toast.error('Failed to check eligibility');
        console.error('Eligibility check error:', error);
      }
    }
  );

  // Handle eligibility check
  const handleEligibilityCheck = () => {
    const userProfile = {
      userId: user?.user_id,
      pan: user?.pan,
      name: user?.name,
      email: user?.email
    };

    eligibilityCheckMutation.mutate({
      userProfile,
      incomeData: userIncomeData
    });
  };

  // Get eligibility results
  const eligibilityResults = eligibilityCheckMutation.data?.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Select Your ITR Form
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Choose the appropriate ITR form based on your income sources
              </p>

              {/* Smart Recommendation Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Get Smart Recommendations</h3>
                  </div>
                  <button
                    onClick={handleEligibilityCheck}
                    disabled={eligibilityCheckMutation.isLoading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {eligibilityCheckMutation.isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4 mr-2" />
                    )}
                    Check Eligibility
                  </button>
                </div>

                {/* Income Input Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Income (₹)
                    </label>
                    <input
                      type="number"
                      value={userIncomeData.salary.amount}
                      onChange={(e) => setUserIncomeData(prev => ({
                        ...prev,
                        salary: { amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Annual salary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      House Property (₹)
                    </label>
                    <input
                      type="number"
                      value={userIncomeData.houseProperty.amount}
                      onChange={(e) => setUserIncomeData(prev => ({
                        ...prev,
                        houseProperty: { amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rental income"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Income (₹)
                    </label>
                    <input
                      type="number"
                      value={userIncomeData.business.amount}
                      onChange={(e) => setUserIncomeData(prev => ({
                        ...prev,
                        business: { amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Business profit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capital Gains (₹)
                    </label>
                    <input
                      type="number"
                      value={userIncomeData.capitalGains.amount}
                      onChange={(e) => setUserIncomeData(prev => ({
                        ...prev,
                        capitalGains: { amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Capital gains"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Income (₹)
                    </label>
                    <input
                      type="number"
                      value={userIncomeData.other.amount}
                      onChange={(e) => setUserIncomeData(prev => ({
                        ...prev,
                        other: { amount: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Other income"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Type
                    </label>
                    <select
                      value={userIncomeData.entityType || 'individual'}
                      onChange={(e) => setUserIncomeData(prev => ({
                        ...prev,
                        entityType: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="individual">Individual</option>
                      <option value="partnership">Partnership</option>
                      <option value="llp">LLP</option>
                      <option value="company">Company</option>
                      <option value="trust">Trust</option>
                      <option value="aop">AOP</option>
                      <option value="boi">BOI</option>
                    </select>
                  </div>
                </div>

                {/* Eligibility Results */}
                {showEligibility && eligibilityResults && (
                  <div className="mt-6 p-4 bg-white rounded-lg border">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                      Your ITR Recommendations
                    </h4>

                    {eligibilityResults.recommendedForm && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium text-green-800">
                              Recommended: {eligibilityResults.recommendedForm.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-green-600 font-medium">
                              {Math.round(eligibilityResults.recommendedForm.confidence * 100)}% Match
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          This form best matches your income profile and requirements.
                        </p>
                        <div className="mt-2">
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${eligibilityResults.recommendedForm.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Eligible Forms:</h5>
                        <div className="space-y-2">
                          {eligibilityResults.eligibleForms.map(form => (
                            <div key={form.code} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                <span className="text-sm font-medium">{form.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-600 mr-2">
                                  {Math.round(form.confidence * 100)}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${form.confidence * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Not Eligible:</h5>
                        <div className="space-y-1">
                          {eligibilityResults.notEligibleForms.map(form => (
                            <div key={form.code} className="flex items-center text-sm text-gray-500">
                              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                              {form.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Assessment Year</div>
              <select
                value={assessmentYear}
                onChange={(e) => setAssessmentYear(e.target.value)}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
              </select>
            </div>
          </div>
        </div>

        {!showDetails ? (
          /* ITR Selection Grid */
          <div className="space-y-6">
            {/* Quick Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Choose Your ITR Form</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <h4 className="font-medium mb-2">✅ Choose ITR-1 if you have:</h4>
                      <ul className="space-y-1">
                        <li>• Salary or pension income</li>
                        <li>• Interest from bank deposits</li>
                        <li>• One house property</li>
                        <li>• No business income</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">🔍 Need ITR-2/3/4 if you have:</h4>
                      <ul className="space-y-1">
                        <li>• Capital gains</li>
                        <li>• Business income</li>
                        <li>• Multiple properties</li>
                        <li>• Foreign assets</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ITR Forms Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {itrForms.map((itr) => {
                const IconComponent = itr.icon;
                return (
                  <div
                    key={itr.id}
                    className={`bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-primary-300 transition-all duration-200 cursor-pointer group ${
                      itr.popular ? 'ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => handleITRSelect(itr)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${itr.color} text-white`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{itr.name}</h3>
                            {itr.popular && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Star className="w-3 h-3 mr-1" />
                                Most Popular
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                      </div>

                      <p className="text-gray-600 mb-4">{itr.description}</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Processing Time:</span>
                          <span className="font-medium text-gray-900">{itr.processingTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Service Fee:</span>
                          <span className="font-medium text-gray-900">{itr.fee}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Eligible for:</h4>
                        <div className="flex flex-wrap gap-1">
                          {itr.eligibility.slice(0, 3).map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {item}
                            </span>
                          ))}
                          {itr.eligibility.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                              +{itr.eligibility.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Choosing?</h3>
                  <p className="text-gray-600 mb-4">
                    Our tax experts can help you select the right ITR form based on your specific income sources and requirements.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate('/ca-assistance')}
                      className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Get Expert Help
                    </button>
                    <button
                      onClick={() => navigate('/tax-calculator')}
                      className="flex items-center justify-center px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Tax Calculator
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ITR Details View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBack}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${selectedITR.color} text-white`}>
                      <selectedITR.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedITR.name}</h2>
                      <p className="text-sm text-gray-600">{selectedITR.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Fee:</span>
                  <span className="text-lg font-semibold text-gray-900">{selectedITR.fee}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Eligibility */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    You're Eligible If You Have:
                  </h3>
                  <ul className="space-y-2">
                    {selectedITR.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Not Eligible */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    Not Eligible If You Have:
                  </h3>
                  <ul className="space-y-2">
                    {selectedITR.notEligible.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Required Documents */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  Required Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedITR.documents.map((doc, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-500 mr-3" />
                      <span className="text-gray-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">Processing Time</h4>
                  <p className="text-sm text-gray-600">{selectedITR.processingTime}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">CA Review</h4>
                  <p className="text-sm text-gray-600">Included</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900">E-filing</h4>
                  <p className="text-sm text-gray-600">Included</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinue}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Continue with {selectedITR.name}
                </button>
                <button
                  onClick={() => navigate('/ca-assistance')}
                  className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Get Expert Help
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITRSelection;
