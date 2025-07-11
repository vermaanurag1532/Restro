import express from 'express';
import orderController from '../Controller/Order.controller.js';

const OrderRouter = express.Router();

// Updated routes to include :restaurantId param
OrderRouter.get('/:restaurantId', orderController.getAllOrders);
OrderRouter.get('/:restaurantId/:id', orderController.getOrderById);
OrderRouter.get('/:restaurantId/customer/:customerId', orderController.getOrdersByCustomerId);
OrderRouter.post('/:restaurantId', orderController.addOrder);
OrderRouter.put('/:restaurantId/:id', orderController.updateOrder);
OrderRouter.delete('/:restaurantId/:id', orderController.deleteOrder);

export default OrderRouter;
