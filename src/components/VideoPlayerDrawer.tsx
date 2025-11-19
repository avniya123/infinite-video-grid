import { VideoItem } from '@/types/video';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface VideoPlayerDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDrawer({ video, open, onOpenChange }: VideoPlayerDrawerProps) {
  if (!video) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{video.title}</DrawerTitle>
          <DrawerDescription>
            {video.orientation} • {video.duration} • ${video.price}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 px-4 pb-4">
          <video
            key={video.videoUrl}
            controls
            autoPlay
            className="w-full h-full rounded-lg bg-black"
            controlsList="nodownload"
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
