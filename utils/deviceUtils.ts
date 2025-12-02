// utils/deviceUtils.ts
/**
 * Generate a unique device identifier based on browser characteristics
 * @returns A unique device ID string
 */
export function generateDeviceId(): string {
  // Try to get existing device ID from localStorage
  let deviceId = localStorage.getItem('device_id');
  
  if (!deviceId) {
    // Generate new device ID based on browser characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let fingerprint = '';
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('device_fingerprint', 2, 2);
      fingerprint = canvas.toDataURL();
    }
    
    // Combine various browser characteristics
    const characteristics = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      fingerprint
    ].join('');
    
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < characteristics.length; i++) {
      const char = characteristics.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    deviceId = 'dev_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
    localStorage.setItem('device_id', deviceId);
  }
  
  return deviceId;
}

/**
 * Check if a device is eligible for free credits
 * @param deviceId The device ID to check
 * @returns True if the device is eligible for free credits, false otherwise
 */
export function isDeviceEligibleForFreeCredits(deviceId: string): boolean {
  // Check if this device has already received free credits
  const deviceRecord = localStorage.getItem(`device_credit_${deviceId}`);
  return !deviceRecord;
}

/**
 * Mark a device as having received free credits
 * @param deviceId The device ID to mark
 */
export function markDeviceAsUsed(deviceId: string): void {
  // Mark this device as having received free credits
  localStorage.setItem(`device_credit_${deviceId}`, Date.now().toString());
}

/**
 * Get device information for analytics
 * @returns Object containing device information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    timezoneOffset: new Date().getTimezoneOffset(),
    hasSessionStorage: !!window.sessionStorage,
    hasLocalStorage: !!window.localStorage,
    deviceId: generateDeviceId()
  };
}