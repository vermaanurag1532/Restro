import express from 'express';
import TableController from '../Controller/table.controller.js';

const TableRouter = express.Router();

TableRouter.get('/', TableController.getAllTables);
TableRouter.get('/:tableNo', TableController.getTableByNumber);
TableRouter.get('/customer/:customerId', TableController.getTableByCustomerId);
TableRouter.post('/', TableController.createTable);
TableRouter.put('/:tableNo', TableController.updateTable);
TableRouter.delete('/:tableNo', TableController.deleteTable);

export default TableRouter;
