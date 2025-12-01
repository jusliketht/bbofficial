// =====================================================
// TAX HARVESTING HELPER
// Component to suggest tax harvesting strategies
// =====================================================

import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingDown, ArrowRight, CheckCircle } from 'lucide-react';
import { useTaxHarvestingSuggestions } from '../hooks/use-capital-gains';
import Button from '../../../../components/common/Button';

const TaxHarvestingHelper = ({ stcgEntries = [], ltcgEntries = [], lossEntries = [], onApplySuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  const suggestionsMutation = useTaxHarvestingSuggestions();

  useEffect(() => {
    if (stcgEntries.length > 0 || ltcgEntries.length > 0 || lossEntries.length > 0) {
      loadSuggestions();
    }
  }, [stcgEntries, ltcgEntries, lossEntries]);

  const loadSuggestions = async () => {
    try {
      const response = await suggestionsMutation.mutateAsync({
        stcgEntries,
        ltcgEntries,
        lossEntries,
      });

      if (response.success) {
        setSuggestions(response.suggestions || []);
        setSummary(response.summary);
      }
    } catch (error) {
      console.error('Failed to load tax harvesting suggestions:', error);
    }
  };

  const handleApplySuggestion = (suggestion, index) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
    setAppliedSuggestions((prev) => new Set([...prev, index]));
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (suggestions.length === 0 && !summary) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="h-6 w-6 text-blue-600" />
        <h3 className="text-heading-md text-gray-800">Tax Harvesting Suggestions</h3>
      </div>

      {summary && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
          <h4 className="text-body-sm font-semibold text-gray-800 mb-3">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-body-xs text-gray-600">STCG</p>
              <p className="text-body-md font-semibold text-gray-800">
                {formatCurrency(summary.totalSTCG)}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-gray-600">LTCG</p>
              <p className="text-body-md font-semibold text-gray-800">
                {formatCurrency(summary.totalLTCG)}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-gray-600">STCL</p>
              <p className="text-body-md font-semibold text-red-700">
                {formatCurrency(summary.totalSTCL)}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-gray-600">LTCL</p>
              <p className="text-body-md font-semibold text-red-700">
                {formatCurrency(summary.totalLTCL)}
              </p>
            </div>
          </div>
          {(summary.netSTCG > 0 || summary.netLTCG > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-body-sm text-gray-600">Net STCG:</span>
                <span className="text-body-md font-semibold text-green-700">
                  {formatCurrency(summary.netSTCG)}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-body-sm text-gray-600">Net LTCG:</span>
                <span className="text-body-md font-semibold text-green-700">
                  {formatCurrency(summary.netLTCG)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-4 border ${
                appliedSuggestions.has(index)
                  ? 'border-green-300 bg-green-50'
                  : 'border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {suggestion.type === 'offset' && (
                      <TrendingDown className="h-5 w-5 text-blue-600" />
                    )}
                    <h5 className="text-body-md font-semibold text-gray-800">{suggestion.title}</h5>
                    {appliedSuggestions.has(index) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-body-sm text-gray-600 mb-2">{suggestion.description}</p>
                  {suggestion.savings > 0 && (
                    <p className="text-body-sm font-semibold text-green-700">
                      Potential Tax Savings: {formatCurrency(suggestion.savings)}
                    </p>
                  )}
                </div>
                {!appliedSuggestions.has(index) && (
                  <Button
                    size="sm"
                    onClick={() => handleApplySuggestion(suggestion, index)}
                    className="ml-4"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    {suggestion.action}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {suggestions.length === 0 && summary && (
        <div className="bg-white rounded-lg p-4 border border-blue-200 text-center">
          <p className="text-body-sm text-gray-600">
            No tax harvesting opportunities found. All gains and losses are already optimized.
          </p>
        </div>
      )}
    </div>
  );
};

export default TaxHarvestingHelper;

