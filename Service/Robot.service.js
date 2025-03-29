import robotRepository from '../Repository/Robot.repository.js';

class RobotService {
    async getAllRobots() {
        return await robotRepository.getAllRobots();
    }

    async getRobotById(robotId) {
        const robot = await robotRepository.getRobotById(robotId);
        if (!robot) throw new Error('Robot not found');
        return robot;
    }

    async getRobotsByOrderId(orderId) {
        const robots = await robotRepository.getRobotsByOrderId(orderId);
        if (robots.length === 0) throw new Error('No robots found for this order');
        return robots;
    }

    async getRobotsByCustomerId(customerId) {
        const robots = await robotRepository.getRobotsByCustomerId(customerId);
        if (robots.length === 0) throw new Error('No robots found for this customer');
        return robots;
    }

    async addRobot(robotData) {
        if (!robotData['Order Id'] || !robotData['Customer Id']) {
            throw new Error('Order ID and Customer ID are required');
        }
        return await robotRepository.addRobot(robotData);
    }

    async updateRobot(robotId, robotData) {
        await this.getRobotById(robotId); // Verify robot exists
        return await robotRepository.updateRobot(robotId, robotData);
    }

    async deleteRobot(robotId) {
        await this.getRobotById(robotId); // Verify robot exists
        return await robotRepository.deleteRobot(robotId);
    }
}

export default new RobotService();