// Repositories/ankitLogin.repository.js
import connection from '../Connection/Connection.js';
import { promisify } from 'util';

// Convert callback-based connection to promise-based
const query = promisify(connection.query).bind(connection);

const ankitLoginRepository = {
  // Get user by email
  async getUserByEmail(email) {
    try {
      const sql = `
        SELECT * FROM Ankit_Login 
        WHERE Email = ?
      `;
      
      const rows = await query(sql, [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Get User By Email Error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const sql = `
        SELECT * FROM Ankit_Login 
        WHERE \`User Id\` = ?
      `;
      
      const rows = await query(sql, [userId]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Get User By ID Error:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const sql = `
        INSERT INTO Ankit_Login (
          \`User Id\`,
          Email,
          Password,
          Name,
          \`Profile Image URL\`,
          \`Is Active\`,
          Preferences,
          \`Device Info\`,
          \`FCM Token\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        userData.userId,
        userData.email,
        userData.password,
        userData.name,
        null, // Profile Image URL
        true, // Is Active
        JSON.stringify(userData.preferences), // Preferences
        userData.deviceInfo ? JSON.stringify(userData.deviceInfo) : null,
        null // FCM Token
      ];

      await query(sql, values);

      // Return the created user
      return await this.getUserById(userData.userId);
    } catch (error) {
      console.error('Create User Error:', error);
      throw error;
    }
  },

  // Update last login time and device info
  async updateLastLogin(userId, deviceInfo) {
    try {
      const sql = `
        UPDATE Ankit_Login 
        SET 
          \`Last Login At\` = NOW(),
          \`Device Info\` = ?
        WHERE \`User Id\` = ?
      `;

      const values = [
        deviceInfo ? JSON.stringify(deviceInfo) : null,
        userId
      ];

      await query(sql, values);
    } catch (error) {
      console.error('Update Last Login Error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const setParts = [];
      const values = [];

      if (updateData.name !== undefined) {
        setParts.push('Name = ?');
        values.push(updateData.name);
      }

      if (updateData.profile_image_url !== undefined) {
        setParts.push('`Profile Image URL` = ?');
        values.push(updateData.profile_image_url);
      }

      if (updateData.preferences !== undefined) {
        setParts.push('Preferences = ?');
        values.push(JSON.stringify(updateData.preferences));
      }

      if (setParts.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(userId);

      const sql = `
        UPDATE Ankit_Login 
        SET ${setParts.join(', ')}
        WHERE \`User Id\` = ?
      `;

      await query(sql, values);

      // Return updated user
      return await this.getUserById(userId);
    } catch (error) {
      console.error('Update User Profile Error:', error);
      throw error;
    }
  },

  // Update FCM token
  async updateFCMToken(userId, fcmToken) {
    try {
      const sql = `
        UPDATE Ankit_Login 
        SET \`FCM Token\` = ?
        WHERE \`User Id\` = ?
      `;

      await query(sql, [fcmToken, userId]);
    } catch (error) {
      console.error('Update FCM Token Error:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers() {
    try {
      const sql = `
        SELECT * FROM Ankit_Login 
        ORDER BY \`Created At\` DESC
      `;
      
      const rows = await query(sql);
      return rows;
    } catch (error) {
      console.error('Get All Users Error:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const sql = `
        DELETE FROM Ankit_Login 
        WHERE \`User Id\` = ?
      `;
      
      await query(sql, [userId]);
    } catch (error) {
      console.error('Delete User Error:', error);
      throw error;
    }
  },

  // Deactivate user (soft delete)
  async deactivateUser(userId) {
    try {
      const sql = `
        UPDATE Ankit_Login 
        SET \`Is Active\` = false
        WHERE \`User Id\` = ?
      `;
      
      await query(sql, [userId]);
    } catch (error) {
      console.error('Deactivate User Error:', error);
      throw error;
    }
  },

  // Activate user
  async activateUser(userId) {
    try {
      const sql = `
        UPDATE Ankit_Login 
        SET \`Is Active\` = true
        WHERE \`User Id\` = ?
      `;
      
      await query(sql, [userId]);
    } catch (error) {
      console.error('Activate User Error:', error);
      throw error;
    }
  },

  // Get users by restaurant ID - REMOVED (no longer needed)
  // This function has been removed as Restaurant ID is no longer part of the system

  // Update password
  async updatePassword(userId, hashedPassword) {
    try {
      const sql = `
        UPDATE Ankit_Login 
        SET Password = ?
        WHERE \`User Id\` = ?
      `;
      
      await query(sql, [hashedPassword, userId]);
    } catch (error) {
      console.error('Update Password Error:', error);
      throw error;
    }
  }
};

export default ankitLoginRepository;