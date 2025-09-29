// =====================================================
// APPLICATION ENTRY POINT - MAIN STARTUP FILE;
// Enterprise-grade application startup and initialization;
// =====================================================

const enterpriseLogger = require('./utils/logger');
const server = require('./server');

// =====================================================
// APPLICATION STARTUP;
// =====================================================

// Log application startup;
enterpriseLogger.info('BurnBlack ITR Platform starting...', {
  nodeVersion: process.version,
  platform: process.platform,
  environment: process.env.NODE_ENV || 'development',
  pid: process.pid,
  uptime: process.uptime(),
});

// =====================================================
// ENVIRONMENT VALIDATION;
// =====================================================

// Validate required environment variables;
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  enterpriseLogger.error('Missing required environment variables', {
    missing: missingEnvVars,
  });
  process.exit(1);
}

// =====================================================
// APPLICATION INITIALIZATION;
// =====================================================

// Initialize application;
try {
  // Server is already started in server.js;
  enterpriseLogger.info('Application initialized successfully');
} catch (error) {
  enterpriseLogger.error('Failed to initialize application', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
}

// =====================================================
// EXPORT FOR TESTING;
// =====================================================

module.exports = server;
