// services/pdfGenerationService.js
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

class PDFGenerationService {
    constructor() {
        this.chartJSNodeCanvas = new ChartJSNodeCanvas({ 
            width: 800, 
            height: 400,
            backgroundColour: 'white',
            chartCallback: (ChartJS) => {
                // Configure global chart defaults for better appearance
                ChartJS.defaults.font.family = 'Arial, sans-serif';
                ChartJS.defaults.font.size = 12;
                ChartJS.defaults.color = '#374151';
                ChartJS.defaults.borderColor = '#E5E7EB';
                ChartJS.defaults.backgroundColor = '#F9FAFB';
            }
        });
    }

    async generateInsightsPDF(insights, analyticsData, filename) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({ 
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: 'Restaurant Business Insights Report',
                        Author: 'Restaurant Analytics System',
                        Subject: 'Business Intelligence Report',
                        Keywords: 'restaurant, analytics, insights, business'
                    }
                });

                const filePath = path.join(process.cwd(), 'reports', filename);
                
                // Ensure reports directory exists
                const reportsDir = path.dirname(filePath);
                if (!fs.existsSync(reportsDir)) {
                    fs.mkdirSync(reportsDir, { recursive: true });
                }

                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Cover Page
                await this.createCoverPage(doc, insights);
                doc.addPage();

                // Executive Summary
                await this.createExecutiveSummary(doc, insights);
                doc.addPage();

                // Revenue Analytics with Charts
                await this.createRevenueSection(doc, insights, analyticsData);
                doc.addPage();

                // Customer Analytics
                await this.createCustomerSection(doc, insights, analyticsData);
                doc.addPage();

                // Operational Insights
                await this.createOperationalSection(doc, insights, analyticsData);
                doc.addPage();

                // Recommendations
                await this.createRecommendationsSection(doc, insights);
                doc.addPage();

                // KPI Dashboard
                await this.createKPISection(doc, insights);

                doc.end();

                stream.on('finish', () => {
                    resolve(filePath);
                });

                stream.on('error', reject);

            } catch (error) {
                reject(error);
            }
        });
    }

    async createCoverPage(doc, insights) {
        // Header with gradient-like effect
        doc.rect(0, 0, doc.page.width, 200)
           .fill('#6366F1');

        // Restaurant name and title
        doc.fillColor('white')
           .fontSize(32)
           .font('Helvetica-Bold')
           .text('RedLinear Restro', 50, 60, { align: 'center' });

        doc.fontSize(24)
           .text('Business Insights Report', 50, 100, { align: 'center' });

        doc.fontSize(16)
           .text(`Generated on ${new Date().toLocaleDateString()}`, 50, 140, { align: 'center' });

        // Business Health Indicator
        const healthColor = this.getHealthColor(insights.executiveSummary.businessHealth);
        doc.rect(50, 250, doc.page.width - 100, 80)
           .fill(healthColor);

        doc.fillColor('white')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text('Business Health Status', 50, 270, { align: 'center' });

        doc.fontSize(28)
           .text(insights.executiveSummary.businessHealth, 50, 295, { align: 'center' });

        // Overall Rating
        doc.fillColor('#374151')
           .fontSize(18)
           .text(`Overall Rating: ${insights.executiveSummary.overallRating}`, 50, 350, { align: 'center' });

        // Key Highlights Box
        doc.rect(50, 400, doc.page.width - 100, 200)
           .stroke('#E5E7EB')
           .fillColor('#F9FAFB')
           .fill();

        doc.fillColor('#1F2937')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Key Highlights', 70, 420);

        let y = 450;
        insights.executiveSummary.keyFindings.slice(0, 3).forEach((finding, index) => {
            doc.fontSize(12)
               .font('Helvetica')
               .text(`• ${finding}`, 70, y);
            y += 25;
        });

        // Footer
        doc.fillColor('#6B7280')
           .fontSize(10)
           .text('Confidential Business Report - For Internal Use Only', 50, doc.page.height - 50, { align: 'center' });
    }

    async createExecutiveSummary(doc, insights) {
        this.addSectionHeader(doc, 'Executive Summary');

        let y = 120;
        const leftColumnX = 50;
        const rightColumnX = 320;
        const columnWidth = 220;

        // Left Column - Business Health Assessment
        doc.fillColor('#1F2937')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Business Health Assessment', leftColumnX, y);
        y += 35;

        // Health status card
        const healthColor = this.getHealthColor(insights.executiveSummary.businessHealth);
        doc.rect(leftColumnX, y, columnWidth, 80)
           .fill('#F9FAFB')
           .stroke('#E5E7EB')
           .lineWidth(1);

        // Health status indicator
        doc.rect(leftColumnX + 10, y + 10, 15, 15)
           .fill(healthColor);

        doc.fillColor('#1F2937')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Status:', leftColumnX + 35, y + 12);

        doc.fillColor(healthColor)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(insights.executiveSummary.businessHealth, leftColumnX + 35, y + 30);

        doc.fillColor('#6B7280')
           .fontSize(12)
           .font('Helvetica')
           .text(`Rating: ${insights.executiveSummary.overallRating}`, leftColumnX + 35, y + 55);

        // Right Column - Key Metrics Summary
        doc.fillColor('#1F2937')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Performance Overview', rightColumnX, 120);

        const metricsY = 155;
        doc.rect(rightColumnX, metricsY, columnWidth, 80)
           .fill('#F0F9FF')
           .stroke('#BAE6FD')
           .lineWidth(1);

        doc.fillColor('#1E40AF')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('Key Performance Indicators', rightColumnX + 15, metricsY + 12);

        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text('• Revenue Growth Analysis', rightColumnX + 15, metricsY + 30)
           .text('• Customer Retention Metrics', rightColumnX + 15, metricsY + 45)
           .text('• Operational Efficiency Score', rightColumnX + 15, metricsY + 60);

        y = Math.max(y + 100, metricsY + 100);

        // Key Findings Section (Full Width)
        doc.fillColor('#1F2937')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Key Findings', leftColumnX, y);
        y += 35;

        insights.executiveSummary.keyFindings.forEach((finding, index) => {
            // Finding box with icon
            const findingY = y + (index * 35);
            
            // Icon circle
            doc.circle(leftColumnX + 8, findingY + 8, 6)
               .fill('#3B82F6');

            // Finding number
            doc.fillColor('white')
               .fontSize(8)
               .font('Helvetica-Bold')
               .text((index + 1).toString(), leftColumnX + 5, findingY + 5);

            // Finding text
            doc.fillColor('#374151')
               .fontSize(11)
               .font('Helvetica')
               .text(finding, leftColumnX + 25, findingY + 2, { 
                   width: doc.page.width - 120,
                   lineGap: 2
               });
        });

        y += (insights.executiveSummary.keyFindings.length * 35) + 30;

        // Critical Issues Section (if any)
        if (insights.executiveSummary.criticalIssues && insights.executiveSummary.criticalIssues.length > 0) {
            doc.fillColor('#DC2626')
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('⚠️ Critical Issues Requiring Immediate Attention', leftColumnX, y);
            y += 35;

            insights.executiveSummary.criticalIssues.forEach((issue, index) => {
                const issueY = y + (index * 30);
                
                // Warning icon
                doc.circle(leftColumnX + 8, issueY + 8, 6)
                   .fill('#DC2626');

                doc.fillColor('white')
                   .fontSize(8)
                   .font('Helvetica-Bold')
                   .text('!', leftColumnX + 6, issueY + 5);

                // Issue text
                doc.fillColor('#374151')
                   .fontSize(11)
                   .font('Helvetica')
                   .text(issue, leftColumnX + 25, issueY + 2, { 
                       width: doc.page.width - 120,
                       lineGap: 2
                   });
            });
        }
    }

    async createRevenueSection(doc, insights, analyticsData) {
        this.addSectionHeader(doc, 'Revenue Analytics');

        let y = 120;

        // Revenue Chart with proper centering
        const chartWidth = 500;
        const chartHeight = 250;
        const chartX = (doc.page.width - chartWidth) / 2; // Center the chart

        try {
            const revenueChart = await this.generateRevenueChart(analyticsData.revenueAnalytics);
            doc.image(revenueChart, chartX, y, { width: chartWidth, height: chartHeight });
        } catch (error) {
            console.warn('Failed to generate revenue chart:', error);
            // Create a placeholder
            doc.rect(chartX, y, chartWidth, chartHeight)
               .fill('#F3F4F6')
               .stroke('#D1D5DB');
            doc.fillColor('#6B7280')
               .fontSize(14)
               .text('Revenue Chart', chartX + chartWidth/2 - 50, y + chartHeight/2 - 10);
        }
        
        y += chartHeight + 30;

        // Revenue Insights in organized layout
        doc.fillColor('#1F2937')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Revenue Insights', 50, y);
        y += 35;

        const revenueInsights = insights.revenueInsights;
        const leftColumnX = 50;
        const rightColumnX = 320;
        const columnWidth = 220;

        // Left Column - Trends
        doc.rect(leftColumnX, y, columnWidth, 120)
           .fill('#F0FDF4')
           .stroke('#BBF7D0')
           .lineWidth(1);

        doc.fillColor('#065F46')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Trends Analysis', leftColumnX + 15, y + 15);

        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(revenueInsights.trends, leftColumnX + 15, y + 35, { 
               width: columnWidth - 30,
               lineGap: 2
           });

        // Right Column - Growth & Seasonality
        doc.rect(rightColumnX, y, columnWidth, 120)
           .fill('#FEF3C7')
           .stroke('#FDE68A')
           .lineWidth(1);

        doc.fillColor('#92400E')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('Growth & Patterns', rightColumnX + 15, y + 15);

        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(`Growth: ${revenueInsights.revenueGrowth}`, rightColumnX + 15, y + 35);

        if (revenueInsights.peakDays && revenueInsights.peakDays.length > 0) {
            doc.text(`Peak Days: ${revenueInsights.peakDays.join(', ')}`, rightColumnX + 15, y + 55, {
                width: columnWidth - 30
            });
        }

        doc.text(`Seasonality: ${revenueInsights.seasonality}`, rightColumnX + 15, y + 80, { 
            width: columnWidth - 30,
            lineGap: 2
        });
    }

    async createCustomerSection(doc, insights, analyticsData) {
        this.addSectionHeader(doc, 'Customer Analytics');

        let y = 120;

        // Customer Distribution Chart
        const customerChart = await this.generateCustomerChart(analyticsData.customerAnalytics);
        doc.image(customerChart, 50, y, { width: 500, height: 250 });
        y += 270;

        // Customer Insights
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1F2937')
           .text('Customer Insights', 50, y);
        y += 30;

        const customerInsights = insights.customerInsights;
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#374151')
           .text(`Customer Retention: ${customerInsights.customerRetention}`, 70, y, { width: doc.page.width - 140 });
        y += 30;

        doc.text(`Lifetime Value: ${customerInsights.lifetimeValue}`, 70, y);
        y += 25;

        doc.text(`Satisfaction Level: ${customerInsights.satisfactionLevel}`, 70, y, { width: doc.page.width - 140 });
        y += 30;

        if (customerInsights.customerSegmentation && customerInsights.customerSegmentation.length > 0) {
            doc.text(`Customer Segments: ${customerInsights.customerSegmentation.join(', ')}`, 70, y, { width: doc.page.width - 140 });
        }
    }

    async createOperationalSection(doc, insights, analyticsData) {
        this.addSectionHeader(doc, 'Operational Insights');

        let y = 120;

        // Peak Hours Chart
        const peakHoursChart = await this.generatePeakHoursChart(analyticsData.timeBasedAnalytics);
        doc.image(peakHoursChart, 50, y, { width: 500, height: 250 });
        y += 270;

        // Operational Insights
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1F2937')
           .text('Operational Performance', 50, y);
        y += 30;

        const operationalInsights = insights.operationalInsights;
        
        if (operationalInsights.peakHours && operationalInsights.peakHours.length > 0) {
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#374151')
               .text(`Peak Hours: ${operationalInsights.peakHours.join(', ')}`, 70, y);
            y += 25;
        }

        doc.text(`Table Utilization: ${operationalInsights.tableUtilization}`, 70, y, { width: doc.page.width - 140 });
        y += 30;

        doc.text(`Service Efficiency: ${operationalInsights.serviceEfficiency}`, 70, y, { width: doc.page.width - 140 });
        y += 30;

        doc.text(`Dish Performance: ${operationalInsights.dishPerformance}`, 70, y, { width: doc.page.width - 140 });
    }

    async createRecommendationsSection(doc, insights) {
        this.addSectionHeader(doc, 'Strategic Recommendations');

        let y = 120;

        // Immediate Actions
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#DC2626')
           .text('🚨 Immediate Actions Required', 50, y);
        y += 40;

        insights.recommendations.immediate.forEach((rec, index) => {
            if (y > doc.page.height - 120) {
                doc.addPage();
                y = 50;
            }
            this.addImprovedRecommendationBox(doc, rec, y, '#FEF2F2', '#DC2626');
            y += 90;
        });

        y += 25;

        // Short Term Recommendations
        if (y > doc.page.height - 200) {
            doc.addPage();
            y = 50;
        }
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#D97706')
           .text('📊 Short Term (1-3 months)', 50, y);
        y += 40;

        insights.recommendations.shortTerm.forEach((rec, index) => {
            if (y > doc.page.height - 120) {
                doc.addPage();
                y = 50;
            }
            this.addImprovedRecommendationBox(doc, rec, y, '#FFFBEB', '#D97706');
            y += 90;
        });

        y += 25;

        // Long Term Recommendations
        if (y > doc.page.height - 200) {
            doc.addPage();
            y = 50;
        }

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#059669')
           .text('🎯 Long Term (3-12 months)', 50, y);
        y += 40;

        insights.recommendations.longTerm.forEach((rec, index) => {
            if (y > doc.page.height - 120) {
                doc.addPage();
                y = 50;
            }
            this.addImprovedRecommendationBox(doc, rec, y, '#F0FDF4', '#059669');
            y += 90;
        });
    }

    addImprovedRecommendationBox(doc, recommendation, y, bgColor, textColor) {
        const boxWidth = doc.page.width - 100;
        const boxHeight = 85;

        // Add subtle shadow
        doc.rect(52, y + 2, boxWidth, boxHeight)
           .fill('#E5E7EB')
           .opacity(0.3);

        // Main recommendation box
        doc.rect(50, y, boxWidth, boxHeight)
           .fill(bgColor)
           .stroke('#E5E7EB')
           .lineWidth(1);

        // Priority badge
        const badgeWidth = 80;
        const badgeHeight = 20;
        const badgeX = doc.page.width - 50 - badgeWidth - 10;
        const badgeY = y + 10;

        const badgeColor = recommendation.impact === 'High' ? '#EF4444' : 
                          recommendation.impact === 'Medium' ? '#F59E0B' : '#10B981';

        doc.rect(badgeX, badgeY, badgeWidth, badgeHeight)
           .fill(badgeColor)
           .stroke('none');

        doc.fillColor('white')
           .fontSize(9)
           .font('Helvetica-Bold')
           .text(`${recommendation.impact} Impact`, badgeX + 5, badgeY + 6, { 
               width: badgeWidth - 10, 
               align: 'center' 
           });

        // Title
        doc.fillColor(textColor)
           .fontSize(13)
           .font('Helvetica-Bold')
           .text(recommendation.title, 60, y + 12, { 
               width: boxWidth - 120, 
               lineGap: 2 
           });

        // Description
        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(recommendation.description, 60, y + 32, { 
               width: boxWidth - 120, 
               lineGap: 1 
           });

        // Implementation details
        if (recommendation.implementation) {
            doc.fillColor('#6B7280')
               .fontSize(9)
               .font('Helvetica-Oblique')
               .text(`Implementation: ${recommendation.implementation}`, 60, y + 60, { 
                   width: boxWidth - 120,
                   lineGap: 1
               });
        }

        doc.opacity(1); // Reset opacity
    }

    async createKPISection(doc, insights) {
        this.addSectionHeader(doc, 'Key Performance Indicators');

        let y = 120;

        // Current Performance Section
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#1F2937')
           .text('Current Performance', 50, y);
        y += 50;

        const currentKPIs = insights.kpiTracking.currentKPIs;
        const targetKPIs = insights.kpiTracking.targetKPIs;

        // Create a 2x2 grid layout for better alignment
        const kpiKeys = Object.keys(currentKPIs);
        const boxWidth = 240;
        const boxHeight = 120;
        const marginX = 30;
        const marginY = 20;
        
        kpiKeys.forEach((kpi, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            
            const x = 50 + (col * (boxWidth + marginX));
            const currentY = y + (row * (boxHeight + marginY));
            
            this.addImprovedKPIBox(doc, kpi, currentKPIs[kpi], targetKPIs[kpi], x, currentY, boxWidth, boxHeight);
        });
    }

    addSectionHeader(doc, title) {
        doc.rect(0, 0, doc.page.width, 80)
           .fill('#4F46E5');

        doc.fillColor('white')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text(title, 50, 35);
    }

    addRecommendationBox(doc, recommendation, y, bgColor, textColor) {
        doc.rect(50, y, doc.page.width - 100, 70)
           .fill(bgColor)
           .stroke('#E5E7EB');

        doc.fillColor(textColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`${recommendation.title} (${recommendation.impact} Impact)`, 60, y + 10);

        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text(recommendation.description, 60, y + 30, { width: doc.page.width - 140 });

        if (recommendation.implementation) {
            doc.text(`Implementation: ${recommendation.implementation}`, 60, y + 50, { width: doc.page.width - 140 });
        }
    }

    addImprovedKPIBox(doc, kpiName, currentValue, targetValue, x, y, width, height) {
        // Main container box with subtle shadow effect
        doc.rect(x + 2, y + 2, width, height)
           .fill('#E5E7EB')
           .opacity(0.3);
        
        doc.rect(x, y, width, height)
           .fill('#FFFFFF')
           .stroke('#E2E8F0')
           .lineWidth(1.5);

        // Header section with colored background
        const headerHeight = 35;
        doc.rect(x, y, width, headerHeight)
           .fill('#F8FAFC')
           .stroke('#E2E8F0');

        // KPI Title
        const formattedTitle = this.formatKPITitle(kpiName);
        doc.fillColor('#1E293B')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(formattedTitle, x + 15, y + 12, { width: width - 30, align: 'left' });

        // Current Value Section
        const currentY = y + headerHeight + 15;
        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text('Current:', x + 15, currentY);

        doc.fillColor('#0F172A')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text(currentValue, x + 15, currentY + 15, { width: width - 30 });

        // Target Value Section
        const targetY = currentY + 40;
        doc.fillColor('#374151')
           .fontSize(10)
           .font('Helvetica')
           .text('Target:', x + 15, targetY);

        doc.fillColor('#059669')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(targetValue, x + 15, targetY + 15, { width: width - 30 });

        // Progress indicator (simple visual element)
        const progressY = targetY + 35;
        const progressWidth = width - 30;
        const progressHeight = 4;
        
        // Background bar
        doc.rect(x + 15, progressY, progressWidth, progressHeight)
           .fill('#E5E7EB');
        
        // Progress bar (mock progress - you can calculate actual progress)
        const progress = 0.7; // 70% - you can calculate this based on current vs target
        doc.rect(x + 15, progressY, progressWidth * progress, progressHeight)
           .fill('#3B82F6');

        doc.opacity(1); // Reset opacity
    }

    formatKPITitle(kpiName) {
        // Convert camelCase to readable format
        return kpiName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    addKPIBox(doc, kpiName, currentValue, targetValue, x, y) {
        // Fallback to old method for compatibility
        this.addImprovedKPIBox(doc, kpiName, currentValue, targetValue, x, y, 200, 100);
    }

    getHealthColor(health) {
        const colors = {
            'Excellent': '#10B981',
            'Good': '#3B82F6',
            'Average': '#F59E0B',
            'Poor': '#EF4444'
        };
        return colors[health] || '#6B7280';
    }

    async generateRevenueChart(revenueData) {
        const labels = revenueData.map(d => new Date(d.order_date).toLocaleDateString());
        const revenues = revenueData.map(d => d.daily_revenue);
        const orders = revenueData.map(d => d.total_orders);

        const configuration = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Revenue (₹)',
                    data: revenues,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y'
                }, {
                    label: 'Total Orders',
                    data: orders,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Revenue and Orders Trend',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue (₹)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Number of Orders'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        };

        return await this.chartJSNodeCanvas.renderToBuffer(configuration);
    }

    async generateCustomerChart(customerData) {
        const topCustomers = customerData.slice(0, 10);
        const labels = topCustomers.map(c => c['Customer Name'] || 'Anonymous');
        const spending = topCustomers.map(c => c.total_spent);

        const configuration = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Spending (₹)',
                    data: spending,
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                        '#F97316', '#06B6D4', '#84CC16', '#F43F5E', '#6366F1'
                    ],
                    borderColor: '#1F2937',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Customers by Spending',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Spending (₹)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Customers'
                        }
                    }
                }
            }
        };

        return await this.chartJSNodeCanvas.renderToBuffer(configuration);
    }

    async generatePeakHoursChart(timeData) {
        const labels = timeData.map(d => `${d.hour_of_day}:00`);
        const orders = timeData.map(d => d.order_count);
        const revenue = timeData.map(d => d.hourly_revenue);

        const configuration = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Orders',
                    data: orders,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    yAxisID: 'y'
                }, {
                    label: 'Revenue (₹)',
                    data: revenue,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10B981',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Peak Hours Analysis',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Number of Orders'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Revenue (₹)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    }
                }
            }
        };

        return await this.chartJSNodeCanvas.renderToBuffer(configuration);
    }

    async generateDishPerformanceChart(dishData) {
        // Group dishes by ID and calculate total quantity
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

        const sortedDishes = Object.values(dishMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        const labels = sortedDishes.map(d => d.name);
        const quantities = sortedDishes.map(d => d.quantity);

        const configuration = {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: quantities,
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                        '#F97316', '#06B6D4', '#84CC16', '#F43F5E', '#6366F1'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Most Popular Dishes',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'right'
                    }
                }
            }
        };

        return await this.chartJSNodeCanvas.renderToBuffer(configuration);
    }
}

export default PDFGenerationService;