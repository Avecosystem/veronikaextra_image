// components/ImageGenerator.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backendApi';
import { IMAGE_COST, BRAND_NAME } from '../constants';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import ImageCard from './ImageCard';
import ShimmerCard from './ui/ShimmerCard';
import { motion } from 'framer-motion';
import { Head } from '@unhead/react';

const ImageGenerator = () => {
  const { user, isAuthenticated, updateUserCredits, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalNotice, setGlobalNotice] = useState('');
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Split BRAND_NAME for styling
  const brandNameParts = BRAND_NAME.split('extra');
  const veronikaPart = brandNameParts[0];
  const extraPart = 'extra';

  // Fetch global notice on component mount
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await backendApi.getGlobalNotice();
        if (response.success) {
          setGlobalNotice(response.data);
        } else {
          setNoticeError(response.message || 'Failed to fetch global notice.');
        }
      } catch (err) {
        console.error('Error fetching global notice:', err);
        setNoticeError('An unexpected error occurred while fetching global notice.');
      }
    };
    fetchNotice();
  }, []);

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError('Please log in to generate images.');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    const requiredCredits = IMAGE_COST * numberOfImages;
    if (user.credits < requiredCredits) {
      setError(`Insufficient credits. You need ${requiredCredits} credits for ${numberOfImages} images.`);
      return;
    }

    // Show provisioning message below the button instead of popup
    setLoading(true);
    setGeneratedImages([]); // Clear previous images
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const response = await backendApi.generateImage(token, prompt, numberOfImages);

      if (response.success) {
        const newImages = response.data.images.map((url: string, index: number) => ({
          id: `${Date.now()}-${index}`,
          url,
          prompt,
        }));
        setGeneratedImages(newImages);
        updateUserCredits(response.data.newCredits);
      } else {
        setError(response.message || 'Failed to generate images.');
      }
    } catch (err: any) {
      console.error('Image generation error:', err);
      if (err.message && err.message.includes('concurrency')) {
        setError('Server is busy, kindly wait. Try again later');
      } else {
        setError('An unexpected error occurred during image generation.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, prompt, numberOfImages, updateUserCredits]);

  const canGenerate = isAuthenticated && user && user.credits >= IMAGE_COST * numberOfImages && !loading && !authLoading;

  // Function to handle image count selection
  const handleImageCountChange = (count: number) => {
    // Limit to 1-6 images
    const validCount = Math.max(1, Math.min(6, count));
    setNumberOfImages(validCount);
  };

  return (
    <>
      <Head>
        <title>AI Image Generator - VERONIKAextra Images</title>
        <meta name="description" content="Create unique AI-generated images with our powerful text-to-image generator. Transform your ideas into stunning visuals instantly with VERONIKAextra." />
        <meta name="keywords" content="AI, image generation, text to image, AI art, VERONIKAextra, artificial intelligence, creative tools, image generator" />
        <meta property="og:title" content="AI Image Generator - VERONIKAextra Images" />
        <meta property="og:description" content="Create unique AI-generated images with our powerful text-to-image generator. Transform your ideas into stunning visuals instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://veronikaextra-images.com/generator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Image Generator - VERONIKAextra Images" />
        <meta name="twitter:description" content="Create unique AI-generated images with our powerful text-to-image generator. Transform your ideas into stunning visuals instantly." />
        <link rel="canonical" href="https://veronikaextra-images.com/generator" />
      </Head>
      <div className="flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 min-h-[calc(100vh-160px)]">
        {/* Global Notice Display */}
        {(globalNotice || noticeError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mb-6"
          >
            <GlassCard className={`p-4 text-center ${noticeError ? 'bg-red-500/20 border-red-500/50' : 'bg-accent/20 border-accent/50'}`}>
              <p className="font-semibold text-base md:text-lg">{noticeError || globalNotice}</p>
            </GlassCard>
          </motion.div>
        )}

        <GlassCard className="max-w-4xl w-full p-4 md:p-6 text-center animate-fade-in mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-darkText dark:text-lightText mb-3">
            <span>{veronikaPart}
              <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text bg-[length:200%_auto] animate-text-gradient-slow ml-0.5">
                {extraPart}
              </span>
            </span> Images
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base mb-6">
            Describe the image you want to create and let AI bring it to life.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="relative w-full">
              <label htmlFor="image-prompt" className="sr-only">Image Prompt</label>
              <textarea
                id="image-prompt"
                placeholder="Enter your imagination... (e.g., a futuristic cyberpunk city in rain)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`w-full p-4 md:p-5 bg-white bg-opacity-10 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-lg
                  border-2 border-gray-700 dark:border-gray-500 rounded-2xl
                  text-base md:text-lg text-darkText dark:text-lightText placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-premiumGradientStart dark:focus:ring-premiumGradientStart
                  transition-all duration-300 resize-y shadow-glass-dark dark:shadow-glass-light`}
                rows={4}
                disabled={loading}
                aria-label="Image Prompt Input"
              ></textarea>
            </div>

            {/* Image Count Selection */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-darkText dark:text-lightText font-medium">Image:</span>
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <motion.button
                    key={count}
                    type="button"
                    onClick={() => handleImageCountChange(count)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                      ${numberOfImages === count
                        ? 'bg-premiumGradientStart text-white shadow-lg transform scale-110'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {count}
                  </motion.button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <Button
              type="submit"
              className={`w-full max-w-sm mx-auto justify-center py-3 md:py-4 text-base md:text-lg font-extrabold
                          ${!canGenerate && 'cursor-not-allowed opacity-70'}
                          ${canGenerate && 'animate-pulse-slow'}`}
              loading={loading}
              disabled={!canGenerate}
              size="lg"
            >
              Generate Masterpiece ({IMAGE_COST * numberOfImages} Credits)
            </Button>
            
            {/* Provisioning Hardware Message - shown below button during loading */}
            {loading && (
              <GlassCard className="text-center py-4 animate-float mt-4">
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-transparent bg-clip-text animate-glow">
                    Provisioning hardware...
                  </span>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
                    This may take 1 minute, so go grab a coffee and come back :)
                  </span>
                </p>
              </GlassCard>
            )}
            
            {!isAuthenticated && (
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Please log in to start generating.
              </p>
            )}
          </form>
        </GlassCard>

        {(loading || generatedImages.length > 0) && (
          <div ref={scrollRef} className="mt-8 w-full max-w-6xl animate-fade-in">
            {loading && (
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="animate-float mb-4">
                  <svg className="h-12 w-12 text-premiumGradientStart animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-lg font-medium text-darkText dark:text-lightText">Crafting your masterpiece...</p>
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-darkText dark:text-lightText text-center mb-6">
              Your Creations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {loading ? (
                Array.from({ length: numberOfImages }).map((_, index) => (
                  <ShimmerCard key={`shimmer-${index}`} className="h-64 md:h-80" />
                ))
              ) : (
                generatedImages.map((image) => (
                  <ImageCard key={image.id} image={image} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageGenerator;
