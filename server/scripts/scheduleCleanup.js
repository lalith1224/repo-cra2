const cron = require('node-cron');
const { cleanupOldFiles } = require('./cleanupFiles');
const { logger } = require('../utils/logger');

// Schedule cleanup to run daily at 2 AM
const scheduleCleanup = () => {
  // Schedule the job to run every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting scheduled file cleanup job');
    try {
      const result = await cleanupOldFiles(7); // Keep files for 7 days
      logger.info('Scheduled cleanup completed', { result });
    } catch (error) {
      logger.error('Scheduled cleanup failed:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Adjust timezone as needed
  });

  logger.info('Scheduled file cleanup job is running daily at 2 AM');
};

// Export for testing or manual triggering
module.exports = {
  scheduleCleanup,
  cleanupOldFiles // Re-export for convenience
};

// Start the scheduler if this script is run directly
if (require.main === module) {
  scheduleCleanup();
  
  // Keep the process running
  process.stdin.resume();
  
  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down cleanup scheduler...');
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
