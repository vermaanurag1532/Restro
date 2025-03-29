import express from 'express';
import dishController from '../Controller/Dish.controller.js';

const DishRouter = express.Router();

DishRouter.get('/', dishController.getAllDishes);
DishRouter.get('/:id', dishController.getDishById);
DishRouter.post('/', dishController.addDish);
DishRouter.put('/:id', dishController.updateDish);
DishRouter.delete('/:id', dishController.deleteDish);

export default DishRouter;