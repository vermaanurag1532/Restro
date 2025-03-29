import express from 'express';
import customerController from '../Controller/Customer.controller.js';

const CustomerRouter = express.Router();

// Public routes
CustomerRouter.post('/login', customerController.login);
CustomerRouter.post('/', customerController.addCustomer);

// Protected routes (would add authentication middleware here)
CustomerRouter.get('/', customerController.getAllCustomers);
CustomerRouter.get('/:id', customerController.getCustomerById);
CustomerRouter.put('/:id', customerController.updateCustomer);
CustomerRouter.delete('/:id', customerController.deleteCustomer);

export default CustomerRouter;