const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { createLogger, format, transports } = require('winston');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create a simple logger for the test script
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.simple(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [new transports.Console()]
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_PDF_PATH = path.join(__dirname, 'test.pdf');

// Generate a test admin token for authentication
const generateTestToken = () => {
  return jwt.sign(
    { userId: 1, role: 'admin' }, // Test user ID and role
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '1h' }
  );
};

const TEST_AUTH_TOKEN = generateTestToken();

// Create a test PDF file if it doesn't exist
const createTestPdf = () => {
  if (!fs.existsSync(TEST_PDF_PATH)) {
    const pdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\n4 0 obj<</Type/Font/BaseFont/Helvetica/Subtype/Type1>>endobj\n5 0 obj<</Length 44>>stream\nBT\n/F1 24 Tf\n100 700 Td\n(Test PDF Document) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000109 00000 n \n0000000205 00000 n \n0000000230 00000 n \ntrailer\n<</Size 6/Root 1 0 R>>\nstartxref\n308\n%%EOF';
    
    fs.writeFileSync(TEST_PDF_PATH, pdfContent);
    logger.info(`Created test PDF at ${TEST_PDF_PATH}`);
  }
};

// Test file upload
const testFileUpload = async () => {
  try {
    createTestPdf();
    
    // Create form data
    const formData = new FormData();
    
    // Append the file
    formData.append('file', fs.createReadStream(TEST_PDF_PATH), {
      filename: 'test.pdf',
      contentType: 'application/pdf'
    });
    
    // Add other fields
    formData.append('rollNumber', 'TEST123');
    formData.append('totalPages', '1');
    formData.append('colorPages', '0');
    formData.append('bwPages', '1');
    formData.append('price', '5.00');
    
    // Create print options as a simple object with string values
    const printOptions = {
      copies: '1',
      doubleSided: 'false',
      color: 'false',
      pageRange: 'all',
      orientation: 'portrait',
      paperSize: 'A4',
      quality: 'normal',
      collate: 'true',
      binding: 'none',
      staple: 'none',
      holePunch: 'none'
    };
    
    // Append each print option as a separate form field
    Object.entries(printOptions).forEach(([key, value]) => {
      formData.append(`printOptions[${key}]`, value);
    });
    
    // Log the request payload for debugging
    console.log('Sending request with print options:', JSON.stringify(printOptions, null, 2));

    // Send the request with form data
    const response = await axios.post(`${BASE_URL}/api/print-job`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
        'Accept': 'application/json'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    logger.info('File upload successful:', response.data);
    return response.data.order.token;
  } catch (error) {
    if (error.response) {
      logger.error(`File upload test failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logger.error('No response received from server');
    } else {
      logger.error(`Error: ${error.message}`);
    }
    throw error;
  }
};

// Test file download
const testFileDownload = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/print-job/download/${token}`, {
      responseType: 'arraybuffer'
    });

    const outputPath = path.join(__dirname, 'downloaded_test.pdf');
    fs.writeFileSync(outputPath, response.data);
    
    logger.info(`File downloaded successfully to ${outputPath}`);
    return true;
  } catch (error) {
    if (error.response) {
      logger.error(`File download test failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logger.error('No response received from server during download');
    } else {
      logger.error(`Download error: ${error.message}`);
    }
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    logger.info('Starting file upload/download tests...');
    
    // Test file upload
    logger.info('Testing file upload...');
    const token = await testFileUpload();
    
    // Test file download
    logger.info('Testing file download...');
    await testFileDownload(token);
    
    logger.info('All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Tests failed:', error);
    process.exit(1);
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testFileUpload,
  testFileDownload,
  runTests
};
