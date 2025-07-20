const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'print-repository' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Security logging function
const logSecurity = (event, data = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ip: data.ip || 'unknown',
    userAgent: data.userAgent || 'unknown',
    userId: data.userId || 'unknown',
    details: data
  });
};

// Performance logging function
const logPerformance = (operation, duration, data = {}) => {
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    details: data
  });
};

// Database logging function
const logDatabase = (operation, query, duration, data = {}) => {
  logger.info('Database', {
    operation,
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    details: data
  });
};

// API request logging function
const logApiRequest = (method, url, statusCode, duration, data = {}) => {
  logger.info('API Request', {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    details: data
  });
};

// Error logging with context
const logError = (error, context = {}) => {
  logger.error('Application Error', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context
  });
};

// Info logging with context
const logInfo = (message, data = {}) => {
  logger.info(message, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Debug logging with context
const logDebug = (message, data = {}) => {
  logger.debug(message, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Warn logging with context
const logWarn = (message, data = {}) => {
  logger.warn(message, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

module.exports = {
  logger,
  logSecurity,
  logPerformance,
  logDatabase,
  logApiRequest,
  logError,
  logInfo,
  logDebug,
  logWarn
}; 