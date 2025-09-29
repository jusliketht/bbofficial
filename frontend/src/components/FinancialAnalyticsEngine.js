import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, 
  DollarSign, Target, AlertTriangle, CheckCircle, Calendar,
  Download, RefreshCw, Filter, Eye, EyeOff, ArrowUp, ArrowDown,
  Calculator, Shield, Users, FileText, Clock, Star
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userDashboardService from '../services/userDashboardService';
import { EnterpriseButton, EnterpriseCard, EnterpriseAlert, EnterpriseInput } from './DesignSystem/EnterpriseComponents';
import { SmartTooltip, InlineHelp } from './DesignSystem/SmartTooltip';

/**
 * Financial Insights and Analytics Engine
 * 
 * Features:
 * - Income trend analysis
 * - Tax optimization insights
 * - Refund predictions
 * - Deduction recommendations
 * - Compliance scoring
 * - Year-over-year comparisons
 * - Interactive charts and visualizations
 * - Export capabilities
 * - Personalized recommendations
 */

const FinancialAnalyticsEngine = ({ userId, assessmentYear = '2024-25', className = '' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('ytd'); // ytd, last_year, custom
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison
  const [isLoading, setIsLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const queryClient = useQueryClient();

  // Fetch financial analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['financialAnalytics', userId, assessmentYear, selectedPeriod],
    queryFn: () => userDashboardService.analyticsService.getFinancialAnalytics({
      assessment_year: assessmentYear,
      period: selectedPeriod,
      date_range: customDateRange
    }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch income trends
  const { data: incomeTrends } = useQuery({
    queryKey: ['incomeTrends', userId],
    queryFn: () => userDashboardService.analyticsService.getIncomeTrends(),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch deduction analysis
  const { data: deductionAnalysis } = useQuery({
    queryKey: ['deductionAnalysis', userId, assessmentYear],
    queryFn: () => userDashboardService.analyticsService.getDeductionAnalysis(assessmentYear),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Fetch compliance score
  const { data: complianceScore } = useQuery({
    queryKey: ['complianceScore', userId],
    queryFn: () => userDashboardService.analyticsService.getComplianceScore(),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Export analytics mutation
  const exportAnalyticsMutation = useMutation({
    mutationFn: (params) => userDashboardService.analyticsService.exportAnalytics(params),
    onSuccess: (data) => {
      // Handle file download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-analytics-${assessmentYear}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  });

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!analyticsData?.data) return null;

    const data = analyticsData.data;
    
    return {
      totalIncome: data.total_income || 0,
      taxableIncome: data.taxable_income || 0,
      taxLiability: data.tax_liability || 0,
      refundAmount: data.refund_amount || 0,
      totalDeductions: data.total_deductions || 0,
      effectiveTaxRate: data.taxable_income > 0 ? (data.tax_liability / data.taxable_income) * 100 : 0,
      deductionUtilization: data.max_possible_deductions > 0 ? (data.total_deductions / data.max_possible_deductions) * 100 : 0,
      incomeGrowth: data.income_growth_percentage || 0,
      refundEfficiency: data.refund_efficiency_score || 0
    };
  }, [analyticsData]);

  // Generate insights and recommendations
  const insights = useMemo(() => {
    if (!keyMetrics) return [];

    const insightsList = [];

    // Income growth insight
    if (keyMetrics.incomeGrowth > 10) {
      insightsList.push({
        type: 'positive',
        icon: TrendingUp,
        title: 'Strong Income Growth',
        description: `Your income has grown by ${keyMetrics.incomeGrowth.toFixed(1)}% compared to last year.`,
        recommendation: 'Consider increasing your tax-saving investments to optimize your tax liability.',
        priority: 'high'
      });
    } else if (keyMetrics.incomeGrowth < -5) {
      insightsList.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Income Decline Detected',
        description: `Your income has decreased by ${Math.abs(keyMetrics.incomeGrowth).toFixed(1)}% compared to last year.`,
        recommendation: 'Review your financial planning and consider consulting a tax advisor.',
        priority: 'urgent'
      });
    }

    // Deduction utilization insight
    if (keyMetrics.deductionUtilization < 70) {
      insightsList.push({
        type: 'opportunity',
        icon: Target,
        title: 'Tax Optimization Opportunity',
        description: `You're only utilizing ${keyMetrics.deductionUtilization.toFixed(1)}% of possible deductions.`,
        recommendation: 'Consider additional investments in Section 80C, health insurance, or home loan to maximize tax savings.',
        priority: 'high'
      });
    }

    // Refund efficiency insight
    if (keyMetrics.refundEfficiency > 80) {
      insightsList.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'Excellent Refund Efficiency',
        description: `Your refund efficiency score is ${keyMetrics.refundEfficiency.toFixed(1)}%.`,
        recommendation: 'You\'re doing great! Continue your current tax planning strategy.',
        priority: 'low'
      });
    }

    // Tax rate insight
    if (keyMetrics.effectiveTaxRate > 20) {
      insightsList.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Effective Tax Rate',
        description: `Your effective tax rate is ${keyMetrics.effectiveTaxRate.toFixed(1)}%.`,
        recommendation: 'Consider tax-saving investments and deductions to reduce your tax burden.',
        priority: 'high'
      });
    }

    return insightsList;
  }, [keyMetrics]);

  // Handle period change
  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      // Set default custom range to current financial year
      const currentYear = new Date().getFullYear();
      setCustomDateRange({
        start: `${currentYear}-04-01`,
        end: `${currentYear + 1}-03-31`
      });
    }
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsLoading(true);
    try {
      await exportAnalyticsMutation.mutateAsync({
        assessment_year: assessmentYear,
        period: selectedPeriod,
        format: exportFormat,
        include_charts: true,
        include_recommendations: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentYear, selectedPeriod, exportFormat, exportAnalyticsMutation]);

  // Get insight color classes
  const getInsightColorClasses = (type) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'opportunity': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'urgent': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <ArrowUp className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Target className="w-4 h-4 text-blue-600" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Financial Analytics & Insights
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive analysis of your financial data and tax optimization opportunities
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </select>
          
          <EnterpriseButton
            onClick={handleExport}
            variant="primary"
            size="sm"
            disabled={isLoading || exportAnalyticsMutation.isPending}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Export Report</span>
          </EnterpriseButton>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Analysis Period:</span>
        <div className="flex items-center space-x-2">
          {['ytd', 'last_year', 'custom'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedPeriod === period
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period === 'ytd' ? 'Year to Date' : 
               period === 'last_year' ? 'Last Year' : 'Custom Range'}
            </button>
          ))}
        </div>
        
        {selectedPeriod === 'custom' && (
          <div className="flex items-center space-x-2">
            <EnterpriseInput
              type="date"
              value={customDateRange.start}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-40"
            />
            <span className="text-gray-500">to</span>
            <EnterpriseInput
              type="date"
              value={customDateRange.end}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-40"
            />
          </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      {keyMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnterpriseCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                {keyMetrics.incomeGrowth > 0 ? '+' : ''}{keyMetrics.incomeGrowth.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Total Income</h3>
            <p className="text-xs text-gray-600">₹{keyMetrics.totalIncome.toLocaleString()}</p>
          </EnterpriseCard>

          <EnterpriseCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                {keyMetrics.deductionUtilization.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Deduction Utilization</h3>
            <p className="text-xs text-gray-600">₹{keyMetrics.totalDeductions.toLocaleString()}</p>
          </EnterpriseCard>

          <EnterpriseCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calculator className="w-8 h-8 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                {keyMetrics.effectiveTaxRate.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Effective Tax Rate</h3>
            <p className="text-xs text-gray-600">₹{keyMetrics.taxLiability.toLocaleString()}</p>
          </EnterpriseCard>

          <EnterpriseCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                {keyMetrics.refundEfficiency.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Refund Efficiency</h3>
            <p className="text-xs text-gray-600">₹{keyMetrics.refundAmount.toLocaleString()}</p>
          </EnterpriseCard>
        </div>
      )}

      {/* Insights and Recommendations */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            AI-Powered Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${getInsightColorClasses(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <insight.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      {getPriorityIcon(insight.priority)}
                    </div>
                    
                    <p className="text-sm mb-3">{insight.description}</p>
                    
                    <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Recommendation:</p>
                      <p className="text-sm">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Trend Analysis */}
        {incomeTrends?.data && (
          <EnterpriseCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Income Trend Analysis
              </h3>
              <SmartTooltip term="income_trend">
                <Info className="w-4 h-4 text-gray-400" />
              </SmartTooltip>
            </div>
            
            <div className="space-y-3">
              {incomeTrends.data.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{trend.year}</p>
                    <p className="text-sm text-gray-600">{trend.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{trend.amount.toLocaleString()}</p>
                    <p className={`text-sm ${trend.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.growth >= 0 ? '+' : ''}{trend.growth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </EnterpriseCard>
        )}

        {/* Deduction Analysis */}
        {deductionAnalysis?.data && (
          <EnterpriseCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Deduction Analysis
              </h3>
              <SmartTooltip term="deduction_analysis">
                <Info className="w-4 h-4 text-gray-400" />
              </SmartTooltip>
            </div>
            
            <div className="space-y-3">
              {deductionAnalysis.data.map((deduction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{deduction.category}</p>
                    <p className="text-sm text-gray-600">{deduction.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{deduction.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{deduction.utilization.toFixed(1)}% utilized</p>
                  </div>
                </div>
              ))}
            </div>
          </EnterpriseCard>
        )}
      </div>

      {/* Compliance Score */}
      {complianceScore?.data && (
        <EnterpriseCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Compliance Score
            </h3>
            <SmartTooltip term="compliance_score">
              <Info className="w-4 h-4 text-gray-400" />
            </SmartTooltip>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {complianceScore.data.score}%
              </div>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            
            <div className="flex-1">
              <div className="space-y-2">
                {complianceScore.data.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{category.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${category.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {category.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </EnterpriseCard>
      )}

      {/* Export Error Alert */}
      {exportAnalyticsMutation.isError && (
        <EnterpriseAlert
          type="error"
          title="Export Failed"
          message="Failed to export analytics report. Please try again."
          onClose={() => exportAnalyticsMutation.reset()}
        />
      )}
    </div>
  );
};

export default FinancialAnalyticsEngine;
