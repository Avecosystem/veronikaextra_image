// components/ImageCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import { addWatermarkToImage, getWatermarkedImageBlob } from '../utils/imageUtils';

const ImageCard = ({ image }: any) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState<string | null>(null);
  const [isLoadingWatermark, setIsLoadingWatermark] = useState(false);
  const watermarkedImageRef = useRef<string | null>(null);

  // Add watermark to image when component mounts
  useEffect(() => {
    const addWatermark = async () => {
      if (!image?.url) return;
      
      setIsLoadingWatermark(true);
      try {
        const watermarkedUrl = await addWatermarkToImage(image.url, "VERONIKAextra");
        setWatermarkedImageUrl(watermarkedUrl);
        watermarkedImageRef.current = watermarkedUrl;
      } catch (error) {
        console.error('Failed to add watermark:', error);
        // Fallback to original image if watermarking fails
        setWatermarkedImageUrl(image.url);
        watermarkedImageRef.current = image.url;
      } finally {
        setIsLoadingWatermark(false);
      }
    };

    addWatermark();
  }, [image?.url]);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      // Use the watermarked image for download
      const imageUrlToUse = watermarkedImageRef.current || image.url;
      
      // Check if the image URL is a data URI
      if (imageUrlToUse && imageUrlToUse.startsWith('data:')) {
        // For data URIs, we can directly download
        const link = document.createElement('a');
        link.href = imageUrlToUse;
        link.download = `VERONIKAextra-image-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For regular URLs, we need to fetch the watermarked image first
        const blob = await getWatermarkedImageBlob(image.url, "VERONIKAextra");
        
        // Create object URL for the blob
        const imageUrl = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `VERONIKAextra-image-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Show error to user
      alert('Download failed. Opening image in new tab instead.');
      // Fallback: open image in new tab
      window.open(image.url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Display the watermarked image if available, otherwise the original
  const displayImageUrl = watermarkedImageUrl || image.url;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <GlassCard className="h-full p-3">
        <div className="w-full aspect-square bg-gray-700/50 dark:bg-gray-300/50 rounded-xl overflow-hidden flex items-center justify-center mb-3 relative group">
          {isLoadingWatermark ? (
            // Show a loading placeholder while watermarking
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-premiumGradientStart"></div>
            </div>
          ) : (
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={displayImageUrl}
              alt={image.prompt}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        </div>
        <p className="text-xs md:text-sm text-center text-gray-400 dark:text-gray-600 mb-3 line-clamp-2 px-2">{image.prompt}</p>
        <Button 
          variant="download" 
          onClick={handleDownload} 
          loading={isDownloading} 
          className="mt-auto w-full py-2 text-sm md:text-base"
        >
          Download Creation
        </Button>
      </GlassCard>
    </motion.div>
  );
};

export default ImageCard;