// Repository/currentAffairs.repository.js
import connection from '../Connection/Connection.js';
import { promisify } from 'util';

export class CurrentAffairsRepository {
  constructor() {
    // Use your existing connection and promisify for async/await
    this.connection = connection;
    this.query = promisify(this.connection.query).bind(this.connection);
    this.initializeDatabase();
  }

  /**
   * Initialize database and create tables
   */
  async initializeDatabase() {
    try {
      // Create current affairs table if it doesn't exist
      await this.createCurrentAffairsTable();
      await this.createCurrentAffairsQuizTable();
      await this.createTrendingTopicsTable();
      
      console.log('Current Affairs database initialized successfully');
    } catch (error) {
      console.error('Error initializing current affairs database:', error);
      throw error;
    }
  }

  /**
   * Create current affairs main table
   */
  async createCurrentAffairsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`Current_Affairs\` (
        \`id\` VARCHAR(255) PRIMARY KEY,
        \`restaurant_id\` VARCHAR(255) DEFAULT 'GENERAL',
        \`title\` TEXT NOT NULL,
        \`summary\` TEXT,
        \`content\` TEXT,
        \`source\` VARCHAR(500),
        \`url\` TEXT,
        \`category\` VARCHAR(100),
        \`date\` DATE NOT NULL,
        \`key_facts\` JSON,
        \`exam_relevance\` JSON,
        \`related_topics\` JSON,
        \`mcq_question\` JSON,
        \`tags\` JSON,
        \`difficulty\` ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
        \`importance\` INT DEFAULT 5,
        \`publish_date\` DATETIME,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_date\` (\`date\`),
        INDEX \`idx_category\` (\`category\`),
        INDEX \`idx_difficulty\` (\`difficulty\`),
        INDEX \`idx_importance\` (\`importance\`),
        INDEX \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await this.query(createTableQuery);
  }

  /**
   * Create current affairs quiz table
   */
  async createCurrentAffairsQuizTable() {
    const createQuizTableQuery = `
      CREATE TABLE IF NOT EXISTS \`Current_Affairs_Quiz\` (
        \`id\` VARCHAR(255) PRIMARY KEY,
        \`restaurant_id\` VARCHAR(255) DEFAULT 'GENERAL',
        \`quiz_title\` VARCHAR(500),
        \`date\` DATE NOT NULL,
        \`difficulty\` ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
        \`exam_type\` VARCHAR(50),
        \`total_questions\` INT,
        \`questions\` JSON,
        \`category\` VARCHAR(100),
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_date\` (\`date\`),
        INDEX \`idx_exam_type\` (\`exam_type\`),
        INDEX \`idx_difficulty\` (\`difficulty\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await this.query(createQuizTableQuery);
  }

  async getNextSequentialId() {
    try {
      // Create a table to track sequential IDs if it doesn't exist
      await this.createSequentialIdTable();
      
      // Get or create the sequential ID counter
      const getQuery = `
        SELECT \`last_id\` FROM \`Current_Affairs_Sequential\` 
        WHERE \`id\` = 1 FOR UPDATE
      `;
      
      const rows = await this.query(getQuery);
      
      if (rows.length === 0) {
        // Initialize with ID 1
        const insertQuery = `
          INSERT INTO \`Current_Affairs_Sequential\` (\`id\`, \`last_id\`) 
          VALUES (1, 1)
        `;
        await this.query(insertQuery);
        return 1;
      } else {
        // Increment and return the next ID
        const updateQuery = `
          UPDATE \`Current_Affairs_Sequential\` 
          SET \`last_id\` = \`last_id\` + 1 
          WHERE \`id\` = 1
        `;
        await this.query(updateQuery);
        return rows[0].last_id + 1;
      }
    } catch (error) {
      console.error('Error getting sequential ID:', error);
      
      // Fallback: use timestamp-based ID
      return 'CA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    }
  }

  /**
   * Create trending topics table
   */
  async createTrendingTopicsTable() {
    const createTrendingTableQuery = `
      CREATE TABLE IF NOT EXISTS \`Trending_Topics\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`restaurant_id\` VARCHAR(255) DEFAULT 'GENERAL',
        \`topic\` VARCHAR(500),
        \`category\` VARCHAR(100),
        \`frequency\` INT DEFAULT 1,
        \`importance\` INT DEFAULT 5,
        \`exam_relevance\` JSON,
        \`date\` DATE NOT NULL,
        \`last_mentioned\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_topic\` (\`topic\`),
        INDEX \`idx_date\` (\`date\`),
        INDEX \`idx_frequency\` (\`frequency\`),
        UNIQUE KEY \`unique_topic_date\` (\`topic\`(255), \`date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await this.query(createTrendingTableQuery);
  }

  /**
   * Save current affairs data with improved JSON handling
   */
  async saveCurrentAffairs(currentAffairsArray, date) {
    try {
      const insertQuery = `
        INSERT INTO \`Current_Affairs\` (
          \`id\`, \`title\`, \`summary\`, \`content\`, \`source\`, \`url\`, 
          \`category\`, \`date\`, \`key_facts\`, \`exam_relevance\`, 
          \`related_topics\`, \`mcq_question\`, \`tags\`, \`difficulty\`, 
          \`importance\`, \`publish_date\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`summary\` = VALUES(\`summary\`),
          \`content\` = VALUES(\`content\`),
          \`exam_relevance\` = VALUES(\`exam_relevance\`),
          \`importance\` = VALUES(\`importance\`),
          \`updated_at\` = CURRENT_TIMESTAMP
      `;
  
      const results = [];
      
      for (const item of currentAffairsArray) {
        try {
          // Ensure all values are properly formatted
          const values = [
            this.ensureString(item.id),
            this.ensureString(item.title),
            this.ensureString(item.summary),
            this.ensureString(item.content),
            this.ensureString(item.source),
            this.ensureString(item.url),
            this.ensureString(item.category),
            date,
            this.stringifyJSON(item.keyFacts || []),
            this.stringifyJSON(item.examRelevance || {}),
            this.stringifyJSON(item.relatedTopics || []),
            this.stringifyJSON(item.mcqQuestion || null),
            this.stringifyJSON(item.tags || []),
            this.ensureString(item.difficulty || 'Medium'),
            this.ensureNumber(item.importance || 5),
            item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : null
          ];
  
          const result = await this.query(insertQuery, values);
          results.push(result);
  
          // Update trending topics
          await this.updateTrendingTopics(item.title, item.category, date, item.examRelevance);
        } catch (error) {
          console.error('Error saving individual current affairs item:', error);
          console.error('Problematic item:', JSON.stringify(item, null, 2));
        }
      }
  
      return results;
    } catch (error) {
      console.error('Error saving current affairs:', error);
      throw error;
    }
  }

  ensureString(value) {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
  
  /**
   * Ensure value is a number
   */
  ensureNumber(value) {
    if (value === null || value === undefined) {
      return 5; // Default importance
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 5 : num;
    }
    return 5; // Fallback
  }
  
  /**
   * Improved JSON stringification with validation
   */
  stringifyJSON(data) {
    try {
      if (data === null || data === undefined) {
        return 'null';
      }
      
      // If it's already a string, check if it's valid JSON
      if (typeof data === 'string') {
        try {
          JSON.parse(data);
          return data; // Already valid JSON string
        } catch {
          // Not valid JSON, wrap it as a string value
          return JSON.stringify(data);
        }
      }
      
      // Convert object/array to JSON string
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error stringifying JSON:', error, 'Data:', data);
      return 'null';
    }
  }

  /**
   * Update trending topics with better JSON handling
   */
/**
 * Update trending topics with better JSON handling
 */
async updateTrendingTopics(topic, category, date, examRelevance) {
  try {
    const updateQuery = `
      INSERT INTO \`Trending_Topics\` (
        \`topic\`, \`category\`, \`frequency\`, \`exam_relevance\`, \`date\`
      ) VALUES (?, ?, 1, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`frequency\` = \`frequency\` + 1,
        \`last_mentioned\` = CURRENT_TIMESTAMP
    `;

    const values = [
      this.ensureString(topic).substring(0, 500), // Limit topic length
      this.ensureString(category),
      this.stringifyJSON(examRelevance || {}),
      date
    ];

    await this.query(updateQuery, values);
  } catch (error) {
    console.error('Error updating trending topics:', error);
  }
}

  /**
   * Get current affairs by date with improved JSON parsing
   */
  async getCurrentAffairsByDate(date, category = null) {
    try {
      let query = `
        SELECT * FROM \`Current_Affairs\` 
        WHERE \`date\` = ?
      `;
      const params = [date];

      if (category) {
        query += ` AND \`category\` = ?`;
        params.push(category);
      }

      query += ` ORDER BY \`importance\` DESC, \`created_at\` DESC`;

      const rows = await this.query(query, params);
      
      return rows.map(row => ({
        ...row,
        keyFacts: this.parseJSON(row.key_facts),
        examRelevance: this.parseJSON(row.exam_relevance),
        relatedTopics: this.parseJSON(row.related_topics),
        mcqQuestion: this.parseJSON(row.mcq_question),
        tags: this.parseJSON(row.tags)
      }));
    } catch (error) {
      console.error('Error getting current affairs by date:', error);
      throw error;
    }
  }

  /**
   * Get current affairs by date range
   */
  async getCurrentAffairsByDateRange(startDate, endDate, category = null, limit = 50) {
    try {
      let query = `
        SELECT * FROM \`Current_Affairs\` 
        WHERE \`date\` BETWEEN ? AND ?
      `;
      const params = [startDate, endDate];

      if (category) {
        query += ` AND \`category\` = ?`;
        params.push(category);
      }

      query += ` ORDER BY \`date\` DESC, \`importance\` DESC LIMIT ?`;
      params.push(limit);

      const rows = await this.query(query, params);
      
      return rows.map(row => ({
        ...row,
        keyFacts: this.parseJSON(row.key_facts),
        examRelevance: this.parseJSON(row.exam_relevance),
        relatedTopics: this.parseJSON(row.related_topics),
        mcqQuestion: this.parseJSON(row.mcq_question),
        tags: this.parseJSON(row.tags)
      }));
    } catch (error) {
      console.error('Error getting current affairs by date range:', error);
      throw error;
    }
  }

  /**
   * Get current affairs by category
   */
  async getCurrentAffairsByCategory(category, date, limit = 20) {
    try {
      const query = `
        SELECT * FROM \`Current_Affairs\` 
        WHERE \`category\` = ? AND \`date\` = ?
        ORDER BY \`importance\` DESC, \`created_at\` DESC
        LIMIT ?
      `;

      const rows = await this.query(query, [category, date, limit]);
      
      return rows.map(row => ({
        ...row,
        keyFacts: this.parseJSON(row.key_facts),
        examRelevance: this.parseJSON(row.exam_relevance),
        relatedTopics: this.parseJSON(row.related_topics),
        mcqQuestion: this.parseJSON(row.mcq_question),
        tags: this.parseJSON(row.tags)
      }));
    } catch (error) {
      console.error('Error getting current affairs by category:', error);
      throw error;
    }
  }

  /**
   * Get trending topics
   */
  async getTrendingTopics(fromDate, categories = [], limit = 15) {
    try {
      let query = `
        SELECT \`topic\`, \`category\`, \`frequency\`, \`importance\`, \`exam_relevance\`, \`last_mentioned\`
        FROM \`Trending_Topics\` 
        WHERE \`date\` >= ?
      `;
      const params = [fromDate];

      if (categories && categories.length > 0) {
        query += ` AND \`category\` IN (${categories.map(() => '?').join(', ')})`;
        params.push(...categories);
      }

      query += ` ORDER BY \`frequency\` DESC, \`importance\` DESC LIMIT ?`;
      params.push(limit);

      const rows = await this.query(query, params);
      
      return rows.map(row => ({
        ...row,
        examRelevance: this.parseJSON(row.exam_relevance)
      }));
    } catch (error) {
      console.error('Error getting trending topics:', error);
      throw error;
    }
  }

  /**
   * Get exam-specific current affairs
   */
  async getExamSpecificCurrentAffairs(date, examType, categories, limit = 25) {
    try {
      let query = `
        SELECT * FROM \`Current_Affairs\` 
        WHERE \`date\` = ?
        AND JSON_EXTRACT(\`exam_relevance\`, '$.${examType}') >= 5
      `;
      const params = [date];

      if (categories && categories.length > 0) {
        query += ` AND \`category\` IN (${categories.map(() => '?').join(', ')})`;
        params.push(...categories);
      }

      query += ` ORDER BY JSON_EXTRACT(\`exam_relevance\`, '$.${examType}') DESC, \`importance\` DESC LIMIT ?`;
      params.push(limit);

      const rows = await this.query(query, params);
      
      return rows.map(row => ({
        ...row,
        keyFacts: this.parseJSON(row.key_facts),
        examRelevance: this.parseJSON(row.exam_relevance),
        relatedTopics: this.parseJSON(row.related_topics),
        mcqQuestion: this.parseJSON(row.mcq_question),
        tags: this.parseJSON(row.tags)
      }));
    } catch (error) {
      console.error('Error getting exam-specific current affairs:', error);
      throw error;
    }
  }

  /**
   * Save quiz data
   */
  async saveQuiz(quizData, date, examType, category = null) {
    try {
      const insertQuery = `
        INSERT INTO \`Current_Affairs_Quiz\` (
          \`id\`, \`quiz_title\`, \`date\`, \`difficulty\`, \`exam_type\`, 
          \`total_questions\`, \`questions\`, \`category\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`questions\` = VALUES(\`questions\`)
      `;

      const quizId = `QUIZ-${Date.now()}-${examType.toUpperCase()}`;
      const values = [
        quizId,
        quizData.quizTitle || `Current Affairs Quiz - ${date}`,
        date,
        quizData.difficulty || 'Medium',
        examType.toUpperCase(),
        quizData.totalQuestions || quizData.questions?.length || 0,
        this.stringifyJSON(quizData.questions || []),
        category
      ];

      const result = await this.query(insertQuery, values);
      return { quizId, ...result };
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId) {
    try {
      const query = `
        SELECT * FROM \`Current_Affairs_Quiz\` 
        WHERE \`id\` = ?
      `;

      const rows = await this.query(query, [quizId]);
      
      if (rows.length > 0) {
        const quiz = rows[0];
        quiz.questions = this.parseJSON(quiz.questions);
        return quiz;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting quiz by ID:', error);
      throw error;
    }
  }

  /**
   * Get count by date
   */
  async getCountByDate(date) {
    try {
      const query = `SELECT COUNT(*) as count FROM \`Current_Affairs\` WHERE \`date\` = ?`;
      const rows = await this.query(query, [date]);
      return rows[0].count;
    } catch (error) {
      console.error('Error getting count by date:', error);
      return 0;
    }
  }

  // Repository/currentAffairs.repository.js - Add this method to the class

/**
 * Get all current affairs with pagination
 */
async getAllCurrentAffairs(page = 1, limit = 50, category = null, sortBy = 'date', sortOrder = 'DESC') {
  try {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM \`Current_Affairs\` 
    `;
    const params = [];

    if (category) {
      query += ` WHERE \`category\` = ?`;
      params.push(category);
    }

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['date', 'created_at', 'importance', 'category', 'difficulty'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'date';
    
    // Validate sort order
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY \`${safeSortBy}\` ${safeSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await this.query(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM \`Current_Affairs\``;
    const countParams = [];
    
    if (category) {
      countQuery += ` WHERE \`category\` = ?`;
      countParams.push(category);
    }
    
    const countResult = await this.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return {
      currentAffairs: rows.map(row => ({
        ...row,
        keyFacts: this.parseJSON(row.key_facts),
        examRelevance: this.parseJSON(row.exam_relevance),
        relatedTopics: this.parseJSON(row.related_topics),
        mcqQuestion: this.parseJSON(row.mcq_question),
        tags: this.parseJSON(row.tags)
      })),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error getting all current affairs:', error);
    throw error;
  }
}

  /**
   * Get total count
   */
  async getTotalCount() {
    try {
      const query = `SELECT COUNT(*) as count FROM \`Current_Affairs\``;
      const rows = await this.query(query);
      return rows[0].count;
    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  }

  /**
   * Search current affairs
   */
  async searchCurrentAffairs(searchTerm, limit = 20) {
    try {
      const query = `
        SELECT * FROM \`Current_Affairs\` 
        WHERE \`title\` LIKE ? OR \`summary\` LIKE ? OR \`content\` LIKE ?
        ORDER BY \`importance\` DESC, \`date\` DESC
        LIMIT ?
      `;

      const searchPattern = `%${searchTerm}%`;
      const rows = await this.query(query, [searchPattern, searchPattern, searchPattern, limit]);
      
      return rows.map(row => ({
        ...row,
        keyFacts: this.parseJSON(row.key_facts),
        examRelevance: this.parseJSON(row.exam_relevance),
        relatedTopics: this.parseJSON(row.related_topics),
        mcqQuestion: this.parseJSON(row.mcq_question),
        tags: this.parseJSON(row.tags)
      }));
    } catch (error) {
      console.error('Error searching current affairs:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(startDate, endDate) {
    try {
      const statsQuery = `
        SELECT 
          \`category\`,
          COUNT(*) as count,
          AVG(\`importance\`) as avg_importance,
          MAX(\`importance\`) as max_importance
        FROM \`Current_Affairs\` 
        WHERE \`date\` BETWEEN ? AND ?
        GROUP BY \`category\`
        ORDER BY count DESC
      `;

      const rows = await this.query(statsQuery, [startDate, endDate]);
      
      const totalQuery = `
        SELECT COUNT(*) as total_count
        FROM \`Current_Affairs\` 
        WHERE \`date\` BETWEEN ? AND ?
      `;
      
      const totalRows = await this.query(totalQuery, [startDate, endDate]);
      
      return {
        totalCount: totalRows[0].total_count,
        categoryStats: rows,
        period: { startDate, endDate }
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Delete old current affairs (cleanup)
   */
  async deleteOldCurrentAffairs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      const deleteQuery = `
        DELETE FROM \`Current_Affairs\` 
        WHERE \`date\` < ?
      `;

      const result = await this.query(deleteQuery, [cutoffDateString]);
      
      // Also cleanup old trending topics
      const deleteTrendingQuery = `
        DELETE FROM \`Trending_Topics\` 
        WHERE \`date\` < ?
      `;
      
      await this.query(deleteTrendingQuery, [cutoffDateString]);
      
      return {
        deletedCount: result.affectedRows,
        cutoffDate: cutoffDateString
      };
    } catch (error) {
      console.error('Error deleting old current affairs:', error);
      throw error;
    }
  }

  /**
   * Clear corrupted data (for fixing existing issues)
   */
  async clearCorruptedData() {
    try {
      console.log('🧹 Cleaning up corrupted JSON data...');
      
      const deleteQuery = `
        DELETE FROM \`Current_Affairs\` 
        WHERE \`date\` >= ?
      `;
      
      const today = new Date().toISOString().split('T')[0];
      const result = await this.query(deleteQuery, [today]);
      
      console.log(`🗑️ Cleared ${result.affectedRows} corrupted records`);
      
      return {
        deletedCount: result.affectedRows,
        message: 'Corrupted data cleared successfully'
      };
    } catch (error) {
      console.error('Error clearing corrupted data:', error);
      throw error;
    }
  }

  /**
   * Improved JSON stringification with validation
   */
  stringifyJSON(data) {
    try {
      if (data === null || data === undefined) {
        return 'null';
      }
      
      // If it's already a string, check if it's valid JSON
      if (typeof data === 'string') {
        try {
          JSON.parse(data);
          return data; // Already valid JSON string
        } catch {
          // Not valid JSON, wrap it as a string value
          return JSON.stringify(data);
        }
      }
      
      // Convert object/array to JSON string
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error stringifying JSON:', error, 'Data:', data);
      return 'null';
    }
  }

  /**
   * Improved JSON parsing with fallback handling
   */
  parseJSON(jsonString) {
    try {
      // Handle null/undefined cases
      if (!jsonString || jsonString === 'null' || jsonString === 'undefined') {
        return null;
      }
      
      // Handle cases where it's already an object (shouldn't happen but defensive)
      if (typeof jsonString === 'object') {
        return jsonString;
      }
      
      // Handle string cases
      if (typeof jsonString === 'string') {
        // Trim whitespace
        const trimmed = jsonString.trim();
        
        // Handle empty strings
        if (trimmed === '' || trimmed === 'null') {
          return null;
        }
        
        // Try to parse as JSON
        try {
          return JSON.parse(trimmed);
        } catch (parseError) {
          // If it's not valid JSON, check if it looks like a comma-separated list
          if (trimmed.includes(',') && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
            // Treat as comma-separated array
            return trimmed.split(',').map(item => item.trim()).filter(item => item.length > 0);
          }
          
          // If it's a simple string without JSON structure, return as single-item array
          return [trimmed];
        }
      }
      
      // Fallback for any other type
      return jsonString;
    } catch (error) {
      console.error('Error parsing JSON:', error, 'Input:', jsonString);
      return null;
    }
  }

  /**
   * Close database connection (optional - your connection handles reconnection)
   */
  async closeConnection() {
    // Your connection.js handles disconnection automatically
    // No need to manually close
    console.log('Current Affairs Repository connection closed');
  }
}