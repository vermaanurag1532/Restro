import express from 'express';
import customerController from '../Controller/Customer.controller.js';

const CustomerRouter = express.Router();

// Public routes with restaurantId param
CustomerRouter.post('/:restaurantId/login', customerController.login);
CustomerRouter.post('/:restaurantId', customerController.addCustomer);

// Protected routes with restaurantId param
CustomerRouter.get('/:restaurantId', customerController.getAllCustomers);
CustomerRouter.get('/:restaurantId/:id', customerController.getCustomerById);
CustomerRouter.put('/:restaurantId/:id', customerController.updateCustomer);
CustomerRouter.delete('/:restaurantId/:id', customerController.deleteCustomer);

export default CustomerRouter;
