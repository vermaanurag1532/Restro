import feedbackRepository from '../Repository/feedbackRepository.js';

class FeedbackService {
    async getAllFeedback(restaurantId) {
        try {
            return await feedbackRepository.getAll(restaurantId);
        } catch (error) {
            throw { success: false, message: 'Error retrieving feedback', error: error.message };
        }
    }

    async getFeedbackById(feedbackId, restaurantId) {
        try {
            const feedback = await feedbackRepository.getById(feedbackId, restaurantId);
            if (!feedback) throw new Error('Feedback not found');

            return { success: true, data: feedback, message: 'Feedback retrieved successfully' };
        } catch (error) {
            throw { success: false, message: error.message, error: error.message };
        }
    }

    async createFeedback(restaurantId, feedbackData) {
        const { feedback, orderId, customerId } = feedbackData;
        if (!feedback || !orderId || !customerId) throw new Error('Missing required fields');

        const feedbackId = await feedbackRepository.getNextFeedbackId();
        const newFeedback = await feedbackRepository.create({
            restaurantId,
            feedbackId,
            feedback,
            orderId,
            customerId
        });

        return { success: true, data: newFeedback, message: 'Feedback created successfully' };
    }

    async updateFeedback(feedbackId, feedbackData, restaurantId) {
        const existingFeedback = await feedbackRepository.getById(feedbackId, restaurantId);
        if (!existingFeedback) throw new Error('Feedback not found');

        const updateData = {
            feedback: feedbackData.feedback || existingFeedback.Feedback,
            orderId: feedbackData.orderId || existingFeedback['Order Id'],
            customerId: feedbackData.customerId || existingFeedback['Customer Id']
        };

        const updatedFeedback = await feedbackRepository.update(feedbackId, updateData, restaurantId);
        return { success: true, data: updatedFeedback, message: 'Feedback updated successfully' };
    }

    async deleteFeedback(feedbackId, restaurantId) {
        const existingFeedback = await feedbackRepository.getById(feedbackId, restaurantId);
        if (!existingFeedback) throw new Error('Feedback not found');

        const result = await feedbackRepository.delete(feedbackId, restaurantId);
        return { success: true, data: result, message: 'Feedback deleted successfully' };
    }

    async getFeedbackByOrderId(orderId, restaurantId) {
        const feedback = await feedbackRepository.getByOrderId(orderId, restaurantId);
        return { success: true, data: feedback, message: 'Feedback retrieved successfully' };
    }

    async getFeedbackByCustomerId(customerId, restaurantId) {
        const feedback = await feedbackRepository.getByCustomerId(customerId, restaurantId);
        return { success: true, data: feedback, message: 'Feedback retrieved successfully' };
    }
}

export default new FeedbackService();
