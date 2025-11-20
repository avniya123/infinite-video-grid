import { useEffect, useRef, useState } from 'react';

interface PreloadOptions {
  enabled?: boolean;
  preloadDistance?: number; // How many cards ahead to preload
}

interface NetworkInfo {
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  saveData: boolean;
  downlink?: number;
}

/**
 * Hook to detect network conditions and adjust preloading strategy
 */
const useNetworkInfo = (): NetworkInfo => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    effectiveType: 'unknown',
    saveData: false,
  });

  useEffect(() => {
    // Check if Network Information API is available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (!connection) {
      // Default to good connection if API not available
      setNetworkInfo({ effectiveType: '4g', saveData: false });
      return;
    }

    const updateNetworkInfo = () => {
      setNetworkInfo({
        effectiveType: connection.effectiveType || 'unknown',
        saveData: connection.saveData || false,
        downlink: connection.downlink,
      });
    };

    updateNetworkInfo();

    // Listen for network changes
    connection.addEventListener('change', updateNetworkInfo);

    return () => {
      connection.removeEventListener('change', updateNetworkInfo);
    };
  }, []);

  return networkInfo;
};

/**
 * Calculate optimal preload settings based on network conditions
 */
const getPreloadStrategy = (networkInfo: NetworkInfo, baseDistance: number) => {
  // Respect user's data saver preference
  if (networkInfo.saveData) {
    return {
      distance: 2, // Minimal preloading
      staggerDelay: 300, // Slower preloading
      enabled: true, // Keep some preloading for UX
    };
  }

  switch (networkInfo.effectiveType) {
    case '4g':
      return {
        distance: Math.min(baseDistance * 1.5, 12), // Aggressive preloading
        staggerDelay: 50, // Fast preloading
        enabled: true,
      };
    case '3g':
      return {
        distance: baseDistance, // Normal preloading
        staggerDelay: 150, // Moderate preloading
        enabled: true,
      };
    case '2g':
      return {
        distance: Math.floor(baseDistance * 0.5), // Reduced preloading
        staggerDelay: 250, // Slower preloading
        enabled: true,
      };
    case 'slow-2g':
      return {
        distance: 2, // Minimal preloading
        staggerDelay: 400, // Very slow preloading
        enabled: true,
      };
    default:
      return {
        distance: baseDistance,
        staggerDelay: 100,
        enabled: true,
      };
  }
};

/**
 * Hook to preload images for upcoming video cards with network-aware optimization
 * This helps make scrolling feel smoother by loading images before they're needed
 * Adjusts strategy based on user's connection speed and data saver preferences
 */
export const useImagePreloader = (
  images: string[],
  options: PreloadOptions = {}
) => {
  const { enabled = true, preloadDistance = 6 } = options;
  const preloadedRef = useRef<Set<string>>(new Set());
  const preloadQueueRef = useRef<string[]>([]);
  const networkInfo = useNetworkInfo();
  
  // Calculate optimal preload strategy based on network
  const strategy = getPreloadStrategy(networkInfo, preloadDistance);

  useEffect(() => {
    if (!enabled || !strategy.enabled || images.length === 0) return;

    // Get images that haven't been preloaded yet, adjusted for network
    const newImages = images
      .slice(0, Math.floor(strategy.distance))
      .filter(img => !preloadedRef.current.has(img));

    if (newImages.length === 0) return;

    // Add to queue
    preloadQueueRef.current = [...preloadQueueRef.current, ...newImages];

    // Preload images with network-aware staggered timing
    const preloadImages = async () => {
      for (let i = 0; i < newImages.length; i++) {
        const imgUrl = newImages[i];
        
        // Skip if already preloaded
        if (preloadedRef.current.has(imgUrl)) continue;

        // Stagger preloads based on network speed
        await new Promise(resolve => setTimeout(resolve, i * strategy.staggerDelay));

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
  }, [images, enabled, strategy.distance, strategy.staggerDelay, strategy.enabled]);

  return {
    preloadedCount: preloadedRef.current.size,
    queueLength: preloadQueueRef.current.length,
    networkType: networkInfo.effectiveType,
    dataSaverEnabled: networkInfo.saveData,
    preloadDistance: Math.floor(strategy.distance),
  };
};
