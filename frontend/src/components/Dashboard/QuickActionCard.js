// =====================================================
// QUICK ACTION CARD - SECONDARY DASHBOARD ACTIONS
// Smaller cards for additional user actions
// =====================================================

import React from 'react';
import { ArrowRight } from 'lucide-react';

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'blue',
  isComingSoon = false,
}) => {
  const colorClasses = {
    blue: 'bg-burn-gradient hover:opacity-90',
    green: 'bg-burn-gradient hover:opacity-90',
    purple: 'bg-burn-gradient hover:opacity-90',
    orange: 'bg-burn-gradient hover:opacity-90',
    pink: 'bg-burn-gradient hover:opacity-90',
    gold: 'bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group ${
        isComingSoon ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      onClick={!isComingSoon ? onClick : undefined}
    >
      <div className="p-3">
        {/* Icon + Title Row */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`w-9 h-9 ${colorClasses[color] || colorClasses.orange} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors flex items-center gap-1.5 flex-1 min-w-0">
            <span className="truncate">{title}</span>
            {isComingSoon && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-normal flex-shrink-0">
                Soon
              </span>
            )}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mb-2 leading-snug line-clamp-2">
          {description}
        </p>

        {/* Action */}
        {!isComingSoon && (
          <div className="flex items-center text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
            <span>Get started</span>
            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickActionCard;
