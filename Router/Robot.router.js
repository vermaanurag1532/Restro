import express from 'express';
import robotController from '../Controller/Robot.controller.js';

const RobotRouter = express.Router();

RobotRouter.get('/', robotController.getAllRobots);
RobotRouter.get('/:id', robotController.getRobotById);
RobotRouter.get('/order/:orderId', robotController.getRobotsByOrderId);
RobotRouter.get('/customer/:customerId', robotController.getRobotsByCustomerId);
RobotRouter.post('/', robotController.addRobot);
RobotRouter.put('/:id', robotController.updateRobot);
RobotRouter.delete('/:id', robotController.deleteRobot);

export default RobotRouter;