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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { Download, Settings, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface VideoPlayerDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDrawer({ video, open, onOpenChange }: VideoPlayerDrawerProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  if (!video) return null;

  const handleDownload = (format: string) => {
    toast.success(`Downloading video in ${format} format`, {
      description: `${video.title} will be downloaded shortly.`
    });
    // In production, this would trigger actual download
    console.log(`Downloading ${video.videoUrl} as ${format}`);
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    toast.success('Filters reset to default');
  };

  const videoStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
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
            
            <div className="flex items-center gap-2 ml-4">
              {/* Filters Button */}
              <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Video Filters</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-6 pb-6 space-y-6">
                    {/* Brightness Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Brightness</label>
                        <span className="text-sm text-muted-foreground">{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={(value) => setBrightness(value[0])}
                        min={0}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Contrast Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Contrast</label>
                        <span className="text-sm text-muted-foreground">{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={(value) => setContrast(value[0])}
                        min={0}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Saturation Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Saturation</label>
                        <span className="text-sm text-muted-foreground">{saturation}%</span>
                      </div>
                      <Slider
                        value={[saturation]}
                        onValueChange={(value) => setSaturation(value[0])}
                        min={0}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Reset Button */}
                    <Button
                      variant="outline"
                      onClick={handleResetFilters}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>

              {/* Download Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm">
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
              style={videoStyle}
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
