import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const RailsSwitcher = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentItrType, 
  recommendedItrType, 
  switches, 
  filingId 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      toast.success('ITR type updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update ITR type');
    } finally {
      setIsLoading(false);
    }
  };

  const getItrDescription = (itrType) => {
    const descriptions = {
      'ITR-1': 'Sahaj - For individuals with salary, pension, one house property',
      'ITR-2': 'For individuals with capital gains, foreign assets',
      'ITR-3': 'For individuals with business/profession income',
      'ITR-4': 'Sugam - For presumptive business income',
      'ITR-5': 'For LLPs, partnerships, AOPs',
      'ITR-6': 'For companies',
      'ITR-7': 'For trusts, political parties'
    };
    return descriptions[itrType] || itrType;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              ITR Type Change Required
            </h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">
                Based on your income details, we recommend switching to a different ITR form.
              </p>
            </div>
          </div>

          {/* Current vs Recommended */}
          <div className="mt-4 space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Current ITR:</span>
                <span className="text-sm text-gray-500">{currentItrType}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {getItrDescription(currentItrType)}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Recommended ITR:</span>
                <span className="text-sm text-blue-600 font-semibold">{recommendedItrType}</span>
              </div>
              <p className="text-xs text-blue-500 mt-1">
                {getItrDescription(recommendedItrType)}
              </p>
            </div>
          </div>

          {/* Reasons for switching */}
          {switches && switches.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Reasons for switching:</h4>
              <div className="space-y-2">
                {switches.map((switchItem, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{switchItem.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Benefits of switching:</p>
                <ul className="text-xs text-green-700 mt-1 space-y-1">
                  <li>• Ensures compliance with tax laws</li>
                  <li>• Prevents filing rejection</li>
                  <li>• All your data will be preserved</li>
                  <li>• No additional information needed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Review Later
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Switch to ' + recommendedItrType
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              You can always change this later in your filing settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RailsSwitcher;
