// utils/envUtils.ts
/**
 * Utility to safely access environment variables in both development and production
 */

export function getApiKey(): string | undefined {
  // In browser environment, Vite exposes env vars on window
  // @ts-nocheck: Ignore TypeScript checks for environment variables
  if (typeof window !== 'undefined') {
    // @ts-ignore
    return import.meta.env?.NEW_API_KEY || window.process?.env?.NEW_API_KEY;
  }
  
  // In Node.js environment, use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEW_API_KEY || process.env.API_KEY;
  }
  
  return undefined;
}

export function getModel(): string | undefined {
  // In browser environment, Vite exposes env vars on window
  // @ts-nocheck: Ignore TypeScript checks for environment variables
  if (typeof window !== 'undefined') {
    // @ts-ignore
    return import.meta.env?.PROVIDER_MODEL || window.process?.env?.PROVIDER_MODEL;
  }
  
  // In Node.js environment, use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env.PROVIDER_MODEL;
  }
  
  return undefined;
}