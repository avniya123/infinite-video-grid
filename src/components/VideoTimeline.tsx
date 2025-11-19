import { useState, useEffect, useRef } from 'react';
import { generateVideoThumbnails, getThumbnailIndexFromPosition } from '@/utils/videoThumbnails';

interface VideoTimelineProps {
  videoUrl: string;
  isVisible: boolean;
}

export function VideoTimeline({ videoUrl, isVisible }: VideoTimelineProps) {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && videoUrl && thumbnails.length === 0) {
      setLoading(true);
      generateVideoThumbnails(videoUrl, 5)
        .then((thumbs) => {
          setThumbnails(thumbs);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to generate thumbnails:', err);
          setLoading(false);
        });
    }
  }, [isVisible, videoUrl, thumbnails.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || thumbnails.length === 0) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(1, x / rect.width));
    
    setHoverPosition(position);
    const index = getThumbnailIndexFromPosition(position, thumbnails.length);
    setCurrentIndex(Math.min(index, thumbnails.length - 1));
  };

  if (!isVisible || loading) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 px-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {/* Thumbnail Preview */}
      {thumbnails.length > 0 && (
        <div 
          className="absolute bottom-full mb-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-white/20"
          style={{
            left: `${hoverPosition * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <img
            src={thumbnails[currentIndex]}
            alt="Video preview"
            className="w-40 h-[90px] object-cover"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
            {Math.floor((currentIndex / thumbnails.length) * 100)}%
          </div>
        </div>
      )}

      {/* Timeline Bar */}
      <div
        ref={timelineRef}
        className="h-1 bg-white/30 backdrop-blur-sm rounded-full cursor-pointer overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Progress indicator */}
        <div
          className="h-full bg-white/80 transition-all duration-100"
          style={{ width: `${hoverPosition * 100}%` }}
        />
      </div>

      {/* Thumbnail markers */}
      <div className="absolute top-0 left-0 right-0 h-1 flex justify-between pointer-events-none">
        {thumbnails.map((_, index) => (
          <div
            key={index}
            className="w-0.5 h-full bg-white/50"
          />
        ))}
      </div>
    </div>
  );
}
