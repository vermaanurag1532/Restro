// routes/feedbackRoutes.js
import express from 'express';
import feedbackController from '../Controller/feedbackController.js';

const feedbackRouter = express.Router();


feedbackRouter.get('/', feedbackController.getAllFeedback);
feedbackRouter.get('/:id', feedbackController.getFeedbackById);
feedbackRouter.post('/', feedbackController.createFeedback);
feedbackRouter.put('/:id', feedbackController.updateFeedback);
feedbackRouter.delete('/:id', feedbackController.deleteFeedback);
feedbackRouter.get('/order/:orderId', feedbackController.getFeedbackByOrderId);
feedbackRouter.get('/customer/:customerId', feedbackController.getFeedbackByCustomerId);

export default feedbackRouter;