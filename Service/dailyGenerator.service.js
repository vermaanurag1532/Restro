import { CurrentAffairsService } from './currentAffairs.service.js';
import { CurrentAffairsRepository } from '../Repository/currentAffairs.repository.js';

export class DailyGeneratorService {
  constructor() {
    this.currentAffairsService = new CurrentAffairsService();
    this.repository = new CurrentAffairsRepository();
  }

  /**
   * Main method to execute the daily generation routine
   */
  async executeDailyGeneration() {
    try {
      console.log('🔄 Starting daily current affairs generation...');
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // 1. Check if data already exists for today
      const existingData = await this.repository.getCurrentAffairsByDate(today);
      
      if (existingData && existingData.length > 0) {
        console.log(`✅ Data for ${today} already exists (${existingData.length} items). Skipping generation.`);
        return {
          success: true,
          message: `Data for ${today} already exists`,
          count: existingData.length,
          generated: false
        };
      }
      
      console.log(`📅 No data found for ${today}. Generating fresh current affairs...`);
      
      // 2. Generate fresh data using the existing service
      const freshData = await this.currentAffairsService.fetchAndProcessCurrentAffairs(today);
      
      console.log(`🎉 Successfully generated ${freshData.length} current affairs items for ${today}`);
      
      return {
        success: true,
        message: `Generated ${freshData.length} items for ${today}`,
        count: freshData.length,
        generated: true,
        date: today
      };
      
    } catch (error) {
      console.error('❌ Error in daily generation:', error);
      
      return {
        success: false,
        message: 'Daily generation failed',
        error: error.message,
        generated: false
      };
    }
  }

  /**
   * Optional: Generate data for a specific date (for testing or backfilling)
   */
  async generateForDate(dateString) {
    try {
      console.log(`🔧 Manual generation for date: ${dateString}`);
      
      const freshData = await this.currentAffairsService.fetchAndProcessCurrentAffairs(dateString);
      
      return {
        success: true,
        message: `Generated ${freshData.length} items for ${dateString}`,
        count: freshData.length,
        date: dateString
      };
    } catch (error) {
      console.error('Error in manual generation:', error);
      throw error;
    }
  }
}