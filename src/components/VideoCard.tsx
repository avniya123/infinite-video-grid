import { VideoItem } from '@/types/video';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import { useState } from 'react';

interface VideoCardProps {
  video: VideoItem;
  onPlay: (video: VideoItem) => void;
  onClick: (video: VideoItem) => void;
}

export function VideoCard({ video, onPlay, onClick }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(video);
  };

  const handleCardClick = () => {
    onClick(video);
  };

  return (
    <article 
      className="group relative overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[var(--shadow-card-hover)] cursor-pointer break-inside-avoid mb-5"
      onClick={handleCardClick}
    >
      <div className="relative">
        {/* Image */}
        <img
          src={video.image}
          alt={video.title}
          className={`w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Trending Badge */}
        {video.trending && (
          <Badge className="absolute top-3 left-3 bg-trending text-trending-foreground font-semibold text-xs px-2 py-1 shadow-lg">
            TRENDING
          </Badge>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-xs font-semibold">
          ${video.price}
        </div>

        {/* Play Button */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          onClick={handlePlayClick}
        >
          <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
            <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Bottom Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">
            {video.title}
          </h3>

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs">
            {/* Left: Tags */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white/90 text-[11px]">
                {video.orientation}
              </span>
              <span className="px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white/90 text-[11px] flex items-center gap-1">
                <span>⏱</span> {video.duration}
              </span>
            </div>

            {/* Right: Pricing */}
            <div className="text-right">
              <div className="text-[10px] line-through text-gray-300">
                MRP ${video.mrp}
              </div>
              <div className="text-[11px] text-discount-foreground font-bold">
                {video.discount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
