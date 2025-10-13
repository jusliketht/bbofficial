// =====================================================
// CONTENT & COPYWRITING REVIEW - CONSISTENCY VALIDATION
// Comprehensive content review for tone, terminology, and clarity
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Typography } from './DesignSystem';
import { PageTransition, FadeInUp } from './Animations';

const ContentReview = () => {
  const [activeTab, setActiveTab] = useState('terminology');
  const [reviewResults, setReviewResults] = useState({});

  const contentCategories = {
    terminology: {
      title: 'Terminology Consistency',
      description: 'Standardize terms across the platform',
      items: [
        {
          category: 'Tax Filing Terms',
          current: ['ITR Filing', 'Tax Filing', 'Return', 'Tax Return'],
          standardized: 'ITR Filing',
          reason: 'Use consistent term throughout the platform'
        },
        {
          category: 'User Actions',
          current: ['Save Changes', 'Update Profile', 'Save', 'Update'],
          standardized: 'Save Changes',
          reason: 'Clear action-oriented language'
        },
        {
          category: 'Status Messages',
          current: ['Success', 'Completed', 'Done', 'Finished'],
          standardized: 'Success',
          reason: 'Positive, action-oriented feedback'
        },
        {
          category: 'Error Messages',
          current: ['Error', 'Failed', 'Something went wrong', 'Oops'],
          standardized: 'Error',
          reason: 'Professional, clear error indication'
        }
      ]
    },
    tone: {
      title: 'Tone of Voice',
      description: 'Ensure consistent professional, reassuring tone',
      items: [
        {
          category: 'Professional',
          examples: [
            'Welcome to BurnBlack, your trusted tax filing partner',
            'We\'re here to help you file your taxes with confidence',
            'Your financial security is our priority'
          ],
          guidelines: 'Professional yet approachable, trustworthy, confident'
        },
        {
          category: 'Reassuring',
          examples: [
            'Don\'t worry, we\'ll guide you through each step',
            'Your data is secure and encrypted',
            'We\'re here to help if you need assistance'
          ],
          guidelines: 'Calming, supportive, encouraging'
        },
        {
          category: 'Simple',
          examples: [
            'Enter your PAN number',
            'Upload your Form 16',
            'Review and submit your filing'
          ],
          guidelines: 'Clear, concise, easy to understand'
        }
      ]
    },
    errorMessages: {
      title: 'Error Message Review',
      description: 'Ensure helpful, actionable error messages',
      items: [
        {
          category: 'Form Validation',
          current: 'Error',
          improved: 'PAN must be exactly 10 characters long',
          reason: 'Specific, actionable feedback'
        },
        {
          category: 'Network Errors',
          current: 'Failed to fetch',
          improved: 'We couldn\'t load your data. Please check your internet connection and try again.',
          reason: 'Clear explanation and next steps'
        },
        {
          category: 'Authentication',
          current: 'Login failed',
          improved: 'Invalid email or password. Please check your credentials and try again.',
          reason: 'Specific guidance on what to check'
        },
        {
          category: 'File Upload',
          current: 'Upload failed',
          improved: 'File upload failed. Please ensure your file is under 10MB and in PDF format.',
          reason: 'Clear requirements and limitations'
        }
      ]
    },
    buttonText: {
      title: 'Button Text Standardization',
      description: 'Consistent button labels across the platform',
      items: [
        {
          category: 'Primary Actions',
          current: ['Submit', 'Save', 'Continue', 'Next', 'Proceed'],
          standardized: 'Continue',
          reason: 'Clear progression through the process'
        },
        {
          category: 'Secondary Actions',
          current: ['Cancel', 'Back', 'Previous', 'Go Back'],
          standardized: 'Back',
          reason: 'Simple, clear navigation'
        },
        {
          category: 'Destructive Actions',
          current: ['Delete', 'Remove', 'Clear', 'Reset'],
          standardized: 'Delete',
          reason: 'Clear, unambiguous action'
        },
        {
          category: 'Confirmation Actions',
          current: ['Yes', 'Confirm', 'OK', 'Accept'],
          standardized: 'Confirm',
          reason: 'Professional confirmation language'
        }
      ]
    }
  };

  const runContentReview = (category) => {
    const results = {
      score: Math.floor(Math.random() * 20) + 80, // Mock score between 80-100
      issues: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    // Mock review results
    switch (category) {
      case 'terminology':
        results.issues = [
          'Inconsistent use of "ITR Filing" vs "Tax Filing"',
          'Mixed terminology in error messages'
        ];
        results.recommendations = [
          'Standardize on "ITR Filing" throughout the platform',
          'Create a terminology guide for developers'
        ];
        break;
      case 'tone':
        results.issues = [
          'Some error messages are too technical',
          'Inconsistent tone between sections'
        ];
        results.recommendations = [
          'Review all error messages for tone consistency',
          'Create tone guidelines for content writers'
        ];
        break;
      case 'errorMessages':
        results.issues = [
          'Generic error messages lack specificity',
          'Missing actionable guidance'
        ];
        results.recommendations = [
          'Rewrite all error messages to be more specific',
          'Add helpful context and next steps'
        ];
        break;
      case 'buttonText':
        results.issues = [
          'Inconsistent button labels across forms',
          'Some buttons lack clarity'
        ];
        results.recommendations = [
          'Standardize button text across all forms',
          'Create button text guidelines'
        ];
        break;
    }

    results.passed = results.score >= 85;
    setReviewResults(prev => ({
      ...prev,
      [category]: results
    }));
  };

  const runAllReviews = () => {
    Object.keys(contentCategories).forEach(category => {
      runContentReview(category);
    });
  };

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-success-600';
    if (score >= 85) return 'text-warning-600';
    return 'text-error-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 95) return 'bg-success-100';
    if (score >= 85) return 'bg-warning-100';
    return 'bg-error-100';
  };

  return (
    <PageTransition className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography.H1 className="mb-4">Content & Copywriting Review</Typography.H1>
          <Typography.Body className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Comprehensive review of platform content for consistency, clarity, and professional tone.
            This ensures all user-facing text maintains a cohesive voice and provides clear guidance.
          </Typography.Body>
        </div>

        {/* Review Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Review Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={runAllReviews}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Run All Reviews
              </button>
              <button
                onClick={() => setReviewResults({})}
                className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-300 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Content Categories */}
        <div className="space-y-6">
          {Object.entries(contentCategories).map(([key, category], index) => (
            <FadeInUp key={key} delay={index * 0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        {category.title}
                      </CardTitle>
                      <Typography.Small className="mt-2">
                        {category.description}
                      </Typography.Small>
                    </div>
                    <div className="flex items-center space-x-3">
                      {reviewResults[key] && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(reviewResults[key].score)} ${getScoreColor(reviewResults[key].score)}`}>
                          {reviewResults[key].score}%
                        </div>
                      )}
                      <button
                        onClick={() => runContentReview(key)}
                        className="px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Content Items */}
                    <div className="space-y-4">
                      {category.items.map((item, idx) => (
                        <div key={idx} className="border border-neutral-200 rounded-lg p-4">
                          <div className="space-y-3">
                            <Typography.Small className="font-medium text-neutral-700">
                              {item.category}
                            </Typography.Small>
                            
                            {item.current && (
                              <div>
                                <Typography.Small className="text-neutral-600 mb-1">
                                  Current Variations:
                                </Typography.Small>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(item.current) ? item.current.map((term, i) => (
                                    <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                                      {term}
                                    </span>
                                  )) : (
                                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                                      {item.current}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {item.standardized && (
                              <div>
                                <Typography.Small className="text-neutral-600 mb-1">
                                  Standardized Term:
                                </Typography.Small>
                                <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-medium">
                                  {item.standardized}
                                </span>
                              </div>
                            )}

                            {item.improved && (
                              <div>
                                <Typography.Small className="text-neutral-600 mb-1">
                                  Improved Version:
                                </Typography.Small>
                                <span className="px-2 py-1 bg-success-100 text-success-700 rounded text-xs font-medium">
                                  {item.improved}
                                </span>
                              </div>
                            )}

                            {item.examples && (
                              <div>
                                <Typography.Small className="text-neutral-600 mb-1">
                                  Examples:
                                </Typography.Small>
                                <div className="space-y-1">
                                  {item.examples.map((example, i) => (
                                    <div key={i} className="text-xs text-neutral-600 italic">
                                      "{example}"
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.guidelines && (
                              <div>
                                <Typography.Small className="text-neutral-600 mb-1">
                                  Guidelines:
                                </Typography.Small>
                                <Typography.Small className="text-neutral-600">
                                  {item.guidelines}
                                </Typography.Small>
                              </div>
                            )}

                            {item.reason && (
                              <div>
                                <Typography.Small className="text-neutral-600 mb-1">
                                  Reason:
                                </Typography.Small>
                                <Typography.Small className="text-neutral-600">
                                  {item.reason}
                                </Typography.Small>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Review Results */}
                    {reviewResults[key] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t pt-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${reviewResults[key].passed ? 'bg-success-500' : 'bg-error-500'}`} />
                            <Typography.Small className="font-medium">
                              {reviewResults[key].passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                            </Typography.Small>
                            <Typography.Small className="text-neutral-500">
                              {new Date(reviewResults[key].timestamp).toLocaleTimeString()}
                            </Typography.Small>
                          </div>

                          {reviewResults[key].issues && reviewResults[key].issues.length > 0 && (
                            <div>
                              <Typography.Small className="font-medium text-neutral-700 mb-2">
                                Issues Found:
                              </Typography.Small>
                              <ul className="space-y-1">
                                {reviewResults[key].issues.map((issue, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <span className="text-error-500 mt-1">•</span>
                                    <Typography.Small className="text-neutral-600">
                                      {issue}
                                    </Typography.Small>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {reviewResults[key].recommendations && reviewResults[key].recommendations.length > 0 && (
                            <div>
                              <Typography.Small className="font-medium text-neutral-700 mb-2">
                                Recommendations:
                              </Typography.Small>
                              <ul className="space-y-1">
                                {reviewResults[key].recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start space-x-2">
                                    <span className="text-success-500 mt-1">•</span>
                                    <Typography.Small className="text-neutral-600">
                                      {rec}
                                    </Typography.Small>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>
          ))}
        </div>

        {/* Content Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Content Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Typography.H4 className="mb-4">Tone of Voice</Typography.H4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Typography.Small className="font-medium text-neutral-700">
                      Professional
                    </Typography.Small>
                    <Typography.Small className="text-neutral-600">
                      Use clear, professional language that builds trust and confidence.
                    </Typography.Small>
                  </div>
                  <div className="space-y-2">
                    <Typography.Small className="font-medium text-neutral-700">
                      Reassuring
                    </Typography.Small>
                    <Typography.Small className="text-neutral-600">
                      Provide comfort and support, especially during complex processes.
                    </Typography.Small>
                  </div>
                  <div className="space-y-2">
                    <Typography.Small className="font-medium text-neutral-700">
                      Simple
                    </Typography.Small>
                    <Typography.Small className="text-neutral-600">
                      Use plain language that anyone can understand.
                    </Typography.Small>
                  </div>
                  <div className="space-y-2">
                    <Typography.Small className="font-medium text-neutral-700">
                      Actionable
                    </Typography.Small>
                    <Typography.Small className="text-neutral-600">
                      Provide clear next steps and guidance.
                    </Typography.Small>
                  </div>
                </div>
              </div>

              <div>
                <Typography.H4 className="mb-4">Error Message Best Practices</Typography.H4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Be specific about what went wrong
                    </Typography.Small>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Explain why it happened in simple terms
                    </Typography.Small>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Provide clear next steps to resolve the issue
                    </Typography.Small>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Use a helpful, non-blaming tone
                    </Typography.Small>
                  </div>
                </div>
              </div>

              <div>
                <Typography.H4 className="mb-4">Button Text Guidelines</Typography.H4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Use action verbs that clearly describe what will happen
                    </Typography.Small>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Keep text concise but descriptive
                    </Typography.Small>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Use consistent terminology across similar actions
                    </Typography.Small>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    <Typography.Small className="text-neutral-600">
                      Avoid technical jargon or ambiguous terms
                    </Typography.Small>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ContentReview;
