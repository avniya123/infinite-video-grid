import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoItem } from "@/types/video";
import { ShoppingCart, Edit, Share2, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useVideoVariations } from "@/hooks/useVideoVariations";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerateThumbnailButton } from "@/components/GenerateThumbnailButton";
import { useState, useRef, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface VariationsDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VariationsDrawer = ({ video, open, onOpenChange }: VariationsDrawerProps) => {
  const { data: variations, isLoading, refetch } = useVideoVariations(video?.id || 0);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [currentVideo, setCurrentVideo] = useState<{ url: string; title: string; thumbnail: string; id?: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!video) return null;

  useEffect(() => {
    if (open) {
      // Set initial video when drawer opens
      setCurrentVideo({
        url: video.videoUrl || '',
        title: video.title,
        thumbnail: video.image
      });
    }
  }, [open, video]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      const progress = (videoElement.currentTime / videoElement.duration) * 100;
      setProgress(progress);
    };

    const handleLoadStart = () => setIsVideoLoading(true);
    const handleCanPlay = () => setIsVideoLoading(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [currentVideo]);

  const handleThumbnailGenerated = (variationId: string, thumbnailUrl: string) => {
    setGeneratingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(variationId);
      return newSet;
    });
    refetch();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleShare = async (variation: any) => {
    const shareData = {
      title: `${video.title} - ${variation.title}`,
      text: `Check out this video variation: ${variation.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Failed to share");
      }
    }
  };

  const handlePlayVariation = (variation: any) => {
    setCurrentVideo({
      url: variation.video_url || video.videoUrl || '',
      title: `${video.title} - ${variation.title}`,
      thumbnail: variation.thumbnail_url || video.image
    });
    setProgress(0);
    toast.success(`Now playing: ${variation.title}`);
    
    // Auto play after a short delay to ensure video is loaded
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl">Template Variations Details</SheetTitle>
          <p className="text-sm text-muted-foreground">Template Variations list informations</p>
        </SheetHeader>

        <div className="px-6 space-y-6">
          {/* Video Player */}
          <div className="w-full rounded-lg overflow-hidden bg-black relative group">
            <AspectRatio ratio={16 / 9}>
              <video
                ref={videoRef}
                src={currentVideo?.url}
                poster={currentVideo?.thumbnail}
                className="w-full h-full object-cover"
                onClick={togglePlayPause}
              />
              
              {/* Loading Overlay */}
              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                </div>
              )}

              {/* Custom Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Center Play/Pause Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8 text-white" fill="white" />
                    ) : (
                      <Play className="h-8 w-8 text-white ml-1" fill="white" />
                    )}
                  </Button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  <Progress value={progress} className="h-1" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </AspectRatio>
          </div>

          {/* Current Video Title */}
          {currentVideo && (
            <div className="text-sm text-muted-foreground">
              Now playing: <span className="font-medium text-foreground">{currentVideo.title}</span>
            </div>
          )}

          {/* Video Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">₹ {video.price}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {video.duration}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {video.resolution}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="line-through">MRP: ₹ {video.mrp}</span>
                <span className="text-destructive font-medium">( {video.discount} Off )</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                <ShoppingCart className="h-4 w-4" />
                Share Cart
              </Button>
              <Button className="flex-1 gap-2">
                <Edit className="h-4 w-4" />
                Edit Template
              </Button>
            </div>
          </div>

          {/* Variations List */}
          <div className="space-y-3 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Available Variations ({variations?.length || 0})</h4>
              <Badge variant="secondary" className="text-xs">
                {variations?.filter(v => v.thumbnail_url).length || 0} with thumbnails
              </Badge>
            </div>

            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="w-20 h-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))
            ) : variations && variations.length > 0 ? (
              variations.map((variation) => {
                const isCurrentlyPlaying = currentVideo?.id === variation.id;
                return (
                  <div
                    key={variation.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isCurrentlyPlaying 
                        ? 'bg-primary/10 border-primary ring-2 ring-primary/20 shadow-md' 
                        : 'bg-card hover:bg-accent/50'
                    }`}
                    onClick={() => handlePlayVariation(variation)}
                  >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0 relative group">
                    <img
                      src={variation.thumbnail_url || video.image}
                      alt={variation.title}
                      className="w-full h-full object-cover"
                    />
                    {!variation.thumbnail_url && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <GenerateThumbnailButton
                          variationId={variation.id}
                          videoTitle={video.title}
                          variationTitle={variation.title}
                          aspectRatio={variation.aspect_ratio}
                          onGenerated={(url) => handleThumbnailGenerated(variation.id, url)}
                        />
                      </div>
                    )}
                    {/* Play overlay icon */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all ${
                      isCurrentlyPlaying 
                        ? 'bg-primary/50' 
                        : 'bg-black/0 group-hover:bg-black/30'
                    }`}>
                      {isCurrentlyPlaying ? (
                        <Volume2 className="h-8 w-8 text-white animate-pulse" />
                      ) : (
                        <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="white" />
                      )}
                    </div>
                  </div>

                  {/* Variation Info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-semibold text-sm leading-tight">{variation.title}</h5>
                        {isCurrentlyPlaying && (
                          <Badge variant="default" className="text-xs">Now Playing</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-muted rounded font-medium">
                          {variation.duration}
                        </span>
                        {variation.aspect_ratio && (
                          <span className="px-2 py-0.5 bg-muted rounded">
                            {variation.aspect_ratio}
                          </span>
                        )}
                        {variation.quality && (
                          <Badge variant="outline" className="text-xs h-5">
                            {variation.quality}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Platforms */}
                    {variation.platforms && variation.platforms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">For:</span>
                        {variation.platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="text-xs px-2 py-0 h-5"
                          >
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 text-xs">
                      {variation.video_url && (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                          Video ready
                        </span>
                      )}
                      {variation.thumbnail_url && (
                        <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                          Has thumbnail
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(variation);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVariation(variation);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <div className="text-4xl mb-2">📹</div>
                <p className="font-medium">No variations available</p>
                <p className="text-sm">This video doesn't have any variations yet</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
