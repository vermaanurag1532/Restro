import dishService from '../Service/Dish.service.js';

class DishController {
    async getAllDishes(req, res) {
        try {
            const dishes = await dishService.getAllDishes();
            res.json(dishes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getDishById(req, res) {
        try {
            const dish = await dishService.getDishById(req.params.id);
            res.json(dish);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addDish(req, res) {
        try {
            const newDish = await dishService.addDish(req.body);
            res.status(201).json(newDish);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateDish(req, res) {
        try {
            const updatedDish = await dishService.updateDish(req.params.id, req.body);
            res.json(updatedDish);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteDish(req, res) {
        try {
            const success = await dishService.deleteDish(req.params.id);
            if (success) {
                res.json({ message: 'Dish deleted successfully' });
            } else {
                res.status(404).json({ message: 'Dish not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new DishController();