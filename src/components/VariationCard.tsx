import { Play, Volume2, Edit as EditIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { GenerateThumbnailButton } from "@/components/GenerateThumbnailButton";
import { UploadThumbnailButton } from "@/components/UploadThumbnailButton";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { VideoVariation } from "@/hooks/useVideoVariations";
import { Button } from "@/components/ui/button";

interface VariationCardProps {
  variation: VideoVariation;
  videoTitle: string;
  videoImage: string;
  isCurrentlyPlaying: boolean;
  onPlay: (variation: VideoVariation) => void;
  onThumbnailGenerated: (variationId: string, url: string) => void;
  onEdit?: (variationId: string) => void;
  hideShareButtons?: boolean;
}

export const VariationCard = ({
  variation,
  videoTitle,
  videoImage,
  isCurrentlyPlaying,
  onPlay,
  onThumbnailGenerated,
  onEdit,
  hideShareButtons = false,
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
        
        {!variation.thumbnail_url && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <GenerateThumbnailButton
              variationId={variation.id}
              videoTitle={videoTitle}
              variationTitle={variation.title}
              aspectRatio={variation.aspect_ratio}
              onGenerated={(url) => onThumbnailGenerated(variation.id, url)}
            />
            <div className="text-xs text-white/60">or</div>
            <UploadThumbnailButton
              variationId={variation.id}
              onUploaded={(url) => onThumbnailGenerated(variation.id, url)}
            />
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

      <div className="flex-1 min-w-0 space-y-2">
        <div className="space-y-1">
          <h5 className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
            {variation.title}
          </h5>
          
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
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground/70 font-medium">Platforms:</span>
            <div className="flex gap-1 flex-wrap">
              {variation.platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-muted-foreground/80 border-muted/50 font-medium"
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!hideShareButtons && (
          <div onClick={(e) => e.stopPropagation()}>
            <SocialShareButtons
              title={`${videoTitle} - ${variation.title}`}
              description={`Check out this video variation: ${variation.title}`}
              url={window.location.href}
            />
          </div>
        )}
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
      </div>
    </div>
  );
};
