import orderService from '../Service/Order.service.js';

class OrderController {
    async getAllOrders(req, res) {
        try {
            const { restaurantId } = req.params;
            const orders = await orderService.getAllOrders(restaurantId);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const order = await orderService.getOrderById(restaurantId, id);
            res.json(order);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getOrdersByCustomerId(req, res) {
        try {
            const { restaurantId, customerId } = req.params;
            const orders = await orderService.getOrdersByCustomerId(restaurantId, customerId);
            res.json(orders);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addOrder(req, res) {
        try {
            const { restaurantId } = req.params;
            const orderData = { ...req.body, 'Restaurant Id': restaurantId };
            const newOrder = await orderService.addOrder(orderData);
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateOrder(req, res) {
        try {
            const { restaurantId, id } = req.params;
            if (req.body.Dishes) {
                const hasValidDishes = req.body.Dishes.every(dish =>
                    dish['DishId'] &&
                    typeof dish.Quantity === 'number' &&
                    dish.Quantity > 0
                );
                if (!hasValidDishes) {
                    return res.status(400).json({
                        message: "Each dish must have a 'DishId' and a positive 'Quantity'"
                    });
                }
            }
            const updatedOrder = await orderService.updateOrder(restaurantId, id, req.body);
            res.json(updatedOrder);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteOrder(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const success = await orderService.deleteOrder(restaurantId, id);
            if (success) {
                res.json({ message: 'Order deleted successfully' });
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new OrderController();
