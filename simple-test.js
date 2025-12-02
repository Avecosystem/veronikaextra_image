// Simple test to debug the image generation issue
require('dotenv').config({ path: '.env.local' });

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function testImageGeneration() {
  console.log('🔍 Testing Image Generation\n');
  
  // Configuration
  const apiKey = process.env.NEW_API_KEY || "ddc-a4f-07842c4bb9ae4099b39833a26a4acf46";
  const model = process.env.PROVIDER_MODEL || "provider-4/imagen-3.5";
  const endpoint = process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations";
  
  console.log('⚙️  Configuration:');
  console.log(`   API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`   Model: ${model}`);
  console.log(`   Endpoint: ${endpoint}\n`);
  
  // Test different numbers of images
  const testCases = [
    { count: 1, description: "Single image" },
    { count: 2, description: "Two images" }
  ];
  
  const testPayloadBase = {
    model: model,
    prompt: "A beautiful landscape",
    size: "1024x1024"
  };
  
  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    
    const testPayload = {
      ...testPayloadBase,
      n: testCase.count
    };
    
    console.log(`   Payload:`, JSON.stringify(testPayload, null, 2));
    
    try {
      const response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS: Generated ${testCase.count} image(s)`);
        try {
          const data = await response.json();
          console.log(`   📄 Response:`, JSON.stringify(data, null, 2));
        } catch (e) {
          console.log(`   📄 Could not parse response JSON`);
        }
      } else {
        console.log(`   ❌ FAILED: ${response.status} ${response.statusText}`);
        try {
          const errorData = await response.json();
          console.log(`   📄 Error Response:`, JSON.stringify(errorData, null, 2));
        } catch (e) {
          console.log(`   📄 Could not parse error response`);
          const text = await response.text();
          console.log(`   📄 Error Text: ${text.substring(0, 200)}...`);
        }
      }
    } catch (error) {
      console.log(`   💥 ERROR: ${error.message}`);
    }
  }
  
  console.log('\n🏁 Testing complete');
}

testImageGeneration().catch(console.error);