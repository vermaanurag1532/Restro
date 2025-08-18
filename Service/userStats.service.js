// Service/userStats.service.js
import userStatsRepository from '../Repository/userStats.repository.js';
import ankitLoginRepository from '../Repository/ankitLogin.repository.js';

const userStatsService = {
  // Get default stats template
  getDefaultStatsTemplate() {
    return {
      total_quizzes: 0,
      total_questions: 0,
      correct_answers: 0,
      average_score: 0.0,
      study_streak: 0,
      total_study_hours: 0,
      completed_flashcards: 0,
      saved_notes: 0,
      subject_stats: {},
      last_activity: new Date().toISOString()
    };
  },

  // Validate stats data
  validateStatsData(statsData) {
    const errors = [];

    // Validate numeric fields
    const numericFields = [
      'total_quizzes', 'total_questions', 'correct_answers', 
      'study_streak', 'total_study_hours', 'completed_flashcards', 'saved_notes'
    ];
    
    numericFields.forEach(field => {
      if (statsData[field] !== undefined) {
        if (!Number.isInteger(statsData[field]) || statsData[field] < 0) {
          errors.push(`${field} must be a non-negative integer`);
        }
      }
    });

    // Validate average_score
    if (statsData.average_score !== undefined) {
      if (typeof statsData.average_score !== 'number' || statsData.average_score < 0 || statsData.average_score > 100) {
        errors.push('average_score must be a number between 0 and 100');
      }
    }

    // Validate subject_stats
    if (statsData.subject_stats !== undefined) {
      if (typeof statsData.subject_stats !== 'object' || Array.isArray(statsData.subject_stats)) {
        errors.push('subject_stats must be an object');
      } else {
        // Check if all values are integers
        for (const [key, value] of Object.entries(statsData.subject_stats)) {
          if (!Number.isInteger(value) || value < 0) {
            errors.push(`subject_stats.${key} must be a non-negative integer`);
          }
        }
      }
    }

    // Validate last_activity
    if (statsData.last_activity !== undefined) {
      try {
        new Date(statsData.last_activity);
      } catch (error) {
        errors.push('last_activity must be a valid ISO date string');
      }
    }

    return errors;
  },

  // Calculate average score
  calculateAverageScore(totalQuestions, correctAnswers) {
    if (totalQuestions === 0) return 0.0;
    return parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(2));
  },

  // Calculate study streak
  async calculateStudyStreak(userId) {
    try {
      // This is a simplified streak calculation
      // In a real application, you'd track daily activities
      const stats = await userStatsRepository.getUserStats(userId);
      if (!stats) return 0;

      const lastActivity = new Date(stats.last_activity);
      const today = new Date();
      const diffTime = Math.abs(today - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If last activity was today or yesterday, maintain/increment streak
      if (diffDays <= 1) {
        return stats.study_streak || 0;
      } else {
        return 0; // Reset streak if more than 1 day gap
      }
    } catch (error) {
      console.error('Calculate Study Streak Error:', error);
      return 0;
    }
  },

  // Get user statistics
  async getUserStats(userId) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Try to get user stats
      let stats = await userStatsRepository.getUserStats(userId);

      // If no stats exist, create default ones
      if (!stats) {
        const defaultStats = this.getDefaultStatsTemplate();
        const createdStats = await userStatsRepository.createUserStats(userId, defaultStats);
        stats = createdStats;
      }

      return {
        success: true,
        stats
      };

    } catch (error) {
      console.error('GetUserStats Service Error:', error);
      throw error;
    }
  },

  // Update user statistics
  async updateUserStats(userId, statsData) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Validate stats data
      const validationErrors = this.validateStatsData(statsData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        };
      }

      // Calculate average score if total_questions and correct_answers are provided
      if (statsData.total_questions !== undefined && statsData.correct_answers !== undefined) {
        statsData.average_score = this.calculateAverageScore(
          statsData.total_questions, 
          statsData.correct_answers
        );
      }

      // Update last_activity
      statsData.last_activity = new Date().toISOString();

      // Check if stats already exist
      const existingStats = await userStatsRepository.getUserStats(userId);

      let updatedStats;
      if (existingStats) {
        // Update existing stats
        updatedStats = await userStatsRepository.updateUserStats(userId, statsData);
      } else {
        // Create new stats with defaults merged with provided data
        const defaultStats = this.getDefaultStatsTemplate();
        const mergedStats = { ...defaultStats, ...statsData };
        updatedStats = await userStatsRepository.createUserStats(userId, mergedStats);
      }

      return {
        success: true,
        stats: updatedStats
      };

    } catch (error) {
      console.error('UpdateUserStats Service Error:', error);
      throw error;
    }
  },

  // Increment specific statistics
  async incrementStats(userId, type, value = 1, subject = null) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Validate increment type
      const validTypes = [
        'total_quizzes', 'total_questions', 'correct_answers',
        'total_study_hours', 'completed_flashcards', 'saved_notes'
      ];

      if (!validTypes.includes(type)) {
        return {
          success: false,
          message: `Invalid increment type. Valid types: ${validTypes.join(', ')}`
        };
      }

      // Get current stats
      let currentStats = await userStatsRepository.getUserStats(userId);
      if (!currentStats) {
        currentStats = await userStatsRepository.createUserStats(userId, this.getDefaultStatsTemplate());
      }

      // Prepare increment data
      const incrementData = {
        [type]: (currentStats[type] || 0) + value,
        last_activity: new Date().toISOString()
      };

      // Handle subject-specific stats
      if (subject && ['total_questions', 'correct_answers'].includes(type)) {
        const subjectStats = currentStats.subject_stats || {};
        subjectStats[subject] = (subjectStats[subject] || 0) + value;
        incrementData.subject_stats = subjectStats;
      }

      // Recalculate average score if questions or answers were incremented
      if (['total_questions', 'correct_answers'].includes(type)) {
        const newTotalQuestions = type === 'total_questions' 
          ? incrementData.total_questions 
          : currentStats.total_questions || 0;
        const newCorrectAnswers = type === 'correct_answers' 
          ? incrementData.correct_answers 
          : currentStats.correct_answers || 0;
        
        incrementData.average_score = this.calculateAverageScore(newTotalQuestions, newCorrectAnswers);
      }

      // Update study streak if it's a study activity
      if (['total_quizzes', 'completed_flashcards', 'saved_notes'].includes(type)) {
        incrementData.study_streak = await this.calculateStudyStreak(userId) + 1;
      }

      const updatedStats = await userStatsRepository.updateUserStats(userId, incrementData);

      return {
        success: true,
        stats: updatedStats
      };

    } catch (error) {
      console.error('IncrementStats Service Error:', error);
      throw error;
    }
  },

  // Reset user statistics
  async resetUserStats(userId) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Get default stats
      const defaultStats = this.getDefaultStatsTemplate();

      // Check if stats exist
      const existingStats = await userStatsRepository.getUserStats(userId);

      let resetStats;
      if (existingStats) {
        // Update with default values
        resetStats = await userStatsRepository.updateUserStats(userId, defaultStats);
      } else {
        // Create new stats with defaults
        resetStats = await userStatsRepository.createUserStats(userId, defaultStats);
      }

      return {
        success: true,
        stats: resetStats
      };

    } catch (error) {
      console.error('ResetUserStats Service Error:', error);
      throw error;
    }
  },

  // Get user statistics by date range
  async getUserStatsByDateRange(userId, startDate, endDate) {
    try {
      // Check if user exists
      const user = await ankitLoginRepository.getUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Validate dates
      if (!startDate || !endDate) {
        return {
          success: false,
          message: 'Start date and end date are required'
        };
      }

      const stats = await userStatsRepository.getUserStatsByDateRange(userId, startDate, endDate);

      return {
        success: true,
        stats: stats || this.getDefaultStatsTemplate()
      };

    } catch (error) {
      console.error('GetUserStatsByDateRange Service Error:', error);
      throw error;
    }
  },

  // Get leaderboard
  async getLeaderboard(category, limit = 10) {
    try {
      const validCategories = [
        'total_quizzes', 'total_questions', 'correct_answers',
        'average_score', 'study_streak', 'total_study_hours',
        'completed_flashcards', 'saved_notes'
      ];

      if (!validCategories.includes(category)) {
        return {
          success: false,
          message: `Invalid category. Valid categories: ${validCategories.join(', ')}`
        };
      }

      const leaderboard = await userStatsRepository.getLeaderboard(category, limit);

      return {
        success: true,
        leaderboard
      };

    } catch (error) {
      console.error('GetLeaderboard Service Error:', error);
      throw error;
    }
  },

  // Record activity
  async recordActivity(userId, activityData) {
    try {
      const { activityType, duration, subject, score } = activityData;

      // Map activity types to stat increments
      const activityMap = {
        'quiz': { field: 'total_quizzes', value: 1 },
        'flashcard': { field: 'completed_flashcards', value: 1 },
        'note': { field: 'saved_notes', value: 1 },
        'study': { field: 'total_study_hours', value: Math.ceil((duration || 0) / 60) }
      };

      if (!activityMap[activityType]) {
        return {
          success: false,
          message: `Invalid activity type. Valid types: ${Object.keys(activityMap).join(', ')}`
        };
      }

      const increment = activityMap[activityType];
      
      // Record the activity
      const result = await this.incrementStats(userId, increment.field, increment.value, subject);

      return result;

    } catch (error) {
      console.error('RecordActivity Service Error:', error);
      throw error;
    }
  }
};

export default userStatsService;