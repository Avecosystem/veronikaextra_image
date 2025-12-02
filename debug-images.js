// Simple debug script to test image generation
const fs = require('fs');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables:');
console.log('NEW_API_KEY:', process.env.NEW_API_KEY ? `${process.env.NEW_API_KEY.substring(0, 8)}...${process.env.NEW_API_KEY.substring(process.env.NEW_API_KEY.length - 4)}` : 'NOT SET');
console.log('PROVIDER_MODEL:', process.env.PROVIDER_MODEL || 'NOT SET');
console.log('API_ENDPOINT:', process.env.API_ENDPOINT || 'NOT SET');

// Test the image generation service directly
async function testImageGeneration() {
  try {
    console.log('\nTesting image generation service...');
    
    // Import the service
    const { generateImages } = require('./services/imageGenerationService');
    
    console.log('Generating 1 image...');
    const result1 = await generateImages('A beautiful sunset', 1);
    console.log('Result 1:', result1);
    
    console.log('\nGenerating 2 images...');
    const result2 = await generateImages('A beautiful sunset', 2);
    console.log('Result 2:', result2);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testImageGeneration();