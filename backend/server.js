require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists on startup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security and CORS
// Configure helmet to allow serving files and prevent strict iframe/resource blocking in development
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*', // In production, replace with specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const clientRoutes = require('./routes/clientRoutes');
const contractRoutes = require('./routes/contractRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Map Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reports', reportRoutes);

// Database Auto Keep-Alive Hook (Public endpoint for external cron jobs)
const db = require('./services/supabase');
app.get('/api/cron/keep-alive', async (req, res) => {
  try {
    console.log('Keep-alive ping triggered from external API call.');
    let dbStatus = 'Mock';
    if (!db.isMock) {
      // Query database
      const vehicles = await db.query('vehicles', { limit: 1 });
      dbStatus = 'Supabase Active';
    }
    return res.status(200).json({
      status: 'success',
      message: 'Server and Database kept alive successfully.',
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Keep alive route error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to run keep-alive database ping.',
      error: error.message
    });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MAA Travels REST API Server',
    database_mode: db.isMock ? 'Mock Fallback JSON' : 'Supabase Live',
    time: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error caught:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`MAA Travels Server running on port ${PORT}`);
  console.log(`Database Status: ${db.isMock ? 'WARNING: Running in Local Fallback Mock mode.' : 'Success: Running on Supabase.'}`);
});
