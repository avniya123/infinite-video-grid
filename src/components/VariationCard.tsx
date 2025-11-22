import { Play, Volume2, Edit as EditIcon, Instagram, Youtube, Facebook, Video, Music2, Bookmark, Check, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { VideoVariation } from "@/hooks/useVideoVariations";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
  onAddToPublish?: (variation: VideoVariation) => void;
  hideShareButtons?: boolean;
  price?: number;
  mrp?: number;
  discount?: string;
  isSaved?: boolean;
  videoId?: number;
  hidePrice?: boolean;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (variationId: string, selected: boolean) => void;
  showActions?: boolean;
}

export const VariationCard = ({
  variation,
  videoTitle,
  videoImage,
  isCurrentlyPlaying,
  onPlay,
  onEdit,
  onAddToPublish,
  hideShareButtons = false,
  price,
  mrp,
  discount,
  isSaved = false,
  videoId,
  hidePrice = false,
  showCheckbox = false,
  isSelected = false,
  onSelectionChange,
  showActions = false,
}: VariationCardProps) => {
  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
        isSelected ? 'bg-primary/10 border-primary' : 
        isCurrentlyPlaying 
          ? 'bg-primary/5 border-primary/50 shadow-sm' 
          : 'bg-card hover:bg-accent/20 hover:border-border'
      }`}
    >
      {/* Checkbox for selection */}
      {showCheckbox && onSelectionChange && (
        <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange(variation.id, checked as boolean)}
            className="h-5 w-5"
          />
        </div>
      )}

      {/* Thumbnail */}
      <div 
        className="w-[120px] h-[90px] rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative cursor-pointer"
        onClick={() => onPlay(variation)}
      >
        <ProgressiveImage
          src={variation.thumbnail_url || videoImage}
          alt={variation.title}
          className="w-full h-full"
          lazy={true}
        />
        
        {/* Saved Badge */}
        {isSaved && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 gap-1 shadow-lg">
              <Bookmark className="h-2.5 w-2.5 fill-white" />
              Saved
            </Badge>
          </div>
        )}
        
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

      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-3">
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onPlay(variation)}
          >
            <h5 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
              {variation.title}
            </h5>
            {videoId && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Stock Video #{videoId}
              </p>
            )}
          </div>
          
          {/* Price Section */}
          {!hidePrice && price !== undefined && mrp !== undefined && (
            <div className="flex-shrink-0 text-right">
              <div className="text-base font-bold text-foreground">₹ {price}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-muted-foreground line-through">₹ {mrp}</span>
                {discount && (
                  <span className="text-xs text-destructive font-semibold">({discount} Off)</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Duration and Aspect Ratio Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground font-medium">
            {variation.duration}
          </Badge>
          {variation.aspect_ratio && (
            <Badge variant="outline" className="text-xs text-muted-foreground border-muted font-medium">
              {variation.aspect_ratio}
            </Badge>
          )}
        </div>
        
        {/* Platforms with Icons and Checks */}
        {variation.platforms && variation.platforms.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {variation.platforms.map((platform) => {
              const PlatformIcon = getPlatformIcon(platform);
              return (
                <div
                  key={platform}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20"
                >
                  <PlatformIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">{platform}</span>
                  <Check className="h-3 w-3 text-emerald-500" />
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2 pt-1">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(variation.id);
                }}
                className="h-7 text-xs gap-1.5"
              >
                <EditIcon className="h-3 w-3" />
                Edit
              </Button>
            )}
            {onAddToPublish && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPublish(variation);
                }}
                className="h-7 text-xs gap-1.5"
              >
                <ShoppingCart className="h-3 w-3" />
                Add to Publish
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Share Button - Always visible in list items when hideShareButtons is false */}
      {!hideShareButtons && (
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <SocialShareButtons
            title={`${videoTitle} - ${variation.title}`}
            description={`Check out this video variation: ${variation.title}`}
            url={window.location.href}
          />
        </div>
      )}
    </div>
  );
};
