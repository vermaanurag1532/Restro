import orderRepository from '../Repository/Order.repository.js';
import dishRepository from '../Repository/Dish.repository.js';

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
        
        // Calculate total amount if not provided
        if (!orderData.Amount) {
            orderData.Amount = await this._calculateTotalAmount(orderData.Dishes);
        }
        
        return await orderRepository.addOrder(orderData);
    }

    async updateOrder(orderId, orderData) {
        // Verify order exists
        const existingOrder = await this.getOrderById(orderId);
        
        // If dishes are provided, add them to the existing dishes and update amount
        if (orderData.Dishes && Array.isArray(orderData.Dishes)) {
            // Calculate additional amount from new dishes
            let additionalAmount = 0;
            
            // Calculate price of all new dishes
            for (const newDish of orderData.Dishes) {
                const dishDetails = await dishRepository.getDishById(newDish['DishId']);
                if (!dishDetails) {
                    throw new Error(`Dish with ID ${newDish['DishId']} not found`);
                }
                
                additionalAmount += dishDetails.Price * newDish.Quantity;
            }
            
            // Combine existing dishes with new dishes
            const updatedDishes = [...existingOrder.Dishes, ...orderData.Dishes];
            
            // Update total amount by adding new amount to existing amount
            const updatedAmount = existingOrder.Amount + additionalAmount;
            
            // Update order data with new dishes and total amount
            orderData.Amount = updatedAmount;
            orderData.Dishes = updatedDishes;
        }
        
        return await orderRepository.updateOrder(orderId, orderData);
    }

    async deleteOrder(orderId) {
        await this.getOrderById(orderId); // Verify order exists
        return await orderRepository.deleteOrder(orderId);
    }
    
    async _calculateTotalAmount(dishes) {
        let totalAmount = 0;
        
        for (const dish of dishes) {
            const dishDetails = await dishRepository.getDishById(dish['DishId']);
            if (!dishDetails) {
                throw new Error(`Dish with ID ${dish['DishId']} not found`);
            }
            
            totalAmount += dishDetails.Price * dish.Quantity;
        }
        
        return totalAmount;
    }
}

export default new OrderService();