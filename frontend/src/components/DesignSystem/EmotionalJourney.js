// BurnBlack Emotional Journey Mapping
// Implements LYRA method emotional design principles
// Maps user emotions: Anxiety → Confidence → Relief

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Smile, 
  CheckCircle, 
  AlertTriangle, 
  Award,
  Clock,
  Shield,
  Star,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

// =====================================================
// EMOTIONAL JOURNEY COMPONENTS
// =====================================================

// Emotional State Tracker
export const EmotionalStateTracker = ({ 
  currentState, 
  onStateChange, 
  showProgress = true,
  ...props 
}) => {
  const emotionalStates = [
    {
      id: 'anxiety',
      label: 'Pre-filing',
      emotion: 'Anxiety/Overwhelm',
      color: 'yellow',
      icon: AlertTriangle,
      message: 'Feeling overwhelmed? We\'ll guide you step by step.',
      tone: 'reassuring'
    },
    {
      id: 'clarity',
      label: 'During Filing',
      emotion: 'Need for Clarity',
      color: 'blue',
      icon: Target,
      message: 'Making progress! Each step brings you closer to completion.',
      tone: 'encouraging'
    },
    {
      id: 'confidence',
      label: 'Progress',
      emotion: 'Growing Confidence',
      color: 'green',
      icon: CheckCircle,
      message: 'You\'re doing great! Your filing is taking shape.',
      tone: 'supportive'
    },
    {
      id: 'relief',
      label: 'Post-filing',
      emotion: 'Relief/Satisfaction',
      color: 'purple',
      icon: Award,
      message: 'Congratulations! You\'re compliant and secure.',
      tone: 'celebratory'
    }
  ];

  const currentStateIndex = emotionalStates.findIndex(state => state.id === currentState);
  const currentStateData = emotionalStates[currentStateIndex];

  return (
    <div className="space-y-4" {...props}>
      {/* Current Emotional State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          p-4 rounded-lg border-2 transition-all duration-500
          ${currentStateData.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
            currentStateData.color === 'blue' ? 'bg-blue-50 border-blue-200' :
            currentStateData.color === 'green' ? 'bg-green-50 border-green-200' :
            'bg-purple-50 border-purple-200'}
        `}
      >
        <div className="flex items-center">
          <div className={`
            p-2 rounded-full mr-3
            ${currentStateData.color === 'yellow' ? 'bg-yellow-100' :
              currentStateData.color === 'blue' ? 'bg-blue-100' :
              currentStateData.color === 'green' ? 'bg-green-100' :
              'bg-purple-100'}
          `}>
            <currentStateData.icon className={`
              w-5 h-5
              ${currentStateData.color === 'yellow' ? 'text-yellow-600' :
                currentStateData.color === 'blue' ? 'text-blue-600' :
                currentStateData.color === 'green' ? 'text-green-600' :
                'text-purple-600'}
            `} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{currentStateData.label}</h3>
            <p className="text-sm text-gray-600">{currentStateData.emotion}</p>
          </div>
        </div>
        <p className={`
          mt-2 text-sm font-medium
          ${currentStateData.color === 'yellow' ? 'text-yellow-800' :
            currentStateData.color === 'blue' ? 'text-blue-800' :
            currentStateData.color === 'green' ? 'text-green-800' :
            'text-purple-800'}
        `}>
          {currentStateData.message}
        </p>
      </motion.div>

      {/* Progress Indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Emotional Journey Progress</span>
            <span>{Math.round(((currentStateIndex + 1) / emotionalStates.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 via-blue-500 to-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStateIndex + 1) / emotionalStates.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Micro-Celebration Component
export const MicroCelebration = ({ 
  trigger, 
  type = 'completion',
  message,
  onComplete,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('entering');

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      setAnimationPhase('entering');
      
      const timer1 = setTimeout(() => {
        setAnimationPhase('celebrating');
      }, 300);
      
      const timer2 = setTimeout(() => {
        setAnimationPhase('exiting');
      }, 2000);
      
      const timer3 = setTimeout(() => {
        setIsVisible(false);
        onComplete && onComplete();
      }, 2500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [trigger, onComplete]);

  const celebrations = {
    completion: {
      icon: CheckCircle,
      color: 'green',
      emoji: '🎉'
    },
    milestone: {
      icon: Star,
      color: 'blue',
      emoji: '⭐'
    },
    achievement: {
      icon: Award,
      color: 'purple',
      emoji: '🏆'
    }
  };

  const celebration = celebrations[type];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ 
        opacity: animationPhase === 'exiting' ? 0 : 1, 
        scale: animationPhase === 'celebrating' ? 1.1 : 1,
        y: animationPhase === 'exiting' ? -50 : 0
      }}
      transition={{ 
        duration: animationPhase === 'exiting' ? 0.3 : 0.5,
        ease: "easeOut"
      }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      {...props}
    >
      <div className={`
        bg-white rounded-xl shadow-2xl p-6 text-center border-2
        ${celebration.color === 'green' ? 'border-green-200' :
          celebration.color === 'blue' ? 'border-blue-200' :
          'border-purple-200'}
      `}>
        <motion.div
          animate={{ rotate: animationPhase === 'celebrating' ? 360 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`
            w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
            ${celebration.color === 'green' ? 'bg-green-100' :
              celebration.color === 'blue' ? 'bg-blue-100' :
              'bg-purple-100'}
          `}
        >
          <celebration.icon className={`
            w-8 h-8
            ${celebration.color === 'green' ? 'text-green-600' :
              celebration.color === 'blue' ? 'text-blue-600' :
              'text-purple-600'}
          `} />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {celebration.emoji} {message || 'Great Job!'}
        </h3>
        <p className="text-gray-600">Keep up the excellent work!</p>
      </div>
    </motion.div>
  );
};

// Emotional Reinforcement Messages
export const EmotionalReinforcement = ({ 
  context, 
  userProgress,
  personalizedMessage,
  ...props 
}) => {
  const reinforcementMessages = {
    'filing-start': {
      title: 'You\'ve Got This!',
      message: '90% of salaried users finish in under 20 minutes. We\'ll guide you every step.',
      icon: Shield,
      color: 'blue'
    },
    'section-complete': {
      title: 'Excellent Progress!',
      message: 'You\'re making great progress. Each section completed brings you closer to your refund.',
      icon: TrendingUp,
      color: 'green'
    },
    'filing-complete': {
      title: 'Congratulations!',
      message: 'You\'re compliant with IT rules and securely filed. Your refund will be processed soon.',
      icon: Award,
      color: 'purple'
    },
    'early-filing': {
      title: 'Early Bird Bonus!',
      message: 'Filing early means faster refunds and peace of mind. You\'re ahead of the curve!',
      icon: Zap,
      color: 'yellow'
    }
  };

  const reinforcement = reinforcementMessages[context];
  const IconComponent = reinforcement.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-4 rounded-lg border transition-all duration-300
        ${reinforcement.color === 'blue' ? 'bg-blue-50 border-blue-200' :
          reinforcement.color === 'green' ? 'bg-green-50 border-green-200' :
          reinforcement.color === 'purple' ? 'bg-purple-50 border-purple-200' :
          'bg-yellow-50 border-yellow-200'}
      `}
      {...props}
    >
      <div className="flex items-start">
        <div className={`
          p-2 rounded-full mr-3 flex-shrink-0
          ${reinforcement.color === 'blue' ? 'bg-blue-100' :
            reinforcement.color === 'green' ? 'bg-green-100' :
            reinforcement.color === 'purple' ? 'bg-purple-100' :
            'bg-yellow-100'}
        `}>
          <IconComponent className={`
            w-5 h-5
            ${reinforcement.color === 'blue' ? 'text-blue-600' :
              reinforcement.color === 'green' ? 'text-green-600' :
              reinforcement.color === 'purple' ? 'text-purple-600' :
              'text-yellow-600'}
          `} />
        </div>
        <div className="flex-1">
          <h3 className={`
            font-semibold mb-1
            ${reinforcement.color === 'blue' ? 'text-blue-900' :
              reinforcement.color === 'green' ? 'text-green-900' :
              reinforcement.color === 'purple' ? 'text-purple-900' :
              'text-yellow-900'}
          `}>
            {reinforcement.title}
          </h3>
          <p className={`
            text-sm
            ${reinforcement.color === 'blue' ? 'text-blue-700' :
              reinforcement.color === 'green' ? 'text-green-700' :
              reinforcement.color === 'purple' ? 'text-purple-700' :
              'text-yellow-700'}
          `}>
            {personalizedMessage || reinforcement.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Success Certificate Component
export const SuccessCertificate = ({ 
  userData, 
  filingData,
  onShare,
  onDownload,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white rounded-xl p-8 text-center"
      {...props}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 mx-auto mb-6"
      >
        <Award className="w-20 h-20" />
      </motion.div>
      
      <h2 className="text-3xl font-bold mb-2">🎉 Filing Complete!</h2>
      <p className="text-lg mb-6">Congratulations on successfully filing your ITR!</p>
      
      <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Filing Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-80">Assessment Year</p>
            <p className="font-semibold">{filingData.assessmentYear}</p>
          </div>
          <div>
            <p className="opacity-80">ITR Form</p>
            <p className="font-semibold">{filingData.itrForm}</p>
          </div>
          <div>
            <p className="opacity-80">Filing Date</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="opacity-80">Status</p>
            <p className="font-semibold text-green-200">Successfully Filed</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onShare}
          className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
        >
          <Star className="w-5 h-5 mr-2" />
          Share Success
        </button>
        <button
          onClick={onDownload}
          className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-colors flex items-center"
        >
          <Award className="w-5 h-5 mr-2" />
          Download Certificate
        </button>
      </div>
    </motion.div>
  );
};

// Emotional Journey Hook
export const useEmotionalJourney = () => {
  const [currentState, setCurrentState] = useState('anxiety');
  const [milestones, setMilestones] = useState([]);
  const [celebrations, setCelebrations] = useState([]);

  const updateState = (newState) => {
    setCurrentState(newState);
  };

  const addMilestone = (milestone) => {
    setMilestones(prev => [...prev, { ...milestone, timestamp: Date.now() }]);
  };

  const triggerCelebration = (type, message) => {
    const celebration = { type, message, timestamp: Date.now() };
    setCelebrations(prev => [...prev, celebration]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.timestamp !== celebration.timestamp));
    }, 3000);
  };

  return {
    currentState,
    milestones,
    celebrations,
    updateState,
    addMilestone,
    triggerCelebration
  };
};

export default {
  EmotionalStateTracker,
  MicroCelebration,
  EmotionalReinforcement,
  SuccessCertificate,
  useEmotionalJourney
};
