import orderRepository from '../Repository/Order.repository.js';
import dishRepository from '../Repository/Dish.repository.js';

class OrderService {
    async getAllOrders(restaurantId) {
        return await orderRepository.getAllOrders(restaurantId);
    }

    async getOrderById(restaurantId, orderId) {
        const order = await orderRepository.getOrderById(restaurantId, orderId);
        if (!order) throw new Error('Order not found');
        return order;
    }

    async getOrdersByCustomerId(restaurantId, customerId) {
        const orders = await orderRepository.getOrdersByCustomerId(restaurantId, customerId);
        if (orders.length === 0) throw new Error('No orders found for this customer');
        return orders;
    }

    async addOrder(orderData) {
        if (!orderData['Customer Id'] || !orderData.Dishes || !orderData['Restaurant Id']) {
            throw new Error('Customer ID, Restaurant ID and Dishes are required');
        }
        
        if (!orderData.Amount) {
            orderData.Amount = await this._calculateTotalAmount(orderData.Dishes);
        }
        
        return await orderRepository.addOrder(orderData);
    }

    async updateOrder(restaurantId, orderId, orderData) {
        const existingOrder = await this.getOrderById(restaurantId, orderId);
        
        if (orderData.Dishes && Array.isArray(orderData.Dishes)) {
            let additionalAmount = 0;
            for (const newDish of orderData.Dishes) {
                const dishDetails = await dishRepository.getDishById(restaurantId ,newDish['DishId']);
                if (!dishDetails) {
                    throw new Error(`Dish with ID ${newDish['DishId']} not found`);
                }
                additionalAmount += dishDetails.Price * newDish.Quantity;
            }
            const updatedDishes = [...existingOrder.Dishes, ...orderData.Dishes];
            const updatedAmount = existingOrder.Amount + additionalAmount;
            orderData.Amount = updatedAmount;
            orderData.Dishes = updatedDishes;
        }
        
        return await orderRepository.updateOrder(restaurantId, orderId, orderData);
    }

    async deleteOrder(restaurantId, orderId) {
        await this.getOrderById(restaurantId, orderId);
        return await orderRepository.deleteOrder(restaurantId, orderId);
    }

    async _calculateTotalAmount(dishes) {
        let totalAmount = 0;
        for (const dish of dishes) {
            const dishDetails = await dishRepository.getDishById(dish['Restaurant Id'] ,dish['DishId']);
            if (!dishDetails) {
                throw new Error(`Dish with ID ${dish['DishId']} not found`);
            }
            totalAmount += dishDetails.Price * dish.Quantity;
        }
        return totalAmount;
    }
}

export default new OrderService();
