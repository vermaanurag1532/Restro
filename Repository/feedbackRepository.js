// repositories/feedbackRepository.js
import connection from '../Connection/Connection.js';

class FeedbackRepository {
    // Get all feedback
    async getAll() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback';
            connection.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // Get feedback by ID
    async getById(feedbackId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Feedback Id` = ?';
            connection.query(query, [feedbackId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            });
        });
    }

    // Create new feedback
    async create(feedbackData) {
        return new Promise((resolve, reject) => {
            const { feedbackId, feedback, orderId, customerId } = feedbackData;
            const query = 'INSERT INTO Feedback (`Feedback Id`, `Feedback`, `Order Id`, `Customer Id`) VALUES (?, ?, ?, ?)';
            connection.query(query, [feedbackId, feedback, orderId, customerId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ feedbackId, ...feedbackData });
                }
            });
        });
    }

    // Update feedback
    async update(feedbackId, feedbackData) {
        return new Promise((resolve, reject) => {
            const { feedback, orderId, customerId } = feedbackData;
            const query = 'UPDATE Feedback SET `Feedback` = ?, `Order Id` = ?, `Customer Id` = ? WHERE `Feedback Id` = ?';
            connection.query(query, [feedback, orderId, customerId, feedbackId], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.affectedRows === 0) {
                    reject(new Error('Feedback not found'));
                } else {
                    resolve({ feedbackId, ...feedbackData });
                }
            });
        });
    }

    // Delete feedback
    async delete(feedbackId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM Feedback WHERE `Feedback Id` = ?';
            connection.query(query, [feedbackId], (err, results) => {
                if (err) {
                    reject(err);
                } else if (results.affectedRows === 0) {
                    reject(new Error('Feedback not found'));
                } else {
                    resolve({ message: 'Feedback deleted successfully' });
                }
            });
        });
    }

    // Get feedback by Order ID
    async getByOrderId(orderId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Order Id` = ?';
            connection.query(query, [orderId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // Get feedback by Customer ID
    async getByCustomerId(customerId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Customer Id` = ?';
            connection.query(query, [customerId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    // Get the next feedback ID number
    async getNextFeedbackId() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM Feedback';
            connection.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const count = results[0].count;
                    const nextId = `Fb-${count + 1}`;
                    resolve(nextId);
                }
            });
        });
    }
}

export default new FeedbackRepository();