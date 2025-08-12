// Controllers/ankitLogin.controller.js
import ankitLoginService from '../Service/ankitLogin.service.js';

const ankitLoginController = {
  // Sign In
  async signIn(req, res) {
    try {
      const { email, password, device_info } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await ankitLoginService.signIn(email, password, device_info);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        user: result.user,
        message: 'Sign in successful'
      });

    } catch (error) {
      console.error('SignIn Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Sign Up
  async signUp(req, res) {
    try {
      const { email, password, name, device_info } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required'
        });
      }

      const result = await ankitLoginService.signUp({
        email,
        password,
        name,
        device_info
      });

      if (!result.success) {
        return res.status(409).json({
          success: false,
          message: result.message
        });
      }

      res.status(201).json({
        success: true,
        user: result.user,
        message: 'Account created successfully'
      });

    } catch (error) {
      console.error('SignUp Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Sign Out
  async signOut(req, res) {
    try {
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await ankitLoginService.signOut(user_id);

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('SignOut Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Forgot Password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const result = await ankitLoginService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('ForgotPassword Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update Profile
  async updateProfile(req, res) {
    try {
      const { user_id, name, profile_image_url, preferences } = req.body;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await ankitLoginService.updateProfile(user_id, {
        name,
        profile_image_url,
        preferences
      });

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        user: result.user,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('UpdateProfile Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update FCM Token
  async updateFCMToken(req, res) {
    try {
      const { user_id, fcm_token } = req.body;

      if (!user_id || !fcm_token) {
        return res.status(400).json({
          success: false,
          message: 'User ID and FCM token are required'
        });
      }

      const result = await ankitLoginService.updateFCMToken(user_id, fcm_token);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        message: 'FCM token updated successfully'
      });

    } catch (error) {
      console.error('UpdateFCMToken Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get User Profile
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await ankitLoginService.getUserProfile(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        user: result.user
      });

    } catch (error) {
      console.error('GetUserProfile Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Version Check
  async versionCheck(req, res) {
    try {
      const { current_version, platform } = req.query;

      const versionInfo = {
        version: "1.1.0",
        build_number: 2,
        is_force_update: false,
        is_optional_update: true,
        update_title: "New Features Available!",
        update_description: "This update includes bug fixes and performance improvements.",
        features: [
          "Improved quiz generation",
          "Better flashcard system",
          "New UI components"
        ],
        download_url: "https://play.google.com/store/apps/details?id=com.yourapp",
        release_date: "2024-01-15T00:00:00Z",
        min_supported_version: "1.0.0"
      };

      res.status(200).json({
        success: true,
        ...versionInfo
      });

    } catch (error) {
      console.error('VersionCheck Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get All Users
  async getAllUsers(req, res) {
    try {
      const result = await ankitLoginService.getAllUsers();

      res.status(200).json({
        success: true,
        users: result.users,
        count: result.count
      });

    } catch (error) {
      console.error('GetAllUsers Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Delete User
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await ankitLoginService.deleteUser(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('DeleteUser Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default ankitLoginController;