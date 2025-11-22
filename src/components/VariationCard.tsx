import { Play, Volume2, Edit as EditIcon, Instagram, Youtube, Facebook, Video, Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { VideoVariation } from "@/hooks/useVideoVariations";
import { Button } from "@/components/ui/button";

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('instagram') || platformLower.includes('reels')) return Instagram;
  if (platformLower.includes('youtube') || platformLower.includes('shorts')) return Youtube;
  if (platformLower.includes('facebook')) return Facebook;
  if (platformLower.includes('tiktok')) return Music2;
  return Video; // Default icon
};

interface VariationCardProps {
  variation: VideoVariation;
  videoTitle: string;
  videoImage: string;
  isCurrentlyPlaying: boolean;
  onPlay: (variation: VideoVariation) => void;
  onEdit?: (variationId: string) => void;
  hideShareButtons?: boolean;
  price?: number;
  mrp?: number;
  discount?: string;
}

export const VariationCard = ({
  variation,
  videoTitle,
  videoImage,
  isCurrentlyPlaying,
  onPlay,
  onEdit,
  hideShareButtons = false,
  price,
  mrp,
  discount,
}: VariationCardProps) => {
  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        isCurrentlyPlaying 
          ? 'bg-primary/5 border-primary/50 shadow-sm' 
          : 'bg-card hover:bg-accent/20 hover:border-border'
      }`}
      onClick={() => onPlay(variation)}
    >
      {/* Thumbnail */}
      <div className="w-[120px] h-[90px] rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
        <ProgressiveImage
          src={variation.thumbnail_url || videoImage}
          alt={variation.title}
          className="w-full h-full"
          lazy={true}
        />
        
        {/* Play overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isCurrentlyPlaying 
            ? 'bg-primary/60' 
            : 'bg-black/0 group-hover:bg-black/40'
        }`}>
          {isCurrentlyPlaying ? (
            <div className="flex flex-col items-center gap-1">
              <Volume2 className="h-6 w-6 text-white animate-pulse" />
              <span className="text-xs text-white font-medium">Playing</span>
            </div>
          ) : (
            <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" fill="white" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
              {variation.title}
            </h5>
            {/* Price */}
            {price !== undefined && mrp !== undefined && (
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-bold text-foreground">₹ {price}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-muted-foreground line-through">₹ {mrp}</span>
                  {discount && (
                    <span className="text-[10px] text-destructive font-semibold">({discount} Off)</span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Metadata Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-[10px] bg-muted/50 text-muted-foreground font-medium px-1.5 py-0">
              {variation.duration}
            </Badge>
            {variation.aspect_ratio && (
              <Badge variant="secondary" className="text-[10px] bg-muted/50 text-muted-foreground font-medium px-1.5 py-0">
                {variation.aspect_ratio}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Platforms */}
        {variation.platforms && variation.platforms.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground/70 font-medium">Platforms:</span>
            {variation.platforms.map((platform) => {
              const PlatformIcon = getPlatformIcon(platform);
              return (
                <Badge
                  key={platform}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0.5 text-muted-foreground/80 border-muted/50 font-medium flex items-center gap-1"
                >
                  <PlatformIcon className="h-2.5 w-2.5" />
                  {platform}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(variation.id);
            }}
            className="gap-1.5 h-8"
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        {!hideShareButtons && (
          <div onClick={(e) => e.stopPropagation()}>
            <SocialShareButtons
              title={`${videoTitle} - ${variation.title}`}
              description={`Check out this video variation: ${variation.title}`}
              url={window.location.href}
            />
          </div>
        )}
      </div>
    </div>
  );
};
