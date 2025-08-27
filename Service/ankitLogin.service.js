// Services/ankitLogin.service.js
import ankitLoginRepository from '../Repository/ankitLogin.repository.js';
import bcrypt from 'bcrypt';
import { preferences } from 'joi';
import { v4 as uuidv4 } from 'uuid';

const ankitLoginService = {
  // Sign In Service
  async signIn(email, password, deviceInfo) {
    try {
      // Get user by email
      const user = await ankitLoginRepository.getUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (!user['Is Active']) {
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Update last login time and device info
      await ankitLoginRepository.updateLastLogin(user['User Id'], deviceInfo);

      // Get updated user data
      const updatedUser = await ankitLoginRepository.getUserById(user['User Id']);

      // Format user data for response
      const responseUser = {
        id: updatedUser['User Id'],
        email: updatedUser.Email,
        name: updatedUser.Name,
        profile_image_url: updatedUser['Profile Image URL'],
        created_at: updatedUser['Created At'],
        last_login_at: updatedUser['Last Login At'],
        is_active: updatedUser['Is Active'],
        preferences: updatedUser.Preferences || {},
        device_id: deviceInfo?.device_id || null,
        fcm_token: updatedUser['FCM Token']
      };

      return {
        success: true,
        user: responseUser
      };

    } catch (error) {
      console.error('SignIn Service Error:', error);
      throw error;
    }
  },

  // Sign Up Service
  async signUp(userData) {
    try {
      // Check if user already exists
      const existingUser = await ankitLoginRepository.getUserByEmail(userData.email);
      
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Generate user ID
      const userId = `USER-${uuidv4()}`;

      // Prepare user data for database
      const newUserData = {
        userId,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        deviceInfo: userData.device_info || null,
        preferences: userData.Preferences
      };

      // Create user
      const createdUser = await ankitLoginRepository.createUser(newUserData);

      // Format user data for response
      const responseUser = {
        id: createdUser['User Id'],
        email: createdUser.Email,
        name: createdUser.Name,
        profile_image_url: createdUser['Profile Image URL'],
        created_at: createdUser['Created At'],
        last_login_at: createdUser['Last Login At'],
        is_active: createdUser['Is Active'],
        preferences: createdUser.Preferences || {},
        device_id: userData.device_info?.device_id || null,
        fcm_token: createdUser['FCM Token']
      };

      return {
        success: true,
        user: responseUser
      };

    } catch (error) {
      console.error('SignUp Service Error:', error);
      throw error;
    }
  },

  // Sign Out Service
  async signOut(userId) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Clear FCM token (optional - for push notifications)
      await ankitLoginRepository.updateFCMToken(userId, null);

      return {
        success: true,
        message: 'Signed out successfully'
      };

    } catch (error) {
      console.error('SignOut Service Error:', error);
      throw error;
    }
  },

  // Forgot Password Service
  async forgotPassword(email) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal if email exists for security
        return {
          success: true,
          message: 'If an account with this email exists, password reset instructions have been sent.'
        };
      }

      // In a real implementation, you would:
      // 1. Generate a password reset token
      // 2. Store it in the database with expiration
      // 3. Send email with reset link
      
      // For now, just return success message
      console.log(`Password reset requested for user: ${user.Email}`);

      return {
        success: true,
        message: 'If an account with this email exists, password reset instructions have been sent.'
      };

    } catch (error) {
      console.error('ForgotPassword Service Error:', error);
      throw error;
    }
  },

  // Update Profile Service
  async updateProfile(userId, updateData) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user profile
      const updatedUser = await ankitLoginRepository.updateUserProfile(userId, updateData);

      // Format user data for response
      const responseUser = {
        id: updatedUser['User Id'],
        email: updatedUser.Email,
        name: updatedUser.Name,
        profile_image_url: updatedUser['Profile Image URL'],
        created_at: updatedUser['Created At'],
        last_login_at: updatedUser['Last Login At'],
        is_active: updatedUser['Is Active'],
        preferences: updatedUser.Preferences || {},
        fcm_token: updatedUser['FCM Token']
      };

      return {
        success: true,
        user: responseUser
      };

    } catch (error) {
      console.error('UpdateProfile Service Error:', error);
      throw error;
    }
  },

  // Update FCM Token Service
  async updateFCMToken(userId, fcmToken) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update FCM token
      await ankitLoginRepository.updateFCMToken(userId, fcmToken);

      return {
        success: true,
        message: 'FCM token updated successfully'
      };

    } catch (error) {
      console.error('UpdateFCMToken Service Error:', error);
      throw error;
    }
  },

  // Get User Profile Service
  async getUserProfile(userId) {
    try {
      const user = await ankitLoginRepository.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Format user data for response
      const responseUser = {
        id: user['User Id'],
        email: user.Email,
        name: user.Name,
        profile_image_url: user['Profile Image URL'],
        created_at: user['Created At'],
        last_login_at: user['Last Login At'],
        is_active: user['Is Active'],
        preferences: user.Preferences || {},
        fcm_token: user['FCM Token']
      };

      return {
        success: true,
        user: responseUser
      };

    } catch (error) {
      console.error('GetUserProfile Service Error:', error);
      throw error;
    }
  },

  // Get All Users Service
  async getAllUsers() {
    try {
      const users = await ankitLoginRepository.getAllUsers();

      // Format users data for response
      const responseUsers = users.map(user => ({
        id: user['User Id'],
        email: user.Email,
        name: user.Name,
        profile_image_url: user['Profile Image URL'],
        created_at: user['Created At'],
        last_login_at: user['Last Login At'],
        is_active: user['Is Active'],
        preferences: user.Preferences || {}
      }));

      return {
        success: true,
        users: responseUsers,
        count: responseUsers.length
      };

    } catch (error) {
      console.error('GetAllUsers Service Error:', error);
      throw error;
    }
  },

  // Delete User Service
  async deleteUser(userId) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Delete user
      await ankitLoginRepository.deleteUser(userId);

      return {
        success: true,
        message: 'User deleted successfully'
      };

    } catch (error) {
      console.error('DeleteUser Service Error:', error);
      throw error;
    }
  }
};

export default ankitLoginService;