import orderRepository from '../Repository/Order.repository.js';

class OrderService {
    async getAllOrders() {
        return await orderRepository.getAllOrders();
    }

    async getOrderById(orderId) {
        const order = await orderRepository.getOrderById(orderId);
        if (!order) throw new Error('Order not found');
        return order;
    }

    async getOrdersByCustomerId(customerId) {
        const orders = await orderRepository.getOrdersByCustomerId(customerId);
        if (orders.length === 0) throw new Error('No orders found for this customer');
        return orders;
    }

    async addOrder(orderData) {
        if (!orderData['Customer Id'] || !orderData.Dishes) {
            throw new Error('Customer ID and Dishes are required');
        }
        return await orderRepository.addOrder(orderData);
    }

    async updateOrder(orderId, orderData) {
        await this.getOrderById(orderId); // Verify order exists
        return await orderRepository.updateOrder(orderId, orderData);
    }

    async deleteOrder(orderId) {
        await this.getOrderById(orderId); // Verify order exists
        return await orderRepository.deleteOrder(orderId);
    }
}

export default new OrderService();