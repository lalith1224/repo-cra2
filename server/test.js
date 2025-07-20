const axios = require('axios');

// Base URL of your server
const BASE_URL = 'http://localhost:5001';

// List of endpoints with HTTP methods
const endpoints = [
  { method: 'GET', path: '/api/files/sample.pdf' },
  { method: 'GET', path: '/health' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'GET', path: '/api/auth/verify' },
  { method: 'GET', path: '/api/auth/validate' },
  { method: 'POST', path: '/api/print-job/upload' },
  { method: 'POST', path: '/api/print-job/create' },
  { method: 'GET', path: '/api/print-job/track/test123' },
  { method: 'GET', path: '/api/print-job/all' },
  { method: 'PATCH', path: '/api/print-job/1/status' },
  { method: 'POST', path: '/api/payment/process' },
  { method: 'GET', path: '/api/payment/print-job/1' },
  { method: 'GET', path: '/api/payment/all' },
  { method: 'GET', path: '/api/tracking/test123' },
  { method: 'GET', path: '/api/tracking/roll/roll123' },
  { method: 'GET', path: '/api/tracking/test123/history' },
  { method: 'GET', path: '/api/admin/dashboard' },
  { method: 'GET', path: '/api/admin/print-jobs' },
  { method: 'GET', path: '/api/admin/print-jobs/1' },
  { method: 'PATCH', path: '/api/admin/print-jobs/1/status' },
  { method: 'GET', path: '/api/admin/print-jobs/1/file' },
  { method: 'GET', path: '/api/admin/payments' },
  { method: 'GET', path: '/api/admin/orders' },
  { method: 'GET', path: '/api/admin/payment-settings' },
  { method: 'GET', path: '/api/admin/payment-stats' },
  { method: 'GET', path: '/api/reports/sales' },
  { method: 'GET', path: '/api/reports/print-types' },
  { method: 'GET', path: '/api/reports/status' },
  { method: 'GET', path: '/api/reports/customers' }
];

// Function to test all endpoints
const testEndpoints = async () => {
  console.log('🔍 Testing API endpoints...\n');
  
  for (const { method, path } of endpoints) {
    try {
      const url = `${BASE_URL}${path}`;
      const config = {
        method: method.toLowerCase(),
        url
      };
      
      // Add empty data object for POST, PUT, PATCH requests
      if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = {};
      }
      
      const res = await axios(config);
      console.log(`✅ ${method} ${path} → ${res.status}`);
    } catch (err) {
      const code = err.response?.status || err.code || 'UNKNOWN';
      console.log(`❌ ${method} ${path} → ${code}`);
    }
  }
};

testEndpoints();