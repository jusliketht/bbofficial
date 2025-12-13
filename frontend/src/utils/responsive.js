// =====================================================
// RESPONSIVE UTILITIES
// Helper functions and hooks for responsive design
// =====================================================

import { useState, useEffect } from 'react';

// Breakpoints matching docs/reference/UI.md
// Mobile: < 768px
// Tablet: 768px - 1023px
// Desktop: ≥ 1024px
export const BREAKPOINTS = {
  mobile: 768,   // < 768px: Mobile (Basic fields only)
  tablet: 1024,  // 768-1023px: Tablet (All fields, compact)
  desktop: 1024, // ≥ 1024px: Desktop (Full form with side-by-side sections)
};

/**
 * Hook to detect current breakpoint
 * @returns {Object} { isMobile, isTablet, isDesktop, breakpoint }
 */
export const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < BREAKPOINTS.mobile) return 'mobile';
    if (width < BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
};

/**
 * Helper function to check if current viewport is mobile
 * @returns {boolean}
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.mobile;
};

/**
 * Helper function to check if current viewport is tablet
 * @returns {boolean}
 */
export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet;
};

/**
 * Helper function to check if current viewport is desktop
 * @returns {boolean}
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= BREAKPOINTS.tablet;
};

/**
 * Get responsive value based on breakpoint
 * @param {Object} values - Object with mobile, tablet, desktop keys
 * @returns {any} Value for current breakpoint
 */
export const getResponsiveValue = (values) => {
  if (typeof window === 'undefined') return values.desktop || values.tablet || values.mobile;

  const width = window.innerWidth;
  if (width < BREAKPOINTS.mobile) {
    return values.mobile;
  } else if (width < BREAKPOINTS.tablet) {
    return values.tablet;
  } else {
    return values.desktop;
  }
};

/**
 * Hook to get responsive value
 * @param {Object} values - Object with mobile, tablet, desktop keys
 * @returns {any} Value for current breakpoint (updates on resize)
 */
export const useResponsiveValue = (values) => {
  const { breakpoint } = useResponsiveBreakpoint();
  return values[breakpoint] || values.desktop || values.tablet || values.mobile;
};

