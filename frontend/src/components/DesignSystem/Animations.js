// =====================================================
// BURNBACK ANIMATION SYSTEM - MICRO-INTERACTIONS & DELIGHT
// Comprehensive animation library for enhanced user experience
// =====================================================

import { motion, AnimatePresence } from 'framer-motion';

// =====================================================
// PAGE TRANSITIONS
// =====================================================

export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// MODAL ANIMATIONS
// =====================================================

export const ModalTransition = ({ children, isOpen, className = '' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// CARD ANIMATIONS
// =====================================================

export const CardAnimation = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ 
        y: -5, 
        transition: { duration: 0.2 } 
      }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// LIST ANIMATIONS
// =====================================================

export const ListAnimation = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </motion.div>
  );
};

export const ListItemAnimation = ({ children, index = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: 'easeOut' 
      }}
      whileHover={{ 
        x: 5, 
        transition: { duration: 0.2 } 
      }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// FORM ANIMATIONS
// =====================================================

export const FormFieldAnimation = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

export const SuccessAnimation = ({ children, isVisible = false, className = '' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// LOADING ANIMATIONS
// =====================================================

export const LoadingAnimation = ({ className = '' }) => {
  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
};

export const SkeletonAnimation = ({ className = '', ...props }) => {
  return (
    <motion.div
      className={`bg-neutral-200 rounded ${className}`}
      animate={{ 
        opacity: [0.5, 1, 0.5],
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      }}
      {...props}
    />
  );
};

// =====================================================
// PROGRESS ANIMATIONS
// =====================================================

export const ProgressAnimation = ({ progress = 0, className = '' }) => {
  return (
    <div className={`w-full bg-neutral-200 rounded-full h-2 ${className}`}>
      <motion.div
        className="bg-primary-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

// =====================================================
// NOTIFICATION ANIMATIONS
// =====================================================

export const NotificationAnimation = ({ children, isVisible = false, className = '' }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// BUTTON ANIMATIONS
// =====================================================

export const ButtonAnimation = ({ children, className = '', ...props }) => {
  return (
    <motion.button
      className={className}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.1 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// =====================================================
// HOVER ANIMATIONS
// =====================================================

export const HoverAnimation = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// FADE ANIMATIONS
// =====================================================

export const FadeIn = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export const FadeInUp = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

export const FadeInDown = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// SCALE ANIMATIONS
// =====================================================

export const ScaleIn = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// STAGGER ANIMATIONS
// =====================================================

export const StaggerContainer = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  PageTransition,
  ModalTransition,
  CardAnimation,
  ListAnimation,
  ListItemAnimation,
  FormFieldAnimation,
  SuccessAnimation,
  LoadingAnimation,
  SkeletonAnimation,
  ProgressAnimation,
  NotificationAnimation,
  ButtonAnimation,
  HoverAnimation,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
};
