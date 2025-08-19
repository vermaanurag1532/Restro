// Repository/userStats.repository.js
import connection from '../Connection/Connection.js';
import { promisify } from 'util';

// Convert callback-based connection to promise-based
const query = promisify(connection.query).bind(connection);

const userStatsRepository = {
  // Helper method to safely parse JSON
  parseJsonSafely(jsonString, defaultValue = {}) {
    try {
      if (!jsonString) return defaultValue;
      
      // If it's already an object, return it
      if (typeof jsonString === 'object') {
        return jsonString;
      }
      
      // If it's a string, try to parse it
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      
      return defaultValue;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return defaultValue;
    }
  },
  // Get user statistics
  async getUserStats(userId) {
    try {
      const sql = `
        SELECT * FROM User_Stats 
        WHERE user_id = ?
      `;
      
      const rows = await query(sql, [userId]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      
      // Format the response to match frontend expectations
      return {
        total_quizzes: row.total_quizzes,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        average_score: parseFloat(row.average_score),
        study_streak: row.study_streak,
        total_study_hours: row.total_study_hours,
        completed_flashcards: row.completed_flashcards,
        saved_notes: row.saved_notes,
        subject_stats: this.parseJsonSafely(row.subject_stats, {}),
        last_activity: row.last_activity ? row.last_activity.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Get User Stats Error:', error);
      throw error;
    }
  },

  // Create user statistics
  async createUserStats(userId, statsData) {
    try {
      const sql = `
        INSERT INTO User_Stats (
          user_id,
          total_quizzes,
          total_questions,
          correct_answers,
          average_score,
          study_streak,
          total_study_hours,
          completed_flashcards,
          saved_notes,
          subject_stats,
          last_activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        userId,
        statsData.total_quizzes || 0,
        statsData.total_questions || 0,
        statsData.correct_answers || 0,
        statsData.average_score || 0.0,
        statsData.study_streak || 0,
        statsData.total_study_hours || 0,
        statsData.completed_flashcards || 0,
        statsData.saved_notes || 0,
        JSON.stringify(statsData.subject_stats || {}),
        statsData.last_activity ? new Date(statsData.last_activity) : new Date()
      ];

      await query(sql, values);

      // Return the created stats
      return await this.getUserStats(userId);
    } catch (error) {
      console.error('Create User Stats Error:', error);
      throw error;
    }
  },

  // Update user statistics
  async updateUserStats(userId, statsData) {
    try {
      const setParts = [];
      const values = [];

      // Build dynamic update query based on provided fields
      if (statsData.total_quizzes !== undefined) {
        setParts.push('total_quizzes = ?');
        values.push(statsData.total_quizzes);
      }

      if (statsData.total_questions !== undefined) {
        setParts.push('total_questions = ?');
        values.push(statsData.total_questions);
      }

      if (statsData.correct_answers !== undefined) {
        setParts.push('correct_answers = ?');
        values.push(statsData.correct_answers);
      }

      if (statsData.average_score !== undefined) {
        setParts.push('average_score = ?');
        values.push(statsData.average_score);
      }

      if (statsData.study_streak !== undefined) {
        setParts.push('study_streak = ?');
        values.push(statsData.study_streak);
      }

      if (statsData.total_study_hours !== undefined) {
        setParts.push('total_study_hours = ?');
        values.push(statsData.total_study_hours);
      }

      if (statsData.completed_flashcards !== undefined) {
        setParts.push('completed_flashcards = ?');
        values.push(statsData.completed_flashcards);
      }

      if (statsData.saved_notes !== undefined) {
        setParts.push('saved_notes = ?');
        values.push(statsData.saved_notes);
      }

      if (statsData.subject_stats !== undefined) {
        setParts.push('subject_stats = ?');
        values.push(JSON.stringify(statsData.subject_stats));
      }

      if (statsData.last_activity !== undefined) {
        setParts.push('last_activity = ?');
        values.push(new Date(statsData.last_activity));
      }

      if (setParts.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at timestamp
      setParts.push('updated_at = NOW()');
      values.push(userId);

      const sql = `
        UPDATE User_Stats 
        SET ${setParts.join(', ')}
        WHERE user_id = ?
      `;

      await query(sql, values);

      // Return updated stats
      return await this.getUserStats(userId);
    } catch (error) {
      console.error('Update User Stats Error:', error);
      throw error;
    }
  },

  // Delete user statistics
  async deleteUserStats(userId) {
    try {
      const sql = `
        DELETE FROM User_Stats 
        WHERE user_id = ?
      `;
      
      await query(sql, [userId]);
    } catch (error) {
      console.error('Delete User Stats Error:', error);
      throw error;
    }
  },

  // Check if user statistics exist
  async statsExist(userId) {
    try {
      const sql = `
        SELECT COUNT(*) as count FROM User_Stats 
        WHERE user_id = ?
      `;
      
      const rows = await query(sql, [userId]);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Check Stats Exist Error:', error);
      throw error;
    }
  },

  // Get user statistics by date range
  async getUserStatsByDateRange(userId, startDate, endDate) {
    try {
      const sql = `
        SELECT * FROM User_Stats 
        WHERE user_id = ? 
        AND last_activity BETWEEN ? AND ?
        ORDER BY last_activity DESC
        LIMIT 1
      `;
      
      const rows = await query(sql, [userId, startDate, endDate]);
      
      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      
      return {
        total_quizzes: row.total_quizzes,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        average_score: parseFloat(row.average_score),
        study_streak: row.study_streak,
        total_study_hours: row.total_study_hours,
        completed_flashcards: row.completed_flashcards,
        saved_notes: row.saved_notes,
        subject_stats: this.parseJsonSafely(row.subject_stats, {}),
        last_activity: row.last_activity ? row.last_activity.toISOString() : new Date().toISOString()
      };
    } catch (error) {
      console.error('Get User Stats By Date Range Error:', error);
      throw error;
    }
  },

  // Get leaderboard for a specific category
  async getLeaderboard(category, limit = 10) {
    try {
      // Validate category to prevent SQL injection
      const validCategories = [
        'total_quizzes', 'total_questions', 'correct_answers',
        'average_score', 'study_streak', 'total_study_hours',
        'completed_flashcards', 'saved_notes'
      ];

      if (!validCategories.includes(category)) {
        throw new Error('Invalid category for leaderboard');
      }

      const sql = `
        SELECT 
          us.user_id,
          us.${category} as score,
          al.Name as user_name,
          us.last_activity
        FROM User_Stats us
        LEFT JOIN Ankit_Login al ON us.user_id = al.\`User Id\`
        WHERE us.${category} > 0
        ORDER BY us.${category} DESC
        LIMIT ?
      `;
      
      const rows = await query(sql, [limit]);
      
      return rows.map((row, index) => ({
        rank: index + 1,
        user_id: row.user_id,
        user_name: row.user_name || 'Unknown User',
        score: category === 'average_score' ? parseFloat(row.score) : row.score,
        last_activity: row.last_activity ? row.last_activity.toISOString() : null
      }));
    } catch (error) {
      console.error('Get Leaderboard Error:', error);
      throw error;
    }
  },

  // Get all users statistics (admin functionality)
  async getAllUserStats() {
    try {
      const sql = `
        SELECT 
          us.*,
          al.Name as user_name,
          al.Email as user_email
        FROM User_Stats us
        LEFT JOIN Ankit_Login al ON us.user_id = al.\`User Id\`
        ORDER BY us.last_activity DESC
      `;
      
      const rows = await query(sql);
      
      return rows.map(row => ({
        user_id: row.user_id,
        user_name: row.user_name || 'Unknown User',
        user_email: row.user_email || 'Unknown Email',
        total_quizzes: row.total_quizzes,
        total_questions: row.total_questions,
        correct_answers: row.correct_answers,
        average_score: parseFloat(row.average_score),
        study_streak: row.study_streak,
        total_study_hours: row.total_study_hours,
        completed_flashcards: row.completed_flashcards,
        saved_notes: row.saved_notes,
        subject_stats: this.parseJsonSafely(row.subject_stats, {}),
        last_activity: row.last_activity ? row.last_activity.toISOString() : null,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Get All User Stats Error:', error);
      throw error;
    }
  },

  // Get statistics summary for dashboard
  async getStatsSummary() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_users,
          SUM(total_quizzes) as total_quizzes_completed,
          SUM(total_questions) as total_questions_answered,
          SUM(correct_answers) as total_correct_answers,
          AVG(average_score) as overall_average_score,
          MAX(study_streak) as highest_study_streak,
          SUM(total_study_hours) as total_study_hours,
          SUM(completed_flashcards) as total_flashcards_completed,
          SUM(saved_notes) as total_notes_saved
        FROM User_Stats
      `;
      
      const rows = await query(sql);
      const summary = rows[0];
      
      return {
        total_users: summary.total_users || 0,
        total_quizzes_completed: summary.total_quizzes_completed || 0,
        total_questions_answered: summary.total_questions_answered || 0,
        total_correct_answers: summary.total_correct_answers || 0,
        overall_average_score: summary.overall_average_score ? parseFloat(summary.overall_average_score.toFixed(2)) : 0,
        overall_accuracy: summary.total_questions_answered > 0 
          ? parseFloat(((summary.total_correct_answers / summary.total_questions_answered) * 100).toFixed(2))
          : 0,
        highest_study_streak: summary.highest_study_streak || 0,
        total_study_hours: summary.total_study_hours || 0,
        total_flashcards_completed: summary.total_flashcards_completed || 0,
        total_notes_saved: summary.total_notes_saved || 0
      };
    } catch (error) {
      console.error('Get Stats Summary Error:', error);
      throw error;
    }
  },

  // Increment specific stat field
  async incrementStatField(userId, field, value = 1) {
    try {
      const sql = `
        UPDATE User_Stats 
        SET ${field} = ${field} + ?, 
            last_activity = NOW(),
            updated_at = NOW()
        WHERE user_id = ?
      `;
      
      await query(sql, [value, userId]);
      return await this.getUserStats(userId);
    } catch (error) {
      console.error('Increment Stat Field Error:', error);
      throw error;
    }
  },

  // Update subject stats
  async updateSubjectStats(userId, subject, increment = 1) {
    try {
      // Get current subject stats
      const currentStats = await this.getUserStats(userId);
      const subjectStats = currentStats?.subject_stats || {};
      
      // Update the specific subject
      subjectStats[subject] = (subjectStats[subject] || 0) + increment;
      
      const sql = `
        UPDATE User_Stats 
        SET subject_stats = ?,
            last_activity = NOW(),
            updated_at = NOW()
        WHERE user_id = ?
      `;
      
      await query(sql, [JSON.stringify(subjectStats), userId]);
      return await this.getUserStats(userId);
    } catch (error) {
      console.error('Update Subject Stats Error:', error);
      throw error;
    }
  }
};

export default userStatsRepository;