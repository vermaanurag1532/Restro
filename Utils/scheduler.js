import cron from 'node-cron';
import { DailyGeneratorService } from '../Service/dailyGenerator.service.js';

export class CurrentAffairsScheduler {
  constructor() {
    this.generatorService = new DailyGeneratorService();
  }

  /**
   * Start the daily scheduler
   */
  startDailyScheduler() {
    console.log('⏰ Initializing daily current affairs scheduler...');
    
    // Schedule to run every day at 3:00 AM
    // cron syntax: '0 3 * * *' (minute 0, hour 3, any day, any month, any day of week)
    cron.schedule('0 3 * * *', async () => {
      console.log('⏰ Cron job triggered: Running daily generation');
      await this.generatorService.executeDailyGeneration();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata" // Adjust to your server's timezone
    });
    
    console.log('✅ Daily scheduler started. Will run at 3:00 AM every day.');
  }

  /**
   * Manual trigger for testing
   */
  async manualTrigger() {
    console.log('🔧 Manually triggering daily generation...');
    return await this.generatorService.executeDailyGeneration();
  }
}