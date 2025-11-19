import { VideoItem } from '@/types/video';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface VideoPlayerDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDrawer({ video, open, onOpenChange }: VideoPlayerDrawerProps) {
  if (!video) return null;

  const handleDownload = (format: string) => {
    toast.success(`Downloading video in ${format} format`, {
      description: `${video.title} will be downloaded shortly.`
    });
    // In production, this would trigger actual download
    console.log(`Downloading ${video.videoUrl} as ${format}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[600px] md:w-[700px] lg:w-[800px] p-0 overflow-y-auto">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle>{video.title}</SheetTitle>
              <SheetDescription>
                {video.resolution} • {video.orientation} • {video.duration} • ${video.price}
              </SheetDescription>
            </div>
            
            {/* Download Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="ml-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('MP4')}>
                  <div className="flex flex-col">
                    <span className="font-semibold">MP4</span>
                    <span className="text-xs text-muted-foreground">Most compatible format</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('MOV')}>
                  <div className="flex flex-col">
                    <span className="font-semibold">MOV</span>
                    <span className="text-xs text-muted-foreground">High quality, larger file</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('WebM')}>
                  <div className="flex flex-col">
                    <span className="font-semibold">WebM</span>
                    <span className="text-xs text-muted-foreground">Web optimized</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
