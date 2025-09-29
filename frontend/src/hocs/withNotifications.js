// =====================================================
// NOTIFICATION INTEGRATION
// =====================================================

import React from 'react';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationComponent from '../components/Notifications/NotificationComponent';

// Higher-order component to wrap app with notifications
export const withNotifications = (WrappedComponent) => {
  return function NotificationWrapper(props) {
    return (
      <NotificationProvider>
        <WrappedComponent {...props} />
        <NotificationComponent />
      </NotificationProvider>
    );
  };
};

// Hook to use notifications in any component
export { useNotificationContext } from '../contexts/NotificationContext';

export default withNotifications;
