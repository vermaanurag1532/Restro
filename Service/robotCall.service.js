// robotCall.service.js
import RobotCallRepository from '../Repository/robotCall.repository.js';
import axios from 'axios';

const RobotCallService = {
    // Call robot to specific table
    callRobotToTable: async (tableNo) => {
        try {
            // First, create the robot call request in database
            const robotCallRequest = await RobotCallRepository.createRobotCall(tableNo);
            
            // Send request to robot server
            const robotServerResponse = await RobotCallService.sendToRobotServer(tableNo);
            
            // Update status based on robot server response
            if (robotServerResponse.success) {
                await RobotCallRepository.updateRobotCallStatus(tableNo, 'dispatched');
                return {
                    success: true,
                    message: `Robot called to table ${tableNo} successfully`,
                    tableNo: tableNo,
                    status: 'dispatched',
                    robotResponse: robotServerResponse
                };
            } else {
                await RobotCallRepository.updateRobotCallStatus(tableNo, 'failed');
                return {
                    success: false,
                    message: `Failed to call robot to table ${tableNo}`,
                    tableNo: tableNo,
                    status: 'failed',
                    error: robotServerResponse.error
                };
            }
        } catch (error) {
            console.error('Error in callRobotToTable:', error);
            
            // Update status to failed if possible
            try {
                await RobotCallRepository.updateRobotCallStatus(tableNo, 'failed');
            } catch (updateError) {
                console.error('Error updating status to failed:', updateError);
            }
            
            throw error;
        }
    },

    // Send table number to robot server
    sendToRobotServer: async (tableNo) => {
        try {
            const robotServerUrl = process.env.ROBOT_SERVER_URL || 'http://localhost:4000';
            const endpoint = `${robotServerUrl}/api/robot/dispatch`;
            
            const payload = {
                tableNo: tableNo,
                action: 'dispatch',
                timestamp: new Date().toISOString(),
                priority: 'normal'
            };

            console.log(`Sending robot dispatch request to: ${endpoint}`);
            console.log('Payload:', payload);

            const response = await axios.post(endpoint, payload, {
                timeout: 10000, // 10 second timeout
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.ROBOT_API_KEY || 'default-key'}`
                }
            });

            return {
                success: true,
                data: response.data,
                status: response.status
            };

        } catch (error) {
            console.error('Error sending to robot server:', error.message);
            
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            };
        }
    },

    // Get robot call status
    getRobotCallStatus: async (tableNo) => {
        return await RobotCallRepository.getRobotCallByTable(tableNo);
    },

    // Get all pending robot calls
    getAllPendingCalls: async () => {
        return await RobotCallRepository.getAllPendingCalls();
    },

    // Update robot call status (for robot server to call back)
    updateCallStatus: async (tableNo, status) => {
        return await RobotCallRepository.updateRobotCallStatus(tableNo, status);
    }
};

export default RobotCallService;