import express from 'express';
import cors from 'cors';
import DishRouter from './Router/Dish.router.js'
import CustomerRouter from './Router/Customer.router.js'
import OrderRouter from './Router/Order.router.js'
import ChefRouter from './Router/Chef.router.js'
import RobotRouter from './Router/Robot.router.js'

const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/Dish', DishRouter);
app.use('/Customer', CustomerRouter);
app.use('/Order', OrderRouter);
app.use('/Chef', ChefRouter);
app.use('/Robot', RobotRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
