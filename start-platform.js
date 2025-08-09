#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Excel Analytics Platform...');

// Start backend server
const server = spawn('node', ['server/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: path.resolve(__dirname)
});

server.stdout.on('data', (data) => {
  console.log(`[SERVER] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Start frontend dev server
const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: path.resolve(__dirname)
});

frontend.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Excel Analytics Platform...');
  server.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Excel Analytics Platform...');
  server.kill();
  frontend.kill();
  process.exit(0);
});

console.log('✅ Both servers starting...');
console.log('🔗 Frontend will be available at: http://localhost:5173');
console.log('🔗 Backend API at: http://localhost:3000');
console.log('📊 Test credentials:');
console.log('   Admin: admin@test.com / admin123');
console.log('   User: user@test.com / user123');
console.log('\nPress Ctrl+C to stop all services');