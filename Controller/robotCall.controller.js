// robotCall.controller.js
import RobotCallService from '../Service/robotCall.service.js';

const RobotCallController = {
    // Handle customer request to call robot
    callRobot: async (req, res) => {
        try {
            const { tableNo } = req.body;

            // Validate table number
            if (!tableNo) {
                return res.status(400).json({
                    success: false,
                    message: 'Table number is required',
                    timestamp: new Date().toISOString()
                });
            }

            // Call the robot service
            const result = await RobotCallService.callRobotToTable(tableNo);

            if (result.success) {
                // Broadcast real-time update if socket.io is available
                if (req.io) {
                    req.io.emit('robot-called', {
                        tableNo: tableNo,
                        status: 'dispatched',
                        timestamp: new Date().toISOString()
                    });
                }

                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        tableNo: result.tableNo,
                        status: result.status,
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    data: {
                        tableNo: result.tableNo,
                        status: result.status
                    },
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error('Error in callRobot controller:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while calling robot',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Get robot call status for a table
    getRobotStatus: async (req, res) => {
        try {
            const { tableNo } = req.params;

            if (!tableNo) {
                return res.status(400).json({
                    success: false,
                    message: 'Table number is required'
                });
            }

            const status = await RobotCallService.getRobotCallStatus(tableNo);

            res.status(200).json({
                success: true,
                data: status,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting robot status:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting robot status',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Get all pending robot calls (for admin/monitoring)
    getPendingCalls: async (req, res) => {
        try {
            const pendingCalls = await RobotCallService.getAllPendingCalls();

            res.status(200).json({
                success: true,
                data: pendingCalls,
                count: pendingCalls.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error getting pending calls:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting pending robot calls',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    // Webhook for robot server to update status
    updateRobotStatus: async (req, res) => {
        try {
            const { tableNo, status } = req.body;

            if (!tableNo || !status) {
                return res.status(400).json({
                    success: false,
                    message: 'Table number and status are required'
                });
            }

            const result = await RobotCallService.updateCallStatus(tableNo, status);

            // Broadcast real-time update
            if (req.io) {
                req.io.emit('robot-status-updated', {
                    tableNo: tableNo,
                    status: status,
                    timestamp: new Date().toISOString()
                });
            }

            res.status(200).json({
                success: true,
                message: 'Robot status updated successfully',
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error updating robot status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating robot status',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
};

export default RobotCallController;