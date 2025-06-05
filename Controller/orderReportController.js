// controllers/orderReportController.js - UPDATED WITH BETTER ERROR HANDLING
import orderReportService from '../Service/orderReportService.js';

class OrderReportController {
    
    // Download PDF report with AI insights
    async downloadPDF(req, res) {
        try {
            console.log('Starting PDF report generation...');
            const { orders, stats, dishData, customerData } = await orderReportService.getReportData();
            
            console.log(`Generating PDF with ${orders.length} orders, ${dishData.length} dishes`);
            const pdfBuffer = await orderReportService.generatePDF(orders, stats, dishData, customerData);
            
            const filename = `restaurant-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.setHeader('Cache-Control', 'no-cache');
            
            res.send(pdfBuffer);
            console.log('PDF report generated and sent successfully');
            
        } catch (error) {
            console.error('Error generating PDF report:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF report',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Download Excel report
    async downloadExcel(req, res) {
        try {
            console.log('Starting Excel report generation...');
            const { orders } = await orderReportService.getReportData();
            
            console.log(`Generating Excel with ${orders.length} orders`);
            const excelBuffer = await orderReportService.generateExcel(orders);
            
            const filename = `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', excelBuffer.length);
            res.setHeader('Cache-Control', 'no-cache');
            
            res.send(excelBuffer);
            console.log('Excel report generated and sent successfully');
            
        } catch (error) {
            console.error('Error generating Excel report:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate Excel report',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Download Word report
    async downloadWord(req, res) {
        try {
            console.log('Starting Word report generation...');
            const { orders } = await orderReportService.getReportData();
            
            console.log(`Generating Word document with ${orders.length} orders`);
            const wordBuffer = await orderReportService.generateWord(orders);
            
            const filename = `orders-report-${new Date().toISOString().split('T')[0]}.docx`;
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', wordBuffer.length);
            res.setHeader('Cache-Control', 'no-cache');
            
            res.send(wordBuffer);
            console.log('Word report generated and sent successfully');
            
        } catch (error) {
            console.error('Error generating Word report:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate Word report',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Get report preview data (for frontend display)
    async getReportPreview(req, res) {
        try {
            console.log('Fetching report preview data...');
            const { orders, stats, dishData, customerData } = await orderReportService.getReportData();
            
            const totalOrders = stats.totalOrders || 0;
            const completedOrders = stats.completedOrders || 0;
            const paidOrders = stats.paidOrders || 0;
            
            // Send summary data for preview
            res.json({
                success: true,
                data: {
                    summary: {
                        totalOrders: totalOrders,
                        totalRevenue: stats.totalRevenue || 0,
                        avgOrderValue: stats.avgOrderValue || 0,
                        completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0,
                        paymentRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0
                    },
                    recentOrders: (orders || []).slice(0, 10),
                    topDishes: (dishData || []).slice(0, 5),
                    topCustomers: (customerData.topCustomers || []).slice(0, 5),
                    ordersByDay: (stats.ordersByDay || []).slice(0, 7),
                    ordersByTime: stats.ordersByTime || [],
                    topTables: (stats.topTables || []).slice(0, 5)
                },
                timestamp: new Date().toISOString()
            });
            
            console.log('Report preview data sent successfully');
            
        } catch (error) {
            console.error('Error fetching report preview:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch report preview',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Get report statistics with AI insights
    async getReportStats(req, res) {
        try {
            console.log('Fetching detailed report statistics...');
            const { stats, dishData, customerData } = await orderReportService.getReportData();
            
            const insights = orderReportService.generateAIInsights(stats, dishData, customerData);
            
            res.json({
                success: true,
                data: {
                    statistics: stats,
                    dishPopularity: dishData || [],
                    customerInsights: customerData,
                    aiInsights: insights,
                    generatedAt: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
            
            console.log('Report statistics sent successfully');
            
        } catch (error) {
            console.error('Error fetching report statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch report statistics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Download all reports metadata (for bulk download preparation)
    async downloadAllReports(req, res) {
        try {
            console.log('Preparing all report formats...');
            const { orders, stats, dishData, customerData } = await orderReportService.getReportData();
            
            // For large datasets, consider implementing queue-based processing
            const dateStr = new Date().toISOString().split('T')[0];
            
            res.json({
                success: true,
                data: {
                    available_formats: ['pdf', 'excel', 'word'],
                    endpoints: {
                        pdf: `/api/reports/download/pdf`,
                        excel: `/api/reports/download/excel`,
                        word: `/api/reports/download/word`
                    },
                    suggested_filenames: {
                        pdf: `restaurant-analytics-report-${dateStr}.pdf`,
                        excel: `orders-report-${dateStr}.xlsx`,
                        word: `orders-report-${dateStr}.docx`
                    },
                    data_summary: {
                        total_orders: orders.length,
                        total_dishes: dishData.length,
                        total_customers: customerData.totalCustomers || 0,
                        date_range: stats.ordersByDay.length > 0 ? {
                            from: stats.ordersByDay[stats.ordersByDay.length - 1]?.order_date,
                            to: stats.ordersByDay[0]?.order_date
                        } : null
                    }
                },
                timestamp: new Date().toISOString()
            });
            
            console.log('All reports metadata prepared successfully');
            
        } catch (error) {
            console.error('Error preparing all reports:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to prepare reports',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Health check for report service
    async healthCheck(req, res) {
        try {
            console.log('Performing health check...');
            
            // Test database connectivity
            const startTime = Date.now();
            const { stats } = await orderReportService.getReportData();
            const responseTime = Date.now() - startTime;
            
            res.json({
                success: true,
                message: 'Report service is healthy',
                health: {
                    database: 'connected',
                    response_time_ms: responseTime,
                    total_orders: stats.totalOrders || 0,
                    service_status: 'operational'
                },
                version: '1.0.0',
                timestamp: new Date().toISOString()
            });
            
            console.log(`Health check passed in ${responseTime}ms`);
            
        } catch (error) {
            console.error('Health check failed:', error);
            res.status(503).json({
                success: false,
                message: 'Report service is unhealthy',
                health: {
                    database: 'disconnected',
                    service_status: 'degraded',
                    last_error: error.message
                },
                timestamp: new Date().toISOString()
            });
        }
    }

    // Get basic order count for quick checks
    async getOrderCount(req, res) {
        try {
            const { stats } = await orderReportService.getReportData();
            
            res.json({
                success: true,
                data: {
                    total_orders: stats.totalOrders || 0,
                    completed_orders: stats.completedOrders || 0,
                    pending_orders: stats.pendingOrders || 0,
                    total_revenue: stats.totalRevenue || 0
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error fetching order count:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch order count',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

export default new OrderReportController();