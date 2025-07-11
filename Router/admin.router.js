import express from 'express';
import AdminController from '../Controller/admin.controller.js';

const AdminRouter = express.Router();

AdminRouter.get('/:restaurantId', AdminController.getAdminsByRestaurant);
AdminRouter.get('/:restaurantId/Chefs', AdminController.getChefsByRestaurant);
AdminRouter.get('/:restaurantId/:adminId', AdminController.getAdminById);
AdminRouter.post('/:restaurantId', AdminController.createAdmin);
AdminRouter.put('/:restaurantId/:adminId', AdminController.updateAdmin);
AdminRouter.delete('/:restaurantId/:adminId', AdminController.deleteAdmin);
AdminRouter.post('/:restaurantId/login', AdminController.loginAdmin);

export default AdminRouter;