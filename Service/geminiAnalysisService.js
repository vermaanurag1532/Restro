// services/geminiAnalysisService.js
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

class GeminiAnalysisService {
    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            temperature: 0.7,
            apiKey: process.env.GOOGLE_API_KEY,
        });
        this.outputParser = new StringOutputParser();
    }

    async analyzeBusinessData(analyticsData) {
        const prompt = PromptTemplate.fromTemplate(`
            You are an expert restaurant business analyst with deep expertise in data analysis, customer behavior, and restaurant operations. 
            
            Analyze the following restaurant data and provide comprehensive business insights:

            **RESTAURANT DATA:**
            
            **Overall Metrics:**
            {overallMetrics}
            
            **Revenue Analytics:**
            {revenueData}
            
            **Popular Dishes:**
            {dishData}
            
            **Customer Analytics:**
            {customerData}
            
            **Table Performance:**
            {tableData}
            
            **Time-based Analytics:**
            {timeData}
            
            **Customer Feedback:**
            {feedbackData}

            **ANALYSIS REQUIREMENTS:**
            
            Please provide a detailed analysis in the following JSON format:
            
            {{
                "executiveSummary": {{
                    "keyFindings": ["finding1", "finding2", "finding3"],
                    "businessHealth": "Excellent/Good/Average/Poor",
                    "overallRating": "rating out of 10",
                    "criticalIssues": ["issue1", "issue2"]
                }},
                "revenueInsights": {{
                    "trends": "revenue trend analysis",
                    "peakDays": ["day1", "day2"],
                    "revenueGrowth": "growth percentage or trend",
                    "seasonality": "seasonal patterns observed"
                }},
                "customerInsights": {{
                    "customerRetention": "retention analysis",
                    "customerSegmentation": ["segment1", "segment2"],
                    "lifetimeValue": "average customer value",
                    "satisfactionLevel": "satisfaction analysis from feedback"
                }},
                "operationalInsights": {{
                    "peakHours": ["hour1", "hour2"],
                    "tableUtilization": "efficiency analysis",
                    "serviceEfficiency": "order processing analysis",
                    "dishPerformance": "best and worst performing dishes"
                }},
                "recommendations": {{
                    "immediate": [
                        {{
                            "title": "recommendation title",
                            "description": "detailed description",
                            "impact": "High/Medium/Low",
                            "implementation": "how to implement"
                        }}
                    ],
                    "shortTerm": [
                        {{
                            "title": "recommendation title",
                            "description": "detailed description",
                            "impact": "High/Medium/Low",
                            "timeframe": "1-3 months"
                        }}
                    ],
                    "longTerm": [
                        {{
                            "title": "recommendation title",
                            "description": "detailed description",
                            "impact": "High/Medium/Low",
                            "timeframe": "3-12 months"
                        }}
                    ]
                }},
                "marketingInsights": {{
                    "targetAudience": "primary customer demographics",
                    "promotionalOpportunities": ["opportunity1", "opportunity2"],
                    "menuOptimization": "menu suggestions",
                    "pricingStrategy": "pricing recommendations"
                }},
                "riskAnalysis": {{
                    "identifiedRisks": ["risk1", "risk2"],
                    "mitigation": ["strategy1", "strategy2"],
                    "monitoring": "what to monitor going forward"
                }},
                "kpiTracking": {{
                    "currentKPIs": {{
                        "averageOrderValue": "current value",
                        "customerSatisfaction": "score",
                        "tableTurnover": "rate",
                        "revenuePerSquareFoot": "efficiency metric"
                    }},
                    "targetKPIs": {{
                        "averageOrderValue": "target value",
                        "customerSatisfaction": "target score",
                        "tableTurnover": "target rate",
                        "revenueGrowth": "target percentage"
                    }}
                }}
            }}

            **IMPORTANT:** 
            - Provide specific, actionable insights based on the actual data
            - Include numerical analysis where relevant
            - Focus on practical recommendations that can increase revenue
            - Identify both opportunities and threats
            - Ensure all recommendations are restaurant-industry specific
            - Make the analysis comprehensive but concise
            - Return only valid JSON without any markdown formatting
        `);

        try {
            const chain = prompt.pipe(this.model).pipe(this.outputParser);
            
            const result = await chain.invoke({
                overallMetrics: JSON.stringify(analyticsData.overallMetrics, null, 2),
                revenueData: JSON.stringify(analyticsData.revenueAnalytics, null, 2),
                dishData: JSON.stringify(analyticsData.popularDishes, null, 2),
                customerData: JSON.stringify(analyticsData.customerAnalytics, null, 2),
                tableData: JSON.stringify(analyticsData.tableAnalytics, null, 2),
                timeData: JSON.stringify(analyticsData.timeBasedAnalytics, null, 2),
                feedbackData: JSON.stringify(analyticsData.feedbackAnalytics, null, 2)
            });

            // Clean and parse the JSON response
            const cleanedResult = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleanedResult);
        } catch (error) {
            console.error('Error in Gemini analysis:', error);
            throw new Error('Failed to analyze business data with Gemini');
        }
    }

    async generateBusinessSummary(insights, analyticsData) {
        const prompt = PromptTemplate.fromTemplate(`
            Based on the following business insights and data, create a comprehensive business summary for restaurant management:

            **Business Insights:**
            {insights}

            **Analytics Data:**
            {analyticsData}

            Generate a detailed executive summary that includes:
            1. Current business performance overview
            2. Key achievements and milestones
            3. Major challenges identified
            4. Strategic recommendations for growth
            5. Financial performance analysis
            6. Customer satisfaction assessment
            7. Operational efficiency review

            Make it professional, actionable, and focused on driving business growth.
        `);

        try {
            const chain = prompt.pipe(this.model).pipe(this.outputParser);
            
            const result = await chain.invoke({
                insights: JSON.stringify(insights, null, 2),
                analyticsData: JSON.stringify(analyticsData, null, 2)
            });

            return result;
        } catch (error) {
            console.error('Error generating business summary:', error);
            throw new Error('Failed to generate business summary');
        }
    }

    async identifyTrends(revenueData, timeBasedData) {
        const prompt = PromptTemplate.fromTemplate(`
            Analyze the following revenue and time-based data to identify key business trends:

            **Revenue Data:**
            {revenueData}

            **Time-based Data:**
            {timeBasedData}

            Identify:
            1. Revenue trends (growing, declining, stable)
            2. Seasonal patterns
            3. Peak performance periods
            4. Growth opportunities
            5. Potential concerns

            Provide specific insights with data-backed recommendations.
        `);

        try {
            const chain = prompt.pipe(this.model).pipe(this.outputParser);
            
            const result = await chain.invoke({
                revenueData: JSON.stringify(revenueData, null, 2),
                timeBasedData: JSON.stringify(timeBasedData, null, 2)
            });

            return result;
        } catch (error) {
            console.error('Error identifying trends:', error);
            throw new Error('Failed to identify business trends');
        }
    }
}

export default GeminiAnalysisService;