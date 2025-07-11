import db from '../Connection/Connection.js';

const RestaurantRepository = {
    getAllRestaurants: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM Restaurant', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    },

    getLastRestaurantId: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT `Restaurant Id` FROM Restaurant ORDER BY `Restaurant Id` DESC LIMIT 1', (err, results) => {
                if (err) reject(err);
                else resolve(results[0]?.['Restaurant Id'] || null);
            });
        });
    },

    addRestaurant: (restaurant) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO Restaurant (`Restaurant Id`, `Name Id`, `Location Id`, `Restaurant logo`) VALUES (?, ?, ?, ?)';
            db.query(sql, [restaurant.id, restaurant.nameId, restaurant.locationId, JSON.stringify(restaurant.logo)], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    updateRestaurant: (restaurantId, data) => {
        return new Promise((resolve, reject) => {
            const sql = 'UPDATE Restaurant SET `Name Id` = ?, `Location Id` = ?, `Restaurant logo` = ? WHERE `Restaurant Id` = ?';
            db.query(sql, [data.nameId, data.locationId, JSON.stringify(data.logo), restaurantId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    deleteRestaurant: (restaurantId) => {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM Restaurant WHERE `Restaurant Id` = ?', [restaurantId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
};

export default RestaurantRepository;
