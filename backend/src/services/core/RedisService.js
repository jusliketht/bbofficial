// =====================================================
// REDIS SERVICE
// Centralized Redis connection and utility service
// Supports rate limiting, sessions, caching, and pub/sub
// =====================================================

const Redis = require('ioredis');
const enterpriseLogger = require('../../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB) || 0,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          this.reconnectAttempts = times;
          if (times > this.maxReconnectAttempts) {
            enterpriseLogger.error('Redis max reconnection attempts reached');
            return null; // Stop retrying
          }
          enterpriseLogger.warn(`Redis reconnecting (attempt ${times})...`, { delay });
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false, // Don't queue commands when offline
        connectTimeout: 10000,
        lazyConnect: false,
      };

      // Main client for general operations
      this.client = new Redis(redisConfig);

      // Subscriber client for pub/sub (separate connection required)
      this.subscriber = new Redis(redisConfig);

      // Publisher client for pub/sub
      this.publisher = new Redis(redisConfig);

      // Event handlers for main client
      this.client.on('connect', () => {
        enterpriseLogger.info('Redis client connecting...');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        enterpriseLogger.info('Redis client ready', {
          host: redisConfig.host,
          port: redisConfig.port,
          db: redisConfig.db,
        });
      });

      this.client.on('error', (error) => {
        this.isConnected = false;
        enterpriseLogger.error('Redis client error', {
          error: error.message,
          stack: error.stack,
        });
      });

      this.client.on('close', () => {
        this.isConnected = false;
        enterpriseLogger.warn('Redis client connection closed');
      });

      this.client.on('reconnecting', (delay) => {
        enterpriseLogger.warn('Redis client reconnecting', { delay });
      });

      // Event handlers for subscriber
      this.subscriber.on('ready', () => {
        enterpriseLogger.info('Redis subscriber ready');
      });

      this.subscriber.on('error', (error) => {
        enterpriseLogger.error('Redis subscriber error', { error: error.message });
      });

      // Event handlers for publisher
      this.publisher.on('ready', () => {
        enterpriseLogger.info('Redis publisher ready');
      });

      this.publisher.on('error', (error) => {
        enterpriseLogger.error('Redis publisher error', { error: error.message });
      });

      // Wait for connection
      await this.client.ping();
      await this.subscriber.ping();
      await this.publisher.ping();

      enterpriseLogger.info('Redis service initialized successfully');
      return true;
    } catch (error) {
      enterpriseLogger.error('Failed to initialize Redis service', {
        error: error.message,
        stack: error.stack,
      });
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get main Redis client
   */
  getClient() {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not initialized or not connected');
    }
    return this.client;
  }

  /**
   * Get subscriber client for pub/sub
   */
  getSubscriber() {
    if (!this.subscriber || !this.isConnected) {
      throw new Error('Redis subscriber not initialized or not connected');
    }
    return this.subscriber;
  }

  /**
   * Get publisher client for pub/sub
   */
  getPublisher() {
    if (!this.publisher || !this.isConnected) {
      throw new Error('Redis publisher not initialized or not connected');
    }
    return this.publisher;
  }

  /**
   * Check if Redis is connected
   */
  isReady() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  /**
   * Graceful shutdown
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        enterpriseLogger.info('Redis client disconnected');
      }
      if (this.subscriber) {
        await this.subscriber.quit();
        enterpriseLogger.info('Redis subscriber disconnected');
      }
      if (this.publisher) {
        await this.publisher.quit();
        enterpriseLogger.info('Redis publisher disconnected');
      }
      this.isConnected = false;
    } catch (error) {
      enterpriseLogger.error('Error disconnecting Redis', { error: error.message });
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.isReady()) {
        return { healthy: false, error: 'Redis not connected' };
      }
      const start = Date.now();
      await this.client.ping();
      const latency = Date.now() - start;
      return {
        healthy: true,
        latency,
        status: this.client.status,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

// Singleton instance
const redisService = new RedisService();

module.exports = redisService;

