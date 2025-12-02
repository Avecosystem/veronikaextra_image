// @ts-nocheck
/**
 * Generate images using the Vercel API route
 * @param prompt The text prompt for image generation
 * @param numberOfImages Number of images to generate (1-6)
 * @returns Promise resolving to an array of image objects
 */
import { formatApiError, buildApiUrl } from '../utils/apiUtils';

export async function generateImages(prompt: string, numberOfImages: number = 1) {
  // Validate number of images (1-6)
  const validImageCount = Math.max(1, Math.min(6, numberOfImages));

  if (!prompt) {
    throw new Error('Prompt is required');
  }

  try {
    // Always use the Netlify function route
    console.log('🔧 Using Netlify function for image generation');

    const apiUrl = buildApiUrl('/generate-images');

    // Prepare the request payload
    const payload = {
      prompt: prompt,
      numberOfImages: validImageCount
    };

    console.log('📤 Sending payload to API route:', JSON.stringify(payload, null, 2));

    // Make a simple POST request to the Netlify function
    const response = await fetchWithTimeout(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

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

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Process the response to match expected format
    if (data.images && Array.isArray(data.images)) {
      // Return the images array directly (it already contains the URLs)
      return data.images;
    }

    // If we got NO images at all, throw an error
    if (!data.images || data.images.length === 0) {
      throw new Error("No images generated. Please try a different prompt.");
    }

    // Return whatever images we successfully generated
    return data.images;

  } catch (error: any) {
    console.error("Image Generation Error:", error);

    // Provide more detailed error information to the user
    const formattedError = formatApiError(error);

    throw new Error(formattedError);
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
