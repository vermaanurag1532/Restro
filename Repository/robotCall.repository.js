// robotCall.repository.js
import connection from '../Connection/Connection.js';

const RobotCallRepository = {
    // Create a robot call request
    createRobotCall: (tableNo) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO Robot_Call_Request (
                    Table_No, 
                    Status, 
                    Created_At, 
                    Updated_At
                ) VALUES (?, 'pending', NOW(), NOW())
            `;
            
            connection.query(query, [tableNo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: results.insertId,
                        tableNo: tableNo,
                        status: 'pending',
                        message: 'Robot call request created successfully'
                    });
                }
            });
        });
    },

    // Get robot call status by table number
    getRobotCallByTable: (tableNo) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM Robot_Call_Request 
                WHERE Table_No = ? 
                ORDER BY Created_At DESC 
                LIMIT 1
            `;
            
            connection.query(query, [tableNo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0] || null);
                }
            });
        });
    },

    // Update robot call status
    updateRobotCallStatus: (tableNo, status) => {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE Robot_Call_Request 
                SET Status = ?, Updated_At = NOW() 
                WHERE Table_No = ? 
                ORDER BY Created_At DESC 
                LIMIT 1
            `;
            
            connection.query(query, [status, tableNo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        tableNo: tableNo,
                        status: status,
                        updated: results.affectedRows > 0
                    });
                }
            });
        });
    },

    // Get all pending robot calls
    getAllPendingCalls: () => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM Robot_Call_Request 
                WHERE Status = 'pending' 
                ORDER BY Created_At ASC
            `;
            
            connection.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
};

export default RobotCallRepository;