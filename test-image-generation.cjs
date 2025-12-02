// Simple test script to verify image generation functionality
const http = require('http');

// Test data
const postData = JSON.stringify({
  prompt: 'A beautiful sunset over the mountains',
  numberOfImages: 3
});

const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/generate-images',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:');
    console.log(data);
    
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.images && Array.isArray(jsonData.images)) {
        console.log(`✅ Success! Generated ${jsonData.images.length} images`);
      } else {
        console.log('❌ Error: Unexpected response format');
      }
    } catch (e) {
      console.log('❌ Error: Could not parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();