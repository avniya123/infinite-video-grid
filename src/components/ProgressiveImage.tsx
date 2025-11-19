import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  blurDataURL?: string;
  onLoad?: () => void;
}

export const ProgressiveImage = ({ 
  src, 
  alt, 
  className, 
  blurDataURL,
  onLoad 
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(blurDataURL || src);

  useEffect(() => {
    setIsLoading(true);
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      // Delay to ensure smooth transition
      setTimeout(() => {
        setCurrentSrc(src);
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.();
      }, 100);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad]);

  return (
    <div className={cn("relative overflow-hidden bg-muted/20", className)}>
      {/* Main Image */}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-700 ease-out",
          isLoaded 
            ? "scale-100 blur-0 opacity-100" 
            : "scale-110 blur-2xl opacity-60"
        )}
      />
      
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
