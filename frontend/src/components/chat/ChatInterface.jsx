// ChatInterface Component
// Real-time chat interface for service tickets

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHook } from '../../hooks/useChat';
import './ChatInterface.css';

const ChatInterface = ({ ticketId, ticketTitle, onClose }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const {
    messages,
    isConnected,
    typingUsers,
    onlineUsers,
    error,
    loading,
    sendMessage,
    handleTyping,
    stopTyping,
    formatTimestamp,
    isOwnMessage,
    getTypingText,
    scrollToBottom,
    messagesEndRef
  } = useChat(ticketId);

  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, []);

  // Handle message input change
  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    if (value.trim()) {
      handleTyping();
    } else {
      stopTyping();
    }
  };

  // Handle message submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;

    const messageText = message.trim();
    setMessage('');
    stopTyping();
    
    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  // Render message
  const renderMessage = (msg) => {
    const isOwn = isOwnMessage(msg);
    const isSystem = msg.userRole === 'system';
    
    return (
      <motion.div
        key={msg.id}
        className={`message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isOwn && !isSystem && (
          <div className="message-header">
            <span className="user-name">{msg.userEmail}</span>
            <span className="user-role">{msg.userRole}</span>
          </div>
        )}
        
        <div className="message-content">
          <div className="message-text">{msg.message}</div>
          <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
        </div>
      </motion.div>
    );
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <motion.div
        className="typing-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="typing-text">{getTypingText()}</span>
      </motion.div>
    );
  };

  // Render connection status
  const renderConnectionStatus = () => {
    if (isConnected) return null;

    return (
      <div className="connection-status error">
        <span>⚠️ Disconnected from chat</span>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h3>{ticketTitle || 'Service Ticket Chat'}</h3>
          <div className="chat-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        
        <div className="online-users">
          <span className="online-count">{onlineUsers.length} online</span>
        </div>
        
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Connection Status */}
      {renderConnectionStatus()}

      {/* Messages Container */}
      <div className="messages-container" ref={chatContainerRef}>
        <div className="messages-list">
          <AnimatePresence>
            {messages.map(renderMessage)}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          <AnimatePresence>
            {renderTypingIndicator()}
          </AnimatePresence>
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSubmit} className="message-form">
          <div className="input-group">
            <button
              type="button"
              className="emoji-button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={loading}
            >
              😊
            </button>
            
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              onBlur={stopTyping}
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              disabled={!isConnected || loading}
              className="message-input"
              rows="1"
            />
            
            <button
              type="submit"
              className="send-button"
              disabled={!message.trim() || !isConnected || loading}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </form>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            <div className="emoji-grid">
              {['😊', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '😢', '😡', '🤝', '💯'].map(emoji => (
                <button
                  key={emoji}
                  className="emoji-option"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;