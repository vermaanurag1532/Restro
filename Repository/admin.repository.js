import connection from '../Connection/Connection.js';

const AdminRepository = {
  getAllByRestaurant: (restaurantId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin WHERE `Role` = "Manager" AND `Restaurant Id` = ?', [restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  
  getAllChefsByRestaurant: (restaurantId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin WHERE `Role` = "Chef" AND `Restaurant Id` = ?', [restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  
  getById: (restaurantId, adminId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin WHERE `Admin Id` = ? AND `Restaurant Id` = ?', [adminId, restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },
  
  getCountByRole: (restaurantId, role) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) AS count FROM Admin WHERE Role = ? AND `Restaurant Id` = ?', [role, restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0].count);
      });
    });
  },
  
  create: (admin) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO Admin SET ?', admin, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  
  update: (restaurantId, adminId, data) => {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE Admin SET ? WHERE `Admin Id` = ? AND `Restaurant Id` = ?', [data, adminId, restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  
  remove: (restaurantId, adminId) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM Admin WHERE `Admin Id` = ? AND `Restaurant Id` = ?', [adminId, restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  
  findByEmailAndRestaurant: (restaurantId, email) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin WHERE Email = ? AND `Restaurant Id` = ?', [email, restaurantId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }  
};

export default AdminRepository;