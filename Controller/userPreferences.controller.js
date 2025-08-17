// Controller/userPreferences.controller.js
import userPreferencesService from '../Service/userPreferences.service.js';

const userPreferencesController = {
  // Get user preferences
  async getUserPreferences(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await userPreferencesService.getUserPreferences(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        preferences: result.preferences,
        message: 'User preferences retrieved successfully'
      });

    } catch (error) {
      console.error('GetUserPreferences Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update user preferences
  async updateUserPreferences(req, res) {
    try {
      const { userId } = req.params;
      const preferencesData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // Validate that we have preferences data
      if (!preferencesData || Object.keys(preferencesData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Preferences data is required'
        });
      }

      const result = await userPreferencesService.updateUserPreferences(userId, preferencesData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        preferences: result.preferences,
        message: 'User preferences updated successfully'
      });

    } catch (error) {
      console.error('UpdateUserPreferences Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Reset user preferences to default
  async resetUserPreferences(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await userPreferencesService.resetUserPreferences(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        preferences: result.preferences,
        message: 'User preferences reset to default successfully'
      });

    } catch (error) {
      console.error('ResetUserPreferences Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get default preferences template
  async getDefaultPreferences(req, res) {
    try {
      const defaultPreferences = userPreferencesService.getDefaultPreferencesTemplate();

      res.status(200).json({
        success: true,
        preferences: defaultPreferences,
        message: 'Default preferences template retrieved successfully'
      });

    } catch (error) {
      console.error('GetDefaultPreferences Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default userPreferencesController;