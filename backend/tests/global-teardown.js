// Justification: Global Test Teardown - Phase 4 Testing Enhancement
// Provides cleanup after test execution
// Essential for maintaining clean test environment and reporting
// Ensures proper cleanup of test resources and processes

const portManager = require('../scripts/port-manager');

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Get port info for cleanup
    const port = global.testPort || process.env.PORT || 3000;
    
    // Check if any test processes are still running
    const portInfo = await portManager.getPortInfo(parseInt(port));
    
    if (portInfo.inUse) {
      console.log(`🔍 Found ${portInfo.processes.length} process(es) still running on port ${port}`);
      console.log('📋 Process details:', portInfo.processes);
      
      // Optionally kill remaining processes
      const killSuccess = await portManager.killProcessOnPort(parseInt(port));
      if (killSuccess) {
        console.log(`✅ Successfully cleaned up port ${port}`);
      } else {
        console.log(`⚠️ Failed to clean up port ${port}`);
      }
    } else {
      console.log(`✅ Port ${port} is clean`);
    }
    
    console.log('✅ Global test teardown completed');
    
  } catch (error) {
    console.error('❌ Error during global test teardown:', error);
  }
};
