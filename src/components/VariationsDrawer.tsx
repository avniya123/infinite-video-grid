import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoItem } from "@/types/video";
import { ShoppingCart, Edit, Play } from "lucide-react";
import { useVideoVariations } from "@/hooks/useVideoVariations";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VariationCard } from "@/components/VariationCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VariationsDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestAuth?: () => void;
}

export const VariationsDrawer = ({ video, open, onOpenChange, onRequestAuth }: VariationsDrawerProps) => {
  const { data: variations, isLoading, refetch } = useVideoVariations(video?.id || 0);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  
  const {
    videoRef,
    currentVideo,
    isPlaying,
    isMuted,
    progress,
    isVideoLoading,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
    playVideo,
    setCurrentVideo,
  } = useVideoPlayer();

  if (!video) return null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (open) {
      setCurrentVideo({
        url: video.videoUrl || '',
        title: video.title,
        thumbnail: video.image
      });
      setSelectedVariation(null); // Reset to main video when opening
    }
  }, [open, video, setCurrentVideo]);

  const handleThumbnailGenerated = (variationId: string, thumbnailUrl: string) => {
    setGeneratingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(variationId);
      return newSet;
    });
    refetch();
  };

  const handlePlayVariation = (variation: any) => {
    setSelectedVariation(variation);
    playVideo({
      url: variation.video_url || video.videoUrl || '',
      title: `${video.title} - ${variation.title}`,
      thumbnail: variation.thumbnail_url || video.image,
      id: variation.id
    });
  };

  const handleShareCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      onRequestAuth?.();
      return;
    }
    toast.success('Added to cart');
  };

  const handleEdit = (variationId?: string) => {
    if (!user) {
      toast.error('Please sign in to edit videos');
      onRequestAuth?.();
      return;
    }
    
    // Use provided variationId or the first variation's ID
    const targetVariationId = variationId || (variations && variations.length > 0 ? variations[0].id : null);
    
    if (!targetVariationId) {
      toast.error('No variation available to edit');
      return;
    }
    
    window.location.href = `/template-editor/${targetVariationId}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl">Video Variations</SheetTitle>
          <SheetDescription>
            Explore different versions and formats of this video
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6 pb-6">
          {/* Video Player */}
          {currentVideo && (
            <VideoPlayer
              videoRef={videoRef}
              videoUrl={currentVideo.url}
              posterUrl={currentVideo.thumbnail}
              isPlaying={isPlaying}
              isMuted={isMuted}
              progress={progress}
              isLoading={isVideoLoading}
              onTogglePlayPause={togglePlayPause}
              onToggleMute={toggleMute}
              onToggleFullscreen={toggleFullscreen}
            />
          )}

          {/* Video Info */}
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">{(currentVideo?.title || video.title).replace(/\s*-\s*Stock Video #\d+.*$/i, '')}</h3>
              <p className="text-xs text-gray-400 font-medium">Stock Video #{video.id}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground">
                  {selectedVariation ? selectedVariation.duration : video.duration}
                </Badge>
                {selectedVariation && selectedVariation.quality && (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-muted">
                    {selectedVariation.quality}
                  </Badge>
                )}
                {selectedVariation && selectedVariation.aspect_ratio && (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-muted">
                    {selectedVariation.aspect_ratio}
                  </Badge>
                )}
                {!selectedVariation && (
                  <Badge variant="outline" className="text-xs text-muted-foreground border-muted">
                    {video.resolution}
                  </Badge>
                )}
                {selectedVariation && selectedVariation.platforms && selectedVariation.platforms.length > 0 && (
                  <div className="flex gap-1">
                    {selectedVariation.platforms.map((platform: string) => (
                      <Badge key={platform} variant="secondary" className="text-[10px] bg-muted/30 text-muted-foreground px-1.5 py-0.5">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 shrink-0">
              {/* Price Section */}
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">₹ {video.price}</div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground line-through">MRP: ₹ {video.mrp}</span>
                  <span className="text-xs text-destructive font-medium">( {video.discount} Off )</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleShareCart} className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Share Cart
                </Button>
                <Button size="sm" onClick={() => handleEdit()} variant="outline" className="gap-2">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Variations List */}
          <div className="space-y-4">
            {isLoading ? (
              <>
                <div className="flex items-center justify-between px-1 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground tracking-tight">Available Variations</h4>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">Choose from different formats and platforms</p>
                  </div>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <Skeleton className="w-24 h-24 rounded-md bg-muted/60" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-3/4 bg-muted/60" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-12 rounded-full bg-muted/60" />
                        <Skeleton className="h-4 w-12 rounded-full bg-muted/60" />
                      </div>
                      <Skeleton className="h-3 w-full bg-muted/60" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md bg-muted/60" />
                    </div>
                  </div>
                ))}
              </>
            ) : variations && variations.length > 0 ? (
              <>
                {/* Category Header */}
                <div className="space-y-1 px-1 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/90 text-primary-foreground text-xs px-2.5 py-1 font-semibold">
                      {video.mainCategory}
                    </Badge>
                    <span className="text-muted-foreground text-xs">•</span>
                    <Badge variant="secondary" className="bg-muted text-foreground text-xs px-2.5 py-1 font-semibold">
                      {video.subcategory}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground/70">
                      {variations.length} {variations.length === 1 ? 'variation' : 'variations'} available
                    </p>
                    <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground">
                      {variations.filter(v => v.thumbnail_url).length} / {variations.length} thumbnails
                    </Badge>
                  </div>
                </div>

                {/* Variations */}
                <div className="space-y-3">
                  {variations.map((variation) => (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      videoTitle={video.title}
                      videoImage={video.image}
                      isCurrentlyPlaying={currentVideo?.id === variation.id}
                      onPlay={handlePlayVariation}
                      onThumbnailGenerated={handleThumbnailGenerated}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <h5 className="font-semibold text-base mb-2">No Variations Available</h5>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  This video doesn't have any variations yet. Check back later for different formats and versions.
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
