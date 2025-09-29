import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Calculator,
  User,
  Menu,
  X,
  BarChart3,
  Upload,
  CheckCircle
} from 'lucide-react';

const MobileNavigation = ({ filingId, currentStep, totalSteps }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      icon: FileText,
      label: 'ITR Selection',
      path: '/itr-selection',
      active: location.pathname === '/itr-selection'
    },
    {
      icon: Calculator,
      label: 'Tax Calculator',
      path: '/tax-calculator',
      active: location.pathname === '/tax-calculator'
    },
    {
      icon: Upload,
      label: 'Documents',
      path: '/documents',
      active: location.pathname === '/documents'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  const isFilingActive = location.pathname.includes('/filing/');

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`mobile-bottom-nav-item touch-target ${
                item.active ? 'active' : ''
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}

          {/* Filing Progress Indicator */}
          {isFilingActive && filingId && (
            <button
              onClick={() => setIsOpen(true)}
              className="mobile-bottom-nav-item touch-target"
            >
              <div className="relative">
                <BarChart3 className="w-5 h-5 mb-1" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {currentStep || 1}
                  </span>
                </div>
              </div>
              <span className="text-xs">Progress</span>
            </button>
          )}

          {/* Menu Button for additional items */}
          <button
            onClick={() => setIsOpen(true)}
            className="mobile-bottom-nav-item touch-target"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="mobile-modal">
          <div className="mobile-modal-content">
            <div className="mobile-modal-header">
              <h3 className="mobile-modal-title">Menu</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="mobile-modal-close touch-target"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors touch-target ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.active && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
                </button>
              ))}

              {/* Filing Progress Section */}
              {isFilingActive && filingId && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Current Filing Progress</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Step {currentStep || 1} of {totalSteps || 5}
                      </span>
                      <span className="text-sm text-blue-700">
                        {Math.round(((currentStep || 1) / (totalSteps || 5)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep || 1) / (totalSteps || 5)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavigation;
