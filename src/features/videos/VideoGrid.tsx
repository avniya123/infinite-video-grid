import { VideoCard } from "@/components/VideoCard";
import { VideoCardSkeleton } from "@/components/VideoCardSkeleton";
import { VideoItem } from "@/types/video";

interface VideoGridProps {
  videos: VideoItem[];
  loading: boolean;
  columnCount: number;
  onPlayVideo: (video: VideoItem) => void;
}

export const VideoGrid = ({ videos, loading, columnCount, onPlayVideo }: VideoGridProps) => {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columnCount] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onPlay={(v) => onPlayVideo(v)}
          onClick={(v) => onPlayVideo(v)}
        />
      ))}
      
      {loading && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={`skeleton-${i}`} />
          ))}
        </>
      )}
    </div>
  );
};
