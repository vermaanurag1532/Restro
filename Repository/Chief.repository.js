import connection from '../Connection/Connection.js';
import bcrypt from 'bcrypt';

class ChefRepository {
    async getNextChefId() {
        const query = 'SELECT MAX(CAST(SUBSTRING(`Chef Id`, 6) AS UNSIGNED)) as maxId FROM Chef';
        const [rows] = await connection.promise().query(query);
        const maxId = rows[0].maxId || 0;
        return `CHEF-${maxId + 1}`;
    }

    async getAllChefs(restaurantId) {
        const query = 'SELECT `Chef Id`, Name, Email FROM Chef WHERE `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [restaurantId]);
        return rows;
    }

    async getChefById(restaurantId, chefId) {
        const query = 'SELECT `Chef Id`, Name, Email FROM Chef WHERE `Restaurant Id` = ? AND `Chef Id` = ?';
        const [rows] = await connection.promise().query(query, [restaurantId, chefId]);
        return rows[0] || null;
    }

    async getChefByEmail(restaurantId, email) {
        const query = 'SELECT * FROM Chef WHERE `Restaurant Id` = ? AND Email = ?';
        const [rows] = await connection.promise().query(query, [restaurantId, email]);
        return rows[0] || null;
    }

    async addChef(restaurantId, chefData) {
        const newChefId = await this.getNextChefId();
        const hashedPassword = await bcrypt.hash(chefData.Password, 10);

        const query = 'INSERT INTO Chef SET ?';
        await connection.promise().query(query, [{
            ...chefData,
            'Restaurant Id': restaurantId,
            'Chef Id': newChefId,
            Password: hashedPassword
        }]);

        return {
            'Chef Id': newChefId,
            Name: chefData.Name,
            Email: chefData.Email
        };
    }

    async updateChef(restaurantId, chefId, chefData) {
        const updateData = { ...chefData };

        if (chefData.Password) {
            updateData.Password = await bcrypt.hash(chefData.Password, 10);
        }

        const query = 'UPDATE Chef SET ? WHERE `Restaurant Id` = ? AND `Chef Id` = ?';
        await connection.promise().query(query, [updateData, restaurantId, chefId]);
        return this.getChefById(restaurantId, chefId);
    }

    async deleteChef(restaurantId, chefId) {
        const query = 'DELETE FROM Chef WHERE `Restaurant Id` = ? AND `Chef Id` = ?';
        const [result] = await connection.promise().query(query, [restaurantId, chefId]);
        return result.affectedRows > 0;
    }

    async verifyChef(restaurantId, email, password) {
        const chef = await this.getChefByEmail(restaurantId, email);
        if (!chef) return null;

        const isValid = await bcrypt.compare(password, chef.Password);
        if (!isValid) return null;

        return {
            'Chef Id': chef['Chef Id'],
            Name: chef.Name,
            Email: chef.Email
        };
    }
}

export default new ChefRepository();
