import express from 'express';
import RestaurantController from '../Controller/restaurant.controller.js';

const RestaurantRouter = express.Router();

RestaurantRouter.get('/', RestaurantController.getAll);
RestaurantRouter.post('/', RestaurantController.create);
RestaurantRouter.put('/:id', RestaurantController.update);
RestaurantRouter.delete('/:id', RestaurantController.delete);

export default RestaurantRouter;
