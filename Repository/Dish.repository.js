import connection from '../Connection/Connection.js';

class DishRepository {
    async getNextDishId() {
        // Get the highest current Dish ID
        const query = 'SELECT MAX(CAST(SUBSTRING(`Dish Id`, 6) AS UNSIGNED)) as maxId FROM Dish';
        const [rows] = await connection.promise().query(query);
        const maxId = rows[0].maxId || 0; // If no dishes exist, start from 0
        return `DISH-${maxId + 1}`;
    }

    safeJsonParse(jsonString, fieldName = '') {
        try {
            // Handle NULL or empty string
            if (!jsonString || jsonString === 'null') return [];
            
            // If it's already an array (might happen if query returns parsed JSON)
            if (Array.isArray(jsonString)) return jsonString;
            
            // Try parsing as JSON
            const parsed = JSON.parse(jsonString);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
            console.error(`Error parsing ${fieldName}:`, jsonString, error);
            // If it's a string but not JSON, return as array with single item
            if (typeof jsonString === 'string') {
                return jsonString.trim() ? [jsonString] : [];
            }
            return [];
        }
    }

    async getAllDishes() {
        try {
            const query = 'SELECT * FROM Dish';
            const [rows] = await connection.promise().query(query);
            
            // Add debug logging
            console.log('Raw DB rows:', rows.map(r => ({
                id: r['Dish Id'],
                imagesRaw: r.Images,
                typeRaw: r['Type of Dish'],
                genreRaw: r['Genre of Taste']
            })));
            
            return rows.map(row => ({
                ...row,
                Images: this.safeJsonParse(row.Images, 'Images'),
                'Type of Dish': this.safeJsonParse(row['Type of Dish'], 'Type of Dish'),
                'Genre of Taste': this.safeJsonParse(row['Genre of Taste'], 'Genre of Taste')
            }));
        } catch (error) {
            console.error('Error in getAllDishes:', error);
            throw error;
        }
    }
    
    async getDishById(dishId) {
        try {
            const query = 'SELECT * FROM Dish WHERE `Dish Id` = ?';
            const [rows] = await connection.promise().query(query, [dishId]);
            if (rows.length === 0) return null;
            
            const row = rows[0];
            console.log('Raw DB row for', dishId, ':', {
                imagesRaw: row.Images,
                typeRaw: row['Type of Dish'],
                genreRaw: row['Genre of Taste']
            });
            
            return {
                ...row,
                Images: this.safeJsonParse(row.Images, 'Images'),
                'Type of Dish': this.safeJsonParse(row['Type of Dish'], 'Type of Dish'),
                'Genre of Taste': this.safeJsonParse(row['Genre of Taste'], 'Genre of Taste')
            };
        } catch (error) {
            console.error('Error in getDishById:', error);
            throw error;
        }
    }


    async addDish(dishData) {
        // Generate new dish ID
        const newDishId = await this.getNextDishId();
        
        // Stringify JSON fields
        const processedData = {
            ...dishData,
            'Dish Id': newDishId,
            Images: JSON.stringify(dishData.Images),
            'Type of Dish': JSON.stringify(dishData['Type of Dish']),
            'Genre of Taste': JSON.stringify(dishData['Genre of Taste'])
        };
        
        const query = 'INSERT INTO Dish SET ?';
        const [result] = await connection.promise().query(query, [processedData]);
        return { ...dishData, 'Dish Id': newDishId };
    }

    async updateDish(dishId, dishData) {
        // Don't allow updating the Dish Id
        if (dishData['Dish Id']) {
            delete dishData['Dish Id'];
        }
        
        // Stringify JSON fields if they exist in the update data
        const processedData = { ...dishData };
        if (dishData.Images) processedData.Images = JSON.stringify(dishData.Images);
        if (dishData['Type of Dish']) processedData['Type of Dish'] = JSON.stringify(dishData['Type of Dish']);
        if (dishData['Genre of Taste']) processedData['Genre of Taste'] = JSON.stringify(dishData['Genre of Taste']);
        
        const query = 'UPDATE Dish SET ? WHERE `Dish Id` = ?';
        await connection.promise().query(query, [processedData, dishId]);
        return this.getDishById(dishId);
    }

    async deleteDish(dishId) {
        const query = 'DELETE FROM Dish WHERE `Dish Id` = ?';
        const [result] = await connection.promise().query(query, [dishId]);
        return result.affectedRows > 0;
    }
}

export default new DishRepository();