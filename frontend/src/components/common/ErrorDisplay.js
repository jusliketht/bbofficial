import React from 'react';
import { AlertTriangle, RefreshCw, Info, X, Wifi, WifiOff } from 'lucide-react';
import { getErrorDisplay } from '../utils/errorHandler';

const ErrorDisplay = ({
  error,
  onRetry,
  onDismiss,
  className = '',
  showDetails = process.env.NODE_ENV === 'development',
  compact = false
}) => {
  const display = getErrorDisplay(error);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-3 rounded-lg border ${getSeverityColor(error.severity)} ${className}`}>
        {getSeverityIcon(error.severity)}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {display.title}
          </p>
          <p className="text-xs text-gray-600">
            {display.message}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1 hover:bg-white rounded transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(error.severity)} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getSeverityIcon(error.severity)}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {display.icon} {display.title}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              {display.message}
            </p>
            <p className="text-xs text-gray-600 mb-3">
              {display.suggestion}
            </p>

            {/* Error Details */}
            {showDetails && error.code && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>Error Code: {error.code}</div>
                <div>Timestamp: {new Date(error.timestamp).toLocaleString()}</div>
                {error.originalError && (
                  <div>Original: {error.originalError}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center px-3 py-1 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white rounded transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized error components
export const NetworkErrorDisplay = ({ onRetry }) => (
  <ErrorDisplay
    error={{
      type: 'network',
      severity: 'high',
      message: 'Unable to connect to our servers',
      timestamp: new Date().toISOString()
    }}
    onRetry={onRetry}
    className="mb-4"
  />
);

export const ValidationErrorDisplay = ({ errors, onDismiss }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {Object.entries(errors).map(([field, fieldErrors]) => (
        <ErrorDisplay
          key={field}
          error={{
            type: 'validation',
            severity: 'low',
            message: `${field}: ${fieldErrors.join(', ')}`,
            timestamp: new Date().toISOString()
          }}
          onDismiss={onDismiss}
          compact
        />
      ))}
    </div>
  );
};

export const FileUploadErrorDisplay = ({ error, onRetry }) => (
  <ErrorDisplay
    error={{
      type: 'file_upload',
      severity: 'medium',
      message: error.message || 'File upload failed',
      timestamp: new Date().toISOString()
    }}
    onRetry={onRetry}
    className="mb-4"
  />
);

// Offline indicator component
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-100 border border-red-300 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-800">You're offline</span>
        </div>
        <p className="text-xs text-red-600 mt-1">
          Some features may not be available
        </p>
      </div>
    </div>
  );
};

// Loading error component
export const LoadingError = ({ error, onRetry, message = 'Failed to load data' }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {message}
    </h3>
    <p className="text-gray-600 mb-4">
      {error?.message || 'Something went wrong while loading the data.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    )}
  </div>
);

export default ErrorDisplay;
