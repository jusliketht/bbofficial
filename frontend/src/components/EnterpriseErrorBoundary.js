// Enterprise Error Boundary
// Comprehensive error handling with detailed reporting and recovery mechanisms
// Follows enterprise patterns for error tracking and user experience

import React from 'react';
import enterpriseDebugger from '../services/EnterpriseDebugger';

class EnterpriseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Track error with enterprise debugging
    enterpriseDebugger.trackError(error, 'ErrorBoundary', {
      errorInfo,
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({
      errorInfo,
      error
    });

    // Log to console for development
    console.error('🚨 Enterprise Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    });
  }

  handleRetry = () => {
    enterpriseDebugger.log('INFO', 'ErrorBoundary', 'User initiated retry', {
      errorId: this.state.errorId,
      retryCount: this.state.retryCount + 1
    });

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    enterpriseDebugger.log('INFO', 'ErrorBoundary', 'User initiated page reload', {
      errorId: this.state.errorId
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Error
                </h3>
                <p className="text-sm text-gray-500">
                  Something went wrong. We've been notified and are working to fix it.
                </p>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-gray-100 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h4>
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  <strong>Error:</strong> {this.state.error?.message}
                </p>
                <p className="text-xs text-gray-600">
                  <strong>Retry Count:</strong> {this.state.retryCount}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Reload Page
              </button>
            </div>

            {this.state.retryCount > 2 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  Multiple retries failed. Please contact support if the issue persists.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnterpriseErrorBoundary;
