// =====================================================
// DATABASE CONNECTION POOL MONITOR
// Monitors pool usage and logs warnings when approaching limits
// =====================================================

const { sequelize } = require('../config/database');
const enterpriseLogger = require('./logger');

class DatabasePoolMonitor {
  constructor() {
    this.monitoringInterval = null;
    this.warningThreshold = 0.8; // Warn at 80% pool usage
    this.criticalThreshold = 0.95; // Critical at 95% pool usage
    this.checkInterval = 30000; // Check every 30 seconds
  }

  /**
   * Start monitoring the connection pool
   */
  start() {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    this.monitoringInterval = setInterval(async () => {
      await this.checkPoolStatus();
    }, this.checkInterval);

    enterpriseLogger.info('Database pool monitor started', {
      checkInterval: this.checkInterval,
      warningThreshold: this.warningThreshold,
      criticalThreshold: this.criticalThreshold,
    });
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      enterpriseLogger.info('Database pool monitor stopped');
    }
  }

  /**
   * Check current pool status
   */
  async checkPoolStatus() {
    try {
      const pool = sequelize.connectionManager.pool;
      if (!pool) {
        return;
      }

      const poolConfig = sequelize.config.pool;
      const maxConnections = poolConfig.max;
      const minConnections = poolConfig.min;

      // Get current pool stats
      const poolSize = pool.size || 0;
      const available = pool.available || 0;
      const using = poolSize - available;
      const waiting = pool.pending || 0;

      const usagePercent = using / maxConnections;
      const availablePercent = available / maxConnections;

      // Log status
      const status = {
        poolSize,
        using,
        available,
        waiting,
        maxConnections,
        minConnections,
        usagePercent: (usagePercent * 100).toFixed(2) + '%',
        availablePercent: (availablePercent * 100).toFixed(2) + '%',
      };

      // Warning if approaching limits
      if (usagePercent >= this.criticalThreshold) {
        enterpriseLogger.error('Database pool CRITICAL: Approaching maximum connections', status);
      } else if (usagePercent >= this.warningThreshold) {
        enterpriseLogger.warn('Database pool WARNING: High connection usage', status);
      } else if (process.env.DB_POOL_LOGGING === 'true') {
        enterpriseLogger.debug('Database pool status', status);
      }

      // Alert if connections are waiting
      if (waiting > 0) {
        enterpriseLogger.warn('Database connections waiting in queue', {
          waiting,
          using,
          available,
          maxConnections,
        });
      }
    } catch (error) {
      enterpriseLogger.error('Error checking database pool status', {
        error: error.message,
      });
    }
  }

  /**
   * Get current pool statistics
   */
  async getStats() {
    try {
      const pool = sequelize.connectionManager.pool;
      if (!pool) {
        return null;
      }

      const poolConfig = sequelize.config.pool;
      const poolSize = pool.size || 0;
      const available = pool.available || 0;
      const using = poolSize - available;
      const waiting = pool.pending || 0;

      return {
        max: poolConfig.max,
        min: poolConfig.min,
        size: poolSize,
        using,
        available,
        waiting,
        usagePercent: ((using / poolConfig.max) * 100).toFixed(2),
        healthy: using < poolConfig.max * this.warningThreshold,
      };
    } catch (error) {
      enterpriseLogger.error('Error getting database pool stats', {
        error: error.message,
      });
      return null;
    }
  }
}

// Singleton instance
const dbPoolMonitor = new DatabasePoolMonitor();

module.exports = dbPoolMonitor;

