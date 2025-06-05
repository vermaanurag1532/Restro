// routes/orderReportRoutes.js
import express from 'express';
import orderReportController from '../Controller/orderReportController.js';

const orderReportRouter = express.Router();

// Middleware for logging requests
const logRequest = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Report request`);
    next();
};

// Apply logging middleware to all routes
orderReportRouter.use(logRequest);

// Health check endpoint
orderReportRouter.get('/health', orderReportController.healthCheck);

// Get report preview data (summary for dashboard)
orderReportRouter.get('/preview', orderReportController.getReportPreview);

// Get detailed statistics with AI insights
orderReportRouter.get('/statistics', orderReportController.getReportStats);

// Download individual report formats
orderReportRouter.get('/download/pdf', orderReportController.downloadPDF);
orderReportRouter.get('/download/excel', orderReportController.downloadExcel);
orderReportRouter.get('/download/word', orderReportController.downloadWord);

// Download all reports at once
orderReportRouter.get('/download/all', orderReportController.downloadAllReports);

// Alternative routes with different naming conventions
orderReportRouter.get('/pdf', orderReportController.downloadPDF);
orderReportRouter.get('/xlsx', orderReportController.downloadExcel);
orderReportRouter.get('/docx', orderReportController.downloadWord);

// Export router
export default orderReportRouter;