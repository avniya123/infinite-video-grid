import { VideoItem } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play, Check, List, Bookmark, BookmarkCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ShareButton } from '@/components/ShareButton';
import { VariationsDrawer } from '@/components/VariationsDrawer';
import { Button } from '@/components/ui/button';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { ProgressiveImage } from '@/components/ProgressiveImage';
import { AuthDrawer } from '@/components/AuthDrawer';
import { useVideoVariationsCount } from '@/hooks/useVideoVariationsCount';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [videoReady, setVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
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
            // Trigger animation after a small delay for better visual effect
            setTimeout(() => setHasAnimated(true), 50);
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

  // Preload video metadata when in view for instant playback
  useEffect(() => {
    if (isInView && videoRef.current && video.videoUrl) {
      // Preload just the metadata for faster startup
      videoRef.current.load();
    }
  }, [isInView, video.videoUrl]);

  // Check if template is already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // First get the variation UUID from video_id
      const { data: variation } = await supabase
        .from('video_variations')
        .select('id')
        .eq('video_id', video.id)
        .maybeSingle();

      if (!variation) return;

      const { data, error } = await supabase
        .from('user_templates')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('variation_id', variation.id)
        .maybeSingle();

      if (!error && data) {
        setIsSaved(true);
      }
    };

    checkIfSaved();
  }, [video.id]);

  const handleSaveTemplate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAuthDrawerOpen(true);
      return;
    }

    setSavingTemplate(true);

    try {
      // First get the variation UUID from video_id
      const { data: variation, error: variationError } = await supabase
        .from('video_variations')
        .select('id')
        .eq('video_id', video.id)
        .maybeSingle();

      if (variationError || !variation) {
        throw new Error('Template variation not found');
      }

      if (isSaved) {
        // Remove from templates
        const { error } = await supabase
          .from('user_templates')
          .delete()
          .eq('user_id', session.user.id)
          .eq('variation_id', variation.id);

        if (error) throw error;

        setIsSaved(false);
        toast.success('Removed from My Templates');
      } else {
        // Add to templates
        const { error } = await supabase
          .from('user_templates')
          .insert([{
            user_id: session.user.id,
            variation_id: variation.id,
            custom_title: video.title,
          }]);

        if (error) throw error;

        setIsSaved(true);
        toast.success('Saved to My Templates');
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

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
    // Fast video start with minimal delay
    hoverTimerRef.current = setTimeout(() => {
      if (videoRef.current) {
        setShowVideo(true);
        setIsBuffering(true);
        // Play immediately - video is already preloaded
        videoRef.current.play().catch(err => {
          console.log('Play failed:', err);
          setIsBuffering(false);
        });
      }
    }, 100); // Ultra-fast 100ms delay
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowVideo(false);
    setVideoReady(false);
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
      className={`group relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-[var(--shadow-card)] transition-all duration-500 hover:shadow-[var(--shadow-card-hover)] cursor-pointer break-inside-avoid mb-5 ${isSelected ? 'ring-4 ring-primary' : ''} ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
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
            className={`w-full h-full transition-opacity duration-300 ease-out ${videoReady ? 'opacity-0' : 'opacity-100'}`}
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
              className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-200 ease-out ${videoReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{
                objectFit: 'cover',
              }}
              loop
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={() => {
                setVideoLoaded(true);
              }}
              onCanPlay={() => {
                setIsBuffering(false);
              }}
              onPlaying={() => {
                setIsBuffering(false);
                setVideoReady(true);
              }}
              onWaiting={() => setIsBuffering(true)}
              onError={(e) => {
                console.log('Video load error:', e);
                setIsBuffering(false);
                setVideoReady(false);
              }}
            />
          )}

          {/* Professional Buffering Indicator - Minimal Design */}
          {showVideo && !videoReady && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Variations Count Badge */}
          <Badge className="absolute top-3 left-3 bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white font-semibold text-[10px] px-2 py-1 shadow-lg z-10 border border-gray-200 dark:border-gray-700">
            01/{String(variationsCount + 1).padStart(2, '0')}
          </Badge>

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Price Section with Tooltip */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white px-2.5 py-1.5 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 cursor-help">
                    <div className="text-xs font-semibold">₹ {video.price}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="left" 
                  className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg"
                >
                  <div className="space-y-1.5 min-w-[160px]">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-1.5">
                      Pricing Breakdown
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 dark:text-gray-400">MRP:</span>
                      <span className="text-gray-900 dark:text-white line-through">₹ {video.mrp}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">{video.discount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1.5 border-t border-gray-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-900 dark:text-white">Final Price:</span>
                      <span className="font-bold text-primary">₹ {video.price}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Share Button - visible on hover */}
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ShareButton video={video} variant="outline" size="icon" />
            </div>

            {/* Save to My Templates Button */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSaveTemplate}
                    disabled={savingTemplate}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-primary" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{isSaved ? 'Saved to My Templates' : 'Save to My Templates'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
            {/* Title with Tooltip */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="text-xs font-bold text-white line-clamp-2 mb-1 leading-relaxed cursor-help">
                    {video.title.replace(/\s*-\s*Stock Video #\d+.*$/i, '').substring(0, 30)}
                    {video.title.replace(/\s*-\s*Stock Video #\d+.*$/i, '').length > 30 ? '...' : ''}
                  </h3>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-xs bg-gray-900 text-white border-gray-700 animate-in fade-in-0 zoom-in-95 duration-200"
                  sideOffset={5}
                >
                  <p className="text-sm font-medium animate-fade-in">{video.title.replace(/\s*-\s*Stock Video #\d+.*$/i, '')}</p>
                  <p className="text-xs text-gray-400 mt-1.5 animate-fade-in" style={{ animationDelay: '50ms' }}>Stock Video #{video.id}</p>
                  <p className="text-xs text-gray-400 animate-fade-in" style={{ animationDelay: '100ms' }}>Price: ₹{video.price}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {/* Caption */}
            <p className="text-[9px] text-gray-400 font-medium">
              Stock Video #{video.id}
            </p>
          </div>

          {/* Variations Button */}
          <Button
            size="sm"
            className="absolute bottom-3 right-3 z-20 gap-1.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 border-0 shadow-lg"
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
