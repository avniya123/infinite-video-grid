import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RefObject } from "react";

interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
  videoUrl: string;
  posterUrl: string;
  isPlaying: boolean;
  isMuted: boolean;
  progress: number;
  isLoading: boolean;
  onTogglePlayPause: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
}

export const VideoPlayer = ({
  videoRef,
  videoUrl,
  posterUrl,
  isPlaying,
  isMuted,
  progress,
  isLoading,
  onTogglePlayPause,
  onToggleMute,
  onToggleFullscreen,
}: VideoPlayerProps) => {
  return (
    <div className="space-y-3">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
        <div className="relative w-full h-full group">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            className="w-full h-full object-cover"
            playsInline
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Progress value={progress} className="h-1 mb-3" />
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={onTogglePlayPause}
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
                  onClick={onToggleMute}
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
                onClick={onToggleFullscreen}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};
