import RestaurantService from '../Service/restaurant.service.js';

const RestaurantController = {
    getAll: async (req, res) => {
        try {
            const restaurants = await RestaurantService.getAll();
            res.json(restaurants);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const restaurant = await RestaurantService.create(req.body);
            res.status(201).json(restaurant);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            await RestaurantService.update(req.params.id, req.body);
            res.json({ message: 'Restaurant updated successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await RestaurantService.delete(req.params.id);
            res.json({ message: 'Restaurant deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

export default RestaurantController;
