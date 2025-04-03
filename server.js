import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration allowing all origins
const corsOptions = {
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply middleware
app.use(helmet()); // Adds various security headers
app.use(cors(corsOptions));
app.use(express.json());

// Route imports
import DishRouter from './Router/Dish.router.js'
import CustomerRouter from './Router/Customer.router.js'
import OrderRouter from './Router/Order.router.js'
import ChefRouter from './Router/Chef.router.js'
import RobotRouter from './Router/Robot.router.js'

// Apply routes
app.use('/Dish', DishRouter);
app.use('/Customer', CustomerRouter);
app.use('/Order', OrderRouter);
app.use('/Chef', ChefRouter);
app.use('/Robot', RobotRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});