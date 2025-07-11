import TableService from '../Service/table.service.js';

const TableController = {
    getAllTables: async (req, res) => {
        try {
            const { restaurantId } = req.params;
            const tables = await TableService.getAllTables(restaurantId);
            res.json(tables);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getTableByNumber: async (req, res) => {
        try {
            const { restaurantId, tableNo } = req.params;
            const table = await TableService.getTableByNumber(restaurantId, tableNo);
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
            const { restaurantId, customerId } = req.params;
            const tables = await TableService.getTableByCustomerId(restaurantId, customerId);
            res.json(tables);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    createTable: async (req, res) => {
        try {
            const { restaurantId } = req.params;
            const { tableNo, customerId, orderId } = req.body;
            await TableService.createTable(restaurantId, tableNo, customerId, orderId);
            res.status(201).json({ message: "Table created successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateTable: async (req, res) => {
        try {
            const { restaurantId, tableNo } = req.params;
            const customerId = req.body["Customer ID"];
            const orderId = req.body["Order Id"];
            await TableService.updateTable(restaurantId, tableNo, customerId ?? null, orderId ?? null);
            res.json({
                message: "Table updated successfully",
                tableNo,
                customerIdUpdated: customerId !== undefined,
                orderIdUpdated: orderId !== undefined
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteTable: async (req, res) => {
        try {
            const { restaurantId, tableNo } = req.params;
            await TableService.deleteTable(restaurantId, tableNo);
            res.json({ message: "Table deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default TableController;
