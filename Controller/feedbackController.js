import feedbackService from '../Service/feedbackService.js';

class FeedbackController {
    async getAllFeedback(req, res) {
        try {
            const { restaurantId } = req.params;
            const result = await feedbackService.getAllFeedback(restaurantId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message, error: error.error });
        }
    }

    async getFeedbackById(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const result = await feedbackService.getFeedbackById(id, restaurantId);
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message === 'Feedback not found' ? 404 : 400;
            res.status(statusCode).json({ success: false, message: error.message, error: error.error });
        }
    }

    async createFeedback(req, res) {
        try {
            const { restaurantId } = req.params;
            const feedbackData = req.body;
            const result = await feedbackService.createFeedback(restaurantId, feedbackData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message, error: error.error });
        }
    }

    async updateFeedback(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const feedbackData = req.body;
            const result = await feedbackService.updateFeedback(id, feedbackData, restaurantId);
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message === 'Feedback not found' ? 404 : 400;
            res.status(statusCode).json({ success: false, message: error.message, error: error.error });
        }
    }

    async deleteFeedback(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const result = await feedbackService.deleteFeedback(id, restaurantId);
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message === 'Feedback not found' ? 404 : 400;
            res.status(statusCode).json({ success: false, message: error.message, error: error.error });
        }
    }

    async getFeedbackByOrderId(req, res) {
        try {
            const { restaurantId, orderId } = req.params;
            const result = await feedbackService.getFeedbackByOrderId(orderId, restaurantId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message, error: error.error });
        }
    }

    async getFeedbackByCustomerId(req, res) {
        try {
            const { restaurantId, customerId } = req.params;
            const result = await feedbackService.getFeedbackByCustomerId(customerId, restaurantId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message, error: error.error });
        }
    }
}

export default new FeedbackController();
