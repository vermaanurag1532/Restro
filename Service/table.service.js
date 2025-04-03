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

    createTable: async (tableNo, customerId) => {
        return await TableRepository.create(tableNo, customerId);
    },

    updateTable: async (tableNo, customerId) => {
        return await TableRepository.update(tableNo, customerId);
    },

    deleteTable: async (tableNo) => {
        return await TableRepository.delete(tableNo);
    }
};

export default TableService;
