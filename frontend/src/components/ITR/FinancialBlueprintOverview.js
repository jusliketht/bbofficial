// =====================================================
// FINANCIAL BLUEPRINT OVERVIEW
// Read-only summary section at the top of ITR computation page
// =====================================================

import { Card } from '../DesignSystem/components';
import { IndianRupee, TrendingUp, TrendingDown, AlertCircle, Calendar, FileText, Loader, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatIndianCurrency } from '../../lib/format';
import NextBestAction from './NextBestAction';

const FinancialBlueprintOverview = ({ blueprint, isLoading, isCollapsed, focusMode, onToggleCollapse, onClose, onActionClick }) => {
  if (isLoading) {
    return (
      <div className="mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-body-small">Loading financial summary...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!blueprint) {
    return null;
  }

  const { income, tax, savings, missedOpportunities, filingState, assessmentYear, itrType } = blueprint;

  // Collapsed view (minimal sidebar button)
  if (isCollapsed && focusMode) {
    return (
      <div className="sticky top-0 z-10 mb-4">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full bg-white border border-slate-200 rounded-lg p-2 hover:bg-slate-50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-body-small font-medium text-slate-700">Financial Blueprint</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${focusMode ? 'sticky top-0 z-10 bg-white border-b border-slate-200 pb-4 -mx-3 px-3' : ''}`}>
      {/* Focus Mode Header */}
      {focusMode && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
          <h3 className="text-heading-5 font-semibold text-slate-900">Financial Blueprint</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title="Exit focus mode"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Year Summary Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span className="text-body-small font-medium text-slate-700">Year Summary</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-body-small text-slate-600 mb-0.5">Assessment Year</div>
              <div className="text-body-regular font-semibold text-slate-900">{assessmentYear || 'N/A'}</div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-body-small text-slate-600 mb-0.5">ITR Type</div>
              <div className="text-body-regular font-semibold text-slate-900">{itrType || 'N/A'}</div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-body-small text-slate-600 mb-0.5">Filing State</div>
              <div className="text-body-regular font-semibold text-slate-900">
                {filingState?.label || 'Unknown'}
              </div>
            </div>
          </div>
        </Card>

        {/* Income Sources Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee className="w-4 h-4 text-slate-600" />
            <span className="text-body-small font-medium text-slate-700">Income Sources</span>
          </div>
          <div className="mb-2">
            <div className="text-body-small text-slate-600 mb-1">Gross Total</div>
            <div className="text-heading-5 font-bold text-slate-900">
              {formatIndianCurrency(income?.grossTotal || income?.grossTotalIncome || 0)}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            {income?.sources && income.sources.length > 0 ? (
              income.sources.map((source, idx) => (
                <div key={idx} className="flex justify-between text-body-small">
                  <span className="text-slate-600 capitalize">
                    {source.type === 'capitalGains' ? 'Capital Gains' : source.type}
                  </span>
                  <span className="text-slate-900 font-medium">
                    {formatIndianCurrency(source.amount || 0)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-body-small text-slate-500">No income sources recorded</div>
            )}
          </div>
        </Card>

        {/* Tax Comparison Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-slate-600" />
            <span className="text-body-small font-medium text-slate-700">Tax Comparison</span>
          </div>
          <div className="space-y-3">
            {/* Before vs After Visual */}
            {(() => {
              const taxWithout = tax?.taxWithoutSavings || tax?.beforeDeductions || 0;
              const taxAfter = tax?.taxAfterSavings || tax?.afterDeductions || 0;
              const savings = tax?.savings || 0;
              const maxTax = Math.max(taxWithout, taxAfter, 1); // Avoid division by zero
              const beforeWidth = taxWithout > 0 ? (taxWithout / maxTax) * 100 : 0;
              const afterWidth = taxAfter > 0 ? (taxAfter / maxTax) * 100 : 0;
              const savingsWidth = savings > 0 ? (savings / maxTax) * 100 : 0;

              return (
                <div className="space-y-3">
                  {/* Before Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-body-small text-slate-600">Without Savings</span>
                      <span className="text-body-small font-semibold text-slate-700">
                        {formatIndianCurrency(taxWithout)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full transition-none"
                        style={{ width: `${beforeWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* After Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-body-small text-slate-600">After Savings</span>
                      <span className="text-body-small font-semibold text-slate-900">
                        {formatIndianCurrency(taxAfter)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-700 rounded-full transition-none"
                        style={{ width: `${afterWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Savings Indicator (if applicable) */}
                  {savings > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1 text-body-small text-green-700">
                          <TrendingUp className="w-3 h-3" />
                          <span>Savings</span>
                        </div>
                        <span className="text-body-small font-semibold text-green-700">
                          {formatIndianCurrency(savings)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-green-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-none"
                          style={{ width: `${savingsWidth}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            {/* Next Best Action */}
            <NextBestAction blueprint={blueprint} onActionClick={onActionClick} />
          </div>
        </Card>
      </div>

      {/* Savings Summary Card */}
      {savings && (savings.total > 0 || savings.fromDeductions > 0 || savings.rebate87A > 0) && (
        <Card className="p-4 mt-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-body-small font-medium text-slate-700">Savings Summary</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-body-small text-slate-600 mb-1">Total Savings</div>
              <div className="text-heading-5 font-bold text-green-700">
                {formatIndianCurrency(savings.total || 0)}
              </div>
            </div>
            <div>
              <div className="text-body-small text-slate-600 mb-1">From Deductions</div>
              <div className="text-body-regular font-semibold text-slate-900">
                {formatIndianCurrency(savings.fromDeductions || 0)}
              </div>
            </div>
            {savings.rebate87A > 0 && (
              <div>
                <div className="text-body-small text-slate-600 mb-1">Rebate 87A</div>
                <div className="text-body-regular font-semibold text-slate-900">
                  {formatIndianCurrency(savings.rebate87A || 0)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Missed Opportunities Card */}
      {missedOpportunities && missedOpportunities.count > 0 && (
        <Card className="p-4 mt-3 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-body-regular font-semibold text-amber-900">
              Missed Opportunities ({missedOpportunities.count})
            </span>
          </div>
          <div className="space-y-2">
            {missedOpportunities.items?.map((opp, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="text-body-small font-semibold text-slate-900">{opp.name}</div>
                    <div className="text-body-small text-slate-600 mt-0.5">{opp.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-body-small text-slate-600">Missed</div>
                    <div className="text-body-regular font-semibold text-amber-700">
                      {formatIndianCurrency(opp.missed || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-body-small text-slate-600 mt-2 pt-2 border-t border-slate-100">
                  <span>Claimed: {formatIndianCurrency(opp.claimed || 0)}</span>
                  <span>Potential: {formatIndianCurrency(opp.potential || 0)}</span>
                </div>
              </div>
            ))}
            {(missedOpportunities.estimatedAdditionalSavings || missedOpportunities.estimatedSavings || 0) > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-body-small font-medium text-amber-900">Estimated Additional Savings</span>
                  <span className="text-heading-5 font-bold text-amber-700">
                    {formatIndianCurrency(
                      missedOpportunities.estimatedAdditionalSavings || missedOpportunities.estimatedSavings || 0,
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialBlueprintOverview;

