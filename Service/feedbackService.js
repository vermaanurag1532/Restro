// services/feedbackService.js
import feedbackRepository from '../Repository/feedbackRepository.js';

class FeedbackService {
    async getAllFeedback() {
        try {
            return await feedbackRepository.getAll();
        } catch (error) {
            throw {
                success: false,
                message: 'Error retrieving feedback',
                error: error.message
            };
        }
    }

    async getFeedbackById(feedbackId) {
        try {
            if (!feedbackId) {
                throw new Error('Feedback ID is required');
            }

            const feedback = await feedbackRepository.getById(feedbackId);
            
            if (!feedback) {
                throw new Error('Feedback not found');
            }

            return {
                success: true,
                data: feedback,
                message: 'Feedback retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Error retrieving feedback',
                error: error.message
            };
        }
    }

    async createFeedback(feedbackData) {
        try {
            const { feedback, orderId, customerId } = feedbackData;

            // Validation
            if (!feedback) {
                throw new Error('Feedback content is required');
            }
            if (!orderId) {
                throw new Error('Order ID is required');
            }
            if (!customerId) {
                throw new Error('Customer ID is required');
            }

            // Generate next feedback ID (Fb-1, Fb-2, etc.)
            const feedbackId = await feedbackRepository.getNextFeedbackId();

            const newFeedback = await feedbackRepository.create({
                feedbackId,
                feedback,
                orderId,
                customerId
            });

            return {
                success: true,
                data: newFeedback,
                message: 'Feedback created successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Error creating feedback',
                error: error.message
            };
        }
    }

    async updateFeedback(feedbackId, feedbackData) {
        try {
            if (!feedbackId) {
                throw new Error('Feedback ID is required');
            }

            const { feedback, orderId, customerId } = feedbackData;

            // Validation
            if (!feedback && !orderId && !customerId) {
                throw new Error('At least one field is required for update');
            }

            // Check if feedback exists
            const existingFeedback = await feedbackRepository.getById(feedbackId);
            if (!existingFeedback) {
                throw new Error('Feedback not found');
            }

            // Prepare update data with existing values as fallback
            const updateData = {
                feedback: feedback || existingFeedback.Feedback,
                orderId: orderId || existingFeedback['Order Id'],
                customerId: customerId || existingFeedback['Customer Id']
            };

            const updatedFeedback = await feedbackRepository.update(feedbackId, updateData);

            return {
                success: true,
                data: updatedFeedback,
                message: 'Feedback updated successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Error updating feedback',
                error: error.message
            };
        }
    }

    async deleteFeedback(feedbackId) {
        try {
            if (!feedbackId) {
                throw new Error('Feedback ID is required');
            }

            // Check if feedback exists
            const existingFeedback = await feedbackRepository.getById(feedbackId);
            if (!existingFeedback) {
                throw new Error('Feedback not found');
            }

            const result = await feedbackRepository.delete(feedbackId);

            return {
                success: true,
                data: result,
                message: 'Feedback deleted successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Error deleting feedback',
                error: error.message
            };
        }
    }

    async getFeedbackByOrderId(orderId) {
        try {
            if (!orderId) {
                throw new Error('Order ID is required');
            }

            const feedback = await feedbackRepository.getByOrderId(orderId);

            return {
                success: true,
                data: feedback,
                message: 'Feedback retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Error retrieving feedback',
                error: error.message
            };
        }
    }

    async getFeedbackByCustomerId(customerId) {
        try {
            if (!customerId) {
                throw new Error('Customer ID is required');
            }

            const feedback = await feedbackRepository.getByCustomerId(customerId);

            return {
                success: true,
                data: feedback,
                message: 'Feedback retrieved successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.message || 'Error retrieving feedback',
                error: error.message
            };
        }
    }
}

export default new FeedbackService();