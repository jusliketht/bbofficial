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
  isComingSoon = false 
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group ${
        isComingSoon ? 'opacity-75' : ''
      }`}
      onClick={!isComingSoon ? onClick : undefined}
    >
      <div className="p-6">
        {/* Icon */}
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
            {title}
            {isComingSoon && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            )}
          </h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {description}
          </p>

          {/* Action */}
          {!isComingSoon && (
            <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;