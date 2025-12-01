// =====================================================
// SECTION CARD COMPONENT
// Implements three density states: Glance, Summary, Detailed
// Used within BreathingGrid layout system
// Fully compliant with UI.md specifications including animations
// =====================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, ChevronRight, X } from 'lucide-react';
import { BREATHING_GRID, ELEVATION, ANIMATIONS } from '../../constants/designTokens';
import { variants, transitions } from '../../lib/motion';
import { cn } from '../../lib/utils';

const SectionCard = ({
  id,
  title,
  icon: Icon,
  description,
  density = 'summary', // 'glance' | 'summary' | 'detailed'
  isExpanded = false,
  onExpand,
  children,
  status = 'complete', // 'complete' | 'warning' | 'error' | 'pending'
  primaryValue,
  secondaryValue,
  className = '',
}) => {
  const handleClick = () => {
    if (onExpand) {
      onExpand();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onExpand) {
        onExpand();
      }
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error-500" />;
      case 'pending':
        return <Info className="w-4 h-4 text-info-500" />;
      default:
        return null;
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return value || '';
  };

  // GLANCE STATE: Minimal - icon + status
  if (density === 'glance') {
    return (
      <motion.div
        className={cn(
          'section-card section-card-glance focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2',
          className,
        )}
        data-density="glance"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${title} section`}
        initial={false}
        animate={{
          width: BREATHING_GRID.cardWidths.glance,
          opacity: 1,
        }}
        transition={transitions.breathing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        style={{
          minWidth: BREATHING_GRID.cardWidths.glance,
          maxWidth: BREATHING_GRID.cardWidths.glance,
          height: BREATHING_GRID.cardWidths.glance,
        }}
      >
        <div
          className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:border-orange-300 cursor-pointer"
          style={{
            padding: '8px',
            position: 'relative',
          }}
        >
          {Icon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-6 h-6 text-gray-600 mb-1" style={{ width: '24px', height: '24px' }} />
            </motion.div>
          )}
          <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}>
            {getStatusIcon()}
          </div>
        </div>
      </motion.div>
    );
  }

  // SUMMARY STATE: Icon + Title + Key Value + Status
  if (density === 'summary') {
    return (
      <motion.div
        className={cn(
          'section-card section-card-summary focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2',
          className,
        )}
        data-density="summary"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${title} section${primaryValue ? `: ${formatCurrency(primaryValue)}` : ''}`}
        aria-expanded={isExpanded}
        initial={false}
        animate={{
          width: '100%',
          opacity: 1,
        }}
        transition={transitions.breathing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          minWidth: BREATHING_GRID.cardWidths.summary,
          maxWidth: BREATHING_GRID.cardWidths.summaryMax,
          minHeight: '120px',
        }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card hover:shadow-card-hover hover:border-orange-300 cursor-pointer p-5 h-full flex flex-col">
          <motion.div
            className="flex items-start justify-between mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="w-5 h-5 text-gray-700" style={{ width: '20px', height: '20px' }} />}
              <h3 className="text-heading-md font-semibold text-gray-800" style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h3>
            </div>
            <div className="flex items-center">
              {getStatusIcon()}
              <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {primaryValue && (
              <motion.div
                key={primaryValue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-number-lg font-semibold text-black-950 mb-2"
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: '32px',
                }}
              >
                {formatCurrency(primaryValue)}
              </motion.div>
            )}
          </AnimatePresence>

          {secondaryValue && (
            <motion.div
              className="text-body-sm text-gray-500 mt-auto"
              style={{ fontSize: '13px', lineHeight: '20px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {secondaryValue}
            </motion.div>
          )}

          {description && !primaryValue && (
            <motion.div
              className="text-body-sm text-gray-500 mt-auto"
              style={{ fontSize: '13px', lineHeight: '20px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {description}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // DETAILED STATE: Full form/content with animations
  return (
    <motion.div
      className={cn(
        'section-card section-card-detailed focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2',
        className,
      )}
      data-density="detailed"
      role="article"
      aria-expanded={true}
      initial={false}
      animate={{
        width: '100%',
        opacity: 1,
      }}
      transition={transitions.breathing}
      style={{
        maxWidth: BREATHING_GRID.cardWidths.expanded,
        minWidth: BREATHING_GRID.cardWidths.expandedMin,
      }}
    >
      <motion.div
        className="bg-white rounded-3xl border-2 border-orange-500 shadow-elevated"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        style={{
          padding: '24px',
        }}
      >
        <motion.div
          className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-6 h-6 text-gray-700" style={{ width: '24px', height: '24px' }} />}
            <div>
              <h2
                className="font-semibold text-gray-800 uppercase tracking-wide"
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  lineHeight: '32px',
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {primaryValue && (
              <motion.div
                key={primaryValue}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="text-number-lg font-semibold text-gray-900"
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  lineHeight: '32px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(primaryValue)}
              </motion.div>
            )}
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {onExpand && (
                <motion.button
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  aria-label="Collapse section"
                  tabIndex={0}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {description && (
          <motion.p
            className="text-body-md text-gray-600 mb-4"
            style={{ fontSize: '14px', lineHeight: '22px' }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          className="section-card-content"
          variants={variants.contentFade}
          initial="hidden"
          animate="visible"
          transition={{
            staggerChildren: 0.03,
            delayChildren: 0.15,
          }}
        >
          {React.Children.map(children, (child, index) => {
            if (!child) return null;
            return (
              <motion.div
                key={index}
                variants={variants.contentFade}
                custom={index}
              >
                {child}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SectionCard;

