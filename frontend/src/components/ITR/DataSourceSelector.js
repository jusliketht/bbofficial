// =====================================================
// DATA SOURCE SELECTOR COMPONENT
// Choose starting method for ITR filing
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Download, Copy, FileText, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DataSourceSelector = ({ onProceed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPerson = location.state?.selectedPerson;
  const [selectedSource, setSelectedSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedPerson) {
      // If no person selected, redirect back to person selector
      navigate('/itr/select-person');
    }
  }, [selectedPerson, navigate]);

  const dataSources = [
    {
      id: 'form16',
      title: 'Upload Form 16',
      description: 'Recommended for salaried employees. Upload your Form 16 Part A and Part B, and we\'ll extract all the data automatically.',
      icon: Upload,
      color: 'bg-orange-100 text-orange-600',
      recommended: true,
      features: ['Auto-extract salary data', 'TDS information', 'Quick setup'],
    },
    {
      id: 'it-portal',
      title: 'Fetch from Income Tax Portal',
      description: 'Connect to the Income Tax Portal and fetch your AIS, 26AS, and pre-filled ITR data automatically.',
      icon: Download,
      color: 'bg-blue-100 text-blue-600',
      recommended: false,
      features: ['AIS data', '26AS statement', 'Pre-filled ITR'],
    },
    {
      id: 'previous-year',
      title: 'Copy from Previous Year',
      description: 'Copy data from a previous year\'s filing to save time. You can edit and update as needed.',
      icon: Copy,
      color: 'bg-green-100 text-green-600',
      recommended: false,
      features: ['Copy all sections', 'Selective copying', 'Quick start'],
    },
    {
      id: 'manual',
      title: 'Start Fresh (Manual Entry)',
      description: 'Enter all information manually. Best if you prefer full control or don\'t have documents ready.',
      icon: FileText,
      color: 'bg-gray-100 text-gray-600',
      recommended: false,
      features: ['Full control', 'Step-by-step entry', 'No documents needed'],
    },
  ];

  const handleSourceSelect = (sourceId) => {
    setSelectedSource(sourceId);
  };

  const handleProceed = async () => {
    if (!selectedSource) {
      toast.error('Please select a data source');
      return;
    }

    setIsLoading(true);

    try {
      // Store selected data source in state/navigation
      const sourceData = {
        source: selectedSource,
        selectedPerson,
      };

      // Navigate based on selected source
      if (selectedSource === 'form16') {
        // Navigate to document upload page or computation with upload option
        navigate('/itr/computation', {
          state: {
            selectedPerson,
            dataSource: 'form16',
            showDocumentUpload: true,
          },
        });
      } else if (selectedSource === 'it-portal') {
        // Navigate to IT Portal connection page or computation with fetch option
        navigate('/itr/computation', {
          state: {
            selectedPerson,
            dataSource: 'it-portal',
            showITPortalConnect: true,
          },
        });
      } else if (selectedSource === 'previous-year') {
        // Navigate to previous year selector
        navigate('/itr/previous-year-selector', {
          state: {
            selectedPerson,
            dataSource: 'previous-year',
            memberId: selectedPerson?.id || null,
            currentAssessmentYear: '2024-25',
          },
        });
      } else {
        // Manual entry - go directly to computation
        navigate('/itr/computation', {
          state: {
            selectedPerson,
            dataSource: 'manual',
          },
        });
      }

      // Call onProceed if provided
      if (onProceed) {
        onProceed(selectedSource, sourceData);
      }
    } catch (error) {
      toast.error('Failed to proceed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading-2xl text-gray-900 mb-2">
            How would you like to start?
          </h1>
          <p className="text-body-md text-gray-600">
            Choose how you want to import or enter your income data
          </p>
        </div>

        {/* Data Source Options */}
        <div className="space-y-4 mb-8">
          {dataSources.map((source) => {
            const Icon = source.icon;
            const isSelected = selectedSource === source.id;

            return (
              <button
                key={source.id}
                onClick={() => handleSourceSelect(source.id)}
                className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${source.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-heading-md text-gray-900">{source.title}</h3>
                      {source.recommended && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Recommended
                        </span>
                      )}
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-body-sm text-gray-600 mb-3">{source.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {source.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Box */}
        {selectedSource && (
          <div className="mb-8 bg-info-50 border border-info-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-info-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-heading-sm text-info-900 mb-1">What happens next?</h3>
                <p className="text-body-sm text-info-700">
                  {selectedSource === 'form16' && 'You\'ll be able to upload your Form 16 documents, and we\'ll automatically extract all the relevant information.'}
                  {selectedSource === 'it-portal' && 'You\'ll connect to the Income Tax Portal, verify your identity, and we\'ll fetch your AIS, 26AS, and pre-filled ITR data.'}
                  {selectedSource === 'previous-year' && 'You\'ll select the previous year to copy from, choose which sections to copy, and then review and update the data.'}
                  {selectedSource === 'manual' && 'You\'ll enter all information step by step. We\'ll guide you through each section of the ITR form.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            disabled={!selectedSource || isLoading}
            className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceSelector;

