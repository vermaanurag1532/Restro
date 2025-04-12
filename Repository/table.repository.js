import connection from '../Connection/Connection.js';

const TableRepository = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `Table`', (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getByTableNumber: (tableNo) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `Table` WHERE `Table No` = ?', [tableNo], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    },

    getByCustomerId: (customerId) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `Table` WHERE `Customer ID` = ?', [customerId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    create: (tableNo, customerId, orderId) => {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO `Table` (`Table No`, `Customer ID`, `Order Id`) VALUES (?, ?, ?)', 
            [tableNo, customerId, orderId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    update: (tableNo, customerId, orderId) => {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE `Table` SET `Customer ID` = ? AND `Order Id` = ? WHERE `Table No` = ?', 
            [customerId, tableNo, orderId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    delete: (tableNo) => {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM `Table` WHERE `Table No` = ?', [tableNo], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }
};

export default TableRepository;
