import express from 'express';
import chefController from '../Controller/Chef.controller.js';

const ChefRouter = express.Router();

// Public routes
ChefRouter.post('/login', chefController.login);

// Protected routes
ChefRouter.get('/', chefController.getAllChefs);
ChefRouter.get('/:id', chefController.getChefById);
ChefRouter.post('/', chefController.addChef);
ChefRouter.put('/:id', chefController.updateChef);
ChefRouter.delete('/:id', chefController.deleteChef);

export default ChefRouter;