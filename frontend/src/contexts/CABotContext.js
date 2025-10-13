// =====================================================
// CA BOT CONTEXT - CONVERSATIONAL AI STATE MANAGEMENT
// Manages CA Bot conversation state and interactions
// =====================================================

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import cabotService from '../services/CABotService';
import { enterpriseLogger } from '../utils/logger';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  // Session state
  sessionId: null,
  isActive: false,
  isLoading: false,
  
  // Conversation state
  messages: [],
  currentStep: 'greeting',
  userType: 'educated',
  language: 'en',
  collectedData: {},
  steps: [],
  
  // UI state
  isTyping: false,
  isVoiceEnabled: false,
  isListening: false,
  isSpeaking: false,
  
  // Bot configuration
  botStatus: null,
  features: {
    userTypeDetection: true,
    languageSupport: ['en', 'hi'],
    voiceInput: true,
    voiceOutput: true,
    realTimeComputation: true,
    aiIntegration: false
  }
};

// Action types
const ActionTypes = {
  // Session management
  CREATE_SESSION: 'CREATE_SESSION',
  DESTROY_SESSION: 'DESTROY_SESSION',
  SET_LOADING: 'SET_LOADING',
  
  // Conversation management
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  UPDATE_STEP: 'UPDATE_STEP',
  UPDATE_USER_TYPE: 'UPDATE_USER_TYPE',
  UPDATE_LANGUAGE: 'UPDATE_LANGUAGE',
  UPDATE_COLLECTED_DATA: 'UPDATE_COLLECTED_DATA',
  ADD_STEP: 'ADD_STEP',
  
  // UI state
  TOGGLE_VOICE: 'TOGGLE_VOICE',
  SET_LISTENING: 'SET_LISTENING',
  SET_SPEAKING: 'SET_SPEAKING',
  
  // Bot configuration
  SET_BOT_STATUS: 'SET_BOT_STATUS',
  SET_FEATURES: 'SET_FEATURES',
  
  // Reset
  RESET_CONVERSATION: 'RESET_CONVERSATION',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
const cabotReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.CREATE_SESSION:
      return {
        ...state,
        sessionId: action.payload.sessionId,
        isActive: true,
        ...action.payload.initialState
      };
      
    case ActionTypes.DESTROY_SESSION:
      return {
        ...initialState,
        botStatus: state.botStatus,
        features: state.features
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case ActionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
      
    case ActionTypes.SET_TYPING:
      return {
        ...state,
        isTyping: action.payload
      };
      
    case ActionTypes.UPDATE_STEP:
      return {
        ...state,
        currentStep: action.payload
      };
      
    case ActionTypes.UPDATE_USER_TYPE:
      return {
        ...state,
        userType: action.payload
      };
      
    case ActionTypes.UPDATE_LANGUAGE:
      return {
        ...state,
        language: action.payload
      };
      
    case ActionTypes.UPDATE_COLLECTED_DATA:
      return {
        ...state,
        collectedData: {
          ...state.collectedData,
          ...action.payload
        }
      };
      
    case ActionTypes.ADD_STEP:
      return {
        ...state,
        steps: [...state.steps, action.payload]
      };
      
    case ActionTypes.TOGGLE_VOICE:
      return {
        ...state,
        isVoiceEnabled: !state.isVoiceEnabled
      };
      
    case ActionTypes.SET_LISTENING:
      return {
        ...state,
        isListening: action.payload
      };
      
    case ActionTypes.SET_SPEAKING:
      return {
        ...state,
        isSpeaking: action.payload
      };
      
    case ActionTypes.SET_BOT_STATUS:
      return {
        ...state,
        botStatus: action.payload
      };
      
    case ActionTypes.SET_FEATURES:
      return {
        ...state,
        features: {
          ...state.features,
          ...action.payload
        }
      };
      
    case ActionTypes.RESET_CONVERSATION:
      return {
        ...state,
        messages: [],
        currentStep: 'greeting',
        collectedData: {},
        steps: [],
        isTyping: false,
        isListening: false,
        isSpeaking: false
      };
      
    case ActionTypes.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
};

// Context
const CABotContext = createContext();

// Provider component
export const CABotProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cabotReducer, initialState);

  // Initialize bot status on mount
  useEffect(() => {
    initializeBot();
  }, []);

  // Initialize bot
  const initializeBot = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const botStatus = await cabotService.getBotStatus();
      
      dispatch({ type: ActionTypes.SET_BOT_STATUS, payload: botStatus });
      dispatch({ type: ActionTypes.SET_FEATURES, payload: botStatus.features });
      
      enterpriseLogger.info('CA Bot initialized', {
        isActive: botStatus.isActive,
        features: botStatus.features
      });
      
    } catch (error) {
      enterpriseLogger.error('CA Bot initialization error', {
        error: error.message
      });
      
      toast.error('Failed to initialize CA Bot');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (options = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const session = await cabotService.createSession(options);
      const context = await cabotService.getConversationContext();
      
      dispatch({
        type: ActionTypes.CREATE_SESSION,
        payload: {
          sessionId: session.id,
          initialState: {
            ...context,
            ...session
          }
        }
      });
      
      // Save to storage
      cabotService.saveConversationToStorage(session.id, {
        ...context,
        ...session
      });
      
      enterpriseLogger.info('CA Bot session created', {
        sessionId: session.id,
        userType: session.userType,
        language: session.language
      });
      
      return session;
      
    } catch (error) {
      enterpriseLogger.error('Session creation error', {
        error: error.message
      });
      
      toast.error('Failed to create session');
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Destroy session
  const destroySession = useCallback(() => {
    if (state.sessionId) {
      cabotService.clearConversationFromStorage(state.sessionId);
    }
    
    dispatch({ type: ActionTypes.DESTROY_SESSION });
    
    enterpriseLogger.info('CA Bot session destroyed', {
      sessionId: state.sessionId
    });
  }, [state.sessionId]);

  // Send message
  const sendMessage = useCallback(async (message) => {
    if (!state.isActive || !message.trim()) {
      return;
    }

    try {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date()
      };
      
      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: userMessage });
      dispatch({ type: ActionTypes.SET_TYPING, payload: true });

      // Prepare context
      const context = {
        userType: state.userType,
        language: state.language,
        currentStep: state.currentStep,
        collectedData: state.collectedData,
        steps: state.steps
      };

      // Process message
      const response = await cabotService.processMessage(message, context);
      
      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        metadata: response.metadata
      };
      
      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: botMessage });
      
      // Update state based on response
      if (response.metadata) {
        if (response.metadata.userType && response.metadata.userType !== state.userType) {
          dispatch({ type: ActionTypes.UPDATE_USER_TYPE, payload: response.metadata.userType });
        }
        
        if (response.metadata.filingStep && response.metadata.filingStep !== state.currentStep) {
          dispatch({ type: ActionTypes.UPDATE_STEP, payload: response.metadata.filingStep });
          dispatch({ type: ActionTypes.ADD_STEP, payload: response.metadata.filingStep });
        }
      }
      
      // Save conversation to storage
      if (state.sessionId) {
        const conversationData = {
          messages: [...state.messages, userMessage, botMessage],
          currentStep: response.metadata?.filingStep || state.currentStep,
          userType: response.metadata?.userType || state.userType,
          language: state.language,
          collectedData: state.collectedData,
          steps: [...state.steps, response.metadata?.filingStep].filter(Boolean)
        };
        
        cabotService.saveConversationToStorage(state.sessionId, conversationData);
      }
      
      enterpriseLogger.info('Message sent successfully', {
        messageLength: message.length,
        userType: response.metadata?.userType || state.userType,
        currentStep: response.metadata?.filingStep || state.currentStep
      });
      
    } catch (error) {
      enterpriseLogger.error('Message sending error', {
        error: error.message,
        message: message
      });
      
      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: errorMessage });
      toast.error('Failed to send message');
      
    } finally {
      dispatch({ type: ActionTypes.SET_TYPING, payload: false });
    }
  }, [state.isActive, state.userType, state.language, state.currentStep, state.collectedData, state.steps, state.messages, state.sessionId]);

  // Update user type
  const updateUserType = useCallback((userType) => {
    dispatch({ type: ActionTypes.UPDATE_USER_TYPE, payload: userType });
    
    enterpriseLogger.info('User type updated', { userType });
  }, []);

  // Update language
  const updateLanguage = useCallback((language) => {
    dispatch({ type: ActionTypes.UPDATE_LANGUAGE, payload: language });
    
    enterpriseLogger.info('Language updated', { language });
  }, []);

  // Update collected data
  const updateCollectedData = useCallback((data) => {
    dispatch({ type: ActionTypes.UPDATE_COLLECTED_DATA, payload: data });
    
    enterpriseLogger.info('Collected data updated', { data });
  }, []);

  // Toggle voice
  const toggleVoice = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_VOICE });
    
    enterpriseLogger.info('Voice toggled', { 
      isVoiceEnabled: !state.isVoiceEnabled 
    });
  }, [state.isVoiceEnabled]);

  // Set listening state
  const setListening = useCallback((isListening) => {
    dispatch({ type: ActionTypes.SET_LISTENING, payload: isListening });
  }, []);

  // Set speaking state
  const setSpeaking = useCallback((isSpeaking) => {
    dispatch({ type: ActionTypes.SET_SPEAKING, payload: isSpeaking });
  }, []);

  // Reset conversation
  const resetConversation = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      
      const newContext = await cabotService.resetConversation();
      
      dispatch({ type: ActionTypes.RESET_CONVERSATION });
      dispatch({ type: ActionTypes.UPDATE_STEP, payload: newContext.currentStep });
      dispatch({ type: ActionTypes.UPDATE_USER_TYPE, payload: newContext.userType });
      dispatch({ type: ActionTypes.UPDATE_LANGUAGE, payload: newContext.language });
      
      // Save to storage
      if (state.sessionId) {
        cabotService.saveConversationToStorage(state.sessionId, newContext);
      }
      
      enterpriseLogger.info('Conversation reset', {
        sessionId: state.sessionId,
        newStep: newContext.currentStep
      });
      
    } catch (error) {
      enterpriseLogger.error('Conversation reset error', {
        error: error.message
      });
      
      toast.error('Failed to reset conversation');
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [state.sessionId]);

  // Load conversation from storage
  const loadConversation = useCallback((sessionId) => {
    const conversationData = cabotService.loadConversationFromStorage(sessionId);
    
    if (conversationData) {
      dispatch({
        type: ActionTypes.CREATE_SESSION,
        payload: {
          sessionId,
          initialState: conversationData
        }
      });
      
      enterpriseLogger.info('Conversation loaded from storage', {
        sessionId,
        messagesCount: conversationData.messages?.length || 0
      });
      
      return conversationData;
    }
    
    return null;
  }, []);

  // Process filing data
  const processFilingData = useCallback(async () => {
    try {
      const conversationData = {
        userType: state.userType,
        language: state.language,
        currentStep: state.currentStep,
        collectedData: state.collectedData,
        steps: state.steps
      };
      
      const filingData = await cabotService.processFilingData(conversationData);
      
      enterpriseLogger.info('Filing data processed', {
        hasPersonalInfo: !!filingData.personalInfo,
        hasIncomeDetails: !!filingData.incomeDetails,
        hasDeductions: !!filingData.deductions
      });
      
      return filingData;
      
    } catch (error) {
      enterpriseLogger.error('Filing data processing error', {
        error: error.message
      });
      
      toast.error('Failed to process filing data');
      throw error;
    }
  }, [state.userType, state.language, state.currentStep, state.collectedData, state.steps]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    createSession,
    destroySession,
    sendMessage,
    updateUserType,
    updateLanguage,
    updateCollectedData,
    toggleVoice,
    setListening,
    setSpeaking,
    resetConversation,
    loadConversation,
    processFilingData,
    initializeBot
  };

  return (
    <CABotContext.Provider value={value}>
      {children}
    </CABotContext.Provider>
  );
};

// Hook to use CA Bot context
export const useCABot = () => {
  const context = useContext(CABotContext);
  
  if (!context) {
    throw new Error('useCABot must be used within a CABotProvider');
  }
  
  return context;
};

export default CABotContext;
