import connection from '../Connection/Connection.js';

class RobotRepository {
    async getNextRobotId() {
        const query = 'SELECT MAX(CAST(SUBSTRING(`Robot Id`, 7) AS UNSIGNED)) as maxId FROM Robot';
        const [rows] = await connection.promise().query(query);
        const maxId = rows[0].maxId || 0;
        return `ROBOT-${maxId + 1}`;
    }

    async getAllRobots() {
        const query = 'SELECT * FROM Robot';
        const [rows] = await connection.promise().query(query);
        return rows;
    }

    async getRobotById(robotId) {
        const query = 'SELECT * FROM Robot WHERE `Robot Id` = ?';
        const [rows] = await connection.promise().query(query, [robotId]);
        return rows[0] || null;
    }

    async getRobotsByOrderId(orderId) {
        const query = 'SELECT * FROM Robot WHERE `Order Id` = ?';
        const [rows] = await connection.promise().query(query, [orderId]);
        return rows;
    }

    async getRobotsByCustomerId(customerId) {
        const query = 'SELECT * FROM Robot WHERE `Customer Id` = ?';
        const [rows] = await connection.promise().query(query, [customerId]);
        return rows;
    }

    async addRobot(robotData) {
        const newRobotId = await this.getNextRobotId();
        
        const query = 'INSERT INTO Robot SET ?';
        const [result] = await connection.promise().query(query, [{
            ...robotData,
            'Robot Id': newRobotId
        }]);
        
        return { 
            ...robotData,
            'Robot Id': newRobotId
        };
    }

    async updateRobot(robotId, robotData) {
        if (robotData['Robot Id']) {
            delete robotData['Robot Id'];
        }
        
        const query = 'UPDATE Robot SET ? WHERE `Robot Id` = ?';
        await connection.promise().query(query, [robotData, robotId]);
        return this.getRobotById(robotId);
    }

    async deleteRobot(robotId) {
        const query = 'DELETE FROM Robot WHERE `Robot Id` = ?';
        const [result] = await connection.promise().query(query, [robotId]);
        return result.affectedRows > 0;
    }
}

export default new RobotRepository();