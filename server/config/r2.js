const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

// Configure AWS SDK for Cloudflare R2
const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto', // R2 doesn't use regions like S3
  signatureVersion: 'v4'
});

const bucketName = process.env.R2_BUCKET_NAME;

// Upload file to R2
const uploadFile = async (fileBuffer, fileName, contentType) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: `uploads/${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        'upload-time': new Date().toISOString(),
        'expires-after': '1 hour'
      }
    };

    const result = await s3.upload(params).promise();
    logger.info(`File uploaded to R2: ${result.Key}`);
    
    return {
      key: result.Key,
      url: result.Location,
      etag: result.ETag
    };
  } catch (error) {
    logger.error('Error uploading file to R2:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
};

// Generate signed URL for file access
const getSignedUrl = async (key, expiresIn = 600) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: expiresIn // 10 minutes default
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw new Error('Failed to generate file access URL');
  }
};

// Delete file from R2
const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    await s3.deleteObject(params).promise();
    logger.info(`File deleted from R2: ${key}`);
    return true;
  } catch (error) {
    logger.error('Error deleting file from R2:', error);
    return false;
  }
};

// List files in bucket (for cleanup)
const listFiles = async (prefix = 'uploads/') => {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    logger.error('Error listing files from R2:', error);
    return [];
  }
};

// Check if file exists
const fileExists = async (key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    logger.error('Error checking file existence:', error);
    return false;
  }
};

// Get file metadata
const getFileMetadata = async (key) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };

    const result = await s3.headObject(params).promise();
    return {
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      lastModified: result.LastModified,
      metadata: result.Metadata
    };
  } catch (error) {
    logger.error('Error getting file metadata:', error);
    return null;
  }
};

// Cleanup expired files (older than 1 hour)
const cleanupExpiredFiles = async () => {
  try {
    const files = await listFiles();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let deletedCount = 0;

    for (const file of files) {
      if (file.LastModified < oneHourAgo) {
        await deleteFile(file.Key);
        deletedCount++;
      }
    }

    logger.info(`Cleaned up ${deletedCount} expired files from R2`);
    return deletedCount;
  } catch (error) {
    logger.error('Error during R2 cleanup:', error);
    return 0;
  }
};

module.exports = {
  uploadFile,
  getSignedUrl,
  deleteFile,
  listFiles,
  fileExists,
  getFileMetadata,
  cleanupExpiredFiles
}; 