// =====================================================
// DATABASE CONFIGURATION - SEQUELIZE STANDARDIZED
// =====================================================

const { Sequelize } = require('sequelize');
const enterpriseLogger = require('../utils/logger');

// Database configuration
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
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
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
    enterpriseLogger.info('Database connection established successfully');
    return true;
  } catch (error) {
    enterpriseLogger.error('Unable to connect to database', { 
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
      enterpriseLogger.info('Database initialized successfully');
      return true;
    } else {
      enterpriseLogger.error('Database initialization failed');
      return false;
    }
  } catch (error) {
    enterpriseLogger.error('Database initialization error', { error: error.message });
    return false;
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  try {
    await sequelize.close();
    enterpriseLogger.info('Database connection closed');
  } catch (error) {
    enterpriseLogger.error('Error closing database connection', { error: error.message });
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