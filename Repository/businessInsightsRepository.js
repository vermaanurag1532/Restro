// repositories/businessInsightsRepository.js - FIXED VERSION
import connection from '../Connection/Connection.js';
import { promisify } from 'util';

class BusinessInsightsRepository {
    constructor() {
        this.query = promisify(connection.query).bind(connection);
    }

    async getOrderAnalytics(startDate, endDate) {
        const sql = `
            SELECT 
                o.\`Order Id\`,
                o.\`Customer Id\`,
                o.\`Table No\`,
                o.Amount,
                o.Time,
                o.Date,
                o.Dishes,
                o.\`Payment Status\`,
                o.\`Serving Status\`,
                c.\`Customer Name\`,
                c.\`Contact Number\`,
                c.Email
            FROM \`Order\` o
            LEFT JOIN Customer c ON o.\`Customer Id\` = c.\`Customer Id\`
            WHERE o.Date BETWEEN ? AND ?
            ORDER BY o.Date DESC, o.Time DESC
        `;
        return await this.query(sql, [startDate, endDate]);
    }

    async getDishAnalytics() {
        const sql = `
            SELECT 
                DishId,
                Name,
                Price,
                Rating,
                \`Cooking Time\`,
                \`Type of Dish\`,
                \`Genre of Taste\`,
                Available
            FROM Dish
            ORDER BY Rating DESC
        `;
        return await this.query(sql);
    }

    async getFeedbackAnalytics(startDate, endDate) {
        const sql = `
            SELECT 
                f.\`Feedback Id\`,
                f.Feedback,
                f.\`Order Id\`,
                f.\`Customer Id\`,
                o.Amount,
                o.Date,
                o.Time,
                c.\`Customer Name\`
            FROM Feedback f
            LEFT JOIN \`Order\` o ON f.\`Order Id\` = o.\`Order Id\`
            LEFT JOIN Customer c ON f.\`Customer Id\` = c.\`Customer Id\`
            WHERE o.Date BETWEEN ? AND ?
            ORDER BY o.Date DESC
        `;
        return await this.query(sql, [startDate, endDate]);
    }

    async getRevenueAnalytics(startDate, endDate) {
        const sql = `
            SELECT 
                DATE(Date) as order_date,
                COUNT(*) as total_orders,
                SUM(Amount) as daily_revenue,
                AVG(Amount) as avg_order_value,
                COUNT(DISTINCT \`Customer Id\`) as unique_customers
            FROM \`Order\`
            WHERE Date BETWEEN ? AND ? AND \`Payment Status\` = 1
            GROUP BY DATE(Date)
            ORDER BY order_date DESC
        `;
        return await this.query(sql, [startDate, endDate]);
    }

    // FIXED: Simplified popular dishes query without complex JSON extraction
    async getPopularDishes(startDate, endDate) {
        try {
            // First, let's get all orders with their dish data
            const sql = `
                SELECT 
                    o.\`Order Id\`,
                    o.Dishes,
                    o.Date
                FROM \`Order\` o
                WHERE o.Date BETWEEN ? AND ? 
                AND o.\`Payment Status\` = 1
                AND o.Dishes IS NOT NULL
                AND o.Dishes != ''
            `;
            
            const orders = await this.query(sql, [startDate, endDate]);
            
            // Process the JSON data in JavaScript instead of MySQL
            const dishCounts = {};
            
            for (const order of orders) {
                try {
                    let dishes;
                    if (typeof order.Dishes === 'string') {
                        dishes = JSON.parse(order.Dishes);
                    } else {
                        dishes = order.Dishes;
                    }
                    
                    if (Array.isArray(dishes)) {
                        for (const dish of dishes) {
                            const dishId = dish['Dish Id'] || dish.dishId || dish.DishId;
                            const quantity = parseInt(dish.Quantity || dish.quantity || 1);
                            
                            if (dishId) {
                                if (!dishCounts[dishId]) {
                                    dishCounts[dishId] = {
                                        dish_id: dishId,
                                        total_quantity: 0,
                                        order_count: 0
                                    };
                                }
                                dishCounts[dishId].total_quantity += quantity;
                                dishCounts[dishId].order_count += 1;
                            }
                        }
                    }
                } catch (jsonError) {
                    console.warn('Failed to parse dish JSON for order:', order['Order Id'], jsonError);
                    continue;
                }
            }
            
            // Get dish details and combine with counts
            const dishIds = Object.keys(dishCounts);
            if (dishIds.length === 0) {
                return [];
            }
            
            const placeholders = dishIds.map(() => '?').join(',');
            const dishDetailsSql = `
                SELECT DishId, Name, Price, Rating
                FROM Dish 
                WHERE DishId IN (${placeholders})
            `;
            
            const dishDetails = await this.query(dishDetailsSql, dishIds);
            
            // Combine counts with dish details
            const result = dishDetails.map(dish => ({
                dish_id: dish.DishId,
                dish_name: dish.Name,
                dish_price: dish.Price,
                dish_rating: dish.Rating,
                quantity: dishCounts[dish.DishId]?.total_quantity || 0,
                order_count: dishCounts[dish.DishId]?.order_count || 0
            }));
            
            // Sort by total quantity
            return result.sort((a, b) => b.quantity - a.quantity);
            
        } catch (error) {
            console.error('Error in getPopularDishes:', error);
            // Return empty array as fallback
            return [];
        }
    }

    async getCustomerAnalytics(startDate, endDate) {
        const sql = `
            SELECT 
                c.\`Customer Id\`,
                c.\`Customer Name\`,
                c.Email,
                COUNT(o.\`Order Id\`) as total_orders,
                COALESCE(SUM(o.Amount), 0) as total_spent,
                COALESCE(AVG(o.Amount), 0) as avg_order_value,
                MAX(o.Date) as last_order_date
            FROM Customer c
            LEFT JOIN \`Order\` o ON c.\`Customer Id\` = o.\`Customer Id\`
                AND o.Date BETWEEN ? AND ? 
                AND o.\`Payment Status\` = 1
            GROUP BY c.\`Customer Id\`, c.\`Customer Name\`, c.Email
            HAVING total_orders > 0
            ORDER BY total_spent DESC
        `;
        return await this.query(sql, [startDate, endDate]);
    }

    async getTableAnalytics(startDate, endDate) {
        const sql = `
            SELECT 
                \`Table No\`,
                COUNT(*) as total_orders,
                SUM(Amount) as total_revenue,
                AVG(Amount) as avg_order_value
            FROM \`Order\`
            WHERE Date BETWEEN ? AND ? AND \`Payment Status\` = 1
            GROUP BY \`Table No\`
            ORDER BY total_revenue DESC
        `;
        return await this.query(sql, [startDate, endDate]);
    }

    async getTimeBasedAnalytics(startDate, endDate) {
        // Handle different time formats more robustly
        const sql = `
            SELECT 
                CASE 
                    WHEN Time REGEXP '^[0-9]{1,2}:[0-9]{2}$' THEN 
                        HOUR(STR_TO_DATE(Time, '%H:%i'))
                    WHEN Time REGEXP '^[0-9]{1,2}:[0-9]{2}:[0-9]{2}$' THEN 
                        HOUR(STR_TO_DATE(Time, '%H:%i:%s'))
                    ELSE 
                        HOUR(CURTIME())
                END as hour_of_day,
                COUNT(*) as order_count,
                SUM(Amount) as hourly_revenue,
                AVG(Amount) as avg_order_value
            FROM \`Order\`
            WHERE Date BETWEEN ? AND ? 
            AND \`Payment Status\` = 1
            AND Time IS NOT NULL
            AND Time != ''
            GROUP BY hour_of_day
            HAVING hour_of_day IS NOT NULL
            ORDER BY hour_of_day
        `;
        return await this.query(sql, [startDate, endDate]);
    }

    async getOverallMetrics(startDate, endDate) {
        const sql = `
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(CASE WHEN \`Payment Status\` = 1 THEN Amount ELSE 0 END), 0) as total_revenue,
                COALESCE(AVG(CASE WHEN \`Payment Status\` = 1 THEN Amount ELSE NULL END), 0) as avg_order_value,
                COUNT(DISTINCT \`Customer Id\`) as unique_customers,
                COUNT(DISTINCT \`Table No\`) as tables_used,
                SUM(CASE WHEN \`Payment Status\` = 1 THEN 1 ELSE 0 END) as successful_orders,
                SUM(CASE WHEN \`Payment Status\` = 0 THEN 1 ELSE 0 END) as pending_orders
            FROM \`Order\`
            WHERE Date BETWEEN ? AND ?
        `;
        const result = await this.query(sql, [startDate, endDate]);
        return result[0];
    }

    // Test database connection
    async testConnection() {
        try {
            const result = await this.query('SELECT 1 as test');
            return { success: true, result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get sample data for debugging
    async getSampleData() {
        try {
            const tables = ['Order', 'Customer', 'Dish', 'Feedback'];
            const results = {};
            
            for (const table of tables) {
                try {
                    const sampleSql = `SELECT * FROM \`${table}\` LIMIT 3`;
                    results[table] = await this.query(sampleSql);
                } catch (error) {
                    results[table] = { error: error.message };
                }
            }
            
            return results;
        } catch (error) {
            return { error: error.message };
        }
    }
}

export default BusinessInsightsRepository;