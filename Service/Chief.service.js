import chefRepository from '../Repository/Chief.repository.js';

class ChefService {
    async getAllChefs() {
        return await chefRepository.getAllChefs();
    }

    async getChefById(chefId) {
        const chef = await chefRepository.getChefById(chefId);
        if (!chef) throw new Error('Chef not found');
        return chef;
    }

    async addChef(chefData) {
        if (!chefData.Name || !chefData.Email || !chefData.Password) {
            throw new Error('Name, Email and Password are required');
        }

        const existingChef = await chefRepository.getChefByEmail(chefData.Email);
        if (existingChef) {
            throw new Error('Email already in use');
        }

        return await chefRepository.addChef(chefData);
    }

    async updateChef(chefId, chefData) {
        await this.getChefById(chefId); // Verify chef exists
        return await chefRepository.updateChef(chefId, chefData);
    }

    async deleteChef(chefId) {
        await this.getChefById(chefId); // Verify chef exists
        return await chefRepository.deleteChef(chefId);
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
        const chef = await chefRepository.verifyChef(email, password);
        if (!chef) {
            throw new Error('Invalid email or password');
        }
        
        return chef;
    }
}

export default new ChefService();