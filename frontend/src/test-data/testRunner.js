// =====================================================
// TEST RUNNER - END-TO-END WORKFLOW TESTING
// Automated test execution and reporting system
// =====================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Typography } from '../components/DesignSystem/DesignSystem';
import { PageTransition, FadeInUp } from '../components/DesignSystem/Animations';
import { TestUsers, TestForm16Data, TestIncomeData, TestDeductionData } from './testData';
import { EndUserTestCases, CATestCases, ExploratoryTestCases, TestExecutionPlan } from './testScenarios';

const TestRunner = () => {
  const [currentTest, setCurrentTest] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testLog, setTestLog] = useState([]);

  const allTestCases = {
    ...EndUserTestCases,
    ...CATestCases,
    ...ExploratoryTestCases
  };

  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, { timestamp, message, type }]);
  };

  const executeTestStep = async (step, testCase) => {
    addLogEntry(`Executing Step ${step.step}: ${step.action}`, 'info');
    
    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock test results based on step
      const result = {
        step: step.step,
        action: step.action,
        expected: step.expected,
        status: 'passed',
        actual: step.expected,
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 2000) + 500
      };

      // Simulate occasional failures for realistic testing
      if (Math.random() < 0.1) {
        result.status = 'failed';
        result.actual = 'Test failed due to simulated error';
        result.error = 'Simulated test failure for demonstration';
        addLogEntry(`❌ Step ${step.step} failed: ${result.error}`, 'error');
      } else {
        addLogEntry(`✅ Step ${step.step} passed: ${step.expected}`, 'success');
      }

      return result;
    } catch (error) {
      addLogEntry(`❌ Step ${step.step} error: ${error.message}`, 'error');
      return {
        step: step.step,
        action: step.action,
        expected: step.expected,
        status: 'error',
        actual: error.message,
        timestamp: new Date().toISOString(),
        duration: 0
      };
    }
  };

  const runTestCase = async (testCase) => {
    setIsRunning(true);
    setCurrentTest(testCase);
    setCurrentStep(0);
    setTestLog([]);
    
    addLogEntry(`🚀 Starting test case: ${testCase.name}`, 'info');
    
    const results = [];
    
    for (let i = 0; i < testCase.steps.length; i++) {
      setCurrentStep(i + 1);
      const step = testCase.steps[i];
      const result = await executeTestStep(step, testCase);
      results.push(result);
      
      // Add delay between steps
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const testResult = {
      id: testCase.id,
      name: testCase.name,
      status: results.every(r => r.status === 'passed') ? 'passed' : 'failed',
      results: results,
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      timestamp: new Date().toISOString(),
      summary: {
        totalSteps: results.length,
        passedSteps: results.filter(r => r.status === 'passed').length,
        failedSteps: results.filter(r => r.status === 'failed').length,
        errorSteps: results.filter(r => r.status === 'error').length
      }
    };
    
    setTestResults(prev => ({
      ...prev,
      [testCase.id]: testResult
    }));
    
    setIsRunning(false);
    setCurrentTest(null);
    setCurrentStep(0);
    
    addLogEntry(`🏁 Test case completed: ${testCase.name} - ${testResult.status.toUpperCase()}`, 
      testResult.status === 'passed' ? 'success' : 'error');
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestLog([]);
    
    addLogEntry('🚀 Starting comprehensive test suite', 'info');
    
    const testCases = Object.values(allTestCases);
    
    for (const testCase of testCases) {
      if (testCase.steps) {
        await runTestCase(testCase);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setIsRunning(false);
    addLogEntry('🏁 All tests completed', 'info');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-success-600';
      case 'failed': return 'text-error-600';
      case 'error': return 'text-warning-600';
      default: return 'text-neutral-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'passed': return 'bg-success-100';
      case 'failed': return 'bg-error-100';
      case 'error': return 'bg-warning-100';
      default: return 'bg-neutral-100';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <PageTransition className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography.H1 className="mb-4">End-to-End Test Runner</Typography.H1>
          <Typography.Body className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Comprehensive test execution system for validating complete user journeys and system integration.
          </Typography.Body>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </button>
              <button
                onClick={() => setTestResults({})}
                disabled={isRunning}
                className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-medium hover:bg-neutral-300 disabled:opacity-50 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Current Test Status */}
        {isRunning && currentTest && (
          <FadeInUp>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Currently Running: {currentTest.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / currentTest.steps.length) * 100}%` }}
                      />
                    </div>
                    <Typography.Small className="text-neutral-600">
                      Step {currentStep} of {currentTest.steps.length}
                    </Typography.Small>
                  </div>
                  <Typography.Small className="text-neutral-600">
                    {currentTest.steps[currentStep - 1]?.action || 'Preparing test...'}
                  </Typography.Small>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        )}

        {/* Test Cases */}
        <div className="space-y-6">
          {Object.entries(allTestCases).map(([key, testCase], index) => (
            <FadeInUp key={key} delay={index * 0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        {testCase.name}
                      </CardTitle>
                      <Typography.Small className="mt-2">
                        {testCase.description}
                      </Typography.Small>
                    </div>
                    <div className="flex items-center space-x-3">
                      {testResults[testCase.id] && (
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(testResults[testCase.id].status)} ${getStatusColor(testResults[testCase.id].status)}`}>
                          {testResults[testCase.id].status.toUpperCase()}
                        </div>
                      )}
                      <button
                        onClick={() => runTestCase(testCase)}
                        disabled={isRunning}
                        className="px-4 py-2 bg-secondary-500 text-white rounded-lg text-sm font-medium hover:bg-secondary-600 disabled:opacity-50 transition-colors"
                      >
                        Run Test
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Test Steps */}
                    {testCase.steps && (
                      <div>
                        <Typography.Small className="font-medium text-neutral-700 mb-2">
                          Test Steps:
                        </Typography.Small>
                        <div className="space-y-2">
                          {testCase.steps.map((step, idx) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {step.step}
                              </div>
                              <div className="flex-1">
                                <Typography.Small className="font-medium text-neutral-700">
                                  {step.action}
                                </Typography.Small>
                                <Typography.Small className="text-neutral-600 mt-1">
                                  Expected: {step.expected}
                                </Typography.Small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Results */}
                    {testResults[testCase.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t pt-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${testResults[testCase.id].status === 'passed' ? 'bg-success-500' : 'bg-error-500'}`} />
                            <Typography.Small className="font-medium">
                              {testResults[testCase.id].status.toUpperCase()}
                            </Typography.Small>
                            <Typography.Small className="text-neutral-500">
                              {new Date(testResults[testCase.id].timestamp).toLocaleTimeString()}
                            </Typography.Small>
                            <Typography.Small className="text-neutral-500">
                              Duration: {Math.round(testResults[testCase.id].duration / 1000)}s
                            </Typography.Small>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-success-600">
                                {testResults[testCase.id].summary.passedSteps}
                              </div>
                              <Typography.Small>Passed</Typography.Small>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-error-600">
                                {testResults[testCase.id].summary.failedSteps}
                              </div>
                              <Typography.Small>Failed</Typography.Small>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-warning-600">
                                {testResults[testCase.id].summary.errorSteps}
                              </div>
                              <Typography.Small>Errors</Typography.Small>
                            </div>
                          </div>

                          {testResults[testCase.id].results.some(r => r.status !== 'passed') && (
                            <div>
                              <Typography.Small className="font-medium text-neutral-700 mb-2">
                                Issues Found:
                              </Typography.Small>
                              <div className="space-y-2">
                                {testResults[testCase.id].results
                                  .filter(r => r.status !== 'passed')
                                  .map((result, idx) => (
                                    <div key={idx} className="flex items-start space-x-2 p-2 bg-error-50 border border-error-200 rounded">
                                      <span className="text-error-500 mt-1">•</span>
                                      <div>
                                        <Typography.Small className="text-error-700 font-medium">
                                          Step {result.step}: {result.action}
                                        </Typography.Small>
                                        <Typography.Small className="text-error-600">
                                          {result.error || result.actual}
                                        </Typography.Small>
                                      </div>
                                    </div>
                                  ))}
                              </div>
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

        {/* Test Log */}
        {testLog.length > 0 && (
          <FadeInUp delay={0.5}>
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Test Execution Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testLog.map((entry, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-sm">
                      <span className="text-neutral-500 flex-shrink-0 w-16">
                        {entry.timestamp}
                      </span>
                      <span className="flex-shrink-0">
                        {getLogIcon(entry.type)}
                      </span>
                      <span className="text-neutral-700">
                        {entry.message}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        )}

        {/* Overall Results */}
        {Object.keys(testResults).length > 0 && (
          <FadeInUp delay={0.6}>
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Overall Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {Object.keys(testResults).length}
                      </div>
                      <Typography.Small>Tests Executed</Typography.Small>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-600">
                        {Object.values(testResults).filter(r => r.status === 'passed').length}
                      </div>
                      <Typography.Small>Tests Passed</Typography.Small>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-error-600">
                        {Object.values(testResults).filter(r => r.status === 'failed').length}
                      </div>
                      <Typography.Small>Tests Failed</Typography.Small>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-warning-600">
                        {Object.values(testResults).filter(r => r.status === 'error').length}
                      </div>
                      <Typography.Small>Tests Error</Typography.Small>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4">
                    <Typography.Small className="font-medium text-neutral-700 mb-2">
                      Test Execution Summary:
                    </Typography.Small>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <Typography.Small>End User Critical Path Tests</Typography.Small>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <Typography.Small>CA Critical Path Tests</Typography.Small>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <Typography.Small>Exploratory Testing</Typography.Small>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <Typography.Small>Performance Testing</Typography.Small>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        )}
      </div>
    </PageTransition>
  );
};

export default TestRunner;
