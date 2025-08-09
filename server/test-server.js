const express = require('express');
const app = express();
const PORT = 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server running' });
});

try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Server startup error:', error);
}