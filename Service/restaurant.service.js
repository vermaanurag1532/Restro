import RestaurantRepository from '../Repository/restaurant.repository.js';

const RestaurantService = {
    generateNewId: async () => {
        const lastId = await RestaurantRepository.getLastRestaurantId();
        if (!lastId) return 'restro-1';
        const num = parseInt(lastId.split('-')[1]) + 1;
        return `restro-${num}`;
    },

    getAll: () => {
        return RestaurantRepository.getAllRestaurants();
    },

    create: async (data) => {
        const newId = await RestaurantService.generateNewId();
        const restaurant = {
            id: newId,
            nameId: data.nameId,
            locationId: data.locationId,
            logo: data.logo || {}
        };
        await RestaurantRepository.addRestaurant(restaurant);
        return restaurant;
    },

    update: async (id, data) => {
        return RestaurantRepository.updateRestaurant(id, data);
    },

    delete: async (id) => {
        return RestaurantRepository.deleteRestaurant(id);
    }
};

export default RestaurantService;
