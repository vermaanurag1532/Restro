import chefRepository from '../Repository/Chief.repository.js';

class ChefService {
    async getAllChefs(restaurantId) {
        return await chefRepository.getAllChefs(restaurantId);
    }

    async getChefById(restaurantId, chefId) {
        const chef = await chefRepository.getChefById(restaurantId, chefId);
        if (!chef) throw new Error('Chef not found');
        return chef;
    }

    async addChef(restaurantId, chefData) {
        if (!chefData.Name || !chefData.Email || !chefData.Password) {
            throw new Error('Name, Email and Password are required');
        }

        const existingChef = await chefRepository.getChefByEmail(restaurantId, chefData.Email);
        if (existingChef) {
            throw new Error('Email already in use');
        }

        return await chefRepository.addChef(restaurantId, chefData);
    }

    async updateChef(restaurantId, chefId, chefData) {
        await this.getChefById(restaurantId, chefId);
        return await chefRepository.updateChef(restaurantId, chefId, chefData);
    }

    async deleteChef(restaurantId, chefId) {
        await this.getChefById(restaurantId, chefId);
        return await chefRepository.deleteChef(restaurantId, chefId);
    }

    async login(restaurantId, email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const chef = await chefRepository.verifyChef(restaurantId, email, password);
        if (!chef) {
            throw new Error('Invalid email or password');
        }

        return chef;
    }
}

export default new ChefService();
