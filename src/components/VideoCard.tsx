import { VideoItem } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play, Check, List } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ShareButton } from '@/components/ShareButton';
import { VariationsDrawer } from '@/components/VariationsDrawer';
import { Button } from '@/components/ui/button';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { ProgressiveImage } from '@/components/ProgressiveImage';
import { AuthDrawer } from '@/components/AuthDrawer';
import { useVideoVariationsCount } from '@/hooks/useVideoVariationsCount';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem, seekTime?: number) => void;
  onClick: (video: VideoItem) => void;
  isSelected?: boolean;
  onSelect?: (video: VideoItem) => void;
}

export function VideoCard({ video, onPlay, onClick, isSelected = false, onSelect }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: variationsCount = 0 } = useVideoVariationsCount(video.id);

  // Calculate aspect ratio based on orientation
  const getAspectRatio = () => {
    if (video.aspectRatio) return video.aspectRatio;
    
    switch (video.orientation) {
      case 'Landscape':
        return 16 / 9;
      case 'Portrait':
        return 9 / 16;
      case 'Square':
        return 1;
      default:
        return 16 / 9;
    }
  };

  const aspectRatio = getAspectRatio();

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Preload video when in view
  useEffect(() => {
    if (isInView && videoRef.current && video.videoUrl) {
      videoRef.current.load();
    }
  }, [isInView, video.videoUrl]);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(video, 0);
  };

  const handleCardClick = () => {
    onClick(video);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(video);
  };

  const handleMouseEnter = () => {
    // Only start video preview if card is in view
    if (!isInView) return;
    
    setIsHovering(true);
    // Start playing video immediately on hover
    hoverTimerRef.current = setTimeout(() => {
      if (videoRef.current) {
        setShowVideo(true);
        setIsBuffering(true);
        videoRef.current.play().catch(err => console.log('Play failed:', err));
      }
    }, 150);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowVideo(false);
    setIsBuffering(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <article 
      ref={cardRef}
      className={`group relative overflow-hidden rounded-lg bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] cursor-pointer break-inside-avoid mb-5 ${isSelected ? 'ring-4 ring-primary' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AspectRatio ratio={aspectRatio}>
        <div className="relative w-full h-full">
          {/* Selection Checkbox */}
          {onSelect && (
            <div 
              className="absolute top-3 left-3 z-10"
              onClick={handleSelectClick}
            >
              <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'bg-white/90 border-white backdrop-blur-sm'}`}>
                {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
              </div>
            </div>
          )}

          {/* Progressive Image with Blur-up and Lazy Loading */}
          <ProgressiveImage
            src={video.image}
            alt={video.title}
            className={`w-full h-full transition-opacity duration-500 ease-out ${showVideo ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoaded(true)}
            lazy={true}
          />
          
          {/* Placeholder before in view */}
          {!isInView && (
            <div className="absolute inset-0 bg-muted/40 animate-pulse" />
          )}

          {/* Video Preview on Hover - Only load when in view */}
          {isInView && (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className={`w-full h-full object-cover absolute inset-0 transition-all duration-500 ease-out ${showVideo ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              style={{
                objectFit: 'cover',
                WebkitMaskImage: '-webkit-radial-gradient(white, black)',
              }}
              loop
              muted
              playsInline
              preload="metadata"
              onLoadedData={() => setVideoLoaded(true)}
              onWaiting={() => setIsBuffering(true)}
              onCanPlay={() => setIsBuffering(false)}
              onPlaying={() => setIsBuffering(false)}
              onError={(e) => console.log('Video load error:', e)}
            />
          )}

          {/* Buffering Shimmer Overlay */}
          {showVideo && isBuffering && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 transition-opacity duration-300">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          )}

          {/* Trending Badge */}
          {video.trending && (
            <Badge className="absolute top-3 left-3 bg-trending text-trending-foreground font-semibold text-xs px-2 py-1 shadow-lg z-10">
              TRENDING
            </Badge>
          )}

          {/* Variations Count Badge */}
          <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white font-semibold text-[10px] px-2 py-1 shadow-lg z-10" style={{ top: video.trending ? '3.5rem' : '0.75rem' }}>
            01/{String(variationsCount + 1).padStart(2, '0')}
          </Badge>

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Price Section */}
            <div className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-md">
              <div className="text-xs font-semibold">₹ {video.price}</div>
            </div>
            
            {/* Share Button - visible on hover */}
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ShareButton video={video} variant="outline" size="icon" />
            </div>
          </div>

          {/* Play Button - hide when video is playing */}
          <div 
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 ease-out ${showVideo ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
            onClick={handlePlayClick}
          >
            <div className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
              <Play className="w-3.5 h-3.5 text-primary ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-4">
            {/* Title */}
            <h3 className="text-[11px] font-bold text-white line-clamp-2 mb-1 leading-relaxed">
              {video.title}
            </h3>
            {/* Caption */}
            <p className="text-[9px] text-gray-400 font-medium">
              Stock Video #{video.id}
            </p>
          </div>

          {/* Variations Button */}
          <Button
            size="sm"
            variant="outline"
            className="absolute bottom-3 right-3 z-20 gap-1.5 bg-background/95 backdrop-blur-sm hover:bg-background text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setVariationsOpen(true);
            }}
          >
            <List className="h-3.5 w-3.5" />
            Variations
          </Button>
        </div>
      </AspectRatio>

      <VariationsDrawer
        video={video}
        open={variationsOpen}
        onOpenChange={setVariationsOpen}
        onRequestAuth={() => setAuthDrawerOpen(true)}
      />

      <VideoPlayerDrawer
        video={video}
        open={playerOpen}
        onOpenChange={setPlayerOpen}
      />

      <AuthDrawer 
        open={authDrawerOpen} 
        onOpenChange={setAuthDrawerOpen} 
      />
    </article>
  );
}
