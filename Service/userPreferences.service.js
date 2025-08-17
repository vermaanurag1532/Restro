// Service/userPreferences.service.js
import userPreferencesRepository from '../Repository/userPreferences.repository.js';
import ankitLoginRepository from '../Repository/ankitLogin.repository.js';

const userPreferencesService = {
  // Get default preferences template
  getDefaultPreferencesTemplate() {
    return {
      user_id: '',
      theme_mode: 'system',
      language: 'en',
      notifications_enabled: true,
      reminder_frequency: 'daily',
      study_reminder_time: '19:0',
      sound_enabled: true,
      haptic_feedback_enabled: true,
      auto_save_interval: 5,
      data_backup_enabled: true,
      favorite_subjects: [],
      custom_settings: {}
    };
  },

  // Validate preferences data
  validatePreferencesData(preferencesData) {
    const errors = [];

    // Validate theme_mode
    if (preferencesData.theme_mode && !['system', 'light', 'dark'].includes(preferencesData.theme_mode)) {
      errors.push('Invalid theme_mode. Must be one of: system, light, dark');
    }

    // Validate language
    if (preferencesData.language && typeof preferencesData.language !== 'string') {
      errors.push('Language must be a string');
    }

    // Validate reminder_frequency
    if (preferencesData.reminder_frequency && !['never', 'daily', 'weekly', 'monthly'].includes(preferencesData.reminder_frequency)) {
      errors.push('Invalid reminder_frequency. Must be one of: never, daily, weekly, monthly');
    }

    // Validate study_reminder_time format (should be HH:MM)
    if (preferencesData.study_reminder_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(preferencesData.study_reminder_time)) {
        errors.push('Invalid study_reminder_time format. Must be HH:MM (e.g., 19:30)');
      }
    }

    // Validate boolean fields
    const booleanFields = ['notifications_enabled', 'sound_enabled', 'haptic_feedback_enabled', 'data_backup_enabled'];
    booleanFields.forEach(field => {
      if (preferencesData[field] !== undefined && typeof preferencesData[field] !== 'boolean') {
        errors.push(`${field} must be a boolean value`);
      }
    });

    // Validate auto_save_interval
    if (preferencesData.auto_save_interval !== undefined) {
      if (!Number.isInteger(preferencesData.auto_save_interval) || preferencesData.auto_save_interval < 1) {
        errors.push('auto_save_interval must be a positive integer');
      }
    }

    // Validate favorite_subjects
    if (preferencesData.favorite_subjects !== undefined) {
      if (!Array.isArray(preferencesData.favorite_subjects)) {
        errors.push('favorite_subjects must be an array');
      } else if (!preferencesData.favorite_subjects.every(subject => typeof subject === 'string')) {
        errors.push('All favorite_subjects must be strings');
      }
    }

    // Validate custom_settings
    if (preferencesData.custom_settings !== undefined) {
      if (typeof preferencesData.custom_settings !== 'object' || Array.isArray(preferencesData.custom_settings)) {
        errors.push('custom_settings must be an object');
      }
    }

    return errors;
  },

  // Get user preferences
  async getUserPreferences(userId) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Try to get user preferences
      let preferences = await userPreferencesRepository.getUserPreferences(userId);

      // If no preferences exist, create default ones
      if (!preferences) {
        const defaultPreferences = this.getDefaultPreferencesTemplate();
        defaultPreferences.user_id = userId;
        
        const createdPreferences = await userPreferencesRepository.createUserPreferences(userId, defaultPreferences);
        preferences = createdPreferences;
      }

      return {
        success: true,
        preferences
      };

    } catch (error) {
      console.error('GetUserPreferences Service Error:', error);
      throw error;
    }
  },

  // Update user preferences
  async updateUserPreferences(userId, preferencesData) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Validate preferences data
      const validationErrors = this.validatePreferencesData(preferencesData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        };
      }

      // Ensure user_id is set correctly
      preferencesData.user_id = userId;

      // Check if preferences already exist
      const existingPreferences = await userPreferencesRepository.getUserPreferences(userId);

      let updatedPreferences;
      if (existingPreferences) {
        // Update existing preferences
        updatedPreferences = await userPreferencesRepository.updateUserPreferences(userId, preferencesData);
      } else {
        // Create new preferences with defaults merged with provided data
        const defaultPreferences = this.getDefaultPreferencesTemplate();
        const mergedPreferences = { ...defaultPreferences, ...preferencesData, user_id: userId };
        updatedPreferences = await userPreferencesRepository.createUserPreferences(userId, mergedPreferences);
      }

      return {
        success: true,
        preferences: updatedPreferences
      };

    } catch (error) {
      console.error('UpdateUserPreferences Service Error:', error);
      throw error;
    }
  },

  // Reset user preferences to default
  async resetUserPreferences(userId) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Get default preferences
      const defaultPreferences = this.getDefaultPreferencesTemplate();
      defaultPreferences.user_id = userId;

      // Check if preferences exist
      const existingPreferences = await userPreferencesRepository.getUserPreferences(userId);

      let resetPreferences;
      if (existingPreferences) {
        // Update with default values
        resetPreferences = await userPreferencesRepository.updateUserPreferences(userId, defaultPreferences);
      } else {
        // Create new preferences with defaults
        resetPreferences = await userPreferencesRepository.createUserPreferences(userId, defaultPreferences);
      }

      return {
        success: true,
        preferences: resetPreferences
      };

    } catch (error) {
      console.error('ResetUserPreferences Service Error:', error);
      throw error;
    }
  }
};

export default userPreferencesService;