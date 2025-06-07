// services/businessInsightsService.js
import BusinessInsightsRepository from '../Repository/businessInsightsRepository.js';
import GeminiAnalysisService from './geminiAnalysisService.js';
import PDFGenerationService from './pdfGenerationService.js';

class BusinessInsightsService {
    constructor() {
        this.repository = new BusinessInsightsRepository();
        this.geminiService = new GeminiAnalysisService();
        this.pdfService = new PDFGenerationService();
    }

    async generateBusinessInsights(startDate, endDate) {
        try {
            // Gather all analytics data
            const analyticsData = await this.gatherAnalyticsData(startDate, endDate);
            
            // Generate AI insights using Gemini
            const aiInsights = await this.geminiService.analyzeBusinessData(analyticsData);
            
            // Generate trends analysis
            const trendsAnalysis = await this.geminiService.identifyTrends(
                analyticsData.revenueAnalytics,
                analyticsData.timeBasedAnalytics
            );

            // Generate business summary
            const businessSummary = await this.geminiService.generateBusinessSummary(
                aiInsights,
                analyticsData
            );

            return {
                insights: aiInsights,
                trends: trendsAnalysis,
                summary: businessSummary,
                analyticsData: analyticsData,
                generatedAt: new Date().toISOString(),
                period: { startDate, endDate }
            };

        } catch (error) {
            console.error('Error generating business insights:', error);
            throw new Error('Failed to generate business insights: ' + error.message);
        }
    }

    async generateInsightsPDF(startDate, endDate) {
        try {
            // Generate insights
            const insights = await this.generateBusinessInsights(startDate, endDate);
            
            // Generate PDF filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `business-insights-${timestamp}.pdf`;
            
            // Generate PDF
            const filePath = await this.pdfService.generateInsightsPDF(
                insights.insights,
                insights.analyticsData,
                filename
            );

            return {
                filePath,
                filename,
                insights: insights.insights,
                summary: insights.summary,
                trends: insights.trends
            };

        } catch (error) {
            console.error('Error generating insights PDF:', error);
            throw new Error('Failed to generate insights PDF: ' + error.message);
        }
    }

    async getQuickInsights(startDate, endDate) {
        try {
            const overallMetrics = await this.repository.getOverallMetrics(startDate, endDate);
            const revenueAnalytics = await this.repository.getRevenueAnalytics(startDate, endDate);
            const popularDishes = await this.repository.getPopularDishes(startDate, endDate);
            
            // Generate quick recommendations based on key metrics
            const quickRecommendations = await this.generateQuickRecommendations({
                overallMetrics,
                revenueAnalytics,
                popularDishes
            });

            return {
                metrics: overallMetrics,
                revenue: revenueAnalytics,
                popularDishes: popularDishes,
                recommendations: quickRecommendations,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error getting quick insights:', error);
            throw new Error('Failed to get quick insights: ' + error.message);
        }
    }

    async gatherAnalyticsData(startDate, endDate) {
        try {
            const [
                overallMetrics,
                revenueAnalytics,
                dishAnalytics,
                feedbackAnalytics,
                popularDishes,
                customerAnalytics,
                tableAnalytics,
                timeBasedAnalytics
            ] = await Promise.all([
                this.repository.getOverallMetrics(startDate, endDate),
                this.repository.getRevenueAnalytics(startDate, endDate),
                this.repository.getDishAnalytics(),
                this.repository.getFeedbackAnalytics(startDate, endDate),
                this.repository.getPopularDishes(startDate, endDate),
                this.repository.getCustomerAnalytics(startDate, endDate),
                this.repository.getTableAnalytics(startDate, endDate),
                this.repository.getTimeBasedAnalytics(startDate, endDate)
            ]);

            return {
                overallMetrics,
                revenueAnalytics,
                dishAnalytics,
                feedbackAnalytics,
                popularDishes,
                customerAnalytics,
                tableAnalytics,
                timeBasedAnalytics
            };

        } catch (error) {
            console.error('Error gathering analytics data:', error);
            throw new Error('Failed to gather analytics data: ' + error.message);
        }
    }

    async generateQuickRecommendations(data) {
        try {
            const { overallMetrics, revenueAnalytics, popularDishes } = data;
            
            const recommendations = [];

            // Revenue-based recommendations
            if (overallMetrics.avg_order_value < 500) {
                recommendations.push({
                    type: 'revenue',
                    priority: 'high',
                    title: 'Increase Average Order Value',
                    description: 'Current AOV is below ₹500. Consider upselling strategies, combo meals, or premium options.',
                    action: 'Implement menu engineering and staff training for upselling'
                });
            }

            // Order success rate recommendations
            const successRate = (overallMetrics.successful_orders / overallMetrics.total_orders) * 100;
            if (successRate < 95) {
                recommendations.push({
                    type: 'operational',
                    priority: 'high',
                    title: 'Improve Order Success Rate',
                    description: `Current success rate is ${successRate.toFixed(1)}%. Focus on reducing order cancellations and payment failures.`,
                    action: 'Review order processing workflow and payment gateway issues'
                });
            }

            // Popular dishes recommendations
            if (popularDishes.length > 0) {
                const topDish = popularDishes[0];
                recommendations.push({
                    type: 'menu',
                    priority: 'medium',
                    title: 'Capitalize on Popular Items',
                    description: `${topDish.dish_name} is performing well. Consider creating variations or promoting similar items.`,
                    action: 'Develop menu items similar to top performers'
                });
            }

            // Customer retention recommendations
            if (overallMetrics.unique_customers < overallMetrics.total_orders * 0.7) {
                recommendations.push({
                    type: 'customer',
                    priority: 'medium',
                    title: 'Improve Customer Retention',
                    description: 'Low repeat customer rate detected. Implement loyalty programs and follow-up strategies.',
                    action: 'Launch customer loyalty program and personalized marketing'
                });
            }

            return recommendations;

        } catch (error) {
            console.error('Error generating quick recommendations:', error);
            return [];
        }
    }

    async getBusinessHealth(startDate, endDate) {
        try {
            const overallMetrics = await this.repository.getOverallMetrics(startDate, endDate);
            const revenueAnalytics = await this.repository.getRevenueAnalytics(startDate, endDate);
            
            // Calculate health score based on multiple factors
            let healthScore = 0;
            const factors = [];

            // Revenue consistency (30% weight)
            const revenueStdDev = this.calculateStandardDeviation(revenueAnalytics.map(r => r.daily_revenue));
            const avgRevenue = revenueAnalytics.reduce((sum, r) => sum + r.daily_revenue, 0) / revenueAnalytics.length;
            const revenueConsistency = revenueStdDev / avgRevenue;
            
            if (revenueConsistency < 0.3) {
                healthScore += 30;
                factors.push('Consistent revenue stream');
            } else if (revenueConsistency < 0.5) {
                healthScore += 20;
                factors.push('Moderately consistent revenue');
            } else {
                healthScore += 10;
                factors.push('Inconsistent revenue pattern');
            }

            // Order success rate (25% weight)
            const successRate = (overallMetrics.successful_orders / overallMetrics.total_orders) * 100;
            if (successRate >= 95) {
                healthScore += 25;
                factors.push('Excellent order success rate');
            } else if (successRate >= 90) {
                healthScore += 20;
                factors.push('Good order success rate');
            } else if (successRate >= 85) {
                healthScore += 15;
                factors.push('Average order success rate');
            } else {
                healthScore += 5;
                factors.push('Poor order success rate');
            }

            // Average order value (20% weight)
            if (overallMetrics.avg_order_value >= 800) {
                healthScore += 20;
                factors.push('High average order value');
            } else if (overallMetrics.avg_order_value >= 600) {
                healthScore += 15;
                factors.push('Good average order value');
            } else if (overallMetrics.avg_order_value >= 400) {
                healthScore += 10;
                factors.push('Average order value');
            } else {
                healthScore += 5;
                factors.push('Low average order value');
            }

            // Customer diversity (15% weight)
            const customerDiversity = overallMetrics.unique_customers / overallMetrics.total_orders;
            if (customerDiversity >= 0.8) {
                healthScore += 15;
                factors.push('High customer diversity');
            } else if (customerDiversity >= 0.6) {
                healthScore += 12;
                factors.push('Good customer diversity');
            } else if (customerDiversity >= 0.4) {
                healthScore += 8;
                factors.push('Average customer diversity');
            } else {
                healthScore += 3;
                factors.push('Low customer diversity');
            }

            // Table utilization (10% weight)
            if (overallMetrics.tables_used >= 10) {
                healthScore += 10;
                factors.push('Good table utilization');
            } else if (overallMetrics.tables_used >= 7) {
                healthScore += 7;
                factors.push('Average table utilization');
            } else {
                healthScore += 3;
                factors.push('Low table utilization');
            }

            // Determine health status
            let healthStatus = 'Poor';
            if (healthScore >= 85) healthStatus = 'Excellent';
            else if (healthScore >= 70) healthStatus = 'Good';
            else if (healthScore >= 55) healthStatus = 'Average';

            return {
                healthScore,
                healthStatus,
                factors,
                metrics: overallMetrics,
                assessmentDate: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error calculating business health:', error);
            throw new Error('Failed to calculate business health: ' + error.message);
        }
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }
}

export default BusinessInsightsService;