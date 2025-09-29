// =====================================================
// ENTERPRISE DESIGN SYSTEM - PIXEL PERFECT CONSISTENCY
// Single Source of Truth for All UI Components
// =====================================================

export const ENTERPRISE_DESIGN_SYSTEM = {
  // =====================================================
  // COLORS - ENTERPRISE STANDARD
  // =====================================================
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // MAIN BRAND BLUE
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Secondary Accent Colors
    secondary: {
      50: '#fefce8',
      100: '#fef3c7',
      200: '#fde68a', 
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // GOLD ACCENT
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    // Status Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // SUCCESS GREEN
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // WARNING AMBER
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // ERROR RED
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // Neutral Colors
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },

  // =====================================================
  // SPACING - ENTERPRISE STANDARD (RESPONSIVE)
  // =====================================================
  spacing: {
    // Component Padding (Responsive)
    padding: {
      xs: 'p-1.5 lg:p-2',      // 6px/8px
      sm: 'p-2.5 lg:p-3',      // 10px/12px
      md: 'p-3 lg:p-4',        // 12px/16px - DEFAULT
      lg: 'p-4 lg:p-6',        // 16px/24px
      xl: 'p-6 lg:p-8',        // 24px/32px
      '2xl': 'p-8 lg:p-12'     // 32px/48px
    },
    
    // Component Margins (Responsive)
    margin: {
      xs: 'm-1.5 lg:m-2',      // 6px/8px
      sm: 'm-2.5 lg:m-3',      // 10px/12px
      md: 'm-3 lg:m-4',        // 12px/16px - DEFAULT
      lg: 'm-4 lg:m-6',        // 16px/24px
      xl: 'm-6 lg:m-8',        // 24px/32px
      '2xl': 'm-8 lg:m-12'     // 32px/48px
    },
    
    // Gap Between Elements (Responsive)
    gap: {
      xs: 'gap-1.5 lg:gap-2',    // 6px/8px
      sm: 'gap-2.5 lg:gap-3',    // 10px/12px
      md: 'gap-3 lg:gap-4',      // 12px/16px - DEFAULT
      lg: 'gap-4 lg:gap-6',      // 16px/24px
      xl: 'gap-6 lg:gap-8',      // 24px/32px
      '2xl': 'gap-8 lg:gap-12'   // 32px/48px
    },
    
    // Space Between Elements (Responsive)
    space: {
      xs: 'space-x-1.5 space-y-1.5 lg:space-x-2 lg:space-y-2',    // 6px/8px
      sm: 'space-x-2.5 space-y-2.5 lg:space-x-3 lg:space-y-3',    // 10px/12px
      md: 'space-x-3 space-y-3 lg:space-x-4 lg:space-y-4',        // 12px/16px - DEFAULT
      lg: 'space-x-4 space-y-4 lg:space-x-6 lg:space-y-6',        // 16px/24px
      xl: 'space-x-6 space-y-6 lg:space-x-8 lg:space-y-8',        // 24px/32px
      '2xl': 'space-x-8 space-y-8 lg:space-x-12 lg:space-y-12'   // 32px/48px
    }
  },

  // =====================================================
  // SHAPES - ENTERPRISE STANDARD
  // =====================================================
  shapes: {
    // Border Radius
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',     // 2px
      md: 'rounded-md',     // 6px - DEFAULT
      lg: 'rounded-lg',     // 8px
      xl: 'rounded-xl',     // 12px
      '2xl': 'rounded-2xl', // 16px
      '3xl': 'rounded-3xl', // 24px
      full: 'rounded-full'
    },
    
    // Shadows
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',      // Subtle
      md: 'shadow-md',      // DEFAULT
      lg: 'shadow-lg',      // Prominent
      xl: 'shadow-xl',      // Strong
      '2xl': 'shadow-2xl',  // Very Strong
      glow: 'shadow-glow',  // Custom glow
      'glow-primary': 'shadow-glow-primary',
      'glow-success': 'shadow-glow-success',
      'glow-warning': 'shadow-glow-warning',
      'glow-error': 'shadow-glow-error'
    }
  },

  // =====================================================
  // TYPOGRAPHY - ENTERPRISE STANDARD
  // =====================================================
  typography: {
    // Font Sizes (Responsive)
    fontSize: {
      xs: 'text-xs',                    // 12px
      sm: 'text-sm',                    // 14px
      base: 'text-sm lg:text-base',     // 14px/16px - DEFAULT
      lg: 'text-base lg:text-lg',       // 16px/18px
      xl: 'text-lg lg:text-xl',         // 18px/20px
      '2xl': 'text-xl lg:text-2xl',     // 20px/24px
      '3xl': 'text-2xl lg:text-3xl',    // 24px/30px
      '4xl': 'text-3xl lg:text-4xl',    // 30px/36px
      '5xl': 'text-4xl lg:text-5xl',    // 36px/48px
      '6xl': 'text-5xl lg:text-6xl'     // 48px/60px
    },
    
    // Font Weights
    fontWeight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',  // DEFAULT
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold'
    },
    
    // Line Heights
    lineHeight: {
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',  // DEFAULT
      relaxed: 'leading-relaxed',
      loose: 'leading-loose'
    }
  },

  // =====================================================
  // COMPONENT SIZES - ENTERPRISE STANDARD
  // =====================================================
  sizes: {
    // Button Sizes (Responsive)
    button: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-xs lg:px-3 lg:py-2 lg:text-sm',
      md: 'px-3 py-2 text-sm lg:px-4 lg:py-2 lg:text-base',  // DEFAULT
      lg: 'px-4 py-2.5 text-base lg:px-6 lg:py-3 lg:text-lg',
      xl: 'px-6 py-3 text-lg lg:px-8 lg:py-4 lg:text-xl'
    },
    
    // Card Sizes (Responsive)
    card: {
      sm: 'p-3 lg:p-4',
      md: 'p-3 lg:p-4',  // DEFAULT
      lg: 'p-4 lg:p-6',
      xl: 'p-6 lg:p-8'
    },
    
    // Icon Sizes (Responsive)
    icon: {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5 lg:w-4 lg:h-4',
      md: 'w-4 h-4 lg:w-5 lg:h-5',  // DEFAULT
      lg: 'w-5 h-5 lg:w-6 lg:h-6',
      xl: 'w-6 h-6 lg:w-8 lg:h-8',
      '2xl': 'w-8 h-8 lg:w-12 lg:h-12'
    }
  },

  // =====================================================
  // ANIMATIONS - ENTERPRISE STANDARD
  // =====================================================
  animations: {
    // Transition Durations
    duration: {
      fast: 'duration-150',
      normal: 'duration-200',  // DEFAULT
      slow: 'duration-300',
      slower: 'duration-500'
    },
    
    // Easing Functions
    easing: {
      linear: 'ease-linear',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out'  // DEFAULT
    }
  }
};

// =====================================================
// ENTERPRISE COMPONENT CLASSES - READY TO USE
// =====================================================

export const ENTERPRISE_CLASSES = {
  // Card Components
  card: {
    base: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.lg} ${ENTERPRISE_DESIGN_SYSTEM.shapes.shadow.md} ${ENTERPRISE_DESIGN_SYSTEM.spacing.padding.md} bg-white border border-neutral-200`,
    hover: 'hover:shadow-lg transition-all duration-200',
    interactive: 'cursor-pointer hover:border-primary-300'
  },
  
  // Button Components
  button: {
    primary: `${ENTERPRISE_DESIGN_SYSTEM.sizes.button.md} ${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors duration-200`,
    secondary: `${ENTERPRISE_DESIGN_SYSTEM.sizes.button.md} ${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors duration-200`,
    success: `${ENTERPRISE_DESIGN_SYSTEM.sizes.button.md} ${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} bg-success-500 hover:bg-success-600 text-white font-medium transition-colors duration-200`,
    warning: `${ENTERPRISE_DESIGN_SYSTEM.sizes.button.md} ${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} bg-warning-500 hover:bg-warning-600 text-white font-medium transition-colors duration-200`,
    error: `${ENTERPRISE_DESIGN_SYSTEM.sizes.button.md} ${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} bg-error-500 hover:bg-error-600 text-white font-medium transition-colors duration-200`
  },
  
  // Input Components
  input: {
    base: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 px-3 py-2 text-base transition-colors duration-200`,
    error: 'border-error-500 focus:border-error-500 focus:ring-error-200'
  },
  
  // Badge Components
  badge: {
    primary: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700`,
    success: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} px-2 py-1 text-xs font-medium bg-success-100 text-success-700`,
    warning: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} px-2 py-1 text-xs font-medium bg-warning-100 text-warning-700`,
    error: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} px-2 py-1 text-xs font-medium bg-error-100 text-error-700`,
    neutral: `${ENTERPRISE_DESIGN_SYSTEM.shapes.radius.md} px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700`
  },
  
  // Progress Components
  progress: {
    base: 'w-full bg-neutral-200 rounded-full overflow-hidden',
    bar: 'h-2 bg-primary-500 transition-all duration-300 ease-out',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500'
  }
};

// =====================================================
// ENTERPRISE COLOR UTILITIES
// =====================================================

export const getEnterpriseColor = (color, shade = 500) => {
  const colorMap = {
    primary: ENTERPRISE_DESIGN_SYSTEM.colors.primary,
    secondary: ENTERPRISE_DESIGN_SYSTEM.colors.secondary,
    success: ENTERPRISE_DESIGN_SYSTEM.colors.success,
    warning: ENTERPRISE_DESIGN_SYSTEM.colors.warning,
    error: ENTERPRISE_DESIGN_SYSTEM.colors.error,
    neutral: ENTERPRISE_DESIGN_SYSTEM.colors.neutral
  };
  
  return colorMap[color]?.[shade] || ENTERPRISE_DESIGN_SYSTEM.colors.primary[500];
};

export const getEnterpriseClasses = (component, variant = 'base') => {
  return ENTERPRISE_CLASSES[component]?.[variant] || '';
};

export default ENTERPRISE_DESIGN_SYSTEM;
