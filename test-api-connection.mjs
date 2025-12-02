// Simple test script to verify API connection
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testApiConnection() {
  console.log('🔍 Testing API Connection\n');
  
  // Configuration
  const apiKey = process.env.NEW_API_KEY || "ddc-a4f-07842c4bb9ae4099b39833a26a4acf46";
  const model = process.env.PROVIDER_MODEL || "provider-4/imagen-3.5";
  const endpoint = process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations";
  
  console.log('⚙️  Configuration:');
  console.log(`   API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`   Model: ${model}`);
  console.log(`   Endpoint: ${endpoint}\n`);
  
  // Test payload
  const payload = {
    model: model,
    prompt: "A beautiful sunset over the mountains",
    n: 1,
    size: "1024x1024"
  };
  
  console.log('📤 Sending test request...');
  console.log('📝 Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! API is working correctly.');
      console.log('📄 Response Data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:');
      console.log('📄 Error Data:', errorText);
    }
  } catch (error) {
    console.log('💥 Network Error:');
    console.log('📄 Error Details:', error.message);
  }
}

testApiConnection();