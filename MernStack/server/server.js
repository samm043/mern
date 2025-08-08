const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Excel Analytics Platform API' });
});

// Authentication endpoints (mock for now)
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, fullName } = req.body;
  
  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Mock successful registration
  res.status(201).json({
    id: Date.now(),
    username,
    email,
    fullName,
    role: 'user',
    token: 'mock-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Mock successful login
  if (email === 'admin@test.com' && password === 'admin123') {
    return res.json({
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin',
      token: 'mock-admin-token'
    });
  }
  
  if (email === 'user@test.com' && password === 'user123') {
    return res.json({
      id: 2,
      username: 'user',
      email: 'user@test.com',
      fullName: 'Test User',
      role: 'user',
      token: 'mock-user-token'
    });
  }
  
  res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/user', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  if (token === 'mock-admin-token') {
    return res.json({
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin'
    });
  }
  
  if (token === 'mock-user-token') {
    return res.json({
      id: 2,
      username: 'user',
      email: 'user@test.com',
      fullName: 'Test User',
      role: 'user'
    });
  }
  
  res.status(401).json({ error: 'Invalid token' });
});

// Dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalFiles: 3,
    totalCharts: 5,
    totalUsers: 12,
    recentFiles: [
      { id: 1, filename: 'sales-data.xlsx', uploadedAt: new Date().toISOString() },
      { id: 2, filename: 'inventory.xlsx', uploadedAt: new Date().toISOString() }
    ],
    recentCharts: [
      { id: 1, title: 'Sales Trend', chartType: 'line', createdAt: new Date().toISOString() },
      { id: 2, title: 'Revenue by Region', chartType: 'bar', createdAt: new Date().toISOString() }
    ],
    chartTypes: { bar: 2, line: 1, pie: 2 }
  });
});

// File management endpoints
app.get('/api/files', (req, res) => {
  res.json([
    { 
      id: 1, 
      filename: 'sales-data.xlsx',
      originalName: 'Sales Data Q4.xlsx',
      fileSize: 1024000,
      sheets: ['Sheet1', 'Summary'],
      rowCount: 500,
      uploadedAt: new Date().toISOString()
    },
    { 
      id: 2, 
      filename: 'inventory.xlsx',
      originalName: 'Inventory Report.xlsx',
      fileSize: 512000,
      sheets: ['Products', 'Categories'],
      rowCount: 250,
      uploadedAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Mock file processing
  const fileInfo = {
    id: Date.now(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    sheets: ['Sheet1', 'Sheet2'], // Mock sheet detection
    columns: {
      'Sheet1': ['Column A', 'Column B', 'Column C'],
      'Sheet2': ['Name', 'Value', 'Date']
    },
    rowCount: 100, // Mock row count
    uploadedAt: new Date().toISOString()
  };
  
  res.json(fileInfo);
});

app.delete('/api/files/:id', (req, res) => {
  const fileId = req.params.id;
  res.json({ message: `File ${fileId} deleted successfully` });
});

// Chart management endpoints
app.get('/api/charts', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Sales Trend',
      chartType: 'line',
      xAxis: 'Date',
      yAxis: 'Revenue',
      sheetName: 'Sheet1',
      is3D: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Revenue Distribution',
      chartType: '3d-bar',
      xAxis: 'Region',
      yAxis: 'Amount',
      sheetName: 'Summary',
      is3D: true,
      createdAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/charts', (req, res) => {
  const { title, chartType, xAxis, yAxis, sheetName, fileId } = req.body;
  
  if (!title || !chartType || !xAxis || !yAxis || !sheetName || !fileId) {
    return res.status(400).json({ error: 'All chart parameters are required' });
  }
  
  const chartData = {
    id: Date.now(),
    title,
    chartType,
    xAxis,
    yAxis,
    sheetName,
    fileId: parseInt(fileId),
    is3D: chartType.includes('3d'),
    chartData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [{
        label: title,
        data: [12, 19, 3, 5, 2],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FF6384']
      }]
    },
    chartOptions: {
      responsive: true,
      plugins: {
        title: { display: true, text: title },
        legend: { position: 'top' }
      }
    },
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(chartData);
});

app.delete('/api/charts/:id', (req, res) => {
  const chartId = req.params.id;
  res.json({ message: `Chart ${chartId} deleted successfully` });
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  // Check for admin token (simplified)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes('admin-token')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  res.json([
    {
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      username: 'user',
      email: 'user@test.com',
      fullName: 'Test User',
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);
});

app.get('/api/admin/files', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes('admin-token')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  res.json([
    { 
      id: 1, 
      filename: 'sales-data.xlsx',
      userId: 2,
      userEmail: 'user@test.com',
      fileSize: 1024000,
      uploadedAt: new Date().toISOString()
    }
  ]);
});

app.get('/api/admin/charts', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes('admin-token')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  res.json([
    {
      id: 1,
      title: 'Sales Trend',
      userId: 2,
      userEmail: 'user@test.com',
      chartType: 'line',
      createdAt: new Date().toISOString()
    }
  ]);
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Excel Analytics Platform API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Test credentials:');
  console.log('  Admin: admin@test.com / admin123');
  console.log('  User: user@test.com / user123');
});