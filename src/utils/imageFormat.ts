/**
 * Utility functions for image format detection and optimization
 */

let webpSupported: boolean | null = null;

/**
 * Detects if the browser supports WebP format
 * Uses a cached result for performance
 */
export const supportsWebP = (): Promise<boolean> => {
  if (webpSupported !== null) {
    return Promise.resolve(webpSupported);
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = webP.height === 2;
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Synchronously checks WebP support (returns cached result)
 * Returns false if not yet detected
 */
export const isWebPSupported = (): boolean => {
  return webpSupported ?? false;
};

/**
 * Transforms an image URL to use WebP format if supported
 * @param url - Original image URL (e.g., image.jpg)
 * @returns WebP URL if supported, otherwise original URL
 */
export const getOptimizedImageUrl = (url: string): string => {
  if (!isWebPSupported() || !url) {
    return url;
  }

  // Transform .jpg, .jpeg, .png to .webp
  return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Gets the fallback URL for an image (converts WebP back to original format)
 * @param url - WebP image URL
 * @returns Original format URL
 */
export const getFallbackUrl = (url: string): string => {
  // If it's a WebP URL, convert back to jpg
  if (url.endsWith('.webp')) {
    return url.replace(/\.webp$/i, '.jpg');
  }
  return url;
};

/**
 * Initialize WebP detection on app load
 */
export const initImageFormatDetection = () => {
  supportsWebP().then((supported) => {
    console.log(`WebP support: ${supported ? 'enabled' : 'disabled'}`);
  });
};
