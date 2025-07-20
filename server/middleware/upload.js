const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware to handle file upload with metadata
const uploadWithScan = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Attach file metadata to request object
    req.fileInfo = {
      originalName: req.file.originalname,
      storedName: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    next();
  });
};

// Middleware to clean up uploaded files in case of errors
const cleanupUploadedFile = (req, res, next) => {
  if (req.file && req.file.path && fs.existsSync(req.file.path)) {
    try {
      fs.unlinkSync(req.file.path);
      logger.info(`Cleaned up file: ${req.file.path}`);
    } catch (error) {
      logger.error(`Error cleaning up file ${req.file.path}:`, error);
    }
  }
  if (typeof next === 'function') {
    next();
  }
};

// Virus scanning middleware (placeholder - implement as needed)
const scanFile = async (filePath) => {
  if (process.env.NODE_ENV === 'development') {
    logger.warn('Virus scanning is disabled in development mode');
    return true;
  }
  
  // In production, implement actual virus scanning here
  // For example, using clamscan or a cloud-based scanning service
  return true;
};

// File upload middleware with scanning and cleanup
const uploadWithScanAndCleanup = (req, res, next) => {
  uploadWithScan(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    try {
      // In production, you would scan the file here
      if (process.env.NODE_ENV !== 'development') {
        await scanFile(req.file.path);
      }
      next();
    } catch (error) {
      // Clean up the file if scanning fails
      cleanupUploadedFile(req, res, () => {
        return res.status(400).json({ error: 'Virus scan failed' });
      });
    }
  });
};

// Validate file size
const validateFileSize = (fileSize) => {
  const maxSize = process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024; // Default 10MB
  return fileSize <= maxSize;
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase().substring(1);
};

// Check if file type is allowed
const isAllowedFileType = (filename) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf').split(',');
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

module.exports = {
  upload,
  uploadWithScan,
  scanFile,
  cleanupUploadedFile,
  uploadWithScanAndCleanup,
  validateFileSize,
  getFileExtension,
  isAllowedFileType,
};