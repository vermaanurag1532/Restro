// Chef.router.js
import express from 'express';
import chefController from '../Controller/Chef.controller.js';

const ChefRouter = express.Router();

// Use Restaurant Id from the route
ChefRouter.post('/:restaurantId/login', chefController.login);
ChefRouter.get('/:restaurantId/', chefController.getAllChefs);
ChefRouter.get('/:restaurantId/:id', chefController.getChefById);
ChefRouter.post('/:restaurantId/', chefController.addChef);
ChefRouter.put('/:restaurantId/:id', chefController.updateChef);
ChefRouter.delete('/:restaurantId/:id', chefController.deleteChef);

export default ChefRouter;
