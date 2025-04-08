import express from 'express';
import AdminController from '../Controller/admin.controller.js';

const AdminRouter = express.Router();

AdminRouter.get('/', AdminController.getAllAdmins);
AdminRouter.get('/:id', AdminController.getAdminById);
AdminRouter.post('/', AdminController.createAdmin);
AdminRouter.put('/:id', AdminController.updateAdmin);
AdminRouter.delete('/:id', AdminController.deleteAdmin);

export default AdminRouter;
