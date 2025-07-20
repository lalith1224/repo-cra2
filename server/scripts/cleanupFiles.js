const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

/**
 * Clean up files from completed or expired orders
 * @param {number} daysOld - Number of days to keep files for completed orders
 */
async function cleanupOldFiles(daysOld = 7) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find orders that are either completed or expired
    const result = await client.query(`
      SELECT id, file_path, stored_filename, status, created_at, updated_at
      FROM orders
      WHERE 
        (status = 'completed' AND updated_at < NOW() - INTERVAL '${daysOld} days')
        OR 
        (expires_at < NOW())
    `);

    const orders = result.rows;
    logger.info(`Found ${orders.length} orders with files to clean up`);

    let deletedFiles = 0;
    let deletedOrders = 0;
    let errors = 0;

    for (const order of orders) {
      try {
        // Delete the file
        if (order.file_path) {
          try {
            await fs.unlink(order.file_path);
            logger.info(`Deleted file: ${order.file_path}`);
            deletedFiles++;
          } catch (error) {
            if (error.code !== 'ENOENT') { // Ignore if file doesn't exist
              throw error;
            }
            logger.warn(`File not found: ${order.file_path}`);
          }
        }

        // Delete the order record
        await client.query('DELETE FROM orders WHERE id = $1', [order.id]);
        deletedOrders++;
        
      } catch (error) {
        errors++;
        logger.error(`Error cleaning up order ${order.id}:`, error);
        // Continue with next order even if one fails
      }
    }

    await client.query('COMMIT');
    
    logger.info(`Cleanup completed: ${deletedFiles} files deleted, ${deletedOrders} orders removed, ${errors} errors`);
    
    return {
      totalProcessed: orders.length,
      filesDeleted: deletedFiles,
      ordersDeleted: deletedOrders,
      errors
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error in cleanup transaction:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  const days = process.argv[2] ? parseInt(process.argv[2], 10) : 7;
  
  cleanupOldFiles(days)
    .then(() => {
      logger.info('File cleanup completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('File cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = {
  cleanupOldFiles
};
