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
}

export const VariationCard = ({
  variation,
  videoTitle,
  videoImage,
  isCurrentlyPlaying,
  onPlay,
  onThumbnailGenerated,
  onEdit,
}: VariationCardProps) => {
  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
        isCurrentlyPlaying 
          ? 'bg-primary/5 border-primary shadow-sm' 
          : 'bg-card hover:bg-accent/30 hover:shadow-sm hover:border-accent'
      }`}
      onClick={() => onPlay(variation)}
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 rounded-md overflow-hidden bg-muted/30 flex-shrink-0 relative">
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

      <div className="flex-1 min-w-0 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h5 className="font-bold text-sm text-foreground leading-tight line-clamp-2 flex-1">
              {variation.title}
            </h5>
            {isCurrentlyPlaying && (
              <Badge variant="default" className="text-xs flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5" />
                Playing
              </Badge>
            )}
          </div>
          
          {/* Metadata Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full text-xs font-medium">
              {variation.duration}
            </span>
            {variation.aspect_ratio && (
              <span className="inline-flex items-center px-2 py-0.5 bg-muted/50 text-muted-foreground rounded-full text-xs font-medium">
                {variation.aspect_ratio}
              </span>
            )}
            {variation.quality && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50 text-muted-foreground font-medium">
                {variation.quality}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Platforms */}
        {variation.platforms && variation.platforms.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground/70 font-medium">Platforms:</span>
            <div className="flex gap-1.5 flex-wrap">
              {variation.platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant="outline"
                  className="text-xs px-2 py-0.5 text-muted-foreground/80 border-muted font-medium"
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Status indicators */}
        <div className="flex items-center gap-3 text-xs">
          {variation.video_url && (
            <span className="flex items-center gap-1.5 text-muted-foreground/70 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
              Ready
            </span>
          )}
          {variation.thumbnail_url && (
            <span className="flex items-center gap-1.5 text-muted-foreground/70 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
              Thumbnail
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 flex-shrink-0">
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(variation.id);
            }}
            className="gap-2"
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <SocialShareButtons
            title={`${videoTitle} - ${variation.title}`}
            description={`Check out this video variation: ${variation.title}`}
            url={window.location.href}
          />
        </div>
      </div>
    </div>
  );
};
