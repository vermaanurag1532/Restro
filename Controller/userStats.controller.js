// Controller/userStats.controller.js
import userStatsService from '../Service/userStats.service.js';

const userStatsController = {
  // Get user statistics
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await userStatsService.getUserStats(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        stats: result.stats,
        message: 'User statistics retrieved successfully'
      });

    } catch (error) {
      console.error('GetUserStats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update user statistics
  async updateUserStats(req, res) {
    try {
      const { userId } = req.params;
      const statsData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      if (!statsData || Object.keys(statsData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Statistics data is required'
        });
      }

      const result = await userStatsService.updateUserStats(userId, statsData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        stats: result.stats,
        message: 'User statistics updated successfully'
      });

    } catch (error) {
      console.error('UpdateUserStats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Increment specific statistics
  async incrementStats(req, res) {
    try {
      const { userId } = req.params;
      const { type, value = 1, subject } = req.body;

      if (!userId || !type) {
        return res.status(400).json({
          success: false,
          message: 'User ID and increment type are required'
        });
      }

      const result = await userStatsService.incrementStats(userId, type, value, subject);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        stats: result.stats,
        message: `${type} incremented successfully`
      });

    } catch (error) {
      console.error('IncrementStats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Reset user statistics
  async resetUserStats(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await userStatsService.resetUserStats(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        stats: result.stats,
        message: 'User statistics reset successfully'
      });

    } catch (error) {
      console.error('ResetUserStats Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get user statistics by date range
  async getUserStatsByDateRange(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const result = await userStatsService.getUserStatsByDateRange(userId, startDate, endDate);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        stats: result.stats,
        dateRange: { startDate, endDate },
        message: 'User statistics for date range retrieved successfully'
      });

    } catch (error) {
      console.error('GetUserStatsByDateRange Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get leaderboard
  async getLeaderboard(req, res) {
    try {
      const { category } = req.params;
      const { limit = 10 } = req.query;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      const result = await userStatsService.getLeaderboard(category, parseInt(limit));

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        leaderboard: result.leaderboard,
        category,
        message: 'Leaderboard retrieved successfully'
      });

    } catch (error) {
      console.error('GetLeaderboard Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Record activity
  async recordActivity(req, res) {
    try {
      const { userId } = req.params;
      const { activityType, duration, subject, score } = req.body;

      if (!userId || !activityType) {
        return res.status(400).json({
          success: false,
          message: 'User ID and activity type are required'
        });
      }

      const result = await userStatsService.recordActivity(userId, {
        activityType,
        duration,
        subject,
        score
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.status(200).json({
        success: true,
        stats: result.stats,
        message: 'Activity recorded successfully'
      });

    } catch (error) {
      console.error('RecordActivity Error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

export default userStatsController;