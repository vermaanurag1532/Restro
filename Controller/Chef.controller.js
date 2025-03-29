import chefService from '../Service/Chief.service.js';

class ChefController {
    async getAllChefs(req, res) {
        try {
            const chefs = await chefService.getAllChefs();
            res.json(chefs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getChefById(req, res) {
        try {
            const chef = await chefService.getChefById(req.params.id);
            res.json(chef);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addChef(req, res) {
        try {
            const newChef = await chefService.addChef(req.body);
            res.status(201).json(newChef);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateChef(req, res) {
        try {
            const updatedChef = await chefService.updateChef(req.params.id, req.body);
            res.json(updatedChef);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteChef(req, res) {
        try {
            const success = await chefService.deleteChef(req.params.id);
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
            const { email, password } = req.body;
            const chef = await chefService.login(email, password);
            res.json(chef);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

export default new ChefController();