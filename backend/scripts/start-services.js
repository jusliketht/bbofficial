#!/usr/bin/env node

// Justification: Service Startup Script - Standardized Port Management
// Provides consistent port allocation and service startup across all environments
// Essential for development, testing, and production deployment consistency
// Prevents port conflicts and ensures reliable service communication

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

class ServiceManager {
  constructor() {
    this.config = {
      // Standardized Port Configuration
      ports: {
        frontend: 3000,
        backend: 3002,
        database: 5432,
        redis: 6379
      },
      // Service Configuration
      services: {
        frontend: {
          name: 'Frontend (React)',
          port: 3000,
          command: 'npm start',
          directory: '../frontend',
          healthCheck: 'http://localhost:3000',
          startupDelay: 10000
        },
        backend: {
          name: 'Backend (Node.js)',
          port: 3002,
          command: 'npm run dev',
          directory: '.',
          healthCheck: 'http://localhost:3002/health',
          startupDelay: 5000
        },
        database: {
          name: 'Database (PostgreSQL)',
          port: 5432,
          command: 'pg_ctl start',
          directory: null,
          healthCheck: 'postgresql://localhost:5432',
          startupDelay: 3000
        },
        redis: {
          name: 'Redis (Cache)',
          port: 6379,
          command: 'redis-server',
          directory: null,
          healthCheck: 'redis://localhost:6379',
          startupDelay: 2000
        }
      }
    };
    
    this.processes = new Map();
  }

  /**
   * Kill any process using the specified port
   * @param {number} port - Port number to free
   * @returns {Promise<boolean>} - True if port is freed, false otherwise
   */
  async killProcessOnPort(port) {
    try {
      console.log(`🔧 Checking for processes on port ${port}...`);
      
      // Find process using the port - Windows compatible
      let stdout = '';
      try {
        const result = await execAsync(`netstat -ano | findstr :${port}`);
        stdout = result.stdout;
      } catch (error) {
        console.log(`📋 No processes found on port ${port}`);
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

      // Wait for port to be free
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`✅ Port ${port} is now free`);
      return true;

    } catch (error) {
      console.error(`❌ Error freeing port ${port}:`, error.message);
      return false;
    }
  }

  /**
   * Free all required ports
   * @returns {Promise<boolean>} - True if all ports are freed
   */
  async freeAllPorts() {
    console.log('🚀 Freeing all required ports...');
    
    const ports = Object.values(this.config.ports);
    const results = await Promise.all(
      ports.map(port => this.killProcessOnPort(port))
    );
    
    const allFreed = results.every(result => result);
    
    if (allFreed) {
      console.log('✅ All ports are now free');
    } else {
      console.log('⚠️ Some ports may still be in use');
    }
    
    return allFreed;
  }

  /**
   * Check if a service is running
   * @param {string} serviceName - Name of the service
   * @returns {Promise<boolean>} - True if service is running
   */
  async isServiceRunning(serviceName) {
    const service = this.config.services[serviceName];
    if (!service) return false;

    try {
      const result = await execAsync(`netstat -ano | findstr :${service.port}`);
      return result.stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start a specific service
   * @param {string} serviceName - Name of the service to start
   * @returns {Promise<boolean>} - True if service started successfully
   */
  async startService(serviceName) {
    const service = this.config.services[serviceName];
    if (!service) {
      console.error(`❌ Unknown service: ${serviceName}`);
      return false;
    }

    console.log(`🚀 Starting ${service.name} on port ${service.port}...`);

    // Check if service is already running
    if (await this.isServiceRunning(serviceName)) {
      console.log(`✅ ${service.name} is already running on port ${service.port}`);
      return true;
    }

    // Free the port first
    await this.killProcessOnPort(service.port);

    // Start the service
    try {
      const workingDir = service.directory ? 
        path.resolve(__dirname, service.directory) : 
        process.cwd();

      console.log(`📁 Working directory: ${workingDir}`);
      console.log(`⚡ Command: ${service.command}`);

      const process = spawn('cmd', ['/c', service.command], {
        cwd: workingDir,
        stdio: 'inherit',
        shell: true
      });

      this.processes.set(serviceName, process);

      // Wait for service to start
      console.log(`⏳ Waiting ${service.startupDelay}ms for ${service.name} to start...`);
      await new Promise(resolve => setTimeout(resolve, service.startupDelay));

      // Verify service is running
      if (await this.isServiceRunning(serviceName)) {
        console.log(`✅ ${service.name} started successfully on port ${service.port}`);
        return true;
      } else {
        console.log(`⚠️ ${service.name} may not have started properly`);
        return false;
      }

    } catch (error) {
      console.error(`❌ Failed to start ${service.name}:`, error.message);
      return false;
    }
  }

  /**
   * Start all services
   * @returns {Promise<boolean>} - True if all services started successfully
   */
  async startAllServices() {
    console.log('🚀 Starting all ITR Filing Platform services...');
    console.log('📋 Port Configuration:');
    Object.entries(this.config.ports).forEach(([service, port]) => {
      console.log(`   ${service}: ${port}`);
    });
    console.log('');

    // Free all ports first
    await this.freeAllPorts();
    console.log('');

    // Start services in order
    const serviceOrder = ['database', 'redis', 'backend', 'frontend'];
    const results = [];

    for (const serviceName of serviceOrder) {
      const success = await this.startService(serviceName);
      results.push({ service: serviceName, success });
      console.log('');
    }

    // Summary
    console.log('📊 Service Startup Summary:');
    results.forEach(({ service, success }) => {
      const status = success ? '✅' : '❌';
      const serviceInfo = this.config.services[service];
      console.log(`   ${status} ${serviceInfo.name} (port ${serviceInfo.port})`);
    });

    const allStarted = results.every(result => result.success);
    
    if (allStarted) {
      console.log('');
      console.log('🎉 All services started successfully!');
      console.log('');
      console.log('🌐 Service URLs:');
      console.log(`   Frontend: http://localhost:${this.config.ports.frontend}`);
      console.log(`   Backend:  http://localhost:${this.config.ports.backend}`);
      console.log(`   Health:   http://localhost:${this.config.ports.backend}/health`);
    } else {
      console.log('');
      console.log('⚠️ Some services failed to start. Check the logs above.');
    }

    return allStarted;
  }

  /**
   * Stop all services
   */
  async stopAllServices() {
    console.log('🛑 Stopping all services...');
    
    // Kill processes we started
    for (const [serviceName, process] of this.processes) {
      try {
        process.kill();
        console.log(`✅ Stopped ${serviceName}`);
      } catch (error) {
        console.log(`⚠️ Error stopping ${serviceName}: ${error.message}`);
      }
    }

    // Free all ports
    await this.freeAllPorts();
    
    console.log('✅ All services stopped');
  }

  /**
   * Show service status
   */
  async showStatus() {
    console.log('📊 Service Status:');
    console.log('');
    
    for (const [serviceName, service] of Object.entries(this.config.services)) {
      const isRunning = await this.isServiceRunning(serviceName);
      const status = isRunning ? '🟢 Running' : '🔴 Stopped';
      console.log(`   ${status} ${service.name} (port ${service.port})`);
    }
  }
}

// CLI usage
if (require.main === module) {
  const serviceManager = new ServiceManager();
  const command = process.argv[2];

  switch (command) {
    case 'start':
      serviceManager.startAllServices()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
          console.error('❌ Error:', error);
          process.exit(1);
        });
      break;

    case 'stop':
      serviceManager.stopAllServices()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('❌ Error:', error);
          process.exit(1);
        });
      break;

    case 'status':
      serviceManager.showStatus()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('❌ Error:', error);
          process.exit(1);
        });
      break;

    case 'free-ports':
      serviceManager.freeAllPorts()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
          console.error('❌ Error:', error);
          process.exit(1);
        });
      break;

    default:
      console.log('🚀 ITR Filing Platform Service Manager');
      console.log('');
      console.log('Usage:');
      console.log('  node start-services.js start      - Start all services');
      console.log('  node start-services.js stop       - Stop all services');
      console.log('  node start-services.js status     - Show service status');
      console.log('  node start-services.js free-ports - Free all required ports');
      console.log('');
      console.log('Port Configuration:');
      Object.entries(serviceManager.config.ports).forEach(([service, port]) => {
        console.log(`  ${service}: ${port}`);
      });
      break;
  }
}

module.exports = ServiceManager;
