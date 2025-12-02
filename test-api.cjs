// Simple test script to verify the API functionality
const http = require('http');

// Test data
const postData = JSON.stringify({
  key: 'globalNotice',
  value: 'Test global notice - this should be visible to all users'
});

const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/global-settings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();