import express from 'express';
import TableController from '../Controller/table.controller.js';

const TableRouter = express.Router();

TableRouter.get('/:restaurantId', TableController.getAllTables);
TableRouter.get('/:restaurantId/number/:tableNo', TableController.getTableByNumber);
TableRouter.get('/:restaurantId/customer/:customerId', TableController.getTableByCustomerId);
TableRouter.post('/:restaurantId', TableController.createTable);
TableRouter.put('/:restaurantId/:tableNo', TableController.updateTable);
TableRouter.delete('/:restaurantId/:tableNo', TableController.deleteTable);

export default TableRouter;
