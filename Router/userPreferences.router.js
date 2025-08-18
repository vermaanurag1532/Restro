// Router/userPreferences.router.js
import express from 'express';
import userPreferencesController from '../Controller/userPreferences.controller.js';
import userStatsController from '../Controller/userStats.controller.js';

const UserPreferencesRouter = express.Router();

// Get user preferences
UserPreferencesRouter.get('/preferences/:userId', userPreferencesController.getUserPreferences);

// Update user preferences
UserPreferencesRouter.put('/preferences/:userId', userPreferencesController.updateUserPreferences);

// Reset preferences to default
UserPreferencesRouter.post('/preferences/:userId/reset', userPreferencesController.resetUserPreferences);

// Get default preferences template
UserPreferencesRouter.get('/preferences/template/default', userPreferencesController.getDefaultPreferences);

// Get user statistics
UserPreferencesRouter.get('/stats/:userId', userStatsController.getUserStats);

// Update user statistics (for when user completes activities)
UserPreferencesRouter.put('/stats/:userId', userStatsController.updateUserStats);

// Increment specific stats (for real-time updates)
UserPreferencesRouter.patch('/stats/:userId/increment', userStatsController.incrementStats);

// Reset user statistics
UserPreferencesRouter.post('/stats/:userId/reset', userStatsController.resetUserStats);

// Get user statistics by date range
UserPreferencesRouter.get('/stats/:userId/range', userStatsController.getUserStatsByDateRange);

// Get leaderboard/comparative stats
UserPreferencesRouter.get('/stats/leaderboard/:category', userStatsController.getLeaderboard);

// Record activity (updates last_activity and relevant stats)
UserPreferencesRouter.post('/stats/:userId/activity', userStatsController.recordActivity);

export default UserPreferencesRouter;