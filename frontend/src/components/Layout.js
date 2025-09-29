// =====================================================
// COMPACT LAYOUT - MOBILE-FIRST DESIGN
// Uses the new compact sidebar and design system
// =====================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import CompactSidebar from './UI/CompactSidebar.js';

const Layout = ({ children }) => {
  return (
    <CompactSidebar>
      {children || <Outlet />}
    </CompactSidebar>
  );
};

// =====================================================
// COMPACT CARD COMPONENT
// =====================================================

export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-neutral-200 p-4 lg:p-6 ${className}`} {...props}>
    {children}
  </div>
);

// =====================================================
// COMPACT GRID COMPONENT
// =====================================================

export const Grid = ({ children, cols = 1, gap = 4, className = '', ...props }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };
  
  const gridGap = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };
  
  return (
    <div 
      className={`grid ${gridCols[cols]} ${gridGap[gap]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

// =====================================================
// COMPACT MAIN LAYOUT WRAPPER
// =====================================================

export const MainLayout = ({ children, headerContent, className = '', ...props }) => (
  <div className={`min-h-screen bg-neutral-50 ${className}`} {...props}>
    {headerContent && (
      <div className="bg-white shadow-sm border-b border-neutral-200 p-4">
        {headerContent}
      </div>
    )}
    <div className="p-4 lg:p-6">
      {children}
    </div>
  </div>
);

// =====================================================
// COMPACT SECTION COMPONENT
// =====================================================

export const Section = ({ title, subtitle, children, className = '', ...props }) => (
  <section className={`space-y-4 ${className}`} {...props}>
    {(title || subtitle) && (
      <div className="space-y-1">
        {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

// =====================================================
// COMPACT STATS COMPONENT
// =====================================================

export const Stats = ({ items, className = '', ...props }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} {...props}>
    {items.map((item, index) => (
      <div key={index} className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">{item.label}</p>
            <p className="text-2xl font-bold text-neutral-900">{item.value}</p>
          </div>
          {item.icon && (
            <div className="p-2 bg-primary-100 rounded-lg">
              <item.icon className="w-5 h-5 text-primary-600" />
            </div>
          )}
        </div>
        {item.change && (
          <div className="mt-2">
            <span className={`text-xs font-medium ${
              item.changeType === 'positive' ? 'text-success-600' : 
              item.changeType === 'negative' ? 'text-error-600' : 
              'text-neutral-600'
            }`}>
              {item.change}
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
);

export default Layout;