// controllers/feedbackController.js
import feedbackService from '../Service/feedbackService.js';

class FeedbackController {
    // Get all feedback
    async getAllFeedback(req, res) {
        try {
            const result = await feedbackService.getAllFeedback();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error',
                error: error.error
            });
        }
    }

    // Get feedback by ID
    async getFeedbackById(req, res) {
        try {
            const { id } = req.params;
            const result = await feedbackService.getFeedbackById(id);
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message === 'Feedback not found' ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error retrieving feedback',
                error: error.error
            });
        }
    }

    // Create new feedback
    async createFeedback(req, res) {
        try {
            const feedbackData = req.body;
            const result = await feedbackService.createFeedback(feedbackData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error creating feedback',
                error: error.error
            });
        }
    }

    // Update feedback
    async updateFeedback(req, res) {
        try {
            const { id } = req.params;
            const feedbackData = req.body;
            const result = await feedbackService.updateFeedback(id, feedbackData);
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message === 'Feedback not found' ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error updating feedback',
                error: error.error
            });
        }
    }

    // Delete feedback
    async deleteFeedback(req, res) {
        try {
            const { id } = req.params;
            const result = await feedbackService.deleteFeedback(id);
            res.status(200).json(result);
        } catch (error) {
            const statusCode = error.message === 'Feedback not found' ? 404 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Error deleting feedback',
                error: error.error
            });
        }
    }

    // Get feedback by Order ID
    async getFeedbackByOrderId(req, res) {
        try {
            const { orderId } = req.params;
            const result = await feedbackService.getFeedbackByOrderId(orderId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error retrieving feedback',
                error: error.error
            });
        }
    }

    // Get feedback by Customer ID
    async getFeedbackByCustomerId(req, res) {
        try {
            const { customerId } = req.params;
            const result = await feedbackService.getFeedbackByCustomerId(customerId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Error retrieving feedback',
                error: error.error
            });
        }
    }
}

export default new FeedbackController();