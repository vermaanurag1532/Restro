import TableRepository from '../Repository/table.repository.js';

const TableService = {
    getAllTables: async () => {
        return await TableRepository.getAll();
    },

    getTableByNumber: async (tableNo) => {
        return await TableRepository.getByTableNumber(tableNo);
    },

    getTableByCustomerId: async (customerId) => {
        return await TableRepository.getByCustomerId(customerId);
    },

    createTable: async (tableNo, customerId, orderId) => {
        return await TableRepository.create(tableNo, customerId, orderId);
    },

    updateTable: async (tableNo, customerId , orderId) => {
        return await TableRepository.update(tableNo, customerId, orderId);
    },

    deleteTable: async (tableNo) => {
        return await TableRepository.delete(tableNo);
    }
};

export default TableService;
