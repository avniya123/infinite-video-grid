import { VideoItem } from "@/types/video";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Sparkles, Lock } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";

interface VideoListViewProps {
  videos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onViewVariations: (videoId: number) => void;
  onAuthRequired: () => void;
}

export const VideoListView = ({ videos, onPlayVideo, onViewVariations, onAuthRequired }: VideoListViewProps) => {
  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all"
        >
          {/* Thumbnail */}
          <div className="relative w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden group">
            <img
              src={video.image}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => onPlayVideo(video)}
              >
                <Play className="h-5 w-5" />
              </Button>
            </div>
            {video.trending && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{video.duration}</span>
                </div>
                <Badge variant="secondary">{video.orientation}</Badge>
                <Badge variant="outline">{video.category}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{video.price}</span>
                <span className="text-sm text-muted-foreground line-through">{video.mrp}</span>
                <Badge variant="destructive" className="text-xs">{video.discount}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onPlayVideo(video)}>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => onViewVariations(video.id)}>
                View Variations
              </Button>
              <ShareButton video={video} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
