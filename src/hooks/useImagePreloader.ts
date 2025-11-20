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

    // Preload images with staggered timing to avoid blocking
    const preloadImages = async () => {
      for (let i = 0; i < newImages.length; i++) {
        const imgUrl = newImages[i];
        
        // Skip if already preloaded
        if (preloadedRef.current.has(imgUrl)) continue;

        // Stagger preloads to avoid bandwidth spikes
        await new Promise(resolve => setTimeout(resolve, i * 100));

        // Create image element to trigger browser cache
        const img = new Image();
        img.src = imgUrl;
        
        // Mark as preloaded whether it succeeds or fails
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
