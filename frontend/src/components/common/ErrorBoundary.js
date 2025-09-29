import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and external service
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Here you would typically send this to an error reporting service
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  logErrorToService = (error, errorInfo) => {
    // Simulate logging to external service
    const errorReport = {
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      componentStack: errorInfo.componentStack,
      user: {
        // Add user context if available
        id: 'anonymous',
        sessionId: sessionStorage.getItem('sessionId')
      }
    };

    // In production, send to error reporting service
    console.log('Error Report:', errorReport);

    // Store locally for debugging
    localStorage.setItem(`error_${this.state.errorId}`, JSON.stringify(errorReport));
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReportBug = () => {
    // Open bug report dialog or redirect to support
    const subject = encodeURIComponent(`Bug Report: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.errorId}
URL: ${window.location.href}
Browser: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]

Technical Details:
${this.state.error?.message || 'Unknown error'}
    `);

    window.open(`mailto:support@itr-filing.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 text-sm">
                We encountered an unexpected error. Our team has been notified.
              </p>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-2 text-gray-600">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error?.message}
                    </div>
                    <div>
                      <strong>Component:</strong>
                      <pre className="text-xs mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo?.componentStack?.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Issue
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Error ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                  {this.state.errorId}
                </code>
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Need help? Contact our support team
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;