const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ===========================
// MIDDLEWARE CONFIGURATION
// ===========================

// Security middleware
app.use(helmet());

// CORS middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ===========================
// CUSTOM MIDDLEWARE
// ===========================

// Request timing middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===========================
// API ROUTES STRUCTURE
// ===========================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Products routes
app.use('/api/products', require('./routes/products'));

// Categories routes
app.use('/api/categories', require('./routes/categories'));

// Users/Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Orders routes
app.use('/api/orders', require('./routes/orders'));

// Cart routes
app.use('/api/cart', require('./routes/cart'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// ===========================
// ERROR HANDLING MIDDLEWARE
// ===========================

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
    timestamp: new Date().toISOString()
  });
});

// ===========================
// SERVER STARTUP
// ===========================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║     Wholesale Footwear Website Server Started          ║
    ║     Environment: ${process.env.NODE_ENV || 'development'}                          ║
    ║     Server: http://${HOST}:${PORT}                       ║
    ║     Time: ${new Date().toISOString()}              ║
    ╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
