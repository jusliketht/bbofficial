import React, { useState, useEffect } from 'react';
import enterpriseDebugger from '../services/EnterpriseDebugger';
import {
  Calculator, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, Info, Eye, EyeOff, RefreshCw, Zap
} from 'lucide-react';

// Real-time Summary Panel - LYRA Flow Core Mechanism
// Purpose: Always visible summary with change history and tax-change explanation

const RealtimeSummaryPanel = ({ 
  summaryData = null, 
  isMobile = false, 
  isSticky = true,
  onExplainTaxChange,
  onWhatIfSimulation,
  showChangeHistory = true
}) => {
  
  // State management
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [changeHistory, setChangeHistory] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Enterprise debugging
  useEffect(() => {
    enterpriseDebugger.trackLifecycle('RealtimeSummaryPanel', 'MOUNT', {
      isMobile,
      isSticky,
      hasSummaryData: !!summaryData
    });

    return () => {
      enterpriseDebugger.trackLifecycle('RealtimeSummaryPanel', 'UNMOUNT');
    };
  }, [isMobile, isSticky, summaryData]);

  // Track changes in summary data
  useEffect(() => {
    if (summaryData) {
      const now = new Date();
      setLastUpdate(now);
      
      // Add to change history
      if (showChangeHistory) {
        setChangeHistory(prev => [
          {
            timestamp: now,
            data: { ...summaryData },
            changes: detectChanges(prev[prev.length - 1]?.data, summaryData)
          },
          ...prev.slice(0, 9) // Keep last 10 changes
        ]);
      }
      
      enterpriseDebugger.log('INFO', 'RealtimeSummaryPanel', 'Summary data updated', {
        timestamp: now.toISOString(),
        hasTaxChange: summaryData.taxChange > 0
      });
    }
  }, [summaryData, showChangeHistory]);

  // Detect changes between summary data
  const detectChanges = (oldData, newData) => {
    if (!oldData) return [];
    
    const changes = [];
    const fields = ['grossIncome', 'totalDeductions', 'taxableIncome', 'estimatedTax', 'estimatedRefund'];
    
    fields.forEach(field => {
      if (oldData[field] !== newData[field]) {
        changes.push({
          field,
          oldValue: oldData[field],
          newValue: newData[field],
          change: newData[field] - oldData[field]
        });
      }
    });
    
    return changes;
  };

  // Handle tax change explanation
  const handleExplainTaxChange = () => {
    if (summaryData?.taxChange > 5000) {
      onExplainTaxChange?.(summaryData.taxChange);
      enterpriseDebugger.log('INFO', 'RealtimeSummaryPanel', 'Tax change explanation requested', {
        taxChange: summaryData.taxChange
      });
    }
  };

  // Handle what-if simulation
  const handleWhatIfSimulation = () => {
    onWhatIfSimulation?.();
    enterpriseDebugger.log('INFO', 'RealtimeSummaryPanel', 'What-if simulation requested');
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${amount.toLocaleString()}`;
  };

  // Get change indicator
  const getChangeIndicator = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  // Mobile sticky panel
  if (isMobile && isSticky) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="p-4">
          {/* Mobile Summary Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">Summary</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Mobile Summary Content */}
          {isExpanded && summaryData && (
            <div className="space-y-3">
              {/* Key Numbers */}
              <div className="grid grid-cols-2 gap-3">
                {summaryData.taxableIncome && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-medium">Taxable Income</div>
                    <div className="text-lg font-bold text-blue-800">
                      {formatCurrency(summaryData.taxableIncome)}
                    </div>
                  </div>
                )}
                
                {summaryData.estimatedRefund && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-medium">Est. Refund</div>
                    <div className="text-lg font-bold text-green-800">
                      {formatCurrency(summaryData.estimatedRefund)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tax Change Alert */}
              {summaryData.taxChange > 5000 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Tax changed by {formatCurrency(summaryData.taxChange)}
                    </span>
                  </div>
                  <button
                    onClick={handleExplainTaxChange}
                    className="mt-2 text-xs text-yellow-700 hover:text-yellow-900 underline"
                  >
                    Explain why
                  </button>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleWhatIfSimulation}
                  className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  What-if
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop sidebar panel
  return (
    <div className={`${isSticky ? 'sticky top-0' : ''} bg-gray-50 border-l border-gray-200 p-4 md:p-6 h-full overflow-y-auto`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-gray-900">Real-time Summary</h4>
        <div className="flex items-center space-x-2">
          {isCalculating && (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && summaryData && (
        <div className="space-y-6">
          
          {/* Income Summary */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Income Summary
            </h5>
            
            <div className="space-y-3">
              {summaryData.grossIncome && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Income</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(summaryData.grossIncome)}
                    </span>
                    {getChangeIndicator(summaryData.grossIncomeChange)}
                  </div>
                </div>
              )}
              
              {summaryData.salaryIncome && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Salary</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(summaryData.salaryIncome)}
                  </span>
                </div>
              )}
              
              {summaryData.otherIncome && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Other Income</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(summaryData.otherIncome)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Deductions Summary */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-blue-600" />
              Deductions
            </h5>
            
            <div className="space-y-3">
              {summaryData.totalDeductions && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Deductions</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(summaryData.totalDeductions)}
                    </span>
                    {getChangeIndicator(summaryData.totalDeductionsChange)}
                  </div>
                </div>
              )}
              
              {summaryData.deductionBreakdown && (
                <div className="space-y-2">
                  {Object.entries(summaryData.deductionBreakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-700">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tax Computation */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-purple-600" />
              Tax Computation
            </h5>
            
            <div className="space-y-3">
              {summaryData.taxableIncome && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taxable Income</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency(summaryData.taxableIncome)}
                  </span>
                </div>
              )}
              
              {summaryData.estimatedTax && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated Tax</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(summaryData.estimatedTax)}
                  </span>
                </div>
              )}
              
              {summaryData.taxCredits && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tax Credits</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(summaryData.taxCredits)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Refund/Payable */}
          {summaryData.estimatedRefund && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="text-center">
                <h5 className="text-sm font-semibold text-green-800 mb-2">Estimated Refund</h5>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(summaryData.estimatedRefund)}
                </div>
                <p className="text-xs text-green-700">
                  File today to claim faster
                </p>
              </div>
            </div>
          )}

          {/* Warnings & Actionables */}
          {summaryData.warnings && summaryData.warnings.length > 0 && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h5 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Warnings & Actionables
              </h5>
              <div className="space-y-2">
                {summaryData.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-600 mt-1 flex-shrink-0" />
                    <span className="text-sm text-yellow-800">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Change Explanation */}
          {summaryData.taxChange > 5000 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-blue-900">Tax Changed</h5>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(summaryData.taxChange)}
                </span>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                Your tax liability changed significantly. Click below to understand why.
              </p>
              <button
                onClick={handleExplainTaxChange}
                className="w-full bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explain Tax Change
              </button>
            </div>
          )}

          {/* What-if Simulator */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h5 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              What-if Simulator
            </h5>
            <p className="text-xs text-purple-700 mb-3">
              Test different scenarios to optimize your tax savings.
            </p>
            <button
              onClick={handleWhatIfSimulation}
              className="w-full bg-purple-600 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Open Simulator
            </button>
          </div>

          {/* Change History */}
          {showChangeHistory && changeHistory.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Recent Changes</h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {changeHistory.slice(0, 5).map((change, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    <div className="font-medium">
                      {change.timestamp.toLocaleTimeString()}
                    </div>
                    {change.changes.map((ch, idx) => (
                      <div key={idx} className="ml-2">
                        {ch.field}: {formatCurrency(ch.oldValue)} → {formatCurrency(ch.newValue)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeSummaryPanel;
