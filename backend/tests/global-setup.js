// Justification: Global Test Setup - Phase 4 Testing Enhancement
// Provides automated port management and test environment preparation
// Essential for ensuring tests run consistently without port conflicts
// Implements user's requirement to kill processes on busy ports before testing

const portManager = require('../scripts/port-manager');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Ensure port is free before running tests
    const port = process.env.PORT || 3002;
    const success = await portManager.ensurePortFree(parseInt(port));
    
    if (!success) {
      console.error(`❌ Failed to free port ${port} during global setup`);
      process.exit(1);
    }
    
    console.log(`✅ Global test setup completed - Port ${port} is ready`);
    
    // Store port info for teardown
    global.testPort = port;
    
  } catch (error) {
    console.error('❌ Error during global test setup:', error);
    process.exit(1);
  }
};
