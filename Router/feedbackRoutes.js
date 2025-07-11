// routes/feedbackRoutes.js
import express from 'express';
import feedbackController from '../Controller/feedbackController.js';

const feedbackRouter = express.Router();


feedbackRouter.get('/:restaurantId', feedbackController.getAllFeedback);
feedbackRouter.get('/:restaurantId/:id', feedbackController.getFeedbackById);
feedbackRouter.post('/:restaurantId', feedbackController.createFeedback);
feedbackRouter.put('/:restaurantId/:id', feedbackController.updateFeedback);
feedbackRouter.delete('/:restaurantId/:id', feedbackController.deleteFeedback);
feedbackRouter.get('/:restaurantId/order/:orderId', feedbackController.getFeedbackByOrderId);
feedbackRouter.get('/:restaurantId/customer/:customerId', feedbackController.getFeedbackByCustomerId);


export default feedbackRouter;