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
            const { customerId } = req.body;
            const { orderId } = req.body;
            await TableService.updateTable(tableNo, customerId, orderId);
            res.json({ message: "Table updated successfully" });
        } catch (error) {
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
