import connection from '../Connection/Connection.js';

class DishRepository {
    async getNextDishId() {
        // Get the highest current Dish ID
        const query = 'SELECT MAX(CAST(SUBSTRING(`DishId`, 6) AS UNSIGNED)) as maxId FROM Dish';
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

    async getAllDishes(restaurantId) {
        const query = 'SELECT * FROM Dish WHERE `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [restaurantId]);
        return rows.map(row => ({
            ...row,
            Images: this.safeJsonParse(row.Images),
            'Type of Dish': this.safeJsonParse(row['Type of Dish']),
            'Genre of Taste': this.safeJsonParse(row['Genre of Taste'])
        }));
    }
    
    
    async getDishById(restaurantId, dishId) {
        const query = 'SELECT * FROM Dish WHERE `DishId` = ? AND `Restaurant Id` = ?';
        const [rows] = await connection.promise().query(query, [dishId, restaurantId]);
        if (rows.length === 0) return null;
    
        const row = rows[0];
        return {
            ...row,
            Images: this.safeJsonParse(row.Images),
            'Type of Dish': this.safeJsonParse(row['Type of Dish']),
            'Genre of Taste': this.safeJsonParse(row['Genre of Taste'])
        };
    }
    


    async addDish(restaurantId, dishData) {
        const newDishId = await this.getNextDishId();
    
        const processedData = {
            ...dishData,
            DishId: newDishId,
            'Restaurant Id': restaurantId,
            Images: JSON.stringify(dishData.Images),
            'Type of Dish': JSON.stringify(dishData['Type of Dish']),
            'Genre of Taste': JSON.stringify(dishData['Genre of Taste'])
        };
    
        const query = 'INSERT INTO Dish SET ?';
        await connection.promise().query(query, [processedData]);
        return { ...dishData, DishId: newDishId };
    }
    

    async updateDish(restaurantId, dishId, dishData) {
        const processedData = { ...dishData };
        if (dishData.Images) processedData.Images = JSON.stringify(dishData.Images);
        if (dishData['Type of Dish']) processedData['Type of Dish'] = JSON.stringify(dishData['Type of Dish']);
        if (dishData['Genre of Taste']) processedData['Genre of Taste'] = JSON.stringify(dishData['Genre of Taste']);
    
        const query = 'UPDATE Dish SET ? WHERE `DishId` = ? AND `Restaurant Id` = ?';
        await connection.promise().query(query, [processedData, dishId, restaurantId]);
    
        return this.getDishById(restaurantId, dishId);
    }
    

    async deleteDish(restaurantId, dishId) {
        const query = 'DELETE FROM Dish WHERE `DishId` = ? AND `Restaurant Id` = ?';
        const [result] = await connection.promise().query(query, [dishId, restaurantId]);
        return result.affectedRows > 0;
    }
    
}

export default new DishRepository();