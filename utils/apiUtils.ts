// utils/apiUtils.ts
/**
 * Utility functions for API handling and validation
 */

export function validateApiConfiguration(): { isValid: boolean; errorMessage?: string } {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Client-side validation - try multiple possible environment variable sources
    let apiKey;
    
    // @ts-ignore: ImportMeta interface extension
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore: ImportMeta interface extension
      apiKey = import.meta.env.NEW_API_KEY || import.meta.env.VITE_NEW_API_KEY;
    }
    
    // Fallback to window.process if available
    if (!apiKey && typeof window !== 'undefined' && (window as any).process?.env) {
      apiKey = (window as any).process?.env.NEW_API_KEY || (window as any).process?.env.VITE_NEW_API_KEY;
    }
    
    if (!apiKey) {
      return {
        isValid: false,
        errorMessage: "API key is missing. Please configure your API key in the environment variables."
      };
    }
  } else if (typeof process !== 'undefined' && process.env) {
    // Server-side validation
    const apiKey = process.env.NEW_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return {
        isValid: false,
        errorMessage: "API key is missing. Please configure your API key in the environment variables."
      };
    }
  }

  return { isValid: true };
}

export function getApiEndpoint(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // @ts-ignore: ImportMeta interface extension
    let customEndpoint;
    // @ts-ignore: ImportMeta interface extension
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore: ImportMeta interface extension
      customEndpoint = import.meta.env.API_ENDPOINT || import.meta.env.VITE_API_ENDPOINT;
    }
    
    // Fallback to window.process if available
    if (!customEndpoint && typeof window !== 'undefined' && (window as any).process?.env) {
      customEndpoint = (window as any).process?.env.API_ENDPOINT || (window as any).process?.env.VITE_API_ENDPOINT;
    }
    
    if (customEndpoint) {
      console.log(`🔧 Using custom endpoint from environment: ${customEndpoint}`);
      return customEndpoint;
    }
    
    // Get the model to determine the correct endpoint
    let model;
    // @ts-ignore: ImportMeta interface extension
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore: ImportMeta interface extension
      model = import.meta.env.PROVIDER_MODEL || import.meta.env.VITE_PROVIDER_MODEL;
    }
    
    // Fallback to window.process if available
    if (!model && typeof window !== 'undefined' && (window as any).process?.env) {
      model = (window as any).process?.env.PROVIDER_MODEL || (window as any).process?.env.VITE_PROVIDER_MODEL;
    }
    
    // Check if it's provider-4/imagen-3.5
    if (model && (model.includes('provider-4') || model.includes('imagen-3.5'))) {
      // Use the correct endpoint for a4f.co
      return "https://api.a4f.co/v1/images/generations";
    }
  }
  
  // Server-side or fallback
  const customEndpoint = process.env.API_ENDPOINT;
  if (customEndpoint) {
    console.log(`🔧 Using custom endpoint from environment: ${customEndpoint}`);
    return customEndpoint;
  }
  
  // Get the model to determine the correct endpoint
  const model = process.env.PROVIDER_MODEL || "provider-4/imagen-3.5";
  
  // Check if it's provider-4/imagen-3.5
  if (model && (model.includes('provider-4') || model.includes('imagen-3.5'))) {
    // Use the correct endpoint for a4f.co
    return "https://api.a4f.co/v1/images/generations";
  }
  
  // Default fallback
  return "https://api.a4f.co/v1/images/generations";
}

export function isApiEndpointValid(endpoint: string): boolean {
  // Basic validation for API endpoint
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

export async function testEndpointConnectivity(endpoint: string): Promise<boolean> {
  try {
    // Simple HEAD request to test connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(endpoint, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function formatApiError(error: any): string {
  // Handle different types of API errors
  if (error.name === 'AbortError') {
    return "The request timed out. Please try again later.";
  }
  
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Check if it's a connection error to the a4f.co endpoint
    if (error.message.includes('a4f.co')) {
      return "Failed to connect to the image generation service. Please check your internet connection and try again.";
    }
    return "Failed to connect to the image generation service. Please check your internet connection and try again.";
  }
  
  if (error.message) {
    // Handle rate limiting and concurrency errors with user-friendly message
    const message = error.message.toLowerCase();
    if (message.includes('429') || 
        message.includes('rate limit') ||
        message.includes('concurrency') ||
        message.includes('busy')) {
      return "Server is busy, kindly wait. Try again later";
    }
    
    return error.message;
  }
  
  return "An unknown error occurred. Please try again later.";
}

export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    let url;
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      url = (import.meta as any).env.VITE_BACKEND_URL;
    }
    if (!url && typeof window !== 'undefined' && (window as any).process?.env) {
      url = (window as any).process?.env.VITE_BACKEND_URL || (window as any).process?.env.PUBLIC_BACKEND_URL;
    }
    if (url) {
      return url.endsWith('/api') ? url : `${url}/api`;
    }
    return '/api';
  }
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (url) {
      return url.endsWith('/api') ? url : `${url}/api`;
    }
  }
  return '/api';
}

export function buildApiUrl(path: string): string {
  const base = getBackendBaseUrl();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
