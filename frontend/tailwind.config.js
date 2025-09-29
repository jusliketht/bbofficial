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
        // BurnBlack Primary Palette
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
        
        // Gold Accent - Wealth & Transformation
        gold: {
          50: '#fffdf7',   // Light Gold
          100: '#fff9e6',  // Light Gold
          200: '#fff2cc',  // Light Gold
          300: '#ffe699',  // Light Gold
          400: '#ffd966',  // Medium Gold
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
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
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
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
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
        'gradient-burnblack-gold': 'linear-gradient(135deg, #0b0b0b 0%, #d4af37 100%)',
        'gradient-gold-emerald': 'linear-gradient(135deg, #d4af37 0%, #2ecc71 100%)',
        'gradient-burnblack-emerald': 'linear-gradient(135deg, #0b0b0b 0%, #2ecc71 100%)',
        'gradient-burnblack-royal': 'linear-gradient(135deg, #0b0b0b 0%, #2980b9 100%)',
        'gradient-sunset-crimson': 'linear-gradient(135deg, #e67e22 0%, #c0392b 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
