// =====================================================
// DATABASE QUERY HELPER
// Wraps Sequelize.query to maintain pool.query() interface
// Converts PostgreSQL $1, $2 syntax to Sequelize-compatible format
// =====================================================

const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const enterpriseLogger = require('./logger');

/**
 * Convert PostgreSQL $1, $2 syntax to Sequelize ? positional syntax
 * Sequelize will automatically convert ? to database-specific syntax (e.g., $1 for PostgreSQL)
 * @param {string} query - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Object} Object with converted query and params array
 */
function convertPostgresToSequelize(query, params = []) {
  // Count number of $N parameters in query
  const paramMatches = query.match(/\$(\d+)/g);
  if (!paramMatches) {
    return { query, params }; // No parameters in query
  }

  const paramIndices = paramMatches.map(m => parseInt(m.replace('$', '')));
  const maxParamIndex = Math.max(...paramIndices);

  // Validate parameter count matches
  if (maxParamIndex > params.length) {
    const error = new Error(
      `Query requires ${maxParamIndex} parameters but only ${params.length} provided`
    );
    enterpriseLogger.error('Parameter count mismatch', {
      query: query.substring(0, 200),
      requiredParams: maxParamIndex,
      providedParams: params.length,
      paramMatches: paramMatches.slice(0, 5), // Show first 5 matches
    });
    throw error;
  }

  // Convert $1, $2, etc. to ? placeholders (Sequelize will handle PostgreSQL conversion)
  // Process in reverse order to avoid replacing $1 in $10, $11, etc.
  let convertedQuery = query;
  for (let i = maxParamIndex; i >= 1; i--) {
    const regex = new RegExp(`\\$${i}\\b`, 'g');
    convertedQuery = convertedQuery.replace(regex, '?');
  }

  return { query: convertedQuery, params };
}

/**
 * Execute a raw SQL query with Sequelize
 * Maintains compatibility with pool.query() interface
 * @param {string} query - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{rows: Array}>} Result object with rows array
 */
async function query(query, params = []) {
  try {
    // Convert PostgreSQL $1, $2 syntax to Sequelize ? syntax
    const { query: convertedQuery, params: convertedParams } = convertPostgresToSequelize(query, params);

    // Use replacements with ? placeholders - Sequelize will convert to PostgreSQL $1, $2 automatically
    const results = await sequelize.query(convertedQuery, {
      replacements: convertedParams,
      type: QueryTypes.SELECT,
    });

    return { rows: results };
  } catch (error) {
    enterpriseLogger.error('Database query failed', {
      error: error.message,
      query: query.substring(0, 200),
      paramCount: params.length,
      params: params.slice(0, 3), // Log first 3 params for debugging
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Execute an INSERT/UPDATE query with RETURNING clause
 * @param {string} query - SQL query with $1, $2, etc. placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{rows: Array}>} Result object with rows array
 */
async function queryWithReturning(query, params = []) {
  try {
    // Convert PostgreSQL $1, $2 syntax to Sequelize ? syntax
    const { query: convertedQuery, params: convertedParams } = convertPostgresToSequelize(query, params);

    // Use replacements with ? placeholders - Sequelize will convert to PostgreSQL $1, $2 automatically
    const results = await sequelize.query(convertedQuery, {
      replacements: convertedParams,
      type: QueryTypes.SELECT,
    });

    return { rows: results };
  } catch (error) {
    enterpriseLogger.error('Database query with returning failed', {
      error: error.message,
      query: query.substring(0, 200),
      paramCount: params.length,
      params: params.slice(0, 3), // Log first 3 params for debugging
      stack: error.stack,
    });
    throw error;
  }
}

module.exports = {
  query,
  queryWithReturning,
};

