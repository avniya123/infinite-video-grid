import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl, getFallbackUrl } from '@/utils/imageFormat';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  lazy?: boolean;
}

export const ProgressiveImage = ({ 
  src, 
  alt, 
  className, 
  blurDataURL,
  onLoad,
  lazy = true
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || '');
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading with aggressive preloading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: '600px', // Start loading 600px before entering viewport for smoother experience
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, isInView]);

  // Load image when in view with WebP optimization
  useEffect(() => {
    if (!isInView || !src) return;

    setIsLoading(true);
    setImageError(false);
    
    // Try loading WebP format first
    const optimizedSrc = getOptimizedImageUrl(src);
    const img = new Image();
    img.src = optimizedSrc;
    
    img.onload = () => {
      setTimeout(() => {
        setCurrentSrc(optimizedSrc);
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.();
      }, 100);
    };

    img.onerror = () => {
      // If WebP fails and we tried WebP, fallback to original format
      if (optimizedSrc !== src && !imageError) {
        setImageError(true);
        const fallbackImg = new Image();
        fallbackImg.src = getFallbackUrl(src);
        
        fallbackImg.onload = () => {
          setTimeout(() => {
            setCurrentSrc(getFallbackUrl(src));
            setIsLoaded(true);
            setIsLoading(false);
            onLoad?.();
          }, 100);
        };
        
        fallbackImg.onerror = () => {
          setIsLoading(false);
        };
      } else {
        setIsLoading(false);
      }
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, isInView, imageError]);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-muted/20", className)}>
      {/* Main Image */}
      {isInView && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-all duration-700 ease-out",
            isLoaded 
              ? "blur-0 opacity-100" 
              : "blur-2xl opacity-60"
          )}
        />
      )}
      
      {/* Loading Shimmer Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 dark:via-white/20 to-transparent" />
        </div>
      )}
      
      {/* Fade-in overlay for smooth transition */}
      <div 
        className={cn(
          "absolute inset-0 bg-background/10 transition-opacity duration-700",
          isLoaded ? "opacity-0" : "opacity-100"
        )} 
      />
    </div>
  );
};
