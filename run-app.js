const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Excel Analytics Platform...');

// Start backend server
const backend = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a moment for backend to start
setTimeout(() => {
  // Start frontend server
  const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
  
}, 2000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

// Handle shutdown
process.on('SIGTERM', () => {
  backend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  backend.kill();
  process.exit(0);
});