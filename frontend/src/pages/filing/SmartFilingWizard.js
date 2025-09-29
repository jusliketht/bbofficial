import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Lightbulb,
  AlertCircle,
  X,
  Bot,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { ValidatedInput } from '../../components/ValidatedInput';
import { ValidatedNumberInput } from '../../components/ValidatedNumberInput';
import { ChatInterface } from '../../components/ChatInterface';
import useChatbot from '../../hooks/useChatbot';
import useAutoSave from '../../hooks/useAutoSave';
import { panValidationService } from '../../services/panValidationService';

const SmartFilingWizard = () => {
  const navigate = useNavigate();
  const { filingId } = useParams();

  // Chatbot integration
  const { messages, loading: chatLoading, sendMessage, clearMessages } = useChatbot();

  // MVP State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Multi-person filing state
  const [filingFor, setFilingFor] = useState([]); // Array of people to file for
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);

  const [panValidation, setPanValidation] = useState({
    pan: '',
    isValid: false,
    isVerifying: false,
    taxpayerName: '',
    lastFiled: null,
    eligibility: null
  });

  // Steps for MVP
  const steps = [
    { id: 'relationship', title: 'Relationship', description: 'Who are we filing for?' },
    { id: 'pan', title: 'PAN Validation', description: 'Verify eligibility' },
    { id: 'income', title: 'Income Details', description: 'Your income sources' },
    { id: 'itr', title: 'ITR Selection', description: 'Choose your form' },
    { id: 'review', title: 'Review & Submit', description: 'Final submission' }
  ];

  // Auto-save hook
  const {
    isSaving: isAutoSaving,
    lastSaved
  } = useAutoSave();

  // Load existing filing data
  const { isLoading } = useQuery(
    ['filing', filingId],
    () => filingId ? api.get(`/filing/${filingId}`) : null,
  );

  // PAN Validation will be handled by the PAN input component

  // Navigation handlers for multi-person filing
  const nextStep = () => {
    // Handle relationship step
    if (currentStep === 0) {
      if (filingFor.length === 0) {
        toast.error('Please select at least one person to file for');
        return;
      }
      setCurrentPersonIndex(0);
      setCurrentStep(1);
      return;
    }

    // Handle PAN validation step for multiple people
    if (currentStep === 1) {
      const currentPerson = filingFor[currentPersonIndex];

      // If current person is not validated, don't proceed
      if (!currentPerson?.panValidation?.isValid) {
        toast.error('Please validate the PAN before proceeding');
        return;
      }

      // If there are more people to validate, move to next person
      if (currentPersonIndex < filingFor.length - 1) {
        setCurrentPersonIndex(currentPersonIndex + 1);
        // Reset PAN validation for next person
        setPanValidation({
          pan: '',
          isValid: false,
          isVerifying: false,
          taxpayerName: '',
          lastFiled: null,
          eligibility: null
        });
        return;
      }

      // All people validated, move to income step
      setCurrentStep(2);
      return;
    }

    // Handle other steps normally
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Handle PAN validation step for multiple people
    if (currentStep === 1 && currentPersonIndex > 0) {
      setCurrentPersonIndex(currentPersonIndex - 1);
      const prevPerson = filingFor[currentPersonIndex - 1];
      setPanValidation(prevPerson?.panValidation || {
        pan: '',
        isValid: false,
        isVerifying: false,
        taxpayerName: '',
        lastFiled: null,
        eligibility: null
      });
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Multi-person filing handlers
  const addPerson = (relationshipType) => {
    if (filingFor.length >= 5) {
      toast.error('Maximum 5 people allowed for filing');
      return;
    }

    const newPerson = {
      id: Date.now(),
      relationship: relationshipType,
      panValidation: {
        pan: '',
        isValid: false,
        isVerifying: false,
        taxpayerName: '',
        lastFiled: null,
        eligibility: null
      }
    };

    setFilingFor(prev => [...prev, newPerson]);
  };

  const removePerson = (personId) => {
    setFilingFor(prev => prev.filter(person => person.id !== personId));
  };

  const updatePersonPAN = (personId, panData) => {
    setFilingFor(prev => prev.map(person =>
      person.id === personId
        ? { ...person, panValidation: panData }
        : person
    ));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate submission for all people
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Filing submitted successfully for ${filingFor.length} person${filingFor.length > 1 ? 's' : ''}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your filing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mobile-safe-area">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 container-mobile">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Smart Tax Filing
          </h1>
          <p className="text-lg text-gray-600">
            Intelligent, auto-saving, one-click filing experience
          </p>
        </div>

        {/* Progress Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 card-mobile">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentStepData.title}
              </h2>
              <p className="text-gray-600">
                {currentStepData.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Auto-save Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              {isAutoSaving ? (
                <div className="flex items-center text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  Auto-saving...
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  All changes saved
                </div>
              )}

              {!navigator.onLine && (
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Offline mode
                </div>
              )}
            </div>

            {lastSaved && (
              <div className="text-gray-500">
                Last saved: {new Date(lastSaved).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-mobile">
          <div className="p-6">

            {/* Step Content - Multi-Person Filing */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Who Are We Filing For?</h3>
                  <p className="text-gray-600">Select the people you want to file tax returns for (up to 5 people)</p>
                </div>

                {/* Relationship Options */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { id: 'self', label: 'Self', icon: '👤', desc: 'Your own taxes' },
                    { id: 'spouse', label: 'Spouse', icon: '💑', desc: 'Husband/Wife' },
                    { id: 'parent', label: 'Parent', icon: '👴', desc: 'Father/Mother' },
                    { id: 'child', label: 'Child', icon: '👶', desc: 'Son/Daughter' },
                    { id: 'sibling', label: 'Sibling', icon: '👫', desc: 'Brother/Sister' },
                    { id: 'friend', label: 'Friend', icon: '🤝', desc: 'Close friend' }
                  ].map((relation) => (
                    <button
                      key={relation.id}
                      onClick={() => addPerson(relation.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center touch-target"
                    >
                      <div className="text-2xl mb-2">{relation.icon}</div>
                      <div className="font-medium text-gray-900">{relation.label}</div>
                      <div className="text-xs text-gray-500">{relation.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Selected People */}
                {filingFor.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Selected for Filing ({filingFor.length}/5):</h4>
                    <div className="space-y-2">
                      {filingFor.map((person, index) => (
                        <div key={person.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {person.relationship === 'self' && '👤'}
                              {person.relationship === 'spouse' && '💑'}
                              {person.relationship === 'parent' && '👴'}
                              {person.relationship === 'child' && '👶'}
                              {person.relationship === 'sibling' && '👫'}
                              {person.relationship === 'friend' && '🤝'}
                            </span>
                            <div>
                              <span className="font-medium capitalize">{person.relationship}</span>
                              <span className="text-sm text-gray-500 ml-2">#{index + 1}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removePerson(person.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filingFor.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">💡 Multi-Person Filing</p>
                        <p>You can file for up to 5 people. Each person needs their own PAN validation.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🔐</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">PAN Validation</h3>
                  <p className="text-gray-600">
                    Person {currentPersonIndex + 1} of {filingFor.length}: {
                      filingFor[currentPersonIndex]?.relationship === 'self' ? 'Your' :
                      filingFor[currentPersonIndex]?.relationship === 'spouse' ? 'Spouse\'s' :
                      filingFor[currentPersonIndex]?.relationship === 'parent' ? 'Parent\'s' :
                      filingFor[currentPersonIndex]?.relationship === 'child' ? 'Child\'s' :
                      filingFor[currentPersonIndex]?.relationship === 'sibling' ? 'Sibling\'s' :
                      'Friend\'s'
                    } PAN
                  </p>
                </div>

                {/* Person Progress Indicator */}
                <div className="flex justify-center space-x-2 mb-6">
                  {filingFor.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index < currentPersonIndex ? 'bg-green-500' :
                        index === currentPersonIndex ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="max-w-md mx-auto">
                  <ValidatedInput
                    label="PAN Number"
                    value={panValidation.pan}
                    onChange={(value) => setPanValidation(prev => ({ ...prev, pan: value }))}
                    placeholder="AAAAA0000A"
                    validationType="pan"
                    required
                  />

                  <button
                    onClick={async () => {
                      const result = await panValidationService.validatePAN(panValidation.pan);
                      if (result.success) {
                        const updatedPAN = {
                          pan: result.data.pan,
                          isValid: true,
                          isVerifying: false,
                          taxpayerName: result.data.name,
                          lastFiled: result.data.lastFiled,
                          eligibility: result.data.eligibility
                        };
                        setPanValidation(updatedPAN);
                        updatePersonPAN(filingFor[currentPersonIndex].id, updatedPAN);
                        toast.success(panValidationService.getValidationMessage(result));
                      } else {
                        setPanValidation(prev => ({ ...prev, isValid: false, isVerifying: false }));
                        toast.error(result.error);
                      }
                    }}
                    disabled={panValidation.isVerifying}
                    className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {panValidation.isVerifying ? (
                      <><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />Verifying...</>
                    ) : (
                      'Verify PAN'
                    )}
                  </button>
                </div>

                {panValidation.isValid && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">✅ PAN Verified!</p>
                        <p>{panValidation.taxpayerName} - Eligible to file tax return</p>
                        {panValidation.lastFiled && (
                          <p className="text-xs mt-1">Last filed: {panValidation.lastFiled}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Income Sources</h3>
                  <p className="text-gray-600">Tell us about your income sources</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Salary Income</h4>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">I have this income</span>
                      </label>
                    </div>
                    <ValidatedNumberInput
                      label="Annual Salary (₹)"
                      placeholder="Enter your annual salary"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Business Income</h4>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">I have this income</span>
                      </label>
                    </div>
                    <ValidatedNumberInput
                      label="Annual Business Income (₹)"
                      placeholder="Enter your business income"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">House Property Income</h4>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">I have this income</span>
                      </label>
                    </div>
                    <ValidatedNumberInput
                      label="Annual Property Income (₹)"
                      placeholder="Enter rental income"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">ITR Selection</h3>
                  <p className="text-gray-600">Based on your income, we recommend ITR-1</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-green-900 mb-2">Recommended: ITR-1 (Sahaj)</h4>
                    <p className="text-green-700 mb-4">Perfect for individuals with salary income under ₹50 lakhs</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-green-600">
                      <span>✅ Salary income</span>
                      <span>✅ Simple filing</span>
                      <span>✅ No business income</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">Not the right form? You can change it later.</p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View all ITR options
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">📎</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Documents</h3>
                  <p className="text-gray-600">Upload your documents or we'll process them automatically</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Form 16 (Salary Certificate)</p>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="text-sm text-gray-500"
                    />
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">PAN Card</p>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="text-sm text-gray-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Lightbulb className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">💡 Smart Processing</p>
                      <p>We'll automatically extract data from your documents to pre-fill your tax return.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between mobile-bottom-nav">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-lg transition-colors touch-target ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium touch-target"
                >
                  {isSubmitting ? (
                    <><RefreshCw className="w-5 h-5 animate-spin mr-2" />Submitting...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5 mr-2" />Submit Filing</>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-target"
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-40 group"
        title="Ask for help"
      >
        <Bot className="w-6 h-6" />
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          ?
        </div>
      </button>

      {/* Chatbot Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        loading={chatLoading}
        onSendMessage={sendMessage}
        onClearMessages={clearMessages}
      />
    </div>
  );
};

export default SmartFilingWizard;