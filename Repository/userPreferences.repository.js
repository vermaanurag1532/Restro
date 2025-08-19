// Repository/userPreferences.repository.js
import connection from '../Connection/Connection.js';
import { promisify } from 'util';

// Convert callback-based connection to promise-based
const query = promisify(connection.query).bind(connection);

// Safe JSON parse helper
const safeJSONParse = (data, fallback) => {
  try {
    if (data === null || data === undefined || data === '') {
      return fallback; // prevent JSON.parse("") crash
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('JSON Parse Error:', err, 'for data:', data);
    return fallback;
  }
};

const userPreferencesRepository = {
  // Get user preferences
  async getUserPreferences(userId) {
    try {
      const sql = `
        SELECT * FROM User_Preferences 
        WHERE user_id = ?
      `;
      
      const rows = await query(sql, [userId]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      
      // Format the response to match frontend expectations
      return {
        user_id: row.user_id,
        theme_mode: row.theme_mode,
        language: row.language,
        notifications_enabled: Boolean(row.notifications_enabled),
        reminder_frequency: row.reminder_frequency,
        study_reminder_time: row.study_reminder_time,
        sound_enabled: Boolean(row.sound_enabled),
        haptic_feedback_enabled: Boolean(row.haptic_feedback_enabled),
        auto_save_interval: row.auto_save_interval,
        data_backup_enabled: Boolean(row.data_backup_enabled),
        favorite_subjects: safeJSONParse(row.favorite_subjects, []),
        custom_settings: safeJSONParse(row.custom_settings, {})
      };
    } catch (error) {
      console.error('Get User Preferences Error:', error);
      throw error;
    }
  },

  // Create user preferences
  async createUserPreferences(userId, preferencesData) {
    try {
      const sql = `
        INSERT INTO User_Preferences (
          user_id,
          theme_mode,
          language,
          notifications_enabled,
          reminder_frequency,
          study_reminder_time,
          sound_enabled,
          haptic_feedback_enabled,
          auto_save_interval,
          data_backup_enabled,
          favorite_subjects,
          custom_settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        userId,
        preferencesData.theme_mode || 'system',
        preferencesData.language || 'en',
        preferencesData.notifications_enabled !== undefined ? preferencesData.notifications_enabled : true,
        preferencesData.reminder_frequency || 'daily',
        preferencesData.study_reminder_time || '19:00',
        preferencesData.sound_enabled !== undefined ? preferencesData.sound_enabled : true,
        preferencesData.haptic_feedback_enabled !== undefined ? preferencesData.haptic_feedback_enabled : true,
        preferencesData.auto_save_interval || 5,
        preferencesData.data_backup_enabled !== undefined ? preferencesData.data_backup_enabled : true,
        JSON.stringify(preferencesData.favorite_subjects || []),  // always safe JSON
        JSON.stringify(preferencesData.custom_settings || {})     // always safe JSON
      ];

      await query(sql, values);

      // Return the created preferences
      return await this.getUserPreferences(userId);
    } catch (error) {
      console.error('Create User Preferences Error:', error);
      throw error;
    }
  },

  // Update user preferences
  async updateUserPreferences(userId, preferencesData) {
    try {
      const setParts = [];
      const values = [];

      // Build dynamic update query based on provided fields
      if (preferencesData.theme_mode !== undefined) {
        setParts.push('theme_mode = ?');
        values.push(preferencesData.theme_mode);
      }

      if (preferencesData.language !== undefined) {
        setParts.push('language = ?');
        values.push(preferencesData.language);
      }

      if (preferencesData.notifications_enabled !== undefined) {
        setParts.push('notifications_enabled = ?');
        values.push(preferencesData.notifications_enabled);
      }

      if (preferencesData.reminder_frequency !== undefined) {
        setParts.push('reminder_frequency = ?');
        values.push(preferencesData.reminder_frequency);
      }

      if (preferencesData.study_reminder_time !== undefined) {
        setParts.push('study_reminder_time = ?');
        values.push(preferencesData.study_reminder_time);
      }

      if (preferencesData.sound_enabled !== undefined) {
        setParts.push('sound_enabled = ?');
        values.push(preferencesData.sound_enabled);
      }

      if (preferencesData.haptic_feedback_enabled !== undefined) {
        setParts.push('haptic_feedback_enabled = ?');
        values.push(preferencesData.haptic_feedback_enabled);
      }

      if (preferencesData.auto_save_interval !== undefined) {
        setParts.push('auto_save_interval = ?');
        values.push(preferencesData.auto_save_interval);
      }

      if (preferencesData.data_backup_enabled !== undefined) {
        setParts.push('data_backup_enabled = ?');
        values.push(preferencesData.data_backup_enabled);
      }

      if (preferencesData.favorite_subjects !== undefined) {
        setParts.push('favorite_subjects = ?');
        values.push(JSON.stringify(preferencesData.favorite_subjects || []));
      }

      if (preferencesData.custom_settings !== undefined) {
        setParts.push('custom_settings = ?');
        values.push(JSON.stringify(preferencesData.custom_settings || {}));
      }

      if (setParts.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at timestamp
      setParts.push('updated_at = NOW()');
      values.push(userId);

      const sql = `
        UPDATE User_Preferences 
        SET ${setParts.join(', ')}
        WHERE user_id = ?
      `;

      await query(sql, values);

      // Return updated preferences
      return await this.getUserPreferences(userId);
    } catch (error) {
      console.error('Update User Preferences Error:', error);
      throw error;
    }
  },

  // Delete user preferences
  async deleteUserPreferences(userId) {
    try {
      const sql = `
        DELETE FROM User_Preferences 
        WHERE user_id = ?
      `;
      
      await query(sql, [userId]);
    } catch (error) {
      console.error('Delete User Preferences Error:', error);
      throw error;
    }
  },

  // Check if user preferences exist
  async preferencesExist(userId) {
    try {
      const sql = `
        SELECT COUNT(*) as count FROM User_Preferences 
        WHERE user_id = ?
      `;
      
      const rows = await query(sql, [userId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Check Preferences Exist Error:', error);
      throw error;
    }
  },

  // Get all users with preferences (admin functionality)
  async getAllUserPreferences() {
    try {
      const sql = `
        SELECT * FROM User_Preferences 
        ORDER BY created_at DESC
      `;
      
      const rows = await query(sql);
      
      return rows.map(row => ({
        user_id: row.user_id,
        theme_mode: row.theme_mode,
        language: row.language,
        notifications_enabled: Boolean(row.notifications_enabled),
        reminder_frequency: row.reminder_frequency,
        study_reminder_time: row.study_reminder_time,
        sound_enabled: Boolean(row.sound_enabled),
        haptic_feedback_enabled: Boolean(row.haptic_feedback_enabled),
        auto_save_interval: row.auto_save_interval,
        data_backup_enabled: Boolean(row.data_backup_enabled),
        favorite_subjects: safeJSONParse(row.favorite_subjects, []),
        custom_settings: safeJSONParse(row.custom_settings, {}),
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Get All User Preferences Error:', error);
      throw error;
    }
  }
};

export default userPreferencesRepository;
