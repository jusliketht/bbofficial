import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, TrendingUp, Info, Target, BarChart3, Zap, Lightbulb, TrendingDown } from 'lucide-react';

const TaxCalculator = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState({
    section80C: '',
    section80D: '',
    section80TTA: '',
    section80G: '',
    section24: '',
    hra: '',
    conveyance: '',
    lta: ''
  });
  const [regime, setRegime] = useState('newRegime');
  const [calculatedTax, setCalculatedTax] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [showEducationalTips, setShowEducationalTips] = useState(true);

  // Tax calculation logic
  const calculateTax = (incomeValue, deductionValues, taxRegime) => {
    if (!incomeValue || incomeValue <= 0) return null;

    let taxableIncome = incomeValue;
    let deductionBreakdown = [];

    // Calculate deductions
    if (taxRegime === 'oldRegime') {
      const section80C = Math.min(parseFloat(deductionValues.section80C) || 0, 150000);
      const section80D = parseFloat(deductionValues.section80D) || 0;
      const section80TTA = Math.min(parseFloat(deductionValues.section80TTA) || 0, 10000);
      const section80G = parseFloat(deductionValues.section80G) || 0;
      const section24 = parseFloat(deductionValues.section24) || 0;
      const hra = parseFloat(deductionValues.hra) || 0;
      const conveyance = Math.min(parseFloat(deductionValues.conveyance) || 0, 19200);
      const lta = parseFloat(deductionValues.lta) || 0;

      const totalDeductions = section80C + section80D + section80TTA + section80G + section24 + hra + conveyance + lta;
      taxableIncome = Math.max(0, incomeValue - totalDeductions);

      deductionBreakdown = [
        { name: 'Section 80C', amount: section80C, max: 150000 },
        { name: 'Section 80D', amount: section80D, max: 25000 },
        { name: 'Section 80TTA', amount: section80TTA, max: 10000 },
        { name: 'Section 80G', amount: section80G, max: '10% of income' },
        { name: 'Section 24', amount: section24, max: 200000 },
        { name: 'HRA', amount: hra, max: 'Actual HRA received' },
        { name: 'Conveyance', amount: conveyance, max: 19200 },
        { name: 'LTA', amount: lta, max: 'Actual LTA received' }
      ].filter(item => item.amount > 0);
    }

    let tax = 0;
    let breakdown = [];

    if (taxRegime === 'newRegime') {
      // New Tax Regime (FY 2024-25)
      if (taxableIncome <= 300000) {
        tax = 0;
        breakdown.push({ slab: 'Up to ₹3,00,000', rate: '0%', tax: 0 });
      } else if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05;
        breakdown.push({ slab: '₹3,00,001 - ₹6,00,000', rate: '5%', tax: tax });
      } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.10;
        breakdown.push({ slab: '₹6,00,001 - ₹9,00,000', rate: '10%', tax: 15000 });
        if (taxableIncome > 600000) {
          breakdown.push({ slab: 'Above ₹6,00,000', rate: '10%', tax: (taxableIncome - 600000) * 0.10 });
        }
      } else if (taxableIncome <= 1200000) {
        tax = 45000 + (taxableIncome - 900000) * 0.15;
        breakdown.push({ slab: '₹9,00,001 - ₹12,00,000', rate: '15%', tax: 45000 });
        if (taxableIncome > 900000) {
          breakdown.push({ slab: 'Above ₹9,00,000', rate: '15%', tax: (taxableIncome - 900000) * 0.15 });
        }
      } else if (taxableIncome <= 1500000) {
        tax = 90000 + (taxableIncome - 1200000) * 0.20;
        breakdown.push({ slab: '₹12,00,001 - ₹15,00,000', rate: '20%', tax: 90000 });
        if (taxableIncome > 1200000) {
          breakdown.push({ slab: 'Above ₹12,00,000', rate: '20%', tax: (taxableIncome - 1200000) * 0.20 });
        }
      } else {
        tax = 150000 + (taxableIncome - 1500000) * 0.30;
        breakdown.push({ slab: '₹15,00,001 - ₹50,00,000', rate: '30%', tax: 150000 });
        if (taxableIncome > 1500000) {
          breakdown.push({ slab: 'Above ₹15,00,000', rate: '30%', tax: (taxableIncome - 1500000) * 0.30 });
        }
      }
    } else {
      // Old Tax Regime (FY 2024-25)
      if (taxableIncome <= 250000) {
        tax = 0;
        breakdown.push({ slab: 'Up to ₹2,50,000', rate: '0%', tax: 0 });
      } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
        breakdown.push({ slab: '₹2,50,001 - ₹5,00,000', rate: '5%', tax: tax });
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.20;
        breakdown.push({ slab: '₹5,00,001 - ₹10,00,000', rate: '20%', tax: 12500 });
        if (taxableIncome > 500000) {
          breakdown.push({ slab: 'Above ₹5,00,000', rate: '20%', tax: (taxableIncome - 500000) * 0.20 });
        }
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.30;
        breakdown.push({ slab: '₹10,00,001 - ₹50,00,000', rate: '30%', tax: 112500 });
        if (taxableIncome > 1000000) {
          breakdown.push({ slab: 'Above ₹10,00,000', rate: '30%', tax: (taxableIncome - 1000000) * 0.30 });
        }
      }
    }

    // Add surcharge for high income
    let surcharge = 0;
    if (taxableIncome > 5000000) {
      if (taxableIncome <= 10000000) {
        surcharge = tax * 0.10;
      } else if (taxableIncome <= 20000000) {
        surcharge = tax * 0.15;
      } else if (taxableIncome <= 50000000) {
        surcharge = tax * 0.25;
      } else {
        surcharge = tax * 0.37;
      }
    }

    // Add 4% Health and Education Cess
    const cess = (tax + surcharge) * 0.04;
    const totalTax = tax + surcharge + cess;

    return {
      grossIncome: incomeValue,
      taxableIncome,
      deductions: taxRegime === 'oldRegime' ? deductionValues : {},
      deductionBreakdown,
      tax,
      surcharge,
      cess,
      totalTax,
      breakdown,
      effectiveRate: ((totalTax / incomeValue) * 100).toFixed(2),
      regime: taxRegime
    };
  };

  // Real-time calculation
  const taxCalculation = useMemo(() => {
    const incomeValue = parseFloat(income) || 0;
    if (incomeValue <= 0) return null;

    return calculateTax(incomeValue, deductions, regime);
  }, [income, deductions, regime]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (taxCalculation) {
      setCalculatedTax(taxCalculation);
    }
  }, [taxCalculation]);

  // Compare regimes
  const compareRegimes = () => {
    const incomeValue = parseFloat(income) || 0;
    if (incomeValue <= 0) return;

    const newRegimeTax = calculateTax(incomeValue, {}, 'newRegime');
    const oldRegimeTax = calculateTax(incomeValue, deductions, 'oldRegime');

    const savings = oldRegimeTax.totalTax - newRegimeTax.totalTax;

    setComparisonData({
      newRegime: newRegimeTax,
      oldRegime: oldRegimeTax,
      savings: Math.abs(savings),
      recommended: savings > 0 ? 'oldRegime' : 'newRegime'
    });

    setActiveTab('comparison');
  };

  // Generate tax scenarios
  const generateScenarios = () => {
    const baseIncome = parseFloat(income) || 0;
    if (baseIncome <= 0) return;

    const scenarios = [
      { name: 'Current Income', income: baseIncome, description: 'Your entered income' },
      { name: '10% Increase', income: baseIncome * 1.1, description: '10% salary hike' },
      { name: '20% Increase', income: baseIncome * 1.2, description: '20% salary hike' },
      { name: 'Freelance Income', income: baseIncome * 0.3, description: 'Additional freelance income' }
    ];

    const scenarioResults = scenarios.map(scenario => ({
      ...scenario,
      calculation: calculateTax(scenario.income, deductions, regime)
    }));

    setScenarios(scenarioResults);
    setActiveTab('scenarios');
  };

  const handleDeductionChange = (field, value) => {
    setDeductions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 mobile-safe-area">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 container-mobile">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Tax Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate, compare, and plan your tax strategy for FY 2024-25
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
            {[
              { id: 'calculator', label: 'Calculator', icon: Calculator },
              { id: 'comparison', label: 'Compare', icon: BarChart3 },
              { id: 'scenarios', label: 'Scenarios', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors touch-target ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-mobile">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Calculator className="w-6 h-6 mr-2 text-blue-600" />
                Tax Calculator
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Gross Income (₹)
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="Enter your annual gross income"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-form-input"
                  />
                  {showEducationalTips && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Include salary, business income, house property, etc.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Regime
                  </label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-form-input"
                  >
                    <option value="newRegime">New Tax Regime (Lower rates, no deductions)</option>
                    <option value="oldRegime">Old Tax Regime (Deductions available)</option>
                  </select>
                </div>

                {/* Deductions Section - Only show for Old Regime */}
                {regime === 'oldRegime' && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
                      Tax-saving Deductions
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section 80C (₹150,000 max)
                        </label>
                        <input
                          type="number"
                          value={deductions.section80C}
                          onChange={(e) => handleDeductionChange('section80C', e.target.value)}
                          placeholder="PPF, ELSS, Life Insurance, etc."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section 80D - Health Insurance (₹25,000 max)
                        </label>
                        <input
                          type="number"
                          value={deductions.section80D}
                          onChange={(e) => handleDeductionChange('section80D', e.target.value)}
                          placeholder="Medical insurance premium"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-form-input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section 80TTA - Savings Interest (₹10,000 max)
                        </label>
                        <input
                          type="number"
                          value={deductions.section80TTA}
                          onChange={(e) => handleDeductionChange('section80TTA', e.target.value)}
                          placeholder="Interest from savings account"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t">
                  <button
                    onClick={compareRegimes}
                    disabled={!income}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium touch-target"
                  >
                    Compare Tax Regimes
                  </button>

                  <button
                    onClick={generateScenarios}
                    disabled={!income}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium touch-target"
                  >
                    Generate Tax Scenarios
                  </button>
                </div>
              </div>

              {/* Educational Tips */}
              {showEducationalTips && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">💡 Tax Planning Tip</p>
                      <p>
                        {regime === 'newRegime'
                          ? 'New regime offers lower tax rates but no deductions. Choose if you have minimal investments.'
                          : 'Old regime allows deductions up to ₹5 lakhs. Choose if you have significant investments and deductions.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-mobile">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                Tax Calculation Results
              </h2>

              {calculatedTax ? (
                <div className="space-y-6">
                  {/* Key Summary */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-800">Gross Income:</span>
                        <span className="font-bold text-blue-900 text-lg">₹{calculatedTax.grossIncome.toLocaleString()}</span>
                      </div>
                    </div>

                    {regime === 'oldRegime' && calculatedTax.deductionBreakdown.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-800">Total Deductions:</span>
                          <span className="font-bold text-green-900">₹{calculatedTax.deductionBreakdown.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxable Income:</span>
                        <span className="font-semibold">₹{calculatedTax.taxableIncome.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-yellow-800">Basic Tax:</span>
                        <span className="font-bold text-yellow-900">₹{calculatedTax.tax.toLocaleString()}</span>
                      </div>
                    </div>

                    {calculatedTax.surcharge > 0 && (
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-orange-800">Surcharge:</span>
                          <span className="font-bold text-orange-900">₹{calculatedTax.surcharge.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Health & Education Cess (4%):</span>
                        <span className="font-semibold">₹{calculatedTax.cess.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Total Tax:</span>
                        <span className="font-bold text-green-900 text-xl">₹{calculatedTax.totalTax.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-800">Effective Tax Rate:</span>
                        <span className="font-bold text-blue-900 text-lg">{calculatedTax.effectiveRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Slabs */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Tax Slab Breakdown
                    </h3>
                    <div className="space-y-2">
                      {calculatedTax.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <span className="text-gray-700">{item.slab}</span>
                          <span className="font-medium text-gray-900">₹{item.tax.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deduction Breakdown */}
                  {regime === 'oldRegime' && calculatedTax.deductionBreakdown.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
                        Deduction Breakdown
                      </h3>
                      <div className="space-y-2">
                        {calculatedTax.deductionBreakdown.map((deduction, index) => (
                          <div key={index} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded">
                            <span className="text-gray-700">{deduction.name}</span>
                            <span className="font-medium text-green-900">₹{deduction.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter your income details to see tax calculation</p>
                  <p className="text-sm text-gray-400 mt-2">Real-time calculation as you type</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {comparisonData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* New Regime */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    New Tax Regime
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Amount:</span>
                      <span className="font-semibold">₹{comparisonData.newRegime.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective Rate:</span>
                      <span className="font-semibold">{comparisonData.newRegime.effectiveRate}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Lower tax rates, no deductions allowed
                    </div>
                  </div>
                </div>

                {/* Old Regime */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Old Tax Regime
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Amount:</span>
                      <span className="font-semibold">₹{comparisonData.oldRegime.totalTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective Rate:</span>
                      <span className="font-semibold">{comparisonData.oldRegime.effectiveRate}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Higher rates, deductions up to ₹5 lakhs
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="lg:col-span-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Recommendation</h3>
                    <p className="text-gray-700 mb-4">
                      Based on your income and deductions, the{' '}
                      <span className="font-semibold text-blue-600">
                        {comparisonData.recommended === 'newRegime' ? 'New Tax Regime' : 'Old Tax Regime'}
                      </span>{' '}
                      would save you{' '}
                      <span className="font-bold text-green-600">
                        ₹{comparisonData.savings.toLocaleString()}
                      </span>
                    </p>
                    <div className="text-sm text-gray-600">
                      {comparisonData.recommended === 'newRegime'
                        ? 'Choose New Regime if you have minimal investments and want simpler tax calculation'
                        : 'Choose Old Regime if you have significant investments and deductions'
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enter income details and click "Compare Tax Regimes" to see comparison</p>
              </div>
            )}
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            {scenarios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {scenarios.map((scenario, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{scenario.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income:</span>
                        <span className="font-medium">₹{scenario.income.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-medium text-red-600">₹{scenario.calculation.totalTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effective Rate:</span>
                        <span className="font-medium">{scenario.calculation.effectiveRate}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">{scenario.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enter income details and click "Generate Tax Scenarios" to see projections</p>
              </div>
            )}
          </div>
        )}

        {/* Educational Tips Toggle */}
        <div className="mt-8 flex items-center justify-center">
          <button
            onClick={() => setShowEducationalTips(!showEducationalTips)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Lightbulb className={`w-4 h-4 ${showEducationalTips ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-700">
              {showEducationalTips ? 'Hide' : 'Show'} Tax Tips
            </span>
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 Important Notes & Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🧮 Calculation Basis</h3>
              <ul className="space-y-1">
                <li>• Budget 2024 rates for FY 2024-25</li>
                <li>• Includes surcharge for ₹50L+ income</li>
                <li>• Health & Education Cess: 4%</li>
                <li>• Real-time calculation updates</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">💡 Tax Planning Tips</h3>
              <ul className="space-y-1">
                <li>• Choose regime based on deductions</li>
                <li>• Plan investments before March</li>
                <li>• Consider tax-saving instruments</li>
                <li>• Consult CA for complex cases</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">⚠️ Important Notice</p>
                <p>This calculator provides estimates only. Actual tax liability may vary based on individual circumstances, additional income sources, and latest tax laws. Please consult a Chartered Accountant for accurate tax planning and filing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
