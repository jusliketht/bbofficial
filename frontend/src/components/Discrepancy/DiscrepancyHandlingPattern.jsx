// =====================================================
// DISCREPANCY HANDLING PATTERN COMPONENT
// Reusable UI pattern for displaying and resolving discrepancies
// =====================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '../DesignSystem/StatusBadge';
import VerificationState from '../UI/VerificationState/VerificationState';

const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  critical: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

const DiscrepancyHandlingPattern = ({
  discrepancy,
  onResolve,
  onDismiss,
  showDetails = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);

  const severity = discrepancy.severity || 'info';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;

  const handleResolve = (value) => {
    setSelectedValue(value);
    if (onResolve) {
      onResolve({
        ...discrepancy,
        resolvedValue: value,
      });
    }
  };

  return (
    <motion.div
      className={`
        border-2 rounded-lg p-4
        ${config.bgColor}
        ${config.borderColor}
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{discrepancy.fieldName}</h4>
              <StatusBadge
                status={severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'info'}
                label={severity.toUpperCase()}
                size="sm"
              />
            </div>
            <p className="text-sm text-gray-700">{discrepancy.message || discrepancy.description}</p>
            {discrepancy.source && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Source:</span>
                <span className="text-xs font-medium text-gray-700">{discrepancy.source}</span>
              </div>
            )}
          </div>
        </div>
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
          >
            {/* Comparison */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">Your Entry</div>
                <div className="text-base font-semibold text-gray-900">
                  {discrepancy.manualValue !== undefined
                    ? typeof discrepancy.manualValue === 'number'
                      ? `₹${discrepancy.manualValue.toLocaleString('en-IN')}`
                      : discrepancy.manualValue
                    : 'N/A'}
                </div>
                <VerificationState state="manual" size="sm" className="mt-2" />
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs font-medium text-gray-500 mb-1">
                  {discrepancy.source} Value
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {discrepancy.sourceValue !== undefined
                    ? typeof discrepancy.sourceValue === 'number'
                      ? `₹${discrepancy.sourceValue.toLocaleString('en-IN')}`
                      : discrepancy.sourceValue
                    : 'N/A'}
                </div>
                <VerificationState state="verified" size="sm" className="mt-2" />
              </div>
            </div>

            {/* Difference */}
            {discrepancy.difference !== undefined && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-500 mb-1">Difference</div>
                <div className={`text-lg font-bold ${
                  Math.abs(discrepancy.difference) > 0 ? 'text-amber-600' : 'text-gray-900'
                }`}>
                  {typeof discrepancy.difference === 'number'
                    ? `₹${Math.abs(discrepancy.difference).toLocaleString('en-IN')}`
                    : discrepancy.difference}
                </div>
              </div>
            )}

            {/* Resolution Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Choose value to use:</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolve(discrepancy.manualValue)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                    selectedValue === discrepancy.manualValue
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Keep Your Entry
                </button>
                <button
                  onClick={() => handleResolve(discrepancy.sourceValue)}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                    selectedValue === discrepancy.sourceValue
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Use {discrepancy.source} Value
                </button>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(discrepancy)}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Dismiss for now
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions (when not expanded) */}
      {!isExpanded && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => handleResolve(discrepancy.manualValue)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Keep Mine
          </button>
          <button
            onClick={() => handleResolve(discrepancy.sourceValue)}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Use {discrepancy.source}
          </button>
          {onDismiss && (
            <button
              onClick={() => onDismiss(discrepancy)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DiscrepancyHandlingPattern;

