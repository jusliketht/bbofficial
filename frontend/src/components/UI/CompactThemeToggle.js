// =====================================================
// COMPACT THEME TOGGLE - MOBILE-FIRST
// Dark/light mode toggle button
// =====================================================

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './CompactThemeProvider';

const CompactThemeToggle = ({ 
  variant = 'button',
  size = 'md',
  className = ''
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'select') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={theme}
          onChange={(e) => {
            if (e.target.value === 'light') {
              setLightTheme();
            } else if (e.target.value === 'dark') {
              setDarkTheme();
            } else {
              toggleTheme();
            }
          }}
          className="appearance-none bg-white border border-neutral-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Monitor className="w-4 h-4 text-neutral-400" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]} rounded-lg border border-neutral-300
        bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 
        focus:ring-primary-500 focus:border-transparent
        transition-all duration-200 active:scale-95
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className={`${iconSizes[size]} text-warning-500 mx-auto`} />
      ) : (
        <Moon className={`${iconSizes[size]} text-neutral-600 mx-auto`} />
      )}
    </button>
  );
};

export default CompactThemeToggle;
