// robotCall.router.js
import express from 'express';
import RobotCallController from '../Controller/robotCall.controller.js';

const RobotCallRouter = express.Router();

// Customer endpoints
RobotCallRouter.post('/call', RobotCallController.callRobot);
RobotCallRouter.get('/status/:tableNo', RobotCallController.getRobotStatus);

// Admin/monitoring endpoints
RobotCallRouter.get('/pending', RobotCallController.getPendingCalls);

// Webhook endpoint for robot server
RobotCallRouter.post('/status/update', RobotCallController.updateRobotStatus);

export default RobotCallRouter;