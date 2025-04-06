import connection from '../Connection/Connection.js';

class OrderRepository {
    async getNextOrderId() {
        const query = 'SELECT MAX(CAST(SUBSTRING(`Order Id`, 7) AS UNSIGNED)) as maxId FROM `Order`';
        const [rows] = await connection.promise().query(query);
        const maxId = rows[0].maxId || 0;
        return `ORDER-${maxId + 1}`;
    }

    safeJsonParse(jsonString) {
        try {
            if (!jsonString || jsonString === 'null') return [];
            if (Array.isArray(jsonString)) return jsonString;
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
            if (typeof jsonString === 'string') {
                return jsonString.trim() ? [jsonString] : [];
            }
            return [];
        }
    }

    async getAllOrders() {
        const query = 'SELECT * FROM `Order`';
        const [rows] = await connection.promise().query(query);
        return rows.map(row => ({
            ...row,
            Dishes: this.safeJsonParse(row.Dishes)
        }));
    }

    async getOrderById(orderId) {
        const query = 'SELECT * FROM `Order` WHERE `Order Id` = ?';
        const [rows] = await connection.promise().query(query, [orderId]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            Dishes: this.safeJsonParse(rows[0].Dishes)
        };
    }

    async getOrdersByCustomerId(customerId) {
        const query = 'SELECT * FROM `Order` WHERE `Customer Id` = ?';
        const [rows] = await connection.promise().query(query, [customerId]);
        return rows.map(row => ({
            ...row,
            Dishes: this.safeJsonParse(row.Dishes)
        }));
    }

    async addOrder(orderData) {
        const newOrderId = await this.getNextOrderId();
        const processedData = {
            ...orderData,
            'Order Id': newOrderId,
            Dishes: JSON.stringify(orderData.Dishes || [])
        };
        
        const query = 'INSERT INTO `Order` SET ?';
        const [result] = await connection.promise().query(query, [processedData]);
        return { ...orderData, 'Order Id': newOrderId };
    }

    async updateOrder(orderId, orderData) {
        if (orderData['Order Id']) delete orderData['Order Id'];
        
        // Get existing order
        const currentOrder = await this.getOrderById(orderId);
        if (!currentOrder) return null;
        
        const processedData = { 
            ...orderData,
        };
        
        // Handle dishes update
        if (orderData.Dishes) {
            processedData.Dishes = JSON.stringify(orderData.Dishes);
        }
        
        const query = 'UPDATE `Order` SET ? WHERE `Order Id` = ?';
        await connection.promise().query(query, [processedData, orderId]);
        return this.getOrderById(orderId);
    }

    async deleteOrder(orderId) {
        const query = 'DELETE FROM `Order` WHERE `Order Id` = ?';
        const [result] = await connection.promise().query(query, [orderId]);
        return result.affectedRows > 0;
    }
}

export default new OrderRepository();