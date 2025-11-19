import { VideoItem } from '@/types/video';
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from '@/components/ui/sheet';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Download, Settings, RotateCcw, Play, Clock, Maximize2, Tag, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { ShareButton } from '@/components/ShareButton';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface VideoPlayerDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTime?: number;
}

export function VideoPlayerDrawer({ video, open, onOpenChange, startTime = 0 }: VideoPlayerDrawerProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Seek to start time when video loads
  useEffect(() => {
    if (videoRef.current && startTime > 0) {
      const handleLoadedMetadata = () => {
        if (videoRef.current && video?.videoUrl) {
          const duration = videoRef.current.duration;
          videoRef.current.currentTime = duration * startTime;
        }
      };
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [startTime, video?.videoUrl]);
  
  if (!video) return null;

  const handleDownload = async (format: string) => {
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadFormat(format);
    
    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setDownloading(false);
            setDownloadProgress(0);
            toast.success(`Video downloaded successfully!`, {
              description: `${video.title} downloaded in ${format} format.`
            });
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // In production, this would trigger actual download with real progress tracking
    console.log(`Downloading ${video.videoUrl} as ${format}`);
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    toast.success('Filters reset to default');
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Keyboard shortcuts for video player
  useKeyboardShortcuts({
    onEscape: () => {
      if (open) {
        onOpenChange(false);
      }
    },
    onSpace: togglePlayPause,
    enabled: open,
  });

  const videoStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[650px] md:w-[700px] p-0 overflow-y-auto">
        {/* Video Player Section */}
        <div className="relative bg-black">
          <AspectRatio ratio={16 / 9} className="bg-black">
            <video
              ref={videoRef}
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
          
          {/* Close Button Overlay */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Download Progress Indicator */}
        {downloading && (
          <div className="sticky top-0 z-50 bg-primary/10 border-b border-primary/20 px-5 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-medium text-foreground">
                  Downloading {downloadFormat} format...
                </span>
              </div>
              <span className="text-xs font-bold text-primary">{downloadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-5 space-y-5">
          {/* Title and Action Buttons */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <h2 className="text-lg font-semibold text-foreground leading-tight">
                  {video.title.split(' - ')[0]}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {video.title.split(' - ')[1] || `Stock Video #${video.id}`}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {video.trending && (
                    <Badge className="bg-trending text-trending-foreground text-[10px] px-1.5 py-0.5">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                      Trending
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">{video.category}</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{video.resolution}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1.5 text-xs h-8" disabled={downloading}>
                    <Download className="w-3.5 h-3.5" />
                    {downloading ? 'Downloading...' : 'Download'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => handleDownload('MP4')}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold">MP4 Format</span>
                      <span className="text-[10px] text-muted-foreground">Most compatible</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('MOV')}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold">MOV Format</span>
                      <span className="text-[10px] text-muted-foreground">High quality</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('WebM')}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold">WebM Format</span>
                      <span className="text-[10px] text-muted-foreground">Web optimized</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Settings className="w-3.5 h-3.5" />
                    Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle className="text-base">Adjust Video Filters</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-6 pb-6 space-y-4">
                    {/* Brightness Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Brightness</label>
                        <span className="text-xs font-semibold text-primary">{brightness}%</span>
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
                        <label className="text-xs font-medium">Contrast</label>
                        <span className="text-xs font-semibold text-primary">{contrast}%</span>
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
                        <label className="text-xs font-medium">Saturation</label>
                        <span className="text-xs font-semibold text-primary">{saturation}%</span>
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

                    <Separator />

                    {/* Reset Button */}
                    <Button
                      variant="outline"
                      onClick={handleResetFilters}
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Filters
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>

              <ShareButton video={video} variant="outline" size="sm" />
            </div>
          </div>

          <Separator />

          {/* Video Specifications - Table Format */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-foreground">Specifications</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground font-medium w-28">Duration</td>
                    <td className="px-3 py-2 text-foreground">{video.duration}</td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground font-medium">Orientation</td>
                    <td className="px-3 py-2 text-foreground">{video.orientation}</td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground font-medium">Resolution</td>
                    <td className="px-3 py-2 text-foreground">{video.resolution}</td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-2 text-muted-foreground font-medium">Category</td>
                    <td className="px-3 py-2 text-foreground">{video.category}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Pricing Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Pricing</h3>
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-end justify-between gap-3 mb-2">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">Regular Price</p>
                  <p className="text-base font-light text-muted-foreground line-through">
                    ${video.mrp}
                  </p>
                </div>
                <Badge className="bg-discount text-discount-foreground px-2 py-0.5 text-[10px]">
                  {video.discount}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Your Price</p>
                <p className="text-2xl font-bold text-primary">
                  ${video.price}
                </p>
              </div>
              <Button className="w-full mt-3" size="sm">
                Purchase License
              </Button>
            </div>
          </div>

          {/* License Information */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-[10px] text-muted-foreground">
              <strong className="text-foreground">License:</strong> Standard royalty-free license. 
              Use in unlimited projects. No attribution required.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
