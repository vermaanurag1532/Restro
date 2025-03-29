import dishRepository from '../Repository/Dish.repository.js';

class DishService {
    async getAllDishes() {
        return await dishRepository.getAllDishes();
    }

    async getDishById(dishId) {
        const dish = await dishRepository.getDishById(dishId);
        if (!dish) {
            throw new Error('Dish not found');
        }
        return dish;
    }

    async addDish(dishData) {
        // Add any business logic/validation here
        return await dishRepository.addDish(dishData);
    }

    async updateDish(dishId, dishData) {
        await this.getDishById(dishId); // Check if dish exists
        return await dishRepository.updateDish(dishId, dishData);
    }

    async deleteDish(dishId) {
        await this.getDishById(dishId); // Check if dish exists
        return await dishRepository.deleteDish(dishId);
    }
}

export default new DishService();