import dishRepository from '../Repository/Dish.repository.js';

class DishService {
    async getAllDishes(restaurantId) {
        return await dishRepository.getAllDishes(restaurantId);
    }

    async getDishById(restaurantId, dishId) {
        const dish = await dishRepository.getDishById(restaurantId, dishId);
        if (!dish) {
            throw new Error('Dish not found');
        }
        return dish;
    }

    async addDish(restaurantId, dishData) {
        return await dishRepository.addDish(restaurantId, dishData);
    }

    async updateDish(restaurantId, dishId, dishData) {
        await this.getDishById(restaurantId, dishId); // Ensure dish exists
        return await dishRepository.updateDish(restaurantId, dishId, dishData);
    }

    async deleteDish(restaurantId, dishId) {
        await this.getDishById(restaurantId, dishId); // Ensure dish exists
        return await dishRepository.deleteDish(restaurantId, dishId);
    }
}


export default new DishService();