// Justification: Port Management Script - Phase 4 Testing Enhancement
// Provides automated port conflict resolution during testing
// Essential for ensuring tests run on configured ports without manual intervention
// Prevents EADDRINUSE errors and maintains consistent test environment
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class PortManager {
  constructor() {
    this.config = {
      defaultPort: process.env.PORT || 3002,
      killTimeout: 5000, // 5 seconds timeout for killing process
      retryAttempts: 3
    };
  }

  /**
   * Kill any process using the specified port
   * @param {number} port - Port number to free
   * @returns {Promise<boolean>} - True if port is freed, false otherwise
   */
  async killProcessOnPort(port = this.config.defaultPort) {
    try {
      console.log(`🔧 Checking for processes on port ${port}...`);
      
      // Find process using the port - Windows compatible
      let stdout = '';
      try {
        const result = await execAsync(`netstat -ano | findstr :${port}`);
        stdout = result.stdout;
      } catch (error) {
        // If netstat fails, try alternative approach
        console.log(`📋 No processes found on port ${port} (netstat returned no results)`);
        return true;
      }
      
      if (!stdout.trim()) {
        console.log(`✅ Port ${port} is already free`);
        return true;
      }

      // Extract PID from netstat output
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });

      if (pids.size === 0) {
        console.log(`✅ Port ${port} is already free`);
        return true;
      }

      console.log(`🔍 Found ${pids.size} process(es) on port ${port}: ${Array.from(pids).join(', ')}`);

      // Kill each process
      for (const pid of pids) {
        try {
          console.log(`🔄 Killing process ${pid}...`);
          await execAsync(`taskkill /F /PID ${pid}`);
          console.log(`✅ Successfully killed process ${pid}`);
        } catch (error) {
          console.log(`⚠️ Failed to kill process ${pid}: ${error.message}`);
        }
      }

      // Verify port is free
      await this.waitForPort(port);
      console.log(`✅ Port ${port} is now free`);
      return true;

    } catch (error) {
      console.error(`❌ Error freeing port ${port}:`, error.message);
      return false;
    }
  }

  /**
   * Wait for port to become available
   * @param {number} port - Port number to check
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - True if port is available, false if timeout
   */
  async waitForPort(port, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await execAsync(`netstat -ano | findstr :${port}`);
        if (!result.stdout.trim()) {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        return true; // If netstat fails, assume port is free
      }
    }
    
    return false;
  }

  /**
   * Ensure port is free before running tests
   * @param {number} port - Port number to ensure is free
   * @returns {Promise<boolean>} - True if successful, false otherwise
   */
  async ensurePortFree(port = this.config.defaultPort) {
    console.log(`🚀 Ensuring port ${port} is free for testing...`);
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      console.log(`📋 Attempt ${attempt}/${this.config.retryAttempts}`);
      
      const success = await this.killProcessOnPort(port);
      if (success) {
        return true;
      }
      
      if (attempt < this.config.retryAttempts) {
        console.log(`⏳ Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.error(`❌ Failed to free port ${port} after ${this.config.retryAttempts} attempts`);
    return false;
  }

  /**
   * Get system information about port usage
   * @param {number} port - Port number to check
   * @returns {Promise<Object>} - Port usage information
   */
  async getPortInfo(port = this.config.defaultPort) {
    try {
      const result = await execAsync(`netstat -ano | findstr :${port}`);
      
      if (!result.stdout.trim()) {
        return {
          port,
          inUse: false,
          processes: []
        };
      }

      const lines = result.stdout.trim().split('\n');
      const processes = [];
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            processes.push({
              pid,
              connection: parts.slice(0, 4).join(' ')
            });
          }
        }
      });

      return {
        port,
        inUse: processes.length > 0,
        processes
      };

    } catch (error) {
      return {
        port,
        inUse: false,
        processes: [],
        error: error.message
      };
    }
  }
}

// Export singleton instance
const portManager = new PortManager();

// CLI usage
if (require.main === module) {
  const port = process.argv[2] || portManager.config.defaultPort;
  
  portManager.ensurePortFree(parseInt(port))
    .then(success => {
      if (success) {
        console.log(`✅ Port ${port} is ready for testing`);
        process.exit(0);
      } else {
        console.error(`❌ Failed to prepare port ${port}`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(`❌ Error:`, error);
      process.exit(1);
    });
}

module.exports = portManager;
