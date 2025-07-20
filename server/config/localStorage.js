const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { logger } = require('../utils/logger');

// Storage configuration
const uploadsDir = path.join(__dirname, '../uploads');
const reportsDir = path.join(__dirname, '../reports');
const tempDir = path.join(__dirname, '../temp');

// Ensure directories exist
const initializeStorage = async () => {
  try {
    const dirs = [uploadsDir, reportsDir, tempDir];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch (error) {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    }
    
    logger.info('Storage directories initialized');
  } catch (error) {
    logger.error('Failed to initialize storage:', error);
    throw error;
  }
};

// File upload handler
const handleFileUpload = async (file, destination = 'uploads') => {
  try {
    const uploadDir = destination === 'reports' ? reportsDir : uploadsDir;
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, extension)}_${timestamp}_${randomString}${extension}`;
    
    const filePath = path.join(uploadDir, filename);
    
    // Write file
    await fs.writeFile(filePath, file.buffer);
    
    logger.info('File uploaded to local storage:', {
      filename,
      originalName: file.originalname,
      size: file.size
    });
    
    return {
      filename,
      originalName: file.originalname,
      size: file.size,
      path: filePath
    };
  } catch (error) {
    logger.error('File upload failed:', error);
    throw error;
  }
};

// File serving
const serveFile = async (filename, directory = 'uploads') => {
  try {
    const baseDir = directory === 'reports' ? reportsDir : uploadsDir;
    const filePath = path.join(baseDir, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error('File not found');
    }
    
    return filePath;
  } catch (error) {
    logger.error('File serving failed:', error);
    throw error;
  }
};

// File deletion
const deleteFile = async (filename, directory = 'uploads') => {
  try {
    const baseDir = directory === 'reports' ? reportsDir : uploadsDir;
    const filePath = path.join(baseDir, filename);
    
    await fs.unlink(filePath);
    logger.info('File deleted:', { filename });
    
    return true;
  } catch (error) {
    logger.error('File deletion failed:', error);
    throw error;
  }
};

// Cleanup old files
const cleanupOldFiles = async (maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
  try {
    const dirs = [uploadsDir, reportsDir, tempDir];
    const cutoffTime = Date.now() - maxAge;
    
    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            logger.info('Cleaned up old file:', { file, directory: dir });
          }
        }
      } catch (error) {
        logger.error('Cleanup failed for directory:', { dir, error: error.message });
      }
    }
    
    logger.info('File cleanup completed');
  } catch (error) {
    logger.error('File cleanup failed:', error);
    throw error;
  }
};

// Get file info
const getFileInfo = async (filename, directory = 'uploads') => {
  try {
    const baseDir = directory === 'reports' ? reportsDir : uploadsDir;
    const filePath = path.join(baseDir, filename);
    
    const stats = await fs.stat(filePath);
    
    return {
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      path: filePath
    };
  } catch (error) {
    logger.error('Get file info failed:', error);
    throw error;
  }
};

module.exports = {
  uploadsDir,
  reportsDir,
  tempDir,
  initializeStorage,
  handleFileUpload,
  serveFile,
  deleteFile,
  cleanupOldFiles,
  getFileInfo
}; 