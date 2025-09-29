// Frontend Chat Service
// Handles Socket.io client connection and chat functionality

import { io } from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3002', {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay
        });

        this.socket.on('connect', () => {
          console.log('Connected to chat server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connection_status', { connected: true });
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from chat server:', reason);
          this.isConnected = false;
          this.emit('connection_status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
          console.error('Chat connection error:', error);
          this.isConnected = false;
          this.reconnectAttempts++;
          this.emit('connection_error', error);
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('Chat error:', error);
          this.emit('error', error);
        });

        // Chat-specific event listeners
        this.socket.on('new_message', (message) => {
          this.emit('new_message', message);
        });

        this.socket.on('user_joined', (data) => {
          this.emit('user_joined', data);
        });

        this.socket.on('user_left', (data) => {
          this.emit('user_left', data);
        });

        this.socket.on('user_typing', (data) => {
          this.emit('user_typing', data);
        });

        this.socket.on('user_stop_typing', (data) => {
          this.emit('user_stop_typing', data);
        });

        this.socket.on('user_status_update', (data) => {
          this.emit('user_status_update', data);
        });

        this.socket.on('ticket_update', (data) => {
          this.emit('ticket_update', data);
        });

        this.socket.on('ticket_messages', (data) => {
          this.emit('ticket_messages', data);
        });

      } catch (error) {
        console.error('Failed to initialize chat connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in chat event listener for ${event}:`, error);
        }
      });
    }
  }

  // Chat actions
  joinTicket(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_ticket', { ticketId });
    } else {
      console.warn('Cannot join ticket: Not connected to chat server');
    }
  }

  leaveTicket(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_ticket', { ticketId });
    }
  }

  sendMessage(ticketId, message, messageType = 'text') {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        ticketId,
        message,
        messageType
      });
    } else {
      console.warn('Cannot send message: Not connected to chat server');
      throw new Error('Not connected to chat server');
    }
  }

  startTyping(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', { ticketId });
    }
  }

  stopTyping(ticketId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stop_typing', { ticketId });
    }
  }

  updateStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_status', { status });
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Reconnection handling
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log(`Attempting to reconnect to chat server (attempt ${this.reconnectAttempts + 1})`);
        this.reconnectAttempts++;
        // The socket.io client will handle reconnection automatically
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
    }
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;
