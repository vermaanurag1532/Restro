// Controllers/currentAffairs.controller.js
import { CurrentAffairsService } from '../Service/currentAffairs.service.js';

export class CurrentAffairsController {
  constructor() {
    this.currentAffairsService = new CurrentAffairsService();
  }

  /**
   * Get daily current affairs
   */
  async getDailyCurrentAffairs(req, res) {
    try {
      const { date, language = 'en' } = req.query;
      
      const currentAffairs = await this.currentAffairsService.getDailyCurrentAffairs(date, language);
      
      res.status(200).json({currentAffairs});
    } catch (error) {
      console.error('Error in getDailyCurrentAffairs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve daily current affairs',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get current affairs by date range
   */
  async getCurrentAffairsByRange(req, res) {
    try {
      const { startDate, endDate, category, limit = 50 } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
          timestamp: new Date().toISOString()
        });
      }

      const currentAffairs = await this.currentAffairsService.getCurrentAffairsByRange(
        startDate, 
        endDate, 
        category, 
        parseInt(limit)
      );
      
      res.status(200).json({currentAffairs,});
    } catch (error) {
      console.error('Error in getCurrentAffairsByRange:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve current affairs by range',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get current affairs by category
   */
  async getCurrentAffairsByCategory(req, res) {
    try {
      const { category } = req.params;
      const { limit = 20, date } = req.query;
      
      const currentAffairs = await this.currentAffairsService.getCurrentAffairsByCategory(
        category, 
        parseInt(limit), 
        date
      );
      
      res.status(200).json({currentAffairs});
    } catch (error) {
      console.error('Error in getCurrentAffairsByCategory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve current affairs by category',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get current affairs quiz questions
   */
  async getCurrentAffairsQuiz(req, res) {
    try {
      const { date, difficulty = 'medium', questionCount = 10, category } = req.query;
      
      const quiz = await this.currentAffairsService.generateCurrentAffairsQuiz(
        date, 
        difficulty, 
        parseInt(questionCount), 
        category
      );
      
      res.status(200).json({quiz});
    } catch (error) {
      console.error('Error in getCurrentAffairsQuiz:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate current affairs quiz',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get trending topics for government exam preparation
   */
  async getTrendingTopics(req, res) {
    try {
      const { examType = 'upsc', limit = 15 } = req.query;
      
      const trendingTopics = await this.currentAffairsService.getTrendingTopics(
        examType, 
        parseInt(limit)
      );
      
      res.status(200).json({trendingTopics,});
    } catch (error) {
      console.error('Error in getTrendingTopics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trending topics',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get exam-specific current affairs
   */
  async getExamSpecificCurrentAffairs(req, res) {
    try {
      const { examType } = req.params;
      const { date, limit = 25 } = req.query;
      
      const examCurrentAffairs = await this.currentAffairsService.getExamSpecificCurrentAffairs(
        examType, 
        date, 
        parseInt(limit)
      );
      
      res.status(200).json({examCurrentAffairs});
    } catch (error) {
      console.error('Error in getExamSpecificCurrentAffairs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve exam-specific current affairs',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Refresh current affairs data
   */
  async refreshCurrentAffairs(req, res) {
    try {
      const { forceUpdate = false } = req.body;
      
      const refreshResult = await this.currentAffairsService.refreshCurrentAffairsData(forceUpdate);
      
      res.status(200).json({refreshResult});
    } catch (error) {
      console.error('Error in refreshCurrentAffairs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh current affairs data',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Health check for current affairs service
   */
  async healthCheck(req, res) {
    try {
      const healthStatus = await this.currentAffairsService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        message: 'Current affairs service health check',
        data: healthStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in healthCheck:', error);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}