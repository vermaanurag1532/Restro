import robotService from '../Service/Robot.service.js';

class RobotController {
    async getAllRobots(req, res) {
        try {
            const robots = await robotService.getAllRobots();
            res.json(robots);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getRobotById(req, res) {
        try {
            const robot = await robotService.getRobotById(req.params.id);
            res.json(robot);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getRobotsByOrderId(req, res) {
        try {
            const robots = await robotService.getRobotsByOrderId(req.params.orderId);
            res.json(robots);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getRobotsByCustomerId(req, res) {
        try {
            const robots = await robotService.getRobotsByCustomerId(req.params.customerId);
            res.json(robots);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async addRobot(req, res) {
        try {
            const newRobot = await robotService.addRobot(req.body);
            res.status(201).json(newRobot);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateRobot(req, res) {
        try {
            const updatedRobot = await robotService.updateRobot(req.params.id, req.body);
            res.json(updatedRobot);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteRobot(req, res) {
        try {
            const success = await robotService.deleteRobot(req.params.id);
            if (success) {
                res.json({ message: 'Robot deleted successfully' });
            } else {
                res.status(404).json({ message: 'Robot not found' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new RobotController();