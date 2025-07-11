import connection from '../Connection/Connection.js';

const TableRepository = {
    getAll: (restaurantId) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `Table` WHERE `Restaurant Id` = ?', [restaurantId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getByTableNumber: (restaurantId, tableNo) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `Table` WHERE `Restaurant Id` = ? AND `Table No` = ?', 
            [restaurantId, tableNo], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    },

    getByCustomerId: (restaurantId, customerId) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `Table` WHERE `Restaurant Id` = ? AND `Customer ID` = ?', 
            [restaurantId, customerId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    create: (restaurantId, tableNo, customerId, orderId) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO `Table` (`Restaurant Id`, `Table No`, `Customer ID`, `Order Id`) VALUES (?, ?, ?, ?)', 
                [restaurantId, tableNo, customerId, orderId], 
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    },

    update: (restaurantId, tableNo, customerId, orderId) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE `Table` SET `Customer ID` = ?, `Order Id` = ? WHERE `Restaurant Id` = ? AND `Table No` = ?', 
                [customerId, orderId, restaurantId, tableNo], 
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    },

    delete: (restaurantId, tableNo) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'DELETE FROM `Table` WHERE `Restaurant Id` = ? AND `Table No` = ?', 
                [restaurantId, tableNo], 
                (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                }
            );
        });
    }
};

export default TableRepository;
