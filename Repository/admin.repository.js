import connection from '../Connection/Connection.js';

const AdminRepository = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (adminId) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin WHERE `Admin Id` = ?', [adminId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },

  getCountByRole: (role) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) AS count FROM Admin WHERE Role = ?', [role], (err, results) => {
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

  update: (adminId, data) => {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE Admin SET ? WHERE `Admin Id` = ?', [data, adminId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  remove: (adminId) => {
    return new Promise((resolve, reject) => {
      connection.query('DELETE FROM Admin WHERE `Admin Id` = ?', [adminId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM Admin WHERE Email = ?', [email], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  }
};

export default AdminRepository;