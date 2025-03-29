import express from 'express';
import orderController from '../Controller/Order.controller.js';

const OrderRouter = express.Router();

OrderRouter.get('/', orderController.getAllOrders);
OrderRouter.get('/:id', orderController.getOrderById);
OrderRouter.get('/customer/:customerId', orderController.getOrdersByCustomerId);
OrderRouter.post('/', orderController.addOrder);
OrderRouter.put('/:id', orderController.updateOrder);
OrderRouter.delete('/:id', orderController.deleteOrder);

export default OrderRouter;