const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Excel Analytics Platform server is running'
  });
});

// Mock auth endpoints for now
app.post('/api/auth/login', (req, res) => {
  res.status(401).json({ error: 'Authentication not fully configured yet' });
});

app.post('/api/auth/register', (req, res) => {
  res.status(401).json({ error: 'Authentication not fully configured yet' });
});

app.get('/api/auth/user', (req, res) => {
  res.status(401).json({ error: 'User not authenticated' });
});

// Mock endpoints for testing frontend
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalFiles: 0,
    totalCharts: 0,
    recentActivity: [],
    chartTypes: { bar: 0, line: 0, pie: 0 }
  });
});

app.get('/api/files', (req, res) => {
  res.json([]);
});

app.get('/api/charts', (req, res) => {
  res.json([]);
});

// Serve static files in development
app.use(express.static(path.join(__dirname, '..', 'client')));

// Catch-all for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Excel Analytics Platform (minimal) running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('⚠️  Authentication and full features are temporarily disabled');
});