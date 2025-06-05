// repositories/orderReportRepository.js - FIXED VERSION
import connection from '../Connection/Connection.js';

class OrderReportRepository {
    // Get all orders with detailed information
    async getAllOrdersWithDetails() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    o.\`Order Id\`,
                    o.\`Customer Id\`,
                    COALESCE(c.\`Customer Name\`, 'Guest') as \`Customer Name\`,
                    COALESCE(c.\`Contact Number\`, 0) as \`Contact Number\`,
                    COALESCE(c.\`Email\`, 'N/A') as \`Email\`,
                    o.\`Table No\`,
                    o.\`Amount\`,
                    o.\`Time\`,
                    o.\`Date\`,
                    o.\`Dishes\`,
                    o.\`Payment Status\`,
                    o.\`Serving Status\`
                FROM \`Order\` o
                LEFT JOIN \`Customer\` c ON o.\`Customer Id\` = c.\`Customer Id\`
                ORDER BY o.\`Date\` DESC, o.\`Time\` DESC
            `;
            
            connection.query(query, (error, results) => {
                if (error) {
                    console.error('Error in getAllOrdersWithDetails:', error);
                    reject(error);
                } else {
                    resolve(results || []);
                }
            });
        });
    }

    // Get order statistics for AI insights
    async getOrderStatistics() {
        return new Promise((resolve, reject) => {
            const queries = {
                totalOrders: "SELECT COUNT(*) as count FROM `Order`",
                totalRevenue: "SELECT COALESCE(SUM(`Amount`), 0) as total FROM `Order` WHERE `Payment Status` = 1",
                avgOrderValue: "SELECT COALESCE(AVG(`Amount`), 0) as avg FROM `Order`",
                completedOrders: "SELECT COUNT(*) as count FROM `Order` WHERE `Serving Status` = 1",
                pendingOrders: "SELECT COUNT(*) as count FROM `Order` WHERE `Serving Status` = 0",
                paidOrders: "SELECT COUNT(*) as count FROM `Order` WHERE `Payment Status` = 1",
                unpaidOrders: "SELECT COUNT(*) as count FROM `Order` WHERE `Payment Status` = 0",
                ordersByDay: `
                    SELECT 
                        DATE(\`Date\`) as order_date,
                        COUNT(*) as order_count,
                        COALESCE(SUM(\`Amount\`), 0) as daily_revenue
                    FROM \`Order\` 
                    WHERE \`Date\` IS NOT NULL
                    GROUP BY DATE(\`Date\`) 
                    ORDER BY order_date DESC 
                    LIMIT 30
                `,
                ordersByTime: `
                    SELECT 
                        COALESCE(HOUR(STR_TO_DATE(\`Time\`, '%H:%i')), 0) as hour,
                        COUNT(*) as order_count
                    FROM \`Order\` 
                    WHERE \`Time\` IS NOT NULL AND \`Time\` != ''
                    GROUP BY HOUR(STR_TO_DATE(\`Time\`, '%H:%i'))
                    ORDER BY hour
                `,
                topTables: `
                    SELECT 
                        \`Table No\`,
                        COUNT(*) as order_count,
                        COALESCE(SUM(\`Amount\`), 0) as table_revenue
                    FROM \`Order\` 
                    WHERE \`Table No\` IS NOT NULL AND \`Table No\` != ''
                    GROUP BY \`Table No\`
                    ORDER BY order_count DESC
                    LIMIT 10
                `
            };

            const executeQuery = (query) => {
                return new Promise((resolve, reject) => {
                    connection.query(query, (error, results) => {
                        if (error) {
                            console.error('Query error:', error);
                            reject(error);
                        } else {
                            resolve(results || []);
                        }
                    });
                });
            };

            Promise.all([
                executeQuery(queries.totalOrders),
                executeQuery(queries.totalRevenue),
                executeQuery(queries.avgOrderValue),
                executeQuery(queries.completedOrders),
                executeQuery(queries.pendingOrders),
                executeQuery(queries.paidOrders),
                executeQuery(queries.unpaidOrders),
                executeQuery(queries.ordersByDay),
                executeQuery(queries.ordersByTime),
                executeQuery(queries.topTables)
            ]).then(results => {
                resolve({
                    totalOrders: results[0][0]?.count || 0,
                    totalRevenue: results[1][0]?.total || 0,
                    avgOrderValue: results[2][0]?.avg || 0,
                    completedOrders: results[3][0]?.count || 0,
                    pendingOrders: results[4][0]?.count || 0,
                    paidOrders: results[5][0]?.count || 0,
                    unpaidOrders: results[6][0]?.count || 0,
                    ordersByDay: results[7] || [],
                    ordersByTime: results[8] || [],
                    topTables: results[9] || []
                });
            }).catch(error => {
                console.error('Error in getOrderStatistics:', error);
                reject(error);
            });
        });
    }

    // Get dish popularity data - simplified approach
    async getDishPopularity() {
        return new Promise((resolve, reject) => {
            // First, try to get basic dish data
            const simpleQuery = `
                SELECT 
                    d.\`Name\` as dish_name,
                    d.\`Price\` as dish_price,
                    COALESCE(d.\`Rating\`, 0) as dish_rating,
                    COALESCE(COUNT(o.\`Order Id\`), 0) as order_frequency
                FROM \`Dish\` d
                LEFT JOIN \`Order\` o ON o.\`Dishes\` LIKE CONCAT('%', d.\`DishId\`, '%')
                WHERE d.\`Available\` = 1
                GROUP BY d.\`DishId\`, d.\`Name\`, d.\`Price\`, d.\`Rating\`
                ORDER BY order_frequency DESC, d.\`Rating\` DESC
                LIMIT 10
            `;
            
            connection.query(simpleQuery, (error, results) => {
                if (error) {
                    console.error('Error in getDishPopularity:', error);
                    // Return default data if query fails
                    resolve([]);
                } else {
                    resolve(results || []);
                }
            });
        });
    }

    // Get customer insights
    async getCustomerInsights() {
        return new Promise((resolve, reject) => {
            const queries = {
                totalCustomers: "SELECT COUNT(DISTINCT `Customer Id`) as count FROM `Order` WHERE `Customer Id` IS NOT NULL",
                topCustomers: `
                    SELECT 
                        COALESCE(c.\`Customer Name\`, 'Guest') as \`Customer Name\`,
                        COALESCE(c.\`Email\`, 'N/A') as \`Email\`,
                        COUNT(o.\`Order Id\`) as order_count,
                        COALESCE(SUM(o.\`Amount\`), 0) as total_spent
                    FROM \`Order\` o
                    LEFT JOIN \`Customer\` c ON o.\`Customer Id\` = c.\`Customer Id\`
                    WHERE o.\`Customer Id\` IS NOT NULL
                    GROUP BY o.\`Customer Id\`, c.\`Customer Name\`, c.\`Email\`
                    ORDER BY total_spent DESC
                    LIMIT 10
                `,
                avgOrdersPerCustomer: `
                    SELECT COALESCE(AVG(customer_orders.order_count), 0) as avg_orders
                    FROM (
                        SELECT COUNT(*) as order_count
                        FROM \`Order\`
                        WHERE \`Customer Id\` IS NOT NULL
                        GROUP BY \`Customer Id\`
                    ) as customer_orders
                `
            };

            const executeQuery = (query) => {
                return new Promise((resolve, reject) => {
                    connection.query(query, (error, results) => {
                        if (error) {
                            console.error('Customer query error:', error);
                            reject(error);
                        } else {
                            resolve(results || []);
                        }
                    });
                });
            };

            Promise.all([
                executeQuery(queries.totalCustomers),
                executeQuery(queries.topCustomers),
                executeQuery(queries.avgOrdersPerCustomer)
            ]).then(results => {
                resolve({
                    totalCustomers: results[0][0]?.count || 0,
                    topCustomers: results[1] || [],
                    avgOrdersPerCustomer: results[2][0]?.avg_orders || 0
                });
            }).catch(error => {
                console.error('Error in getCustomerInsights:', error);
                // Return default data on error
                resolve({
                    totalCustomers: 0,
                    topCustomers: [],
                    avgOrdersPerCustomer: 0
                });
            });
        });
    }

    // Test database connection
    async testConnection() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT 1 as test', (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
}

export default new OrderReportRepository();