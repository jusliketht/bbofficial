// =====================================================
// VERCEL SERVERLESS FUNCTION ENTRY POINT
// This file is used by Vercel to handle API requests
// =====================================================

// Load environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = require('../src/app');

// Export the Express app for Vercel
module.exports = app;

