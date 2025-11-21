import { useEffect, useRef } from 'react';

interface PreloadOptions {
  enabled?: boolean;
  preloadDistance?: number; // How many cards ahead to preload
}

/**
 * Hook to preload images for upcoming video cards
 * This helps make scrolling feel smoother by loading images before they're needed
 */
export const useImagePreloader = (
  images: string[],
  options: PreloadOptions = {}
) => {
  const { enabled = true, preloadDistance = 6 } = options;
  const preloadedRef = useRef<Set<string>>(new Set());
  const preloadQueueRef = useRef<string[]>([]);

  useEffect(() => {
    if (!enabled || images.length === 0) return;

    // Get images that haven't been preloaded yet
    const newImages = images
      .slice(0, preloadDistance)
      .filter(img => !preloadedRef.current.has(img));

    if (newImages.length === 0) return;

    // Add to queue
    preloadQueueRef.current = [...preloadQueueRef.current, ...newImages];

    // Preload images with optimized timing
    const preloadImages = async () => {
      for (let i = 0; i < newImages.length; i++) {
        const imgUrl = newImages[i];
        
        if (preloadedRef.current.has(imgUrl)) continue;

        // Reduced stagger delay for faster preloading
        await new Promise(resolve => setTimeout(resolve, i * 50));

        const img = new Image();
        img.src = imgUrl;
        
        img.onload = () => {
          preloadedRef.current.add(imgUrl);
          preloadQueueRef.current = preloadQueueRef.current.filter(url => url !== imgUrl);
        };
        
        img.onerror = () => {
          preloadedRef.current.add(imgUrl);
          preloadQueueRef.current = preloadQueueRef.current.filter(url => url !== imgUrl);
        };
      }
    };

    preloadImages();
  }, [images, preloadDistance, enabled]);

  return {
    preloadedCount: preloadedRef.current.size,
    queueLength: preloadQueueRef.current.length,
  };
};
