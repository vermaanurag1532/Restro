import connection from '../Connection/Connection.js';

class FeedbackRepository {
    async getAll(restaurantId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Restaurant Id` = ?';
            connection.query(query, [restaurantId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async getById(feedbackId, restaurantId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Feedback Id` = ? AND `Restaurant Id` = ?';
            connection.query(query, [feedbackId, restaurantId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
    }

    async create({ restaurantId, feedbackId, feedback, orderId, customerId }) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO Feedback (`Restaurant Id`, `Feedback Id`, `Feedback`, `Order Id`, `Customer Id`) VALUES (?, ?, ?, ?, ?)';
            connection.query(query, [restaurantId, feedbackId, feedback, orderId, customerId], (err, results) => {
                if (err) reject(err);
                else resolve({ feedbackId, feedback, orderId, customerId, restaurantId });
            });
        });
    }

    async update(feedbackId, feedbackData, restaurantId) {
        return new Promise((resolve, reject) => {
            const { feedback, orderId, customerId } = feedbackData;
            const query = 'UPDATE Feedback SET `Feedback` = ?, `Order Id` = ?, `Customer Id` = ? WHERE `Feedback Id` = ? AND `Restaurant Id` = ?';
            connection.query(query, [feedback, orderId, customerId, feedbackId, restaurantId], (err, results) => {
                if (err) reject(err);
                else if (results.affectedRows === 0) reject(new Error('Feedback not found'));
                else resolve({ feedbackId, ...feedbackData, restaurantId });
            });
        });
    }

    async delete(feedbackId, restaurantId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM Feedback WHERE `Feedback Id` = ? AND `Restaurant Id` = ?';
            connection.query(query, [feedbackId, restaurantId], (err, results) => {
                if (err) reject(err);
                else if (results.affectedRows === 0) reject(new Error('Feedback not found'));
                else resolve({ message: 'Feedback deleted successfully' });
            });
        });
    }

    async getByOrderId(orderId, restaurantId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Order Id` = ? AND `Restaurant Id` = ?';
            connection.query(query, [orderId, restaurantId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async getByCustomerId(customerId, restaurantId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Feedback WHERE `Customer Id` = ? AND `Restaurant Id` = ?';
            connection.query(query, [customerId, restaurantId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async getNextFeedbackId() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM Feedback';
            connection.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(`Fb-${results[0].count + 1}`);
            });
        });
    }
}

export default new FeedbackRepository();
