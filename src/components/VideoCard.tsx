import { VideoItem } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ShareButton } from '@/components/ShareButton';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onClick: (video: VideoItem) => void;
  isSelected?: boolean;
  onSelect?: (video: VideoItem) => void;
}

export function VideoCard({ video, onPlay, onClick, isSelected = false, onSelect }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(video);
  };

  const handleCardClick = () => {
    onClick(video);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(video);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Start playing video after 500ms hover
    hoverTimerRef.current = setTimeout(() => {
      setShowVideo(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowVideo(false);
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
      className={`group relative overflow-hidden rounded-none bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[var(--shadow-card-hover)] cursor-pointer break-inside-avoid mb-5 ${isSelected ? 'ring-4 ring-primary' : ''}`}
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

          {/* Image */}
          <img
            src={video.image}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded && !showVideo ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Video Preview on Hover */}
          {showVideo && (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
              loop
              muted
              playsInline
            />
          )}
          
          {/* Loading placeholder */}
          {!imageLoaded && !showVideo && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Trending Badge */}
          {video.trending && (
            <Badge className="absolute top-3 left-3 bg-trending text-trending-foreground font-semibold text-xs px-2 py-1 shadow-lg z-10">
              TRENDING
            </Badge>
          )}

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Price Badge */}
            <div className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold">
              ${video.price}
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
          {!showVideo && (
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              onClick={handlePlayClick}
            >
              <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
                <Play className="w-5 h-5 text-primary ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Bottom Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-3">
            {/* Title */}
            <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
              {video.title}
            </h3>

            {/* Metadata Row */}
            <div className="flex items-center justify-between text-xs">
              {/* Left: Tags */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white/90 text-[11px]">
                  {video.orientation}
                </span>
                <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white/90 text-[11px] flex items-center gap-1">
                  <span>⏱</span> {video.duration}
                </span>
              </div>

              {/* Right: Pricing */}
              <div className="text-right">
                <div className="text-[10px] line-through text-gray-300">
                  MRP ${video.mrp}
                </div>
                <div className="text-[11px] text-discount-foreground font-bold">
                  {video.discount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </article>
  );
}
