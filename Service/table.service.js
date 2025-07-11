import TableRepository from '../Repository/table.repository.js';

const TableService = {
    getAllTables: async (restaurantId) => {
        return await TableRepository.getAll(restaurantId);
    },

    getTableByNumber: async (restaurantId, tableNo) => {
        return await TableRepository.getByTableNumber(restaurantId, tableNo);
    },

    getTableByCustomerId: async (restaurantId, customerId) => {
        return await TableRepository.getByCustomerId(restaurantId, customerId);
    },

    createTable: async (restaurantId, tableNo, customerId, orderId) => {
        return await TableRepository.create(restaurantId, tableNo, customerId, orderId);
    },

    updateTable: async (restaurantId, tableNo, customerId, orderId) => {
        return await TableRepository.update(restaurantId, tableNo, customerId, orderId);
    },

    deleteTable: async (restaurantId, tableNo) => {
        return await TableRepository.delete(restaurantId, tableNo);
    }
};

export default TableService;
