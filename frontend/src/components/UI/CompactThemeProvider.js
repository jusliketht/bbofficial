// =====================================================
// COMPACT THEME PROVIDER - MOBILE-FIRST THEMING
// Dark mode and theme management for compact design
// =====================================================

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a CompactThemeProvider');
  }
  return context;
};

export const CompactThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('burnblack-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      setIsDark(savedTheme === 'dark');
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
      setIsDark(prefersDark);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme, isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('burnblack-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsDark(newTheme === 'dark');
    localStorage.setItem('burnblack-theme', newTheme);
  };

  const setLightTheme = () => {
    setTheme('light');
    setIsDark(false);
    localStorage.setItem('burnblack-theme', 'light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    setIsDark(true);
    localStorage.setItem('burnblack-theme', 'dark');
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    setLightTheme,
    setDarkTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default CompactThemeProvider;