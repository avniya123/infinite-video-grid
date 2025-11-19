import { VideoItem } from '@/types/video';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoPlayerDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDrawer({ video, open, onOpenChange }: VideoPlayerDrawerProps) {
  if (!video) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[600px] md:w-[700px] lg:w-[800px] p-0 overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>{video.title}</SheetTitle>
          <SheetDescription>
            {video.orientation} • {video.duration} • ${video.price}
          </SheetDescription>
        </SheetHeader>
        
        <div className="px-6 pb-6">
          <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden">
            <video
              key={video.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
              controlsList="nodownload"
            >
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </AspectRatio>
        </div>
      </SheetContent>
    </Sheet>
  );
}
