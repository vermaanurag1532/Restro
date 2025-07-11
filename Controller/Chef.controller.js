import chefService from '../Service/Chief.service.js';

class ChefController {
    async getAllChefs(req, res) {
        try {
            const { restaurantId } = req.params;
            const chefs = await chefService.getAllChefs(restaurantId);
            res.json(chefs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getChefById(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const chef = await chefService.getChefById(restaurantId, id);
            res.json(chef);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addChef(req, res) {
        try {
            const { restaurantId } = req.params;
            const newChef = await chefService.addChef(restaurantId, req.body);
            res.status(201).json(newChef);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateChef(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const updatedChef = await chefService.updateChef(restaurantId, id, req.body);
            res.json(updatedChef);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteChef(req, res) {
        try {
            const { restaurantId, id } = req.params;
            const success = await chefService.deleteChef(restaurantId, id);
            if (success) {
                res.json({ message: 'Chef deleted successfully' });
            } else {
                res.status(404).json({ message: 'Chef not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { restaurantId } = req.params;
            const { email, password } = req.body;
            const chef = await chefService.login(restaurantId, email, password);
            res.json(chef);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

export default new ChefController();
