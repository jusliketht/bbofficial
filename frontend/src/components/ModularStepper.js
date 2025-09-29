import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import enterpriseDebugger from '../services/EnterpriseDebugger';
import {
  CheckCircle, Clock, AlertCircle, ArrowRight, ArrowLeft, 
  Save, Eye, EyeOff, Info, Zap
} from 'lucide-react';

// Modular Stepper Component - LYRA Flow Core Mechanism
// Purpose: Progress-first UI with per-step micro-wins and persistent real-time summary

const ModularStepper = ({ 
  steps = [], 
  currentStep = 0, 
  onStepChange, 
  onSaveDraft, 
  summaryData = null,
  isMobile = false,
  showSummary = true,
  allowStepBack = true,
  autoSave = true
}) => {
  const navigate = useNavigate();
  
  // State management
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepData, setStepData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(showSummary);
  const [lastSaved, setLastSaved] = useState(null);

  // Enterprise debugging
  useEffect(() => {
    enterpriseDebugger.trackLifecycle('ModularStepper', 'MOUNT', {
      totalSteps: steps.length,
      currentStep,
      isMobile,
      showSummary
    });

    return () => {
      enterpriseDebugger.trackLifecycle('ModularStepper', 'UNMOUNT');
    };
  }, [steps.length, currentStep, isMobile, showSummary]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && Object.keys(stepData).length > 0) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [stepData, autoSave]);

  // Mark step as completed
  const markStepCompleted = (stepIndex, data) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    setStepData(prev => ({ ...prev, [stepIndex]: data }));
    
    enterpriseDebugger.log('INFO', 'ModularStepper', 'Step completed', {
      stepIndex,
      stepName: steps[stepIndex]?.name,
      hasData: !!data
    });
  };

  // Handle step navigation
  const handleStepChange = (newStep) => {
    if (newStep < 0 || newStep >= steps.length) return;
    
    enterpriseDebugger.log('INFO', 'ModularStepper', 'Step navigation', {
      from: currentStep,
      to: newStep,
      stepName: steps[newStep]?.name
    });

    onStepChange?.(newStep);
  };

  // Handle auto-save
  const handleAutoSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSaveDraft?.(stepData);
      setLastSaved(new Date());
      
      enterpriseDebugger.log('SUCCESS', 'ModularStepper', 'Auto-save completed', {
        stepsWithData: Object.keys(stepData).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      enterpriseDebugger.log('ERROR', 'ModularStepper', 'Auto-save failed', {
        error: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle manual save
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await onSaveDraft?.(stepData);
      setLastSaved(new Date());
      
      enterpriseDebugger.log('SUCCESS', 'ModularStepper', 'Manual save completed', {
        stepsWithData: Object.keys(stepData).length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      enterpriseDebugger.log('ERROR', 'ModularStepper', 'Manual save failed', {
        error: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get step status
  const getStepStatus = (stepIndex) => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'current';
    if (stepIndex < currentStep) return 'pending';
    return 'upcoming';
  };

  // Calculate progress percentage
  const progressPercentage = (completedSteps.size / steps.length) * 100;

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} h-full`}>
      
      {/* Stepper Navigation */}
      <div className={`${isMobile ? 'w-full' : 'w-80'} bg-white border-r border-gray-200 flex flex-col`}>
        
        {/* Progress Header */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Filing Progress</h3>
            <button
              onClick={() => setShowSummaryPanel(!showSummaryPanel)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showSummaryPanel ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completedSteps.size} of {steps.length} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-3">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = allowStepBack && (status === 'completed' || status === 'current');
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    status === 'completed' 
                      ? 'border-green-200 bg-green-50' 
                      : status === 'current'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  } ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}`}
                  onClick={() => isClickable && handleStepChange(index)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Step Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status === 'completed' 
                        ? 'bg-green-500 text-white' 
                        : status === 'current'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : status === 'current' ? (
                        <Zap className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${
                          status === 'completed' 
                            ? 'text-green-800' 
                            : status === 'current'
                            ? 'text-blue-800'
                            : 'text-gray-600'
                        }`}>
                          {step.name}
                        </h4>
                        {status === 'current' && (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className={`text-sm ${
                        status === 'completed' 
                          ? 'text-green-600' 
                          : status === 'current'
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      {step.estimatedTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          Est. {step.estimatedTime}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Step Data Indicator */}
                  {stepData[index] && (
                    <div className="mt-3 p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Data saved</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 md:p-6 border-t border-gray-200 space-y-3">
          {/* Save Draft Button */}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="w-full bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </>
            )}
          </button>
          
          {/* Navigation Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleStepChange(currentStep - 1)}
              disabled={currentStep === 0 || !allowStepBack}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={() => handleStepChange(currentStep + 1)}
              disabled={currentStep >= steps.length - 1}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Last Saved Indicator */}
          {lastSaved && (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Panel (Desktop) */}
      {showSummaryPanel && !isMobile && summaryData && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 md:p-6">
          <div className="sticky top-0">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Real-time Summary</h4>
            
            {/* Summary Content */}
            <div className="space-y-4">
              {summaryData.grossIncome && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Gross Income</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{summaryData.grossIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              {summaryData.totalDeductions && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Total Deductions</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{summaryData.totalDeductions.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              {summaryData.taxableIncome && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Taxable Income</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{summaryData.taxableIncome.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              {summaryData.estimatedTax && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Estimated Tax</span>
                    <span className="text-lg font-bold text-red-600">
                      ₹{summaryData.estimatedTax.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              
              {summaryData.estimatedRefund && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Estimated Refund</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{summaryData.estimatedRefund.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Warnings */}
            {summaryData.warnings && summaryData.warnings.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Warnings</h5>
                <div className="space-y-2">
                  {summaryData.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModularStepper;
