import connection from '../Connection/Connection.js';
import TableRepository from './table.repository.js';
import { io } from '../server.js'; // Import io from server.js

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
        
        // Add the order
        const query = 'INSERT INTO `Order` SET ?';
        const [result] = await connection.promise().query(query, [processedData]);
        
        // Update the table with this order ID
        if (orderData['Customer Id']) {
            const tables = await TableRepository.getByCustomerId(orderData['Customer Id']);
            
            // If customer has a table assigned, update it with the new order ID
            if (tables && tables.length > 0) {
                const table = tables[0]; // Using the first table if there are multiple
                await TableRepository.update(table['Table No'], orderData['Customer Id'], newOrderId);
            }
        }
        
        // Get the complete order with all fields for emitting
        const newOrder = await this.getOrderById(newOrderId);
        
        // Emit 'order_created' event with the new order
        io.emit('order_created', newOrder);
        
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
        
        // Get updated order
        const updatedOrder = await this.getOrderById(orderId);
        
        // Determine what type of update occurred to emit the appropriate event
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
        
        // If dishes were updated, emit a specific event
        if (orderData.Dishes) {
            io.emit('order_dishes_updated', updatedOrder);
        }
        
        // Always emit a general update event
        io.emit('order_updated', updatedOrder);
        
        return updatedOrder;
    }

    async deleteOrder(orderId) {
        const query = 'DELETE FROM `Order` WHERE `Order Id` = ?';
        const [result] = await connection.promise().query(query, [orderId]);
        
        if (result.affectedRows > 0) {
            // Emit order deleted event
            io.emit('order_deleted', orderId);
            return true;
        }
        
        return false;
    }
}

export default new OrderRepository();