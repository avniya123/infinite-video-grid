import { VideoItem } from '@/types/video';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CompareDrawerProps {
  videos: VideoItem[];
  open: boolean;
  onClose: () => void;
  onRemove: (video: VideoItem) => void;
  onPlayVideo: (video: VideoItem) => void;
}

export function CompareDrawer({ videos, open, onClose, onRemove, onPlayVideo }: CompareDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Compare Videos ({videos.length}/4)</SheetTitle>
          <SheetDescription>
            Compare up to 4 videos side by side to find the perfect one for your needs
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {videos.map((video) => (
            <div key={video.id} className="relative bg-card rounded-lg overflow-hidden shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white"
                onClick={() => onRemove(video)}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="relative">
                <img
                  src={video.image}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <Button
                  size="icon"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  onClick={() => onPlayVideo(video)}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                </Button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span className={`font-semibold ${
                      video.resolution === '8K' ? 'text-purple-600' :
                      video.resolution === '4K' ? 'text-blue-600' :
                      'text-green-600'
                    }`}>{video.resolution}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{video.duration}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Orientation:</span>
                    <span className="font-medium">{video.orientation}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <div>
                      <div className="text-xs line-through text-muted-foreground">
                        ${video.mrp}
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        ${video.price}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-discount-foreground">
                      {video.discount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {videos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Select up to 4 videos to compare
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
