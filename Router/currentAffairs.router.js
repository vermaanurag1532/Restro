// Router/currentAffairs.router.js
import express from 'express';
import { CurrentAffairsController } from '../Controller/currentAffairs.controller.js';

const router = express.Router();
const currentAffairsController = new CurrentAffairsController();

// Get daily current affairs
router.get('/daily', currentAffairsController.getDailyCurrentAffairs.bind(currentAffairsController));

// Get current affairs by date range
router.get('/range', currentAffairsController.getCurrentAffairsByRange.bind(currentAffairsController));

// Get current affairs by category
router.get('/category/:category', currentAffairsController.getCurrentAffairsByCategory.bind(currentAffairsController));

// Get current affairs quiz questions
router.get('/quiz', currentAffairsController.getCurrentAffairsQuiz.bind(currentAffairsController));

// Get trending topics for UPSC/PCS preparation
router.get('/trending', currentAffairsController.getTrendingTopics.bind(currentAffairsController));

// Get current affairs summary for specific exam
router.get('/exam/:examType', currentAffairsController.getExamSpecificCurrentAffairs.bind(currentAffairsController));

// Refresh current affairs data
router.post('/refresh', currentAffairsController.refreshCurrentAffairs.bind(currentAffairsController));

// Health check for current affairs service
router.get('/health', currentAffairsController.healthCheck.bind(currentAffairsController));

export default router;