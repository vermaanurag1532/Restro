import connection from '../Connection/Connection.js';
import bcrypt from 'bcrypt';

class ChefRepository {
    async getNextChefId() {
        const query = 'SELECT MAX(CAST(SUBSTRING(`Chef Id`, 6) AS UNSIGNED)) as maxId FROM Chef';
        const [rows] = await connection.promise().query(query);
        const maxId = rows[0].maxId || 0;
        return `CHEF-${maxId + 1}`;
    }

    async getAllChefs() {
        const query = 'SELECT `Chef Id`, Name, Email FROM Chef';
        const [rows] = await connection.promise().query(query);
        return rows;
    }

    async getChefById(chefId) {
        const query = 'SELECT `Chef Id`, Name, Email FROM Chef WHERE `Chef Id` = ?';
        const [rows] = await connection.promise().query(query, [chefId]);
        return rows[0] || null;
    }

    async getChefByEmail(email) {
        const query = 'SELECT * FROM Chef WHERE Email = ?';
        const [rows] = await connection.promise().query(query, [email]);
        return rows[0] || null;
    }

    async addChef(chefData) {
        const newChefId = await this.getNextChefId();
        const hashedPassword = await bcrypt.hash(chefData.Password, 10);
        
        const query = 'INSERT INTO Chef SET ?';
        const [result] = await connection.promise().query(query, [{
            ...chefData,
            'Chef Id': newChefId,
            Password: hashedPassword
        }]);
        
        return { 
            'Chef Id': newChefId, 
            Name: chefData.Name, 
            Email: chefData.Email 
        };
    }

    async updateChef(chefId, chefData) {
        const updateData = { ...chefData };
        
        if (chefData.Password) {
            updateData.Password = await bcrypt.hash(chefData.Password, 10);
        }
        
        const query = 'UPDATE Chef SET ? WHERE `Chef Id` = ?';
        await connection.promise().query(query, [updateData, chefId]);
        return this.getChefById(chefId);
    }

    async deleteChef(chefId) {
        const query = 'DELETE FROM Chef WHERE `Chef Id` = ?';
        const [result] = await connection.promise().query(query, [chefId]);
        return result.affectedRows > 0;
    }

    async verifyChef(email, password) {
        const chef = await this.getChefByEmail(email);
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