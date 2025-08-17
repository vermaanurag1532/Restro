// Router/userPreferences.router.js
import express from 'express';
import userPreferencesController from '../Controller/userPreferences.controller.js';

const UserPreferencesRouter = express.Router();

// Get user preferences
UserPreferencesRouter.get('/preferences/:userId', userPreferencesController.getUserPreferences);

// Update user preferences
UserPreferencesRouter.put('/preferences/:userId', userPreferencesController.updateUserPreferences);

// Reset preferences to default
UserPreferencesRouter.post('/preferences/:userId/reset', userPreferencesController.resetUserPreferences);

// Get default preferences template
UserPreferencesRouter.get('/preferences/template/default', userPreferencesController.getDefaultPreferences);

export default UserPreferencesRouter;