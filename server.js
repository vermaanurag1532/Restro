import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// More secure CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://restro-site-lac.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply middleware
app.use(helmet()); // Adds various security headers
app.use(cors(corsOptions));
app.use(express.json());

// Your existing route imports remain the same
import DishRouter from './Router/Dish.router.js'
import CustomerRouter from './Router/Customer.router.js'
import OrderRouter from './Router/Order.router.js'
import ChefRouter from './Router/Chef.router.js'
import RobotRouter from './Router/Robot.router.js'

app.use('/Dish', DishRouter);
app.use('/Customer', CustomerRouter);
app.use('/Order', OrderRouter);
app.use('/Chef', ChefRouter);
app.use('/Robot', RobotRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});