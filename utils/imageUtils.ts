// utils/imageUtils.ts
/**
 * Utility functions for image processing including watermarking
 */

/**
 * Add a watermark to an image
 * @param imageUrl - URL of the image to watermark
 * @param watermarkText - Text to use as watermark
 * @param position - Position of the watermark (default: bottom-right)
 * @returns Promise that resolves to a data URL of the watermarked image
 */
export async function addWatermarkToImage(
  imageUrl: string,
  watermarkText: string = "VERONIKAextra",
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS issues
    
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Set watermark properties
        ctx.font = `bold ${Math.max(16, Math.min(32, canvas.width / 20))}px Arial, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Light ash color with transparency
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Add shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Calculate position
        let x, y;
        const padding = 20;
        
        switch (position) {
          case 'top-left':
            x = padding;
            y = padding;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            break;
          case 'top-right':
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            break;
          case 'bottom-left':
            x = padding;
            y = canvas.height - padding;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            break;
          case 'bottom-right':
          default:
            x = canvas.width - padding;
            y = canvas.height - padding;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
        }
        
        // Draw watermark text
        ctx.fillText(watermarkText, x, y);
        
        // Convert to data URL and resolve
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for watermarking'));
    };
    
    // Load the image
    img.src = imageUrl;
  });
}

/**
 * Convert a URL to a watermarked blob
 * @param imageUrl - URL of the image to watermark
 * @param watermarkText - Text to use as watermark
 * @returns Promise that resolves to a Blob of the watermarked image
 */
export async function getWatermarkedImageBlob(
  imageUrl: string,
  watermarkText: string = "VERONIKAextra"
): Promise<Blob> {
  const watermarkedDataUrl = await addWatermarkToImage(imageUrl, watermarkText);
  
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/png');
      };
      
      img.src = watermarkedDataUrl;
    } catch (error) {
      reject(error);
    }
  });
}