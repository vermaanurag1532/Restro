// routes/businessInsightsRoutes.js
import express from 'express';
import BusinessInsightsController from '../Controller/businessInsightsController.js';

const router = express.Router();
const businessInsightsController = new BusinessInsightsController();

// Middleware for request logging
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.log('Query params:', req.query);
    next();
});

// Middleware for CORS
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Route validation middleware
const validateDateParams = (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (req.path === '/health-check') {
        return next(); // Skip validation for health check
    }
    
    if (req.path === '/quick' || req.path === '/health-score') {
        return next(); // These endpoints have default dates
    }
    
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: 'Missing required parameters',
            required: ['startDate', 'endDate'],
            format: 'YYYY-MM-DD',
            example: 'GET /api/insights?startDate=2023-01-01&endDate=2023-12-31'
        });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date format',
            expected: 'YYYY-MM-DD',
            received: { startDate, endDate }
        });
    }
    
    // Validate date values
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date values',
            startDate: isNaN(start.getTime()) ? 'Invalid' : 'Valid',
            endDate: isNaN(end.getTime()) ? 'Invalid' : 'Valid'
        });
    }
    
    if (start > end) {
        return res.status(400).json({
            success: false,
            message: 'Start date must be before or equal to end date',
            startDate,
            endDate
        });
    }
    
    // Check if date range is not too large (max 1 year)
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
        return res.status(400).json({
            success: false,
            message: 'Date range too large. Maximum allowed range is 365 days',
            requestedDays: Math.ceil(daysDiff),
            maxAllowed: 365
        });
    }
    
    next();
};

// Error handling middleware
const handleAsyncErrors = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes

/**
 * @route GET /api/insights/health-check
 * @desc Check API health and get available endpoints
 * @access Public
 */
router.get('/health-check', 
    handleAsyncErrors(businessInsightsController.healthCheck.bind(businessInsightsController))
);

/**
 * @route GET /api/insights
 * @desc Get comprehensive business insights
 * @access Private
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
router.get('/', 
    validateDateParams,
    handleAsyncErrors(businessInsightsController.getBusinessInsights.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/pdf
 * @desc Generate and download PDF report
 * @access Private
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
router.get('/pdf', 
    validateDateParams,
    handleAsyncErrors(businessInsightsController.generatePDFReport.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/quick
 * @desc Get quick insights for dashboard
 * @access Private
 * @param {string} [startDate] - Start date (YYYY-MM-DD) - defaults to 30 days ago
 * @param {string} [endDate] - End date (YYYY-MM-DD) - defaults to today
 */
router.get('/quick', 
    handleAsyncErrors(businessInsightsController.getQuickInsights.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/health-score
 * @desc Get business health assessment
 * @access Private
 * @param {string} [startDate] - Start date (YYYY-MM-DD) - defaults to 30 days ago
 * @param {string} [endDate] - End date (YYYY-MM-DD) - defaults to today
 */
router.get('/health-score', 
    handleAsyncErrors(businessInsightsController.getBusinessHealth.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/recommendations
 * @desc Get AI-powered recommendations
 * @access Private
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} [type] - Filter by type: immediate, shortTerm, longTerm
 */
router.get('/recommendations', 
    validateDateParams,
    handleAsyncErrors(businessInsightsController.getAIRecommendations.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/revenue
 * @desc Get detailed revenue analytics
 * @access Private
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
router.get('/revenue', 
    validateDateParams,
    handleAsyncErrors(businessInsightsController.getRevenueAnalytics.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/customers
 * @desc Get customer analytics and segmentation
 * @access Private
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
router.get('/customers', 
    validateDateParams,
    handleAsyncErrors(businessInsightsController.getCustomerAnalytics.bind(businessInsightsController))
);

/**
 * @route GET /api/insights/operations
 * @desc Get operational insights (peak hours, table performance, dish analytics)
 * @access Private
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
router.get('/operations', 
    validateDateParams,
    handleAsyncErrors(businessInsightsController.getOperationalInsights.bind(businessInsightsController))
);

// Global error handler for this router
router.use((error, req, res, next) => {
    console.error('Business Insights Router Error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            details: error.message
        });
    }
    
    if (error.name === 'DatabaseError') {
        return res.status(503).json({
            success: false,
            message: 'Database service unavailable',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
        });
    }
    
    if (error.message && error.message.includes('Gemini')) {
        return res.status(502).json({
            success: false,
            message: 'AI service temporarily unavailable',
            details: 'Please try again in a few moments'
        });
    }
    
    // Default error response
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        requestId: req.headers['x-request-id'] || Date.now(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler for unmatched routes in this router
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /api/insights',
            'GET /api/insights/pdf',
            'GET /api/insights/quick',
            'GET /api/insights/health-score',
            'GET /api/insights/recommendations',
            'GET /api/insights/revenue',
            'GET /api/insights/customers',
            'GET /api/insights/operations',
            'GET /api/insights/health-check'
        ],
        requestedPath: req.originalUrl,
        method: req.method
    });
});

export default router;