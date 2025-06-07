// controllers/businessInsightsController.js
import BusinessInsightsService from '../Service/businessInsightsService.js';
import fs from 'fs';
import path from 'path';

class BusinessInsightsController {
    constructor() {
        this.businessInsightsService = new BusinessInsightsService();
    }

    // Get comprehensive business insights
    async getBusinessInsights(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            // Validate date parameters
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required',
                    example: 'GET /api/insights?startDate=2023-01-01&endDate=2023-12-31'
                });
            }

            // Validate date format
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Use YYYY-MM-DD format'
                });
            }

            if (start > end) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date must be before end date'
                });
            }

            console.log(`Generating business insights for period: ${startDate} to ${endDate}`);
            
            const insights = await this.businessInsightsService.generateBusinessInsights(startDate, endDate);
            
            res.status(200).json({
                success: true,
                message: 'Business insights generated successfully',
                data: insights,
                metadata: {
                    period: { startDate, endDate },
                    generatedAt: new Date().toISOString(),
                    dataPoints: {
                        revenueRecords: insights.analyticsData.revenueAnalytics.length,
                        customerRecords: insights.analyticsData.customerAnalytics.length,
                        feedbackRecords: insights.analyticsData.feedbackAnalytics.length,
                        dishRecords: insights.analyticsData.dishAnalytics.length
                    }
                }
            });

        } catch (error) {
            console.error('Error in getBusinessInsights:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate business insights',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Generate and download PDF report
    async generatePDFReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            // Validate date parameters
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            console.log(`Generating PDF report for period: ${startDate} to ${endDate}`);
            
            const result = await this.businessInsightsService.generateInsightsPDF(startDate, endDate);
            
            // Check if file exists
            if (!fs.existsSync(result.filePath)) {
                return res.status(500).json({
                    success: false,
                    message: 'PDF generation failed - file not created'
                });
            }

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // Stream the PDF file
            const fileStream = fs.createReadStream(result.filePath);
            
            fileStream.on('error', (error) => {
                console.error('Error streaming PDF:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error streaming PDF file'
                    });
                }
            });

            fileStream.on('end', () => {
                // Clean up - delete the temporary file after streaming
                setTimeout(() => {
                    try {
                        fs.unlinkSync(result.filePath);
                        console.log(`Temporary PDF file deleted: ${result.filePath}`);
                    } catch (unlinkError) {
                        console.error('Error deleting temporary PDF:', unlinkError);
                    }
                }, 5000); // Delete after 5 seconds
            });

            fileStream.pipe(res);

        } catch (error) {
            console.error('Error in generatePDFReport:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to generate PDF report',
                    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
                });
            }
        }
    }

    // Get quick insights for dashboard
    async getQuickInsights(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            // Default to last 30 days if no dates provided
            const end = endDate ? new Date(endDate) : new Date();
            const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            const quickInsights = await this.businessInsightsService.getQuickInsights(
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            );
            
            res.status(200).json({
                success: true,
                message: 'Quick insights retrieved successfully',
                data: quickInsights,
                metadata: {
                    period: {
                        startDate: start.toISOString().split('T')[0],
                        endDate: end.toISOString().split('T')[0]
                    },
                    generatedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error in getQuickInsights:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get quick insights',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get business health score
    async getBusinessHealth(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            // Default to last 30 days if no dates provided
            const end = endDate ? new Date(endDate) : new Date();
            const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            const healthData = await this.businessInsightsService.getBusinessHealth(
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            );
            
            res.status(200).json({
                success: true,
                message: 'Business health assessment completed',
                data: healthData,
                metadata: {
                    period: {
                        startDate: start.toISOString().split('T')[0],
                        endDate: end.toISOString().split('T')[0]
                    },
                    assessmentDate: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error in getBusinessHealth:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assess business health',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get AI recommendations
    async getAIRecommendations(req, res) {
        try {
            const { startDate, endDate, type } = req.query;
            
            // Validate date parameters
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            console.log(`Generating AI recommendations for period: ${startDate} to ${endDate}`);
            
            const insights = await this.businessInsightsService.generateBusinessInsights(startDate, endDate);
            
            let recommendations = insights.insights.recommendations;
            
            // Filter by type if specified
            if (type && ['immediate', 'shortTerm', 'longTerm'].includes(type)) {
                recommendations = { [type]: recommendations[type] };
            }
            
            res.status(200).json({
                success: true,
                message: 'AI recommendations generated successfully',
                data: {
                    recommendations,
                    executiveSummary: insights.insights.executiveSummary,
                    marketingInsights: insights.insights.marketingInsights,
                    riskAnalysis: insights.insights.riskAnalysis
                },
                metadata: {
                    period: { startDate, endDate },
                    generatedAt: new Date().toISOString(),
                    recommendationTypes: Object.keys(recommendations),
                    totalRecommendations: Object.values(recommendations).reduce((sum, arr) => sum + arr.length, 0)
                }
            });

        } catch (error) {
            console.error('Error in getAIRecommendations:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate AI recommendations',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get revenue analytics
    async getRevenueAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            const analyticsData = await this.businessInsightsService.gatherAnalyticsData(startDate, endDate);
            
            // Calculate additional revenue metrics
            const revenueData = analyticsData.revenueAnalytics;
            const totalRevenue = revenueData.reduce((sum, day) => sum + day.daily_revenue, 0);
            const avgDailyRevenue = totalRevenue / revenueData.length;
            const peakRevenueDay = revenueData.reduce((max, day) => 
                day.daily_revenue > max.daily_revenue ? day : max
            );
            
            // Calculate growth rate
            let growthRate = 0;
            if (revenueData.length >= 2) {
                const firstHalf = revenueData.slice(0, Math.floor(revenueData.length / 2));
                const secondHalf = revenueData.slice(Math.floor(revenueData.length / 2));
                
                const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.daily_revenue, 0) / firstHalf.length;
                const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.daily_revenue, 0) / secondHalf.length;
                
                growthRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
            }

            res.status(200).json({
                success: true,
                message: 'Revenue analytics retrieved successfully',
                data: {
                    dailyRevenue: revenueData,
                    summary: {
                        totalRevenue,
                        avgDailyRevenue,
                        peakRevenueDay: peakRevenueDay.order_date,
                        peakRevenueAmount: peakRevenueDay.daily_revenue,
                        growthRate: parseFloat(growthRate.toFixed(2)),
                        totalDays: revenueData.length
                    },
                    overallMetrics: analyticsData.overallMetrics
                },
                metadata: {
                    period: { startDate, endDate },
                    generatedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error in getRevenueAnalytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get revenue analytics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get customer analytics
    async getCustomerAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            const analyticsData = await this.businessInsightsService.gatherAnalyticsData(startDate, endDate);
            
            const customerData = analyticsData.customerAnalytics;
            const topCustomers = customerData.slice(0, 10);
            const avgCustomerValue = customerData.reduce((sum, customer) => sum + customer.total_spent, 0) / customerData.length;
            
            // Calculate customer segments
            const highValueCustomers = customerData.filter(c => c.total_spent > avgCustomerValue * 1.5);
            const regularCustomers = customerData.filter(c => c.total_spent <= avgCustomerValue * 1.5 && c.total_spent >= avgCustomerValue * 0.5);
            const lowValueCustomers = customerData.filter(c => c.total_spent < avgCustomerValue * 0.5);

            res.status(200).json({
                success: true,
                message: 'Customer analytics retrieved successfully',
                data: {
                    customers: customerData,
                    topCustomers,
                    segments: {
                        highValue: {
                            count: highValueCustomers.length,
                            percentage: (highValueCustomers.length / customerData.length * 100).toFixed(1),
                            avgSpent: highValueCustomers.reduce((sum, c) => sum + c.total_spent, 0) / highValueCustomers.length || 0
                        },
                        regular: {
                            count: regularCustomers.length,
                            percentage: (regularCustomers.length / customerData.length * 100).toFixed(1),
                            avgSpent: regularCustomers.reduce((sum, c) => sum + c.total_spent, 0) / regularCustomers.length || 0
                        },
                        lowValue: {
                            count: lowValueCustomers.length,
                            percentage: (lowValueCustomers.length / customerData.length * 100).toFixed(1),
                            avgSpent: lowValueCustomers.reduce((sum, c) => sum + c.total_spent, 0) / lowValueCustomers.length || 0
                        }
                    },
                    summary: {
                        totalCustomers: customerData.length,
                        avgCustomerValue: parseFloat(avgCustomerValue.toFixed(2)),
                        totalCustomerSpending: customerData.reduce((sum, c) => sum + c.total_spent, 0)
                    }
                },
                metadata: {
                    period: { startDate, endDate },
                    generatedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error in getCustomerAnalytics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get customer analytics',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get operational insights
    async getOperationalInsights(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required'
                });
            }

            const analyticsData = await this.businessInsightsService.gatherAnalyticsData(startDate, endDate);
            
            // Peak hours analysis
            const timeData = analyticsData.timeBasedAnalytics;
            const peakHour = timeData.reduce((max, hour) => 
                hour.order_count > max.order_count ? hour : max
            );
            
            // Table performance
            const tableData = analyticsData.tableAnalytics;
            const topTable = tableData.reduce((max, table) => 
                table.total_revenue > max.total_revenue ? table : max
            );
            
            // Dish performance
            const dishData = analyticsData.popularDishes;
            const dishMap = {};
            dishData.forEach(item => {
                const dishId = item.dish_id;
                if (dishMap[dishId]) {
                    dishMap[dishId].quantity += parseInt(item.quantity);
                } else {
                    dishMap[dishId] = {
                        name: item.dish_name,
                        quantity: parseInt(item.quantity),
                        price: item.dish_price,
                        rating: item.dish_rating
                    };
                }
            });
            
            const topDishes = Object.values(dishMap)
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 10);

            res.status(200).json({
                success: true,
                message: 'Operational insights retrieved successfully',
                data: {
                    peakHours: {
                        hour: `${peakHour.hour_of_day}:00`,
                        orderCount: peakHour.order_count,
                        revenue: peakHour.hourly_revenue,
                        allHours: timeData
                    },
                    tablePerformance: {
                        topTable: topTable['Table No'],
                        topTableRevenue: topTable.total_revenue,
                        allTables: tableData
                    },
                    dishPerformance: {
                        topDish: topDishes[0]?.name || 'No data',
                        topDishQuantity: topDishes[0]?.quantity || 0,
                        topDishes: topDishes
                    },
                    overallMetrics: analyticsData.overallMetrics
                },
                metadata: {
                    period: { startDate, endDate },
                    generatedAt: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Error in getOperationalInsights:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get operational insights',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Health check endpoint
    async healthCheck(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Business Insights API is running',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                endpoints: {
                    insights: 'GET /api/insights',
                    pdf: 'GET /api/insights/pdf',
                    quick: 'GET /api/insights/quick',
                    health: 'GET /api/insights/health-score',
                    recommendations: 'GET /api/insights/recommendations',
                    revenue: 'GET /api/insights/revenue',
                    customers: 'GET /api/insights/customers',
                    operations: 'GET /api/insights/operations'
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Health check failed',
                error: error.message
            });
        }
    }
}

export default BusinessInsightsController;