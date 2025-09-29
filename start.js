// =====================================================
// BURNBACK ITR PLATFORM - STARTUP SCRIPT
// =====================================================

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting BurnBlack ITR Platform...\n');

// Start backend
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend
console.log('🎨 Starting frontend development server...');
const frontend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
    shell: true
  });
  
// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Handle backend errors
backend.on('error', (error) => {
  console.error('❌ Backend error:', error);
});

// Handle frontend errors
frontend.on('error', (error) => {
  console.error('❌ Frontend error:', error);
});

console.log('✅ Both servers are starting...');
console.log('🌐 Frontend: http://localhost:3000');
console.log('🔧 Backend: http://localhost:3002');
console.log('\nPress Ctrl+C to stop both servers\n');
