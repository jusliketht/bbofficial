// =====================================================
// FILING LAUNCHPAD - EMPTY STATE DASHBOARD CARD
// Large, visually engaging card for first-time filers
// =====================================================

import React from 'react';
import { FileText, Zap, Shield, ArrowRight, Sparkles } from 'lucide-react';

const FilingLaunchpad = ({ onStartFiling }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Content */}
      <div className="relative p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-2 w-20 h-20 bg-blue-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-purple-500 rounded-full blur-xl"></div>
        </div>

        {/* Content */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-3">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>

            {/* Headline */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Ready to file your taxes for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AY 2024-25
                </span>
                ?
              </h2>
              <p className="text-xs text-gray-600">
                AI-powered, secure, and fast. Maximize your refund.
              </p>
            </div>
          </div>

          {/* Features - Compact Row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center px-2 py-1 bg-white rounded-md shadow-sm border border-gray-100">
              <Zap className="w-3 h-3 text-yellow-500 mr-1.5" />
              <span className="text-xs font-medium text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center px-2 py-1 bg-white rounded-md shadow-sm border border-gray-100">
              <Shield className="w-3 h-3 text-green-500 mr-1.5" />
              <span className="text-xs font-medium text-gray-700">Secure</span>
            </div>
            <div className="flex items-center px-2 py-1 bg-white rounded-md shadow-sm border border-gray-100">
              <Sparkles className="w-3 h-3 text-purple-500 mr-1.5" />
              <span className="text-xs font-medium text-gray-700">Maximize Refunds</span>
            </div>
          </div>

          {/* Primary CTA - Compact */}
          <button
            onClick={onStartFiling}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FileText className="w-4 h-4 mr-2" />
            Start My ITR Filing
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Bottom Accent - Thinner */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </div>
  );
};

export default FilingLaunchpad;
