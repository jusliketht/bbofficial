// =====================================================
// DASHBOARD WIDGETS - STATS CARDS
// Key metrics displayed as colorful cards
// =====================================================

import React from 'react';
import { FileText, Clock, Folder, TrendingUp, ArrowUpRight } from 'lucide-react';

const DashboardWidgets = ({ stats }) => {
  // Default stats if not provided
  const defaultStats = {
    totalFilings: 0,
    pendingActions: 0,
    documentsUploaded: 0,
    taxSaved: 0,
  };

  const widgetStats = stats || defaultStats;

  const widgets = [
    {
      title: 'Total Filings',
      value: widgetStats.totalFilings,
      icon: FileText,
      color: 'orange',
      bgGradient: 'bg-burn-gradient',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Pending Actions',
      value: widgetStats.pendingActions,
      icon: Clock,
      color: 'warning',
      bgGradient: 'from-warning-500 to-orange-500',
      textColor: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: 'Documents',
      value: widgetStats.documentsUploaded,
      icon: Folder,
      color: 'info',
      bgGradient: 'from-info-500 to-info-600',
      textColor: 'text-info-600',
      bgColor: 'bg-info-50',
    },
    {
      title: 'Tax Saved',
      value: `₹${widgetStats.taxSaved.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'gold',
      bgGradient: 'bg-burn-gradient',
      textColor: 'text-gold-600',
      bgColor: 'bg-gold-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {widgets.map((widget, index) => {
        const Icon = widget.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className={`p-2 rounded-lg ${widget.bgGradient === 'bg-burn-gradient' ? 'bg-burn-gradient' : `bg-gradient-to-br ${widget.bgGradient}`} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <ArrowUpRight className={`h-3 w-3 ${widget.textColor} opacity-40 group-hover:opacity-60 transition-opacity`} />
            </div>
            <div>
              <p className="text-label-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">{widget.title}</p>
              <p className="text-number-md sm:text-number-lg font-semibold text-gray-900 tabular-nums">{widget.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardWidgets;

