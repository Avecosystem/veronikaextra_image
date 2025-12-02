import { formatApiError } from '../utils/apiUtils';

export default async function handler(req: any, res: any) {
  // 1. Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Validate API Key from Server Environment
  const apiKey = process.env.NEW_API_KEY || process.env.API_KEY;
  const model = process.env.PROVIDER_MODEL || "provider-4/imagen-3.5";

  // Add debugging to see what environment variables are available
  console.log("🔍 Environment variables check:");
  console.log("  NEW_API_KEY:", process.env.NEW_API_KEY ? `${process.env.NEW_API_KEY.substring(0, 8)}...` : 'Not set');
  console.log("  API_KEY:", process.env.API_KEY ? `${process.env.API_KEY.substring(0, 8)}...` : 'Not set');
  console.log("  PROVIDER_MODEL:", process.env.PROVIDER_MODEL);
  console.log("  API_ENDPOINT:", process.env.API_ENDPOINT);

  if (!apiKey) {
    console.error("CRITICAL: API_KEY missing in server environment.");
    return res.status(500).json({ 
      message: 'Server Configuration Error: API Key is missing. Please add API_KEY to environment settings.' 
    });
  }

  try {
    const { prompt, numberOfImages = 1 } = req.body;
    
    // Validate number of images (1-6)
    const validImageCount = Math.max(1, Math.min(6, numberOfImages));

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // API endpoint - prioritize custom endpoint from environment variables
    const apiUrl = process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations";
    
    console.log(`🔍 Using endpoint: ${apiUrl}`);
    
    // For a4f.co, we'll generate images individually to avoid authentication issues
    const images: any[] = [];
    
    // Generate images one by one
    for (let i = 0; i < validImageCount; i++) {
      console.log(`🎨 Generating image ${i + 1} of ${validImageCount}`);
      
      // Prepare the request payload (always generate 1 image per request)
      const payload = {
        model: model,
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      };
      
      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
      
      // Try the correct authentication method for a4f.co (Bearer token)
      let response;
      let lastError;
      let successMethod = "";
      
      try {
        const headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        console.log('🔐 Trying Bearer token authentication (a4f.co specific)');
        console.log('  Headers:', headers);
        response = await fetchWithTimeout(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          successMethod = "Bearer token";
        } else {
          console.log(`Bearer token failed with status: ${response.status}`);
        }
      } catch (error) {
        lastError = error;
        console.log('Bearer token error:', error);
      }
      
      // If all methods failed for this image, return the error
      if (!response) {
        throw lastError || new Error(`Failed to connect to the image generation service for image ${i + 1}.`);
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
          
          // Log the full error response for debugging
          console.error("Full API error response:", errorData);
          console.error("Response status:", response.status);
          console.error("Response status text:", response.statusText);
        } catch (e) {
          // If we can't parse the error response, use the status text
          console.error("Could not parse error response:", e);
        }
        
        throw new Error(`Error generating image ${i + 1}: ${errorMessage}`);
      }
      
      // Log successful authentication method
      if (successMethod) {
        console.log(`✅ Backend authentication successful with ${successMethod} for image ${i + 1}`);
      }
      
      const data = await response.json();
      console.log(`🔎 API raw response for image ${i + 1}:`, JSON.stringify(data));
      
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const item = data.data[0];
        images.push({ id: `img-${Date.now()}-${i}`, url: item.url || item.b64_json, prompt });
      } else if (data && data.image && (data.image.url || data.image.b64_json)) {
        images.push({ id: `img-${Date.now()}-${i}`, url: data.image.url || data.image.b64_json, prompt });
      } else if (data && data.url) {
        images.push({ id: `img-${Date.now()}-${i}`, url: data.url, prompt });
      } else if (data && data.images && Array.isArray(data.images) && data.images.length > 0) {
        const item = data.images[0];
        images.push({ id: `img-${Date.now()}-${i}`, url: item.url || item.b64_json || item, prompt });
      }
    }
    
    // If we got NO images at all, throw an error
    if (images.length === 0) {
      throw new Error("No images generated. Please try a different prompt.");
    }

    // Return whatever images we successfully generated
    return res.status(200).json({ images });

  } catch (error: any) {
    console.error("Backend Generation Error:", error);
    
    // Provide more detailed error information to the frontend
    const formattedError = formatApiError(error);
    
    // Log additional debugging information
    console.error("Debug Info:");
    console.error("  - API Key Present:", !!apiKey);
    console.error("  - Model:", model);
    console.error("  - Endpoint:", process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations");
    
    return res.status(500).json({ 
      message: formattedError,
      debugInfo: {
        apiKeyPresent: !!apiKey,
        model: model,
        endpoint: process.env.API_ENDPOINT || "https://api.a4f.co/v1/images/generations"
      }
    });
  }
}

// Helper function with timeout
async function fetchWithTimeout(url: string, options: any) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
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
