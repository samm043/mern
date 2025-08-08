const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { storage } = require('./storage');
const { setupAuth, requireAuth, requireAdmin } = require('./auth');
const ExcelProcessor = require('./excel-processor');
const { insertExcelFileSchema, insertChartSchema } = require('../shared/schema');

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype) || 
        file.originalname.match(/\.(xlsx|xls)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

function registerRoutes(app) {
  // Set up authentication routes
  setupAuth(app);

  // File upload endpoint
  app.post('/api/upload', requireAuth, upload.single('excelFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Process Excel file
      const processedData = ExcelProcessor.processExcelFile(req.file.path);
      
      // Save file info to database
      const fileData = {
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        sheets: processedData.sheetNames,
        columns: processedData.columns,
        rowCount: processedData.totalRowCount
      };

      const savedFile = await storage.createExcelFile(fileData);
      
      res.json({
        file: savedFile,
        sheets: processedData.sheets,
        summary: {
          totalSheets: processedData.sheetNames.length,
          totalRows: processedData.totalRowCount,
          sheetNames: processedData.sheetNames
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: error.message || 'File upload failed' });
    }
  });

  // Get user's uploaded files
  app.get('/api/files', requireAuth, async (req, res) => {
    try {
      const files = await storage.getUserExcelFiles(req.user.id);
      res.json(files);
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
    }
  });

  // Get specific file details
  app.get('/api/files/:id', requireAuth, async (req, res) => {
    try {
      const file = await storage.getExcelFile(req.params.id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Check ownership
      if (file.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get detailed file analysis
      const processedData = ExcelProcessor.processExcelFile(file.filePath);
      
      res.json({
        file,
        sheets: processedData.sheets,
        analysis: processedData.sheetNames.map(sheetName => 
          ExcelProcessor.generateSummaryStats(file.filePath, sheetName)
        )
      });
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ error: 'Failed to retrieve file details' });
    }
  });

  // Create chart from Excel data
  app.post('/api/charts', requireAuth, async (req, res) => {
    try {
      const { fileId, title, chartType, xAxis, yAxis, sheetName, is3D, zAxis } = req.body;
      
      // Get file
      const file = await storage.getExcelFile(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Check ownership
      if (file.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Generate chart data
      let chartData;
      if (is3D) {
        chartData = ExcelProcessor.generate3DChartData(file.filePath, sheetName, xAxis, yAxis, zAxis);
      } else {
        chartData = ExcelProcessor.extractChartData(file.filePath, sheetName, xAxis, yAxis);
      }

      // Save chart
      const chartRecord = await storage.createChart({
        userId: req.user.id,
        fileId,
        title,
        chartType,
        xAxis,
        yAxis,
        sheetName,
        chartData,
        chartOptions: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: title
            },
            legend: {
              display: true
            }
          }
        },
        is3D: !!is3D
      });

      res.json({
        chart: chartRecord,
        data: chartData
      });
    } catch (error) {
      console.error('Create chart error:', error);
      res.status(500).json({ error: error.message || 'Failed to create chart' });
    }
  });

  // Get user's charts
  app.get('/api/charts', requireAuth, async (req, res) => {
    try {
      const charts = await storage.getUserCharts(req.user.id);
      res.json(charts);
    } catch (error) {
      console.error('Get charts error:', error);
      res.status(500).json({ error: 'Failed to retrieve charts' });
    }
  });

  // Get specific chart
  app.get('/api/charts/:id', requireAuth, async (req, res) => {
    try {
      const chart = await storage.getChart(req.params.id);
      if (!chart) {
        return res.status(404).json({ error: 'Chart not found' });
      }
      
      // Check ownership
      if (chart.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(chart);
    } catch (error) {
      console.error('Get chart error:', error);
      res.status(500).json({ error: 'Failed to retrieve chart' });
    }
  });

  // Update chart
  app.put('/api/charts/:id', requireAuth, async (req, res) => {
    try {
      const chart = await storage.getChart(req.params.id);
      if (!chart) {
        return res.status(404).json({ error: 'Chart not found' });
      }
      
      // Check ownership
      if (chart.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { title, chartOptions } = req.body;
      const updatedChart = await storage.updateChart(req.params.id, {
        title,
        chartOptions
      });

      res.json(updatedChart);
    } catch (error) {
      console.error('Update chart error:', error);
      res.status(500).json({ error: 'Failed to update chart' });
    }
  });

  // Delete chart
  app.delete('/api/charts/:id', requireAuth, async (req, res) => {
    try {
      const chart = await storage.getChart(req.params.id);
      if (!chart) {
        return res.status(404).json({ error: 'Chart not found' });
      }
      
      // Check ownership
      if (chart.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      await storage.deleteChart(req.params.id);
      res.json({ message: 'Chart deleted successfully' });
    } catch (error) {
      console.error('Delete chart error:', error);
      res.status(500).json({ error: 'Failed to delete chart' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  app.get('/api/admin/files', requireAdmin, async (req, res) => {
    try {
      const files = await storage.getAllExcelFiles();
      res.json(files);
    } catch (error) {
      console.error('Get all files error:', error);
      res.status(500).json({ error: 'Failed to retrieve files' });
    }
  });

  app.get('/api/admin/charts', requireAdmin, async (req, res) => {
    try {
      const charts = await storage.getAllCharts();
      res.json(charts);
    } catch (error) {
      console.error('Get all charts error:', error);
      res.status(500).json({ error: 'Failed to retrieve charts' });
    }
  });

  app.put('/api/admin/users/:id/deactivate', requireAdmin, async (req, res) => {
    try {
      const user = await storage.deactivateUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    try {
      const userFiles = await storage.getUserExcelFiles(req.user.id);
      const userCharts = await storage.getUserCharts(req.user.id);
      
      const stats = {
        totalFiles: userFiles.length,
        totalCharts: userCharts.length,
        totalRows: userFiles.reduce((sum, file) => sum + file.rowCount, 0),
        recentFiles: userFiles.slice(0, 5),
        recentCharts: userCharts.slice(0, 5),
        chartTypes: userCharts.reduce((acc, chart) => {
          acc[chart.chartType] = (acc[chart.chartType] || 0) + 1;
          return acc;
        }, {})
      };

      if (req.user.role === 'admin') {
        const allUsers = await storage.getAllUsers();
        const allFiles = await storage.getAllExcelFiles();
        const allCharts = await storage.getAllCharts();
        
        stats.adminStats = {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.isActive).length,
          totalSystemFiles: allFiles.length,
          totalSystemCharts: allCharts.length,
          totalSystemRows: allFiles.reduce((sum, file) => sum + file.rowCount, 0)
        };
      }

      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve dashboard stats' });
    }
  });

  return app;
}

module.exports = { registerRoutes };