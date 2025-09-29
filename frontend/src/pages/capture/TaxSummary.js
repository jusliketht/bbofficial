import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Calculator, 
  TrendingDown, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Edit
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { apiClient as filingClient } from '../../services/filingService';
import { apiClient as taxClient } from '../../services/taxService';

const TaxSummary = () => {
  const { filingId } = useParams();
  const navigate = useNavigate();
  const [selectedRegime, setSelectedRegime] = useState('old');

  // Fetch filing details
  const { data: filing, isLoading: filingLoading } = useQuery(
    ['filing', filingId],
    () => filingService.getFiling(filingId),
    {
      onError: (error) => {
        toast.error('Failed to load filing details');
      },
    }
  );

  // Fetch latest tax computation
  const { data: taxComputation, isLoading: taxLoading, refetch: refetchTax } = useQuery(
    ['tax-computation', filingId],
    () => taxService.getLatestTaxComputation(filingId),
    {
      onError: (error) => {
        console.error('Failed to load tax computation:', error);
      },
    }
  );

  // Compute tax mutation
  const computeTaxMutation = useMutation(
    async () => {
      return taxService.computeTax(filingId, selectedRegime);
    },
    {
      onSuccess: () => {
        toast.success('Tax computation completed!');
        refetchTax();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to compute tax');
      },
    }
  );

  const handleComputeTax = () => {
    computeTaxMutation.mutate();
  };

  const handleEditIntake = () => {
    navigate(`/intake/${filingId}`);
  };

  const handleContinueToFiling = () => {
    navigate(`/filing/${filingId}/submit`); // Justification: Navigate to filing submission workflow
  };

  if (filingLoading || taxLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const taxData = taxComputation?.computation?.computation_data;
  const hasTaxData = taxData && Object.keys(taxData).length > 0;

  // Prepare chart data
  const incomeBreakdownData = hasTaxData ? [
    { name: 'Salary', value: taxData.breakdown.salary, color: '#3B82F6' },
    { name: 'House Property', value: taxData.breakdown.houseProperty, color: '#10B981' },
    { name: 'Business', value: taxData.breakdown.business, color: '#F59E0B' },
    { name: 'Capital Gains', value: taxData.breakdown.capitalGains, color: '#EF4444' },
    { name: 'Other Income', value: taxData.breakdown.otherIncome, color: '#8B5CF6' }
  ].filter(item => item.value > 0) : [];

  const regimeComparisonData = hasTaxData ? [
    {
      name: 'Old Regime',
      taxableIncome: taxData.oldRegime.taxableIncome,
      finalTax: taxData.oldRegime.finalTax,
      effectiveRate: taxData.oldRegime.effectiveRate
    },
    {
      name: 'New Regime',
      taxableIncome: taxData.newRegime.taxableIncome,
      finalTax: taxData.newRegime.finalTax,
      effectiveRate: taxData.newRegime.effectiveRate
    }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Tax Summary</h1>
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
              {!hasTaxData && (
                <button
                  onClick={handleComputeTax}
                  disabled={computeTaxMutation.isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  {computeTaxMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Compute Tax
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {!hasTaxData ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Tax Computation Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Complete your income details and compute tax to view the summary.
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleEditIntake}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-white hover:bg-yellow-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Income Details
            </button>
            <button
              onClick={handleComputeTax}
              disabled={computeTaxMutation.isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              {computeTaxMutation.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              Compute Tax
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tax Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old Regime Card */}
              <div className={`bg-white shadow rounded-lg p-6 border-2 ${
                selectedRegime === 'old' ? 'border-primary-500' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Old Regime</h3>
                  {taxData.comparison.recommendedRegime === 'old' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Taxable Income</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{taxData.oldRegime.taxableIncome.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tax</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{taxData.oldRegime.finalTax.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Effective Rate</p>
                    <p className="text-lg font-medium text-gray-900">
                      {taxData.oldRegime.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRegime('old')}
                  className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium ${
                    selectedRegime === 'old'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  View Details
                </button>
              </div>

              {/* New Regime Card */}
              <div className={`bg-white shadow rounded-lg p-6 border-2 ${
                selectedRegime === 'new' ? 'border-primary-500' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">New Regime</h3>
                  {taxData.comparison.recommendedRegime === 'new' && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Taxable Income</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{taxData.newRegime.taxableIncome.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tax</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ₹{taxData.newRegime.finalTax.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Effective Rate</p>
                    <p className="text-lg font-medium text-gray-900">
                      {taxData.newRegime.effectiveRate.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRegime('new')}
                  className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium ${
                    selectedRegime === 'new'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Tax Savings Alert */}
            {taxData.comparison.taxSavings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <TrendingDown className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">
                      Tax Savings Available!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      You can save ₹{taxData.comparison.taxSavings.toLocaleString()} by choosing the{' '}
                      <span className="font-semibold">{taxData.comparison.recommendedRegime} regime</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Income Breakdown Chart */}
            {incomeBreakdownData.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Income Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                                         <RechartsPieChart>
                      <Pie
                        data={incomeBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                         </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Regime Comparison Chart */}
            {regimeComparisonData.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Regime Comparison</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regimeComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="finalTax" fill="#3B82F6" name="Final Tax" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ₹{taxData.income.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Deductions</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{taxData.income.totalDeductions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Standard Deduction</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{taxData.income.standardDeduction.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recommended Regime</p>
                  <p className="text-lg font-medium text-primary-600">
                    {taxData.comparison.recommendedRegime.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tax Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRegime === 'old' ? 'Old Regime' : 'New Regime'} Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Basic Tax</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{taxData[selectedRegime].basicTax.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cess (4%)</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{taxData[selectedRegime].cess.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rebate</p>
                  <p className="text-lg font-medium text-green-600">
                    ₹{taxData[selectedRegime].rebate.toLocaleString()}
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600">Final Tax</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ₹{taxData[selectedRegime].finalTax.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleEditIntake}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Income Details
                </button>
                <button
                  onClick={handleContinueToFiling}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Continue to Filing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxSummary;
