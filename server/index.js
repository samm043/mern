const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files (protected)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Basic authentication routes for testing
app.post('/api/auth/register', (req, res) => {
  res.status(501).json({ 
    error: 'Registration endpoint temporarily disabled. Backend configuration in progress.' 
  });
});

app.post('/api/auth/login', (req, res) => {
  res.status(501).json({ 
    error: 'Login endpoint temporarily disabled. Backend configuration in progress.' 
  });
});

app.get('/api/auth/user', (req, res) => {
  res.status(401).json({ error: 'Authentication not configured' });
});

// Mock endpoints for frontend testing
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalFiles: 3,
    totalCharts: 5,
    totalUsers: 12,
    recentFiles: [],
    recentCharts: [],
    chartTypes: { bar: 2, line: 1, pie: 2 }
  });
});

app.get('/api/files', (req, res) => {
  res.json([]);
});

app.get('/api/charts', (req, res) => {
  res.json([]);
});

app.get('/api/admin/users', (req, res) => {
  res.status(403).json({ error: 'Admin access required' });
});

app.get('/api/admin/files', (req, res) => {
  res.status(403).json({ error: 'Admin access required' });
});

app.get('/api/admin/charts', (req, res) => {
  res.status(403).json({ error: 'Admin access required' });
});

// TODO: Gradually add full authentication and database routes

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  
  if (error.message.includes('Only Excel files')) {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Excel Analytics Platform server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 Frontend dev server should be running on http://localhost:5173`);
  }
});