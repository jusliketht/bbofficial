// =====================================================
// ADMIN LAYOUT COMPONENT
// =====================================================

import React from 'react';
import AdminNavigation from './AdminNavigation';
import AdminRoute from './AdminRoute';
import { enterpriseLogger } from '../../utils/logger';

const AdminLayout = ({ children }) => {
  return (
    <AdminRoute>
      <div className="admin-layout">
        <AdminNavigation />
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;
