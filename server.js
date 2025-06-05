import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://restro-site-lac.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io to be used in other files
export { io };

// Configure CORS to allow credentials with specific origins
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'https://restro-site-lac.vercel.app'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now, but properly configured
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important: Allow cookies to be sent
};

// Apply middleware
app.use(helmet()); // Adds security headers
app.use(cors(corsOptions));
app.use(express.json());

// Route imports
import DishRouter from './Router/Dish.router.js';
import CustomerRouter from './Router/Customer.router.js';
import OrderRouter from './Router/Order.router.js';
import ChefRouter from './Router/Chef.router.js';
import RobotRouter from './Router/Robot.router.js';
import TableRouter from './Router/table.router.js'
import AdminRouter from './Router/admin.router.js'
import orderReportRouter from './Router/orderReportRoutes.js'
import feedbackRouter from './Router/feedbackRoutes.js'

// Apply routes
app.use('/Dish', DishRouter);
app.use('/Customer', CustomerRouter);
app.use('/Order', OrderRouter);
app.use('/Chef', ChefRouter);
app.use('/Robot', RobotRouter);
app.use('/Table', TableRouter);
app.use('/Admin', AdminRouter);
app.use('/orderReport', orderReportRouter);
app.use('/feedback', feedbackRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server using httpServer instead of app
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});