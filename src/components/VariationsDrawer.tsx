import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoItem } from "@/types/video";
import { ShoppingCart, Edit, Share2, Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useVideoVariations } from "@/hooks/useVideoVariations";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { GenerateThumbnailButton } from "@/components/GenerateThumbnailButton";
import { useState } from "react";

interface VariationsDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayVariation?: (variation: { video_url?: string; thumbnail_url?: string; title: string }) => void;
}

export const VariationsDrawer = ({ video, open, onOpenChange, onPlayVariation }: VariationsDrawerProps) => {
  const { data: variations, isLoading, refetch } = useVideoVariations(video?.id || 0);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());

  if (!video) return null;

  const handleThumbnailGenerated = (variationId: string, thumbnailUrl: string) => {
    setGeneratingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(variationId);
      return newSet;
    });
    refetch();
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

  const handlePlay = (variation: any) => {
    if (onPlayVariation) {
      onPlayVariation({
        video_url: variation.video_url || video.videoUrl,
        thumbnail_url: variation.thumbnail_url || video.image,
        title: `${video.title} - ${variation.title}`
      });
      onOpenChange(false);
    } else {
      toast.info("Playing " + variation.title);
    }
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
          <div className="w-full rounded-lg overflow-hidden bg-muted">
            <AspectRatio ratio={16 / 9}>
              <video
                src={video.videoUrl}
                poster={video.image}
                controls
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>

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
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="w-16 h-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))
            ) : variations && variations.length > 0 ? (
              variations.map((variation) => (
                <div
                  key={variation.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0 relative group">
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
                  </div>

                  {/* Variation Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <span className="font-medium">{variation.title}</span>
                      <span className="text-muted-foreground">{variation.duration}</span>
                      {variation.aspect_ratio && (
                        <span className="text-muted-foreground">{variation.aspect_ratio}</span>
                      )}
                      {variation.quality && (
                        <span className="text-muted-foreground">{variation.quality}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {variation.platforms.map((platform) => (
                        <Badge
                          key={platform}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleShare(variation)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handlePlay(variation)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No variations available for this video
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
