import connection from '../Connection/Connection.js';
import TableRepository from './table.repository.js';
import { io } from '../server.js';

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

    async getAllOrders(restaurantId) {
        const query = 'SELECT * FROM `Order` WHERE `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [restaurantId]);
        return rows.map(row => ({
            ...row,
            Dishes: this.safeJsonParse(row.Dishes)
        }));
    }

    async getOrderById(restaurantId, orderId) {
        const query = 'SELECT * FROM `Order` WHERE `Order Id` = ? AND `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [orderId, restaurantId]);
        if (rows.length === 0) return null;
        return {
            ...rows[0],
            Dishes: this.safeJsonParse(rows[0].Dishes)
        };
    }

    async getOrdersByCustomerId(restaurantId, customerId) {
        const query = 'SELECT * FROM `Order` WHERE `Customer Id` = ? AND `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [customerId, restaurantId]);
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
        
        if (orderData['Customer Id']) {
            const tables = await TableRepository.getByCustomerId(orderData['Restaurant Id'] ,orderData['Customer Id']);
            if (tables && tables.length > 0) {
                const table = tables[0];
                await TableRepository.update(orderData['Restaurant Id'] ,table['Table No'], orderData['Customer Id'], newOrderId);
            }
        }
        
        const newOrder = await this.getOrderById(orderData['Restaurant Id'], newOrderId);
        io.emit('order_created', newOrder);
        
        return { ...orderData, 'Order Id': newOrderId };
    }

    async updateOrder(restaurantId, orderId, orderData) {
        if (orderData['Order Id']) delete orderData['Order Id'];

        const currentOrder = await this.getOrderById(restaurantId, orderId);
        if (!currentOrder) return null;

        const processedData = { ...orderData };

        if (orderData.Dishes) {
            processedData.Dishes = JSON.stringify(orderData.Dishes);
        }

        const query = 'UPDATE `Order` SET ? WHERE `Order Id` = ? AND `Restaurant Id` = ?';
        await connection.promise().query(query, [processedData, orderId, restaurantId]);

        const updatedOrder = await this.getOrderById(restaurantId, orderId);

        if (orderData['Serving Status'] !== undefined) {
            io.emit('order_status_updated', {
                orderId,
                status: 'serving',
                value: orderData['Serving Status']
            });
        }

        if (orderData['Payment Status'] !== undefined) {
            io.emit('order_status_updated', {
                orderId,
                status: 'payment',
                value: orderData['Payment Status']
            });
        }

        if (orderData.Dishes) {
            io.emit('order_dishes_updated', updatedOrder);
        }

        io.emit('order_updated', updatedOrder);

        return updatedOrder;
    }

    async deleteOrder(restaurantId, orderId) {
        const query = 'DELETE FROM `Order` WHERE `Order Id` = ? AND `Restaurant Id` = ?';
        const [result] = await connection.promise().query(query, [orderId, restaurantId]);

        if (result.affectedRows > 0) {
            io.emit('order_deleted', orderId);
            return true;
        }

        return false;
    }
}

export default new OrderRepository();
