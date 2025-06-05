// services/orderReportService.js - SAFE VERSION
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel } from 'docx';
import orderReportRepository from '../Repository/orderReportRepository.js';

class OrderReportService {
    
    // Generate AI-based insights for PDF with safe data handling
    generateAIInsights(stats, dishData, customerData) {
        const insights = [];
        
        try {
            // Safely calculate metrics with fallbacks
            const totalOrders = stats.totalOrders || 0;
            const completedOrders = stats.completedOrders || 0;
            const paidOrders = stats.paidOrders || 0;
            
            const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0;
            const paymentRate = totalOrders > 0 ? (paidOrders / totalOrders * 100).toFixed(1) : 0;
            
            // Business Performance
            insights.push({
                title: "📊 Business Performance",
                content: `Your restaurant has processed ${totalOrders} orders with a ${completionRate}% completion rate. Payment collection stands at ${paymentRate}%, showing ${paymentRate > 90 ? 'excellent' : paymentRate > 75 ? 'good' : 'room for improvement'} financial performance.`
            });

            // Revenue Insights
            const avgOrderValue = stats.avgOrderValue || 0;
            const totalRevenue = stats.totalRevenue || 0;
            
            insights.push({
                title: "💰 Revenue Analysis",
                content: `Total revenue: ₹${totalRevenue.toLocaleString()}. Average order value of ₹${avgOrderValue.toFixed(2)} indicates ${avgOrderValue > 400 ? 'premium positioning' : avgOrderValue > 250 ? 'mid-range appeal' : 'value-focused strategy'}.`
            });

            // Peak Hours Analysis
            if (stats.ordersByTime && stats.ordersByTime.length > 0) {
                const peakHour = stats.ordersByTime.reduce((max, current) => 
                    (current.order_count || 0) > (max.order_count || 0) ? current : max, {order_count: 0, hour: 0});
                
                insights.push({
                    title: "⏰ Peak Performance",
                    content: `Peak ordering time is ${peakHour.hour}:00 with ${peakHour.order_count} orders. Consider optimizing staff allocation during this period.`
                });
            }

            // Table Performance
            if (stats.topTables && stats.topTables.length > 0) {
                const topTable = stats.topTables[0];
                insights.push({
                    title: "🪑 Table Analytics",
                    content: `Table ${topTable['Table No']} leads with ${topTable.order_count} orders generating ₹${(topTable.table_revenue || 0).toLocaleString()}.`
                });
            }

            // Dish Recommendations
            if (dishData && dishData.length > 0) {
                const topDish = dishData[0];
                insights.push({
                    title: "🍽️ Menu Intelligence",
                    content: `"${topDish.dish_name}" is popular with a ${topDish.dish_rating}-star rating. Consider featuring similar items or creating combo offers.`
                });
            }

            // Customer Behavior
            const totalCustomers = customerData.totalCustomers || 0;
            const avgOrdersPerCustomer = customerData.avgOrdersPerCustomer || 0;
            
            insights.push({
                title: "👥 Customer Insights",
                content: `${totalCustomers} unique customers with an average of ${avgOrdersPerCustomer.toFixed(1)} orders each. Focus on loyalty programs to increase repeat visits.`
            });

            // Strategic Recommendations
            const recommendations = [];
            const pendingOrders = stats.pendingOrders || 0;
            const unpaidOrders = stats.unpaidOrders || 0;
            
            if (totalOrders > 0) {
                if (pendingOrders > totalOrders * 0.2) {
                    recommendations.push("Optimize kitchen workflow to reduce completion time");
                }
                if (unpaidOrders > totalOrders * 0.1) {
                    recommendations.push("Implement automated payment reminders");
                }
                if (avgOrderValue < 300) {
                    recommendations.push("Introduce upselling strategies and combo meals");
                }
            }

            if (recommendations.length > 0) {
                insights.push({
                    title: "🎯 Strategic Recommendations",
                    content: recommendations.join(". ") + "."
                });
            }

            return insights;
        } catch (error) {
            console.error('Error generating AI insights:', error);
            return [{
                title: "📊 Business Summary",
                content: "Report generated successfully. Contact system administrator for detailed insights."
            }];
        }
    }

    // Generate PDF with safe error handling
    async generatePDF(orders, stats, dishData, customerData) {
        return new Promise((resolve) => {
            try {
                const doc = new PDFDocument({ 
                    margin: 50,
                    size: 'A4'
                });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header
                doc.fontSize(24).fillColor('#1a365d').text('🏪 Restaurant Analytics Report', { align: 'center' });
                doc.fontSize(12).fillColor('#666').text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
                doc.moveDown(2);

                // Executive Summary Box
                const totalOrders = stats.totalOrders || 0;
                const totalRevenue = stats.totalRevenue || 0;
                const avgOrderValue = stats.avgOrderValue || 0;
                const completionRate = totalOrders > 0 ? (stats.completedOrders / totalOrders * 100).toFixed(1) : 0;
                const paymentRate = totalOrders > 0 ? (stats.paidOrders / totalOrders * 100).toFixed(1) : 0;

                doc.rect(50, doc.y, 495, 80).stroke('#e2e8f0');
                doc.fontSize(16).fillColor('#2d3748').text('📋 Executive Summary', 60, doc.y + 10);
                doc.fontSize(11).fillColor('#4a5568')
                   .text(`Total Orders: ${totalOrders} | Revenue: ₹${totalRevenue.toLocaleString()} | Avg Order: ₹${avgOrderValue.toFixed(0)}`, 60, doc.y + 5)
                   .text(`Completion Rate: ${completionRate}% | Payment Rate: ${paymentRate}%`, 60, doc.y + 5);
                doc.moveDown(3);

                // AI Insights Section
                const insights = this.generateAIInsights(stats, dishData, customerData);
                doc.fontSize(18).fillColor('#1a365d').text('🤖 AI-Powered Business Insights', { underline: true });
                doc.moveDown();

                insights.forEach(insight => {
                    if (doc.y > 700) {
                        doc.addPage();
                    }
                    doc.fontSize(14).fillColor('#2d3748').text(insight.title);
                    doc.fontSize(10).fillColor('#4a5568').text(insight.content, { width: 495, align: 'justify' });
                    doc.moveDown();
                });

                // Performance Metrics
                doc.addPage();
                doc.fontSize(18).fillColor('#1a365d').text('📈 Performance Metrics');
                doc.moveDown();

                // Revenue Chart (Text-based)
                if (stats.ordersByDay && stats.ordersByDay.length > 0) {
                    doc.fontSize(14).fillColor('#2d3748').text('Daily Revenue Trend');
                    const recentDays = stats.ordersByDay.slice(0, 7);
                    const maxRevenue = Math.max(...recentDays.map(d => d.daily_revenue || 0));
                    
                    recentDays.forEach(day => {
                        const revenue = day.daily_revenue || 0;
                        const barLength = maxRevenue > 0 ? Math.floor((revenue / maxRevenue) * 200) : 0;
                        doc.fontSize(10).fillColor('#4a5568')
                           .text(`${day.order_date}: `, 60, doc.y)
                           .text('█'.repeat(Math.max(1, barLength/10)), 140, doc.y - 12, { fillColor: '#48bb78' })
                           .text(` ₹${revenue.toLocaleString()}`, 350, doc.y - 12);
                        doc.moveDown(0.5);
                    });
                }

                // Top Dishes
                if (dishData && dishData.length > 0) {
                    doc.moveDown();
                    doc.fontSize(14).fillColor('#2d3748').text('🏆 Top Performing Dishes');
                    dishData.slice(0, 5).forEach((dish, index) => {
                        doc.fontSize(10).fillColor('#4a5568')
                           .text(`${index + 1}. ${dish.dish_name || 'Unknown'}`, 60, doc.y)
                           .text(`${dish.order_frequency || 0} orders`, 250, doc.y - 12)
                           .text(`₹${dish.dish_price || 0}`, 350, doc.y - 12)
                           .text(`⭐ ${dish.dish_rating || 0}`, 420, doc.y - 12);
                        doc.moveDown(0.5);
                    });
                }

                // Order Details Table
                if (orders && orders.length > 0) {
                    doc.addPage();
                    doc.fontSize(18).fillColor('#1a365d').text('📋 Recent Orders');
                    doc.moveDown();

                    // Table Headers
                    const tableTop = doc.y;
                    doc.fontSize(9).fillColor('#2d3748');
                    doc.text('Order ID', 50, tableTop);
                    doc.text('Customer', 120, tableTop);
                    doc.text('Table', 200, tableTop);
                    doc.text('Amount', 240, tableTop);
                    doc.text('Date', 290, tableTop);
                    doc.text('Status', 380, tableTop);

                    // Draw header line
                    doc.moveTo(50, tableTop + 15).lineTo(450, tableTop + 15).stroke();

                    let yPosition = tableTop + 25;
                    orders.slice(0, 20).forEach(order => {
                        if (yPosition > 750) {
                            doc.addPage();
                            yPosition = 50;
                        }

                        doc.fontSize(8).fillColor('#4a5568');
                        doc.text((order['Order Id'] || '').substring(0, 8), 50, yPosition);
                        doc.text(order['Customer Name'] || 'Guest', 120, yPosition);
                        doc.text(order['Table No'] || 'N/A', 200, yPosition);
                        doc.text(`₹${order.Amount || 0}`, 240, yPosition);
                        doc.text(order.Date ? new Date(order.Date).toLocaleDateString() : 'N/A', 290, yPosition);
                        doc.text(order['Serving Status'] ? '✅' : '⏳', 380, yPosition);
                        
                        yPosition += 15;
                    });
                }

                // Footer
                doc.fontSize(8).fillColor('#a0aec0').text(
                    'Generated by Restaurant Management System with AI Analytics',
                    50, 750, { align: 'center', width: 500 }
                );

                doc.end();
            } catch (error) {
                console.error('Error generating PDF:', error);
                // Return a simple error PDF
                const errorDoc = new PDFDocument();
                const chunks = [];
                errorDoc.on('data', chunk => chunks.push(chunk));
                errorDoc.on('end', () => resolve(Buffer.concat(chunks)));
                errorDoc.text('Error generating report. Please try again.');
                errorDoc.end();
            }
        });
    }

    // Generate Excel file with error handling
    async generateExcel(orders) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Orders Report');

            // Add headers
            worksheet.columns = [
                { header: 'Order ID', key: 'orderId', width: 15 },
                { header: 'Customer Name', key: 'customerName', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Contact', key: 'contact', width: 15 },
                { header: 'Table No', key: 'tableNo', width: 10 },
                { header: 'Amount', key: 'amount', width: 12 },
                { header: 'Date', key: 'date', width: 12 },
                { header: 'Time', key: 'time', width: 10 },
                { header: 'Payment Status', key: 'paymentStatus', width: 15 },
                { header: 'Serving Status', key: 'servingStatus', width: 15 }
            ];

            // Style headers
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            // Add data safely
            if (orders && orders.length > 0) {
                orders.forEach(order => {
                    worksheet.addRow({
                        orderId: order['Order Id'] || 'N/A',
                        customerName: order['Customer Name'] || 'Guest',
                        email: order['Email'] || 'N/A',
                        contact: order['Contact Number'] || 'N/A',
                        tableNo: order['Table No'] || 'N/A',
                        amount: order['Amount'] || 0,
                        date: order['Date'] ? new Date(order['Date']).toLocaleDateString() : 'N/A',
                        time: order['Time'] || 'N/A',
                        paymentStatus: order['Payment Status'] ? 'Paid' : 'Pending',
                        servingStatus: order['Serving Status'] ? 'Served' : 'Pending'
                    });
                });
            } else {
                worksheet.addRow({
                    orderId: 'No data available',
                    customerName: '',
                    email: '',
                    contact: '',
                    tableNo: '',
                    amount: '',
                    date: '',
                    time: '',
                    paymentStatus: '',
                    servingStatus: ''
                });
            }

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            console.error('Error generating Excel:', error);
            throw new Error('Failed to generate Excel file');
        }
    }

    // Generate Word document with error handling
    async generateWord(orders) {
        try {
            const tableRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph("Order ID")] }),
                        new TableCell({ children: [new Paragraph("Customer")] }),
                        new TableCell({ children: [new Paragraph("Table")] }),
                        new TableCell({ children: [new Paragraph("Amount")] }),
                        new TableCell({ children: [new Paragraph("Date")] }),
                        new TableCell({ children: [new Paragraph("Status")] })
                    ]
                })
            ];

            if (orders && orders.length > 0) {
                orders.slice(0, 50).forEach(order => {
                    tableRows.push(
                        new TableRow({
                            children: [
                                new TableCell({ children: [new Paragraph(order['Order Id'] || 'N/A')] }),
                                new TableCell({ children: [new Paragraph(order['Customer Name'] || 'Guest')] }),
                                new TableCell({ children: [new Paragraph(order['Table No'] || 'N/A')] }),
                                new TableCell({ children: [new Paragraph(`₹${order['Amount'] || 0}`)] }),
                                new TableCell({ children: [new Paragraph(order['Date'] ? new Date(order['Date']).toLocaleDateString() : 'N/A')] }),
                                new TableCell({ children: [new Paragraph(order['Serving Status'] ? 'Served' : 'Pending')] })
                            ]
                        })
                    );
                });
            } else {
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph("No data available")] }),
                            new TableCell({ children: [new Paragraph("")] }),
                            new TableCell({ children: [new Paragraph("")] }),
                            new TableCell({ children: [new Paragraph("")] }),
                            new TableCell({ children: [new Paragraph("")] }),
                            new TableCell({ children: [new Paragraph("")] })
                        ]
                    })
                );
            }

            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: "Restaurant Orders Report",
                            heading: HeadingLevel.TITLE,
                        }),
                        new Paragraph({
                            text: `Generated on: ${new Date().toLocaleDateString()}`,
                            spacing: { after: 200 }
                        }),
                        new Table({
                            rows: tableRows
                        })
                    ]
                }]
            });

            return await Packer.toBuffer(doc);
        } catch (error) {
            console.error('Error generating Word document:', error);
            throw new Error('Failed to generate Word document');
        }
    }

    // Main service method to get all data with comprehensive error handling
    async getReportData() {
        try {
            console.log('Starting report data collection...');
            
            // Test database connection first
            await orderReportRepository.testConnection();
            console.log('Database connection successful');
            
            const [orders, stats, dishData, customerData] = await Promise.allSettled([
                orderReportRepository.getAllOrdersWithDetails(),
                orderReportRepository.getOrderStatistics(),
                orderReportRepository.getDishPopularity(),
                orderReportRepository.getCustomerInsights()
            ]);

            // Handle results with fallbacks
            const processResult = (result, defaultValue) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error('Query failed:', result.reason);
                    return defaultValue;
                }
            };

            const finalData = {
                orders: processResult(orders, []),
                stats: processResult(stats, {
                    totalOrders: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0,
                    completedOrders: 0,
                    pendingOrders: 0,
                    paidOrders: 0,
                    unpaidOrders: 0,
                    ordersByDay: [],
                    ordersByTime: [],
                    topTables: []
                }),
                dishData: processResult(dishData, []),
                customerData: processResult(customerData, {
                    totalCustomers: 0,
                    topCustomers: [],
                    avgOrdersPerCustomer: 0
                })
            };

            console.log('Report data collection completed successfully');
            return finalData;
            
        } catch (error) {
            console.error('Critical error in getReportData:', error);
            throw new Error(`Failed to generate report data: ${error.message}`);
        }
    }
}

export default new OrderReportService();