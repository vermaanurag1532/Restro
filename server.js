import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://restro-site-lac.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle real-time business insights updates
  socket.on('subscribe-insights', (data) => {
    console.log('Client subscribed to insights:', data);
    socket.join('business-insights');
  });
  
  socket.on('unsubscribe-insights', () => {
    socket.leave('business-insights');
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io to be used in other files
export { io };

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain endpoints
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/insights/health-check';
  }
});

// Configure CORS to allow credentials with specific origins
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://restro-site-lac.vercel.app',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-request-id',
    'Accept',
    'Origin'
  ],
  credentials: true
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Apply rate limiting
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-request-id'] || Date.now().toString();
  req.requestId = requestId;
  
  if (process.env.ENABLE_LOGGING !== 'false') {
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Request ID: ${requestId}`);
  }
  
  // Add response logging
  const originalSend = res.send;
  res.send = function(data) {
    if (process.env.ENABLE_LOGGING !== 'false') {
      console.log(`[${timestamp}] Response ${res.statusCode} - Request ID: ${requestId}`);
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log('Created reports directory:', reportsDir);
}

// Serve static files for PDF reports
app.use('/reports', express.static(reportsDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'Connected',
      websocket: 'Active',
      ai: process.env.GOOGLE_API_KEY ? 'Configured' : 'Not Configured',
      reports: fs.existsSync(reportsDir) ? 'Available' : 'Not Available'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Route imports
import DishRouter from './Router/Dish.router.js';
import CustomerRouter from './Router/Customer.router.js';
import OrderRouter from './Router/Order.router.js';
import ChefRouter from './Router/Chef.router.js';
import RobotRouter from './Router/Robot.router.js';
import TableRouter from './Router/table.router.js';
import AdminRouter from './Router/admin.router.js';
import orderReportRouter from './Router/orderReportRoutes.js';
import feedbackRouter from './Router/feedbackRoutes.js';
import businessInsightsRoutes from './Router/businessInsightsRoutes.js'
import RobotCallRouter from './Router/robotCall.router.js'
import RestaurantRouter from './Router/restaurant.routes.js'

// Apply existing routes
app.use('/Dish', DishRouter);
app.use('/Customer', CustomerRouter);
app.use('/Order', OrderRouter);
app.use('/Chef', ChefRouter);
app.use('/Robot', RobotRouter);
app.use('/Table', TableRouter);
app.use('/Admin', AdminRouter);
app.use('/orderReport', orderReportRouter);
app.use('/feedback', feedbackRouter);
app.use('/api/robot-call', RobotCallRouter);
app.use('/Restaurant', RestaurantRouter);

// Apply Business Insights routes
app.use('/api/insights', businessInsightsRoutes);

// Root endpoint with comprehensive API documentation
app.get('/businessInsights', (req, res) => {
  res.json({
    message: 'RedLinear Restaurant Management API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: {
      baseUrl: `${req.protocol}://${req.get('host')}`,
      endpoints: {
        // Existing endpoints
        dishes: 'GET,POST,PUT,DELETE /Dish',
        customers: 'GET,POST,PUT,DELETE /Customer',
        orders: 'GET,POST,PUT,DELETE /Order',
        chefs: 'GET,POST,PUT,DELETE /Chef',
        robots: 'GET,POST,PUT,DELETE /Robot',
        tables: 'GET,POST,PUT,DELETE /Table',
        admin: 'GET,POST,PUT,DELETE /Admin',
        orderReports: 'GET /orderReport',
        feedback: 'GET,POST /feedback',
        
        // New Business Insights endpoints
        businessInsights: {
          comprehensive: 'GET /api/insights?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          pdf: 'GET /api/insights/pdf?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          quick: 'GET /api/insights/quick',
          healthScore: 'GET /api/insights/health-score',
          recommendations: 'GET /api/insights/recommendations?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          revenue: 'GET /api/insights/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          customers: 'GET /api/insights/customers?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          operations: 'GET /api/insights/operations?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
          healthCheck: 'GET /api/insights/health-check'
        }
      },
      features: {
        websocket: 'Real-time updates available via Socket.IO',
        ai: 'Gemini AI integration for business insights',
        reports: 'PDF report generation with charts',
        analytics: 'Comprehensive business analytics',
        security: 'Helmet, CORS, Rate limiting',
        monitoring: 'Health checks and logging'
      },
      examples: {
        quickInsights: `${req.protocol}://${req.get('host')}/api/insights/quick`,
        monthlyReport: `${req.protocol}://${req.get('host')}/api/insights?startDate=2023-01-01&endDate=2023-01-31`,
        pdfDownload: `${req.protocol}://${req.get('host')}/api/insights/pdf?startDate=2023-01-01&endDate=2023-01-31`,
        healthCheck: `${req.protocol}://${req.get('host')}/health`
      }
    },
    websocket: {
      url: `ws://${req.get('host')}`,
      events: ['subscribe-insights', 'unsubscribe-insights'],
      namespaces: ['business-insights']
    }
  });
});

// Socket.IO integration for real-time insights updates
export const broadcastInsightsUpdate = (data) => {
  io.to('business-insights').emit('insights-updated', {
    timestamp: new Date().toISOString(),
    data
  });
};

// Middleware to attach socket.io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    requestedPath: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /',
      'GET,POST,PUT,DELETE /Dish',
      'GET,POST,PUT,DELETE /Customer',
      'GET,POST,PUT,DELETE /Order',
      'GET,POST,PUT,DELETE /Chef',
      'GET,POST,PUT,DELETE /Robot',
      'GET,POST,PUT,DELETE /Table',
      'GET,POST,PUT,DELETE /Admin',
      'GET /orderReport',
      'GET,POST /feedback',
      'GET /api/insights/*'
    ],
    documentation: `${req.protocol}://${req.get('host')}/`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = req.requestId || 'unknown';
  
  console.error(`[${timestamp}] Error in request ${requestId}:`, err);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: err.message,
      requestId,
      timestamp
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access',
      requestId,
      timestamp
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      limit: process.env.MAX_REQUEST_SIZE || '10mb',
      requestId,
      timestamp
    });
  }
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      origin: req.headers.origin,
      requestId,
      timestamp
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId,
    timestamp
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    
    // Close database connections if any
    // connection.end();
    
    // Close other services
    io.close(() => {
      console.log('Socket.IO server closed');
      console.log('Process terminated');
      process.exit(0);
    });
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server using httpServer instead of app
httpServer.listen(PORT, () => {
  console.log('\n🚀 RedLinear Restaurant Server Started Successfully!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`🔌 WebSocket server: ws://localhost:${PORT}`);
  console.log(`🤖 Gemini AI: ${process.env.GOOGLE_API_KEY ? '✅ Configured' : '❌ Not Configured'}`);
  console.log(`📈 Business Insights: http://localhost:${PORT}/api/insights/health-check`);
  console.log(`📄 PDF Reports: ${fs.existsSync(reportsDir) ? '✅ Available' : '❌ Directory not found'}`);
  
  if (!process.env.GOOGLE_API_KEY) {
    console.warn('\n⚠️  Warning: GOOGLE_API_KEY not found.');
    console.warn('   Business insights with AI analysis will not work.');
    console.warn('   Please set GOOGLE_API_KEY in your .env file.');
  }
  
  console.log('\n📋 Available Business Insights Endpoints:');
  console.log('   • GET /api/insights/quick - Quick dashboard insights');
  console.log('   • GET /api/insights/pdf - Download comprehensive PDF report');
  console.log('   • GET /api/insights/health-score - Business health assessment');
  console.log('   • GET /api/insights/recommendations - AI-powered recommendations');
  console.log('   • GET /api/insights/revenue - Revenue analytics');
  console.log('   • GET /api/insights/customers - Customer analytics');
  console.log('   • GET /api/insights/operations - Operational insights');
  
  console.log('\n🎯 Ready to serve business insights! 📊\n');
});

export default app;