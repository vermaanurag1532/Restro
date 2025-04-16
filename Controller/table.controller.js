import TableService from '../Service/table.service.js';

const TableController = {
    getAllTables: async (req, res) => {
        try {
            const tables = await TableService.getAllTables();
            res.json(tables);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getTableByNumber: async (req, res) => {
        try {
            const { tableNo } = req.params;
            const table = await TableService.getTableByNumber(tableNo);
            if (table) {
                res.json(table);
            } else {
                res.status(404).json({ message: "Table not found" });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getTableByCustomerId: async (req, res) => {
        try {
            const { customerId } = req.params;
            const tables = await TableService.getTableByCustomerId(customerId);
            res.json(tables);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createTable: async (req, res) => {
        try {
            const { tableNo, customerId, orderId } = req.body;
            await TableService.createTable(tableNo, customerId, orderId);
            res.status(201).json({ message: "Table created successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateTable: async (req, res) => {
        try {
            const { tableNo } = req.params;
            // Log the request body to debug
            console.log('Update table request for table', tableNo, 'with body:', req.body);
            
            // Extract the customer ID using the exact field name from database
            const customerId = req.body["Customer ID"];
            const orderId = req.body["Order Id"];
            
            console.log('Extracted values:', { tableNo, customerId, orderId });
            
            // If either value is undefined, use null instead
            const customerIdValue = customerId !== undefined ? customerId : null;
            const orderIdValue = orderId !== undefined ? orderId : null;
            
            // Call the service layer
            await TableService.updateTable(tableNo, customerIdValue, orderIdValue);
            
            // Return success response
            res.json({ 
                message: "Table updated successfully", 
                tableNo,
                customerIdUpdated: customerIdValue !== null,
                orderIdUpdated: orderIdValue !== null
            });
        } catch (error) {
            console.error('Error updating table:', error);
            res.status(500).json({ message: error.message });
        }
    },

    deleteTable: async (req, res) => {
        try {
            const { tableNo } = req.params;
            await TableService.deleteTable(tableNo);
            res.json({ message: "Table deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default TableController;