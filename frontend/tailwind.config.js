/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // =====================================================
      // ENTERPRISE COLOR SYSTEM - PIXEL PERFECT CONSISTENCY
      // =====================================================
      colors: {
        // BurnBlack Primary Palette (keeping for backward compatibility)
        burnblack: {
          50: '#f5f5f5',   // White/Neutral
          100: '#e8e8e8',  // Light Grey
          200: '#b3b3b3',  // Grey Spectrum
          300: '#4d4d4d',  // Grey Spectrum
          400: '#2c2c2c',  // Grey Spectrum
          500: '#0b0b0b',  // BurnBlack Base - Foundation of trust
          600: '#080808',  // Darker BurnBlack
          700: '#050505',  // Darker BurnBlack
          800: '#030303',  // Darker BurnBlack
          900: '#000000',  // Pure Black
        },
        
        // BLAZE ORANGE (Primary Action Color) - UI.md Design System
        orange: {
          50: '#FFF8F2',   // Subtle highlight background
          100: '#FFF0E5',  // Light background tint
          400: '#FF8533',  // Disabled state (with opacity)
          500: '#FF6B00',  // Primary buttons, key CTAs
          600: '#E55F00',  // Hover state
          700: '#CC5500',  // Active/pressed state
        },
        
        // GOLDEN YELLOW (Success, Positive Values) - UI.md Design System
        gold: {
          50: '#FFFCF2',   // Subtle success tint
          100: '#FFF9E5',  // Success background
          400: '#FFC933',  // Lighter variant
          500: '#FFB800',  // Success highlights, savings shown
          600: '#E5A600',  // Hover
        },
        
        // Legacy Gold (keeping for backward compatibility)
        goldLegacy: {
          200: '#fff2cc',  // Light Gold
          300: '#ffe699',  // Light Gold
          500: '#d4af37',  // MAIN GOLD - Wealth, transformation, premium
          600: '#b8941f',  // Dark Gold
          700: '#9c7a17',  // Dark Gold
          800: '#80600f',  // Dark Gold
          900: '#644607',  // Dark Gold
        },
        
        // Emerald Green - Growth & Refund Success
        emerald: {
          50: '#e8f8f5',   // Light Emerald
          100: '#d1f2eb',  // Light Emerald
          200: '#a3e4d7',  // Light Emerald
          300: '#76d7c4',  // Light Emerald
          400: '#48c9b0',  // Medium Emerald
          500: '#2ecc71',  // MAIN EMERALD - Growth, refund success, trust
          600: '#28b463',  // Dark Emerald
          700: '#229954',  // Dark Emerald
          800: '#1d7e45',  // Dark Emerald
          900: '#176336',  // Dark Emerald
        },
        
        // Sunset Orange - Warnings & Urgency
        sunset: {
          50: '#fef5e7',   // Light Orange
          100: '#fdebd0',  // Light Orange
          200: '#fad7a0',  // Light Orange
          300: '#f8c471',  // Light Orange
          400: '#f5b041',  // Medium Orange
          500: '#e67e22',  // MAIN SUNSET - Warnings, deadline urgency
          600: '#d68910',  // Dark Orange
          700: '#c77c0e',  // Dark Orange
          800: '#b86f0c',  // Dark Orange
          900: '#a9620a',  // Dark Orange
        },
        
        // Crimson Red - Errors & Penalties
        crimson: {
          50: '#fdf2f2',   // Light Red
          100: '#fce7e7',  // Light Red
          200: '#f9d1d1',  // Light Red
          300: '#f5bbbb',  // Light Red
          400: '#f1a5a5',  // Medium Red
          500: '#c0392b',  // MAIN CRIMSON - Errors, penalties, high attention
          600: '#a93226',  // Dark Red
          700: '#922b21',  // Dark Red
          800: '#7b241c',  // Dark Red
          900: '#641d17',  // Dark Red
        },
        
        // Royal Blue - Tech & Compliance
        royal: {
          50: '#ebf3fd',   // Light Blue
          100: '#d6e7fa',  // Light Blue
          200: '#adcff5',  // Light Blue
          300: '#84b7f0',  // Light Blue
          400: '#5b9feb',  // Medium Blue
          500: '#2980b9',  // MAIN ROYAL - Tech-forward, compliance, data security
          600: '#2471a3',  // Dark Blue
          700: '#1f618d',  // Dark Blue
          800: '#1a5177',  // Dark Blue
          900: '#154360',  // Dark Blue
        },
        
        // BLACK SCALE - UI.md Design System
        black: {
          500: '#737373',  // Placeholder text
          600: '#525252',  // Secondary text (dark mode)
          700: '#404040',  // Borders (dark mode)
          800: '#262626',  // Secondary backgrounds (dark mode)
          900: '#171717',  // Card backgrounds (dark mode)
          950: '#0A0A0A',  // True black, headers, primary text
        },
        
        // SEMANTIC COLORS - UI.md Design System
        success: {
          50: '#F0FDF4',   // Subtle tint
          100: '#DCFCE7',  // Background
          500: '#22C55E',  // Icons, checkmarks
          600: '#16A34A',  // Hover
        },
        error: {
          50: '#FEF2F2',   // Subtle tint
          100: '#FEE2E2',  // Background
          500: '#EF4444',  // Icons, error text
          600: '#DC2626',  // Hover
        },
        warning: {
          50: '#FFFBEB',   // Subtle tint
          100: '#FEF3C7',  // Background
          500: '#F59E0B',  // Icons, warning text
          600: '#D97706',  // Hover
        },
        info: {
          50: '#EFF6FF',   // Subtle tint
          100: '#DBEAFE',  // Background
          500: '#3B82F6',  // Icons, info badges
          600: '#2563EB',  // Hover
        },
        
        // REGIME COMPARISON COLORS - UI.md Design System
        regime: {
          old: '#6366F1',   // Indigo (distinct from orange)
          new: '#8B5CF6',   // Violet (pairs with indigo)
        },
        
        // DATA PROVENANCE COLORS - UI.md Design System
        source: {
          form16: '#3B82F6',   // Blue chip
          ais: '#06B6D4',      // Cyan chip
          '26as': '#14B8A6',   // Teal chip
          broker: '#8B5CF6',   // Violet chip
          manual: '#737373',   // Gray chip
        },
        
        // Legacy aliases for compatibility
        primary: {
          50: '#f5f5f5', 100: '#e8e8e8', 200: '#b3b3b3', 300: '#4d4d4d', 400: '#2c2c2c',
          500: '#0b0b0b', 600: '#080808', 700: '#050505', 800: '#030303', 900: '#000000',
        },
        secondary: {
          50: '#fffdf7', 100: '#fff9e6', 200: '#fff2cc', 300: '#ffe699', 400: '#ffd966',
          500: '#d4af37', 600: '#b8941f', 700: '#9c7a17', 800: '#80600f', 900: '#644607',
        },
        success: {
          50: '#e8f8f5', 100: '#d1f2eb', 200: '#a3e4d7', 300: '#76d7c4', 400: '#48c9b0',
          500: '#2ecc71', 600: '#28b463', 700: '#229954', 800: '#1d7e45', 900: '#176336',
        },
        warning: {
          50: '#fef5e7', 100: '#fdebd0', 200: '#fad7a0', 300: '#f8c471', 400: '#f5b041',
          500: '#e67e22', 600: '#d68910', 700: '#c77c0e', 800: '#b86f0c', 900: '#a9620a',
        },
        error: {
          50: '#fdf2f2', 100: '#fce7e7', 200: '#f9d1d1', 300: '#f5bbbb', 400: '#f1a5a5',
          500: '#c0392b', 600: '#a93226', 700: '#922b21', 800: '#7b241c', 900: '#641d17',
        },
        neutral: {
          50: '#ffffff', 100: '#f5f5f5', 200: '#b3b3b3', 300: '#4d4d4d', 400: '#2c2c2c',
          500: '#1a1a1a', 600: '#141414', 700: '#0f0f0f', 800: '#0a0a0a', 900: '#050505',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        // UI.md Typography System
        'display-lg': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'display-md': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'display-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'heading-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'heading-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', fontWeight: '500' }],
        'number-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'number-md': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'number-sm': ['14px', { lineHeight: '22px', fontWeight: '500' }],
        // Legacy sizes (keeping for backward compatibility)
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        // UI.md 8px Grid System
        '13': '3.25rem', // 52px
        '15': '3.75rem', // 60px
        '18': '4.5rem',  // 72px
        // Additional spacing tokens
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        // UI.md Border Radius Tokens
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
        // Legacy tokens (keeping for backward compatibility)
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // UI.md Elevation System
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'elevated': '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        'floating': '0 10px 25px rgba(0,0,0,0.1), 0 6px 10px rgba(0,0,0,0.08)',
        'overlay': '0 20px 40px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1)',
        // Legacy shadows (keeping for backward compatibility)
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)',
        // BurnBlack specific shadows
        'burnblack-glow': '0 0 30px rgba(11, 11, 11, 0.4)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.4)',
        'emerald-glow': '0 0 25px rgba(46, 204, 113, 0.4)',
        'sunset-glow': '0 0 25px rgba(230, 126, 34, 0.4)',
        'crimson-glow': '0 0 25px rgba(192, 57, 43, 0.4)',
        'royal-glow': '0 0 25px rgba(41, 128, 185, 0.4)',
      },
      backgroundImage: {
        // UI.md Brand Gradient
        'burn-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FFB800 100%)',
        // Legacy gradients (keeping for backward compatibility)
        'gradient-burnblack-gold': 'linear-gradient(135deg, #0b0b0b 0%, #d4af37 100%)',
        'gradient-gold-emerald': 'linear-gradient(135deg, #d4af37 0%, #2ecc71 100%)',
        'gradient-burnblack-emerald': 'linear-gradient(135deg, #0b0b0b 0%, #2ecc71 100%)',
        'gradient-burnblack-royal': 'linear-gradient(135deg, #0b0b0b 0%, #2980b9 100%)',
        'gradient-sunset-crimson': 'linear-gradient(135deg, #e67e22 0%, #c0392b 100%)',
      },
      animation: {
        // UI.md Motion System - Core Animations
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        // UI.md Motion System - Component Animations
        'breathing-expand': 'breathingExpand 400ms cubic-bezier(0, 0, 0.2, 1)',
        'breathing-collapse': 'breathingCollapse 400ms cubic-bezier(0.4, 0, 1, 1)',
        'content-fade-in': 'contentFadeIn 200ms cubic-bezier(0, 0, 0.2, 1) 100ms',
        'regime-toggle': 'regimeToggle 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'success-check': 'successCheck 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'toast-enter': 'toastEnter 200ms cubic-bezier(0, 0, 0.2, 1)',
        'toast-exit': 'toastExit 200ms cubic-bezier(0.4, 0, 1, 1)',
        // Legacy animations (keeping for backward compatibility)
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        // UI.md Motion System - Core Keyframes
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // UI.md Motion System - Component Keyframes
        breathingExpand: {
          '0%': { width: 'var(--card-summary-width)', opacity: '1' },
          '100%': { width: 'var(--card-expanded-width)', opacity: '1' },
        },
        breathingCollapse: {
          '0%': { width: 'var(--card-summary-width)', opacity: '1' },
          '100%': { width: 'var(--card-glance-width)', opacity: '1' },
        },
        contentFadeIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        regimeToggle: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        successCheck: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        toastEnter: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        toastExit: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        // Legacy keyframes (keeping for backward compatibility)
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        'instant': '0ms',
        'fast': '100ms',
        'normal': '200ms',
        'relaxed': '300ms',
        'slow': '500ms',
        'slower': '700ms',
        'breathing': '400ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-both': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
}
