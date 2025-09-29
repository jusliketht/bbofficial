import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ExternalLink, Sparkles } from 'lucide-react';
import { getTooltipContent, getAIPrompt, TOOLTIP_CATEGORIES, TOOLTIP_PRIORITIES } from '../data/tooltipMasterList';
import { EnterpriseButton } from '../components/DesignSystem/EnterpriseComponents';

/**
 * Smart Tooltip Component
 * 
 * Per design.md requirements:
 * - Plain-English explanations
 * - Concise (max 2 lines)
 * - Link/CTA to AI Assistant
 * - Enterprise color palette
 * - Behavioral psychology integration
 */

const SmartTooltip = ({ 
  term, 
  children, 
  position = 'top',
  size = 'md',
  variant = 'default',
  showAI = true,
  className = '',
  onAIClick = null
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const tooltipData = getTooltipContent(term);
  
  if (!tooltipData) {
    console.warn(`Tooltip data not found for term: ${term}`);
    return children;
  }

  const categoryConfig = TOOLTIP_CATEGORIES[tooltipData.category];
  const priorityConfig = TOOLTIP_PRIORITIES[tooltipData.priority];

  // Position calculations
  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 max-w-xs';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
    }
  };

  // Size configurations
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-3 py-2';
      case 'lg':
        return 'text-base px-4 py-3';
      default:
        return 'text-sm px-3 py-2';
    }
  };

  // Color configurations based on category
  const getColorClasses = () => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      teal: 'bg-teal-50 border-teal-200 text-teal-900',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      amber: 'bg-amber-50 border-amber-200 text-amber-900',
      pink: 'bg-pink-50 border-pink-200 text-pink-900'
    };
    
    return colorMap[categoryConfig.color] || colorMap.blue;
  };

  // Priority indicator
  const getPriorityIndicator = () => {
    if (tooltipData.priority === 'high') {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      );
    }
    return null;
  };

  // Handle AI Assistant click
  const handleAIClick = () => {
    if (onAIClick) {
      onAIClick(term, getAIPrompt(term));
    } else {
      // Default behavior - could open AI chat or navigate to help
      console.log('AI Assistant requested for:', term);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  return (
    <div 
      className={`relative inline-block ${className}`}
      ref={triggerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger Element */}
      <div className="inline-flex items-center">
        {children}
        <button
          type="button"
          className="ml-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          onClick={() => setIsVisible(!isVisible)}
          aria-label={`Learn more about ${tooltipData.title}`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {(isVisible || isHovered) && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`${getPositionClasses()} ${getColorClasses()} ${getSizeClasses()} rounded-lg border shadow-lg`}
          >
            {/* Priority Indicator */}
            {getPriorityIndicator()}

            {/* Close Button */}
            <button
              type="button"
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              onClick={() => setIsVisible(false)}
              aria-label="Close tooltip"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Content */}
            <div className="pr-6">
              {/* Title */}
              <div className="font-semibold mb-1 text-current">
                {tooltipData.title}
              </div>

              {/* Content */}
              <div className="text-current opacity-90 leading-relaxed">
                {tooltipData.content}
              </div>

              {/* Category Badge */}
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full bg-${categoryConfig.color}-100 text-${categoryConfig.color}-800`}>
                  {categoryConfig.name}
                </span>
                
                {/* AI Assistant Button */}
                {showAI && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAIClick}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Help</span>
                    <ExternalLink className="w-3 h-3" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-current transform rotate-45 ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2' :
              'right-full top-1/2 -translate-y-1/2 translate-x-1/2'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Inline Help Component
 * For contextual help within forms and inputs
 */
export const InlineHelp = ({ term, children, className = '' }) => {
  const tooltipData = getTooltipContent(term);
  
  if (!tooltipData) return children;

  return (
    <div className={`flex items-start space-x-2 ${className}`}>
      <div className="flex-1">
        {children}
      </div>
      <SmartTooltip 
        term={term} 
        position="right"
        size="sm"
        className="mt-1"
      >
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      </SmartTooltip>
    </div>
  );
};

/**
 * Help Badge Component
 * For displaying help information in cards and sections
 */
export const HelpBadge = ({ term, className = '' }) => {
  const tooltipData = getTooltipContent(term);
  
  if (!tooltipData) return null;

  const categoryConfig = TOOLTIP_CATEGORIES[tooltipData.category];

  return (
    <SmartTooltip term={term} position="top" size="md">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryConfig.color}-100 text-${categoryConfig.color}-800 hover:bg-${categoryConfig.color}-200 transition-colors duration-200 cursor-help ${className}`}>
        <HelpCircle className="w-3 h-3 mr-1" />
        {tooltipData.title}
      </span>
    </SmartTooltip>
  );
};

/**
 * Progressive Disclosure Component
 * For showing advanced information on demand
 */
export const ProgressiveDisclosure = ({ 
  term, 
  children, 
  showAdvanced = false,
  onToggle = null,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(showAdvanced);
  const tooltipData = getTooltipContent(term);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  if (!tooltipData) return children;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <SmartTooltip term={term} position="top" size="sm">
          <span className="text-sm font-medium text-gray-700 cursor-help">
            {tooltipData.title}
          </span>
        </SmartTooltip>
        
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          {isExpanded ? 'Show Less' : 'Learn More'}
        </button>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border"
        >
          {tooltipData.content}
        </motion.div>
      )}
      
      {children}
    </div>
  );
};

export default SmartTooltip;
