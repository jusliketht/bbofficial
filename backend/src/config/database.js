// =====================================================
// DATABASE CONFIGURATION - LOCAL POSTGRESQL
// =====================================================

const { Sequelize } = require('sequelize');
const enterpriseLogger = require('../utils/logger');

// Database configuration for local PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'burnblack_itr',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? 
    (msg) => enterpriseLogger.debug('Sequelize Query', { query: msg }) : false,
  
  // Connection pool settings
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000
  },
  
  // Connection timeout settings
  dialectOptions: {
    connectTimeout: 60000,
    requestTimeout: 60000,
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 30000
    // SSL disabled for local development
  },
  
  // Additional options
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    enterpriseLogger.info('Local PostgreSQL database connection established successfully');
    return true;
  } catch (error) {
    enterpriseLogger.error('Unable to connect to local PostgreSQL database', { 
      error: error.message,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        username: dbConfig.username
      }
    });
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      // Sync models (create tables if they don't exist)
      await sequelize.sync({ alter: false }); // Don't alter existing tables
      enterpriseLogger.info('Local PostgreSQL database initialized successfully');
      return true;
    } else {
      enterpriseLogger.error('Local PostgreSQL database initialization failed');
      return false;
    }
  } catch (error) {
    enterpriseLogger.error('Local PostgreSQL database initialization error', { error: error.message });
    return false;
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await sequelize.close();
    enterpriseLogger.info('Local PostgreSQL database connection closed');
  } catch (error) {
    enterpriseLogger.error('Error closing local PostgreSQL database connection', { error: error.message });
  }
};

// Export Sequelize instance and utilities
module.exports = {
  sequelize,
  testConnection,
  initializeDatabase,
  closeDatabase,
  dbConfig
};