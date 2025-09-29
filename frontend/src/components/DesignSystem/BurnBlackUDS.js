// BurnBlack Unified Design System (UDS)
// Behavioral Psychology-Driven Component Library
// Implements LYRA method principles for trust-first, minimalistic design

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  DollarSign,
  Users,
  Star,
  Award,
  Lock,
  Eye
} from 'lucide-react';

// =====================================================
// DESIGN TOKENS - Single Source of Truth
// Ultra-refined design system following LYRA method
// =====================================================

export const DESIGN_TOKENS = {
  colors: {
    // Trust-first color palette with enhanced psychology
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main blue - trust & reliability
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#fefce8',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Gold for premium & value
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Green for success & compliance
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
      500: '#f59e0b', // Amber for deadlines & urgency
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
      500: '#ef4444', // Red for errors & critical actions
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
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
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '5rem',   // 80px
    '5xl': '6rem'    // 96px
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    strong: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    'glow-success': '0 0 20px rgba(34, 197, 94, 0.3)',
    'glow-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
    'glow-error': '0 0 20px rgba(239, 68, 68, 0.3)'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    '4xl': '2rem',   // 32px
    '5xl': '2.5rem', // 40px
    full: '9999px'
  }
};

// =====================================================
// TRUST-FIRST COMPONENTS
// =====================================================

// Ultra-refined Security Badge with enhanced trust indicators
export const SecurityBadge = ({ 
  type = 'verified', 
  size = 'md', 
  showIcon = true,
  className = '',
  animated = true 
}) => {
  const config = {
    verified: {
      icon: Shield,
      text: 'Verified Secure',
      bgColor: 'bg-success-50',
      textColor: 'text-success-700',
      borderColor: 'border-success-200',
      iconColor: 'text-success-600'
    },
    encrypted: {
      icon: Lock,
      text: 'End-to-End Encrypted',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      borderColor: 'border-primary-200',
      iconColor: 'text-primary-600'
    },
    compliant: {
      icon: CheckCircle,
      text: 'GDPR Compliant',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary-700',
      borderColor: 'border-secondary-200',
      iconColor: 'text-secondary-600'
    },
    audit: {
      icon: Eye,
      text: 'Audit Ready',
      bgColor: 'bg-neutral-50',
      textColor: 'text-neutral-700',
      borderColor: 'border-neutral-200',
      iconColor: 'text-neutral-600'
    }
  };

  const { icon: Icon, text, bgColor, textColor, borderColor, iconColor } = config[type];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-2 rounded-lg border-2 font-medium
        ${bgColor} ${textColor} ${borderColor} ${sizeClasses[size]}
        ${animated ? 'transition-all duration-300 hover:scale-105 hover:shadow-md' : ''}
        ${className}
      `}
    >
      {showIcon && (
        <Icon 
          className={`h-4 w-4 ${iconColor} ${animated ? 'animate-pulse-soft' : ''}`} 
        />
      )}
      <span className="font-semibold">{text}</span>
    </motion.div>
  );
};

// Enhanced Trust Indicator with behavioral psychology
export const TrustIndicator = ({ 
  type, 
  message, 
  size = 'md',
  showIcon = true,
  animated = true,
  className = '',
  ...props 
}) => {
  const indicators = {
    'eri-certified': {
      icon: Shield,
      text: 'Government ERI Certified',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    'encrypted': {
      icon: Lock,
      text: '256-bit SSL Encrypted',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    },
    'compliant': {
      icon: CheckCircle,
      text: 'IT Rules Compliant',
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    'audit-ready': {
      icon: Eye,
      text: 'Audit Ready',
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-50',
      borderColor: 'border-neutral-200'
    }
  };

  const indicator = indicators[type];
  const IconComponent = indicator.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        inline-flex items-center gap-2 rounded-lg border-2 font-medium
        ${indicator.bgColor} ${indicator.color} ${indicator.borderColor} 
        ${sizeClasses[size]}
        ${animated ? 'transition-all duration-300 hover:scale-105 hover:shadow-soft' : ''}
        ${className}
      `}
      {...props}
    >
      {showIcon && (
        <IconComponent 
          className={`h-4 w-4 ${animated ? 'animate-pulse-soft' : ''}`} 
        />
      )}
      <span className="font-semibold">{message || indicator.text}</span>
    </motion.div>
  );
};

// =====================================================
// PROGRESS PSYCHOLOGY COMPONENTS
// =====================================================

// Ultra-refined Progress Stepper with behavioral psychology
export const ProgressStepper = ({ 
  steps, 
  currentStep, 
  onStepClick, 
  showPercentage = true,
  animated = true,
  className = '',
  ...props 
}) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Progress Header */}
      {showPercentage && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-neutral-800">Progress</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-sm text-neutral-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      )}

      {/* Overall Progress Bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2 mb-8">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm"
        />
      </div>

      {/* Step Indicators */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onStepClick && onStepClick(index)}
              >
                {/* Step Circle */}
                <motion.div 
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300 border-2
                    ${isCompleted ? 'bg-success-500 text-white border-success-500 shadow-glow-success' : 
                      isCurrent ? 'bg-primary-500 text-white border-primary-500 shadow-glow ring-4 ring-primary-200' : 
                      'bg-neutral-100 text-neutral-400 border-neutral-200 hover:border-neutral-300'}
                    ${animated ? 'group-hover:scale-110' : ''}
                  `}
                  whileHover={animated ? { scale: 1.1 } : {}}
                  whileTap={animated ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Step Label */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`
                    mt-3 text-sm font-medium text-center max-w-24 leading-tight
                    ${isCompleted ? 'text-success-700' : 
                      isCurrent ? 'text-primary-700 font-semibold' : 
                      'text-neutral-500'}
                  `}
                >
                  {step.label}
                </motion.div>

                {/* Step Description */}
                {step.description && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className={`
                      mt-1 text-xs text-center max-w-28 leading-tight
                      ${isCompleted ? 'text-success-600' : 
                        isCurrent ? 'text-primary-600' : 
                        'text-neutral-400'}
                    `}
                  >
                    {step.description}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Connecting Lines */}
        <div className="absolute top-6 left-0 right-0 h-0.5 -z-10">
          {steps.slice(0, -1).map((_, index) => {
            const isCompleted = index < currentStep;
            return (
              <motion.div
                key={index}
                initial={{ width: 0 }}
                animate={{ width: isCompleted ? '100%' : '0%' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  h-0.5 absolute top-0
                  ${isCompleted ? 'bg-success-500' : 'bg-neutral-200'}
                `}
                style={{ 
                  left: `${(index / (steps.length - 1)) * 100}%`,
                  width: `${100 / (steps.length - 1)}%`
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Ultra-refined Micro-Celebration with behavioral psychology
export const MicroCelebration = ({ 
  trigger, 
  message, 
  type = 'success',
  duration = 3000,
  position = 'top-right',
  animated = true,
  className = '',
  ...props 
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!show) return null;

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success-500',
      textColor: 'text-white',
      iconColor: 'text-white',
      shadowColor: 'shadow-glow-success'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning-500',
      textColor: 'text-white',
      iconColor: 'text-white',
      shadowColor: 'shadow-glow-warning'
    },
    info: {
      icon: Info,
      bgColor: 'bg-primary-500',
      textColor: 'text-white',
      iconColor: 'text-white',
      shadowColor: 'shadow-glow'
    }
  };

  const { icon: Icon, bgColor, textColor, iconColor, shadowColor } = config[type];

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      className={`fixed z-50 ${positionClasses[position]} ${className}`}
      {...props}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`
          ${bgColor} ${textColor} px-6 py-4 rounded-xl shadow-lg flex items-center gap-3
          ${shadowColor} border-2 border-white/20 backdrop-blur-sm
          ${animated ? 'hover:scale-105 transition-all duration-300' : ''}
        `}
      >
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{message}</span>
          <span className="text-xs opacity-90">Great job!</span>
        </div>
        
        {/* Animated particles */}
        {animated && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 20,
                  y: Math.sin(i * 60 * Math.PI / 180) * 20
                }}
                transition={{ 
                  delay: 0.3 + i * 0.1, 
                  duration: 1.5,
                  ease: "easeOut"
                }}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// =====================================================
// BEHAVIORAL TRIGGERS COMPONENTS
// =====================================================

// Deadline Countdown Component
export const DeadlineCountdown = ({ deadline, onUrgent, ...props }) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0 });
  const [isUrgent, setIsUrgent] = React.useState(false);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const deadlineTime = new Date(deadline).getTime();
      const difference = deadlineTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, minutes });
        setIsUrgent(days <= 7);
        
        if (days <= 7 && onUrgent) {
          onUrgent();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [deadline, onUrgent]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        p-4 rounded-lg border-2 transition-all duration-300
        ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}
      `}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className={`w-5 h-5 mr-2 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`} />
          <div>
            <p className={`font-semibold ${isUrgent ? 'text-red-800' : 'text-yellow-800'}`}>
              {isUrgent ? '⚠️ Urgent: File Now!' : '⏰ Deadline Approaching'}
            </p>
            <p className={`text-sm ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
              {timeLeft.days} days, {timeLeft.hours} hours left to avoid penalty
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
            {timeLeft.days}
          </p>
          <p className={`text-xs ${isUrgent ? 'text-red-500' : 'text-yellow-500'}`}>
            days left
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Refund Estimator Component
export const RefundEstimator = ({ estimatedRefund, onFileNow, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-50 border border-green-200 rounded-lg p-4"
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Estimated Refund</p>
            <p className="text-sm text-green-600">File today to claim faster</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">₹{estimatedRefund?.toLocaleString()}</p>
          <button
            onClick={onFileNow}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            File Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Social Proof Component
export const SocialProof = ({ stats, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      {...props}
    >
      <div className="flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-800">{stats.users} users filed with us last year</p>
          <p className="text-sm text-blue-600">Join thousands of satisfied customers</p>
        </div>
      </div>
    </motion.div>
  );
};

// =====================================================
// CONTEXTUAL HELP SYSTEM
// =====================================================

// Smart Tooltip Component
export const SmartTooltip = ({ 
  children, 
  content, 
  placement = 'top',
  showAIAssistant = true,
  ...props 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`
            absolute z-50 bg-gray-800 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs
            ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${placement === 'left' ? 'right-full mr-2' : 'left-0'}
          `}
          {...props}
        >
          <div className="relative">
            <p className="mb-2">{content}</p>
            {showAIAssistant && (
              <div className="border-t border-gray-600 pt-2">
                <p className="text-xs text-gray-300">
                  Need more help? Ask AI Assistant
                </p>
              </div>
            )}
            {/* Arrow */}
            <div className={`
              absolute w-2 h-2 bg-gray-800 transform rotate-45
              ${placement === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'}
              ${placement === 'left' ? 'left-4' : 'left-4'}
            `} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// =====================================================
// EMOTIONAL JOURNEY COMPONENTS
// =====================================================

// Emotional State Indicator
export const EmotionalStateIndicator = ({ state, message, ...props }) => {
  const states = {
    'anxiety': {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    'confidence': {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    'relief': {
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  };

  const stateConfig = states[state];
  const IconComponent = stateConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center p-4 rounded-lg border ${stateConfig.bgColor} ${stateConfig.borderColor}
      `}
      {...props}
    >
      <IconComponent className={`w-5 h-5 mr-3 ${stateConfig.color}`} />
      <p className={`font-medium ${stateConfig.color}`}>{message}</p>
    </motion.div>
  );
};

// Success Celebration Component
export const SuccessCelebration = ({ onShare, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-xl text-center"
      {...props}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 mx-auto mb-4"
      >
        <Star className="w-16 h-16" />
      </motion.div>
      
      <h3 className="text-2xl font-bold mb-2">🎉 Filing Complete!</h3>
      <p className="text-lg mb-4">You're compliant with IT rules, securely filed.</p>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onShare}
          className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Share Success
        </button>
        <button className="bg-white bg-opacity-20 text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-colors">
          Download Certificate
        </button>
      </div>
    </motion.div>
  );
};

// =====================================================
// EXPORT ALL COMPONENTS
// =====================================================

export default {
  DESIGN_TOKENS,
  SecurityBadge,
  TrustIndicator,
  ProgressStepper,
  MicroCelebration,
  DeadlineCountdown,
  RefundEstimator,
  SocialProof,
  SmartTooltip,
  EmotionalStateIndicator,
  SuccessCelebration
};
