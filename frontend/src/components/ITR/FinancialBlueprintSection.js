// =====================================================
// FINANCIAL BLUEPRINT SECTION
// Read-only summary of income, tax, savings, and missed opportunities
// =====================================================

import { useState, useEffect } from 'react';
import { Card } from '../DesignSystem/components';
import { IndianRupee, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import itrService from '../../services/api/itrService';
import { formatIndianCurrency } from '../../lib/format';

const FinancialBlueprintSection = ({ filingId }) => {
  const [blueprint, setBlueprint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filingId) {
      setIsLoading(false);
      return;
    }

    const fetchBlueprint = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await itrService.getFinancialBlueprint(filingId);
        setBlueprint(data);
      } catch (err) {
        setError(err.message || 'Failed to load financial blueprint');
        console.error('Error fetching financial blueprint:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlueprint();
  }, [filingId]);

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

  if (error || !blueprint) {
    return null; // Fail silently - don't show error UI
  }

  const { income, tax, savings, missedOpportunities, filingState } = blueprint;

  return (
    <div className="mb-4">
      <div className="mb-2">
        <h3 className="text-heading-5 font-semibold text-slate-900">Financial Blueprint</h3>
        <p className="text-body-small text-slate-600 mt-0.5">Read-only summary of your filing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Income Summary Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee className="w-4 h-4 text-slate-600" />
            <span className="text-body-small font-medium text-slate-700">Gross Income</span>
          </div>
          <div className="text-heading-4 font-bold text-slate-900">
            {formatIndianCurrency(income?.grossTotal || income?.grossTotalIncome || 0)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            {income?.sources && income.sources.length > 0 ? (
              income.sources.map((source, idx) => (
                <div key={idx} className="flex justify-between text-body-small text-slate-600 mb-1">
                  <span className="capitalize">{source.type === 'capitalGains' ? 'Capital Gains' : source.type}</span>
                  <span>{formatIndianCurrency(source.amount || 0)}</span>
                </div>
              ))
            ) : (
              // Fallback to flat structure for backward compatibility
              <>
                {(income?.salary || 0) > 0 && (
                  <div className="flex justify-between text-body-small text-slate-600 mb-1">
                    <span>Salary</span>
                    <span>{formatIndianCurrency(income?.salary || 0)}</span>
                  </div>
                )}
                {(income?.businessIncome || 0) > 0 && (
                  <div className="flex justify-between text-body-small text-slate-600 mb-1">
                    <span>Business</span>
                    <span>{formatIndianCurrency(income?.businessIncome || 0)}</span>
                  </div>
                )}
                {(income?.capitalGains || 0) > 0 && (
                  <div className="flex justify-between text-body-small text-slate-600 mb-1">
                    <span>Capital Gains</span>
                    <span>{formatIndianCurrency(income?.capitalGains || 0)}</span>
                  </div>
                )}
                {(income?.rentalIncome || 0) > 0 && (
                  <div className="flex justify-between text-body-small text-slate-600">
                    <span>Rental</span>
                    <span>{formatIndianCurrency(income?.rentalIncome || 0)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Tax Summary Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-slate-600" />
            <span className="text-body-small font-medium text-slate-700">Tax Liability</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-body-small text-slate-600 mb-1">Without Savings</div>
              <div className="text-heading-5 font-semibold text-slate-700">
                {formatIndianCurrency(tax?.taxWithoutSavings || tax?.beforeDeductions || 0)}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="text-body-small text-slate-600 mb-1">After Savings</div>
              <div className="text-heading-4 font-bold text-slate-900">
                {formatIndianCurrency(tax?.taxAfterSavings || tax?.afterDeductions || 0)}
              </div>
            </div>
            {tax?.savings > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1 text-body-small text-green-700">
                  <TrendingUp className="w-3 h-3" />
                  <span>Saved: {formatIndianCurrency(tax?.savings || 0)}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Savings Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-body-small font-medium text-slate-700">Total Savings</span>
          </div>
          <div className="text-heading-4 font-bold text-green-700">
            {formatIndianCurrency(savings?.total || 0)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-body-small text-slate-600 mb-1">
              <span>From Deductions</span>
              <span>{formatIndianCurrency(savings?.fromDeductions || 0)}</span>
            </div>
            {(savings?.rebate87A || 0) > 0 && (
              <div className="flex justify-between text-body-small text-slate-600">
                <span>Rebate 87A</span>
                <span>{formatIndianCurrency(savings?.rebate87A || 0)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Filing State Card */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {filingState?.canFile ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : filingState?.canEdit ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-body-small font-medium text-slate-700">Filing State</span>
          </div>
          <div className="text-body-regular font-semibold text-slate-900 mb-2">
            {filingState?.label || filingState?.lifecycleState?.replace(/_/g, ' ') || filingState?.status || 'Unknown'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-body-small">
              {filingState?.canEdit ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <XCircle className="w-3 h-3 text-slate-400" />
              )}
              <span className="text-slate-600">Can Edit</span>
            </div>
            <div className="flex items-center gap-1.5 text-body-small">
              {filingState?.canCompute ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <XCircle className="w-3 h-3 text-slate-400" />
              )}
              <span className="text-slate-600">Can Compute</span>
            </div>
            <div className="flex items-center gap-1.5 text-body-small">
              {filingState?.canFile ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <XCircle className="w-3 h-3 text-slate-400" />
              )}
              <span className="text-slate-600">Can File</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Missed Opportunities Card */}
      {missedOpportunities?.count > 0 && (
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
                    {formatIndianCurrency(missedOpportunities.estimatedAdditionalSavings || missedOpportunities.estimatedSavings || 0)}
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

export default FinancialBlueprintSection;

