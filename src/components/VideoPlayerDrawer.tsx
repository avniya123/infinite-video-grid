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
import { useState } from 'react';
import { ShareButton } from '@/components/ShareButton';

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
      <SheetContent side="right" className="w-full sm:w-[650px] md:w-[750px] lg:w-[900px] p-0 overflow-y-auto">
        {/* Video Player Section */}
        <div className="relative bg-black">
          <AspectRatio ratio={16 / 9} className="bg-black">
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

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Title and Action Buttons */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  {video.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {video.trending && (
                    <Badge className="bg-trending text-trending-foreground">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  <Badge variant="secondary">{video.category}</Badge>
                  <Badge variant="outline">{video.resolution}</Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Video
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => handleDownload('MP4')}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">MP4 Format</span>
                      <span className="text-xs text-muted-foreground">Most compatible, recommended</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('MOV')}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">MOV Format</span>
                      <span className="text-xs text-muted-foreground">High quality, larger file size</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload('WebM')}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold">WebM Format</span>
                      <span className="text-xs text-muted-foreground">Web optimized, smaller size</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Video Filters
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Adjust Video Filters</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-6 pb-8 space-y-6">
                    {/* Brightness Control */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Brightness</label>
                        <span className="text-sm font-semibold text-primary">{brightness}%</span>
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Contrast</label>
                        <span className="text-sm font-semibold text-primary">{contrast}%</span>
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Saturation</label>
                        <span className="text-sm font-semibold text-primary">{saturation}%</span>
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
                      className="w-full gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset All Filters
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>

              <ShareButton video={video} variant="outline" size="default" />
            </div>
          </div>

          <Separator />

          {/* Video Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Video Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Duration</p>
                  <p className="font-semibold text-foreground truncate">{video.duration}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Maximize2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Orientation</p>
                  <p className="font-semibold text-foreground truncate">{video.orientation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Play className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Resolution</p>
                  <p className="font-semibold text-foreground truncate">{video.resolution}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Tag className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                  <p className="font-semibold text-foreground truncate">{video.category}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Pricing</h3>
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <div className="flex items-end justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Regular Price</p>
                  <p className="text-2xl font-light text-muted-foreground line-through">
                    ${video.mrp}
                  </p>
                </div>
                <Badge className="bg-discount text-discount-foreground px-3 py-1 text-sm">
                  {video.discount}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Price</p>
                <p className="text-4xl font-bold text-primary">
                  ${video.price}
                </p>
              </div>
              <Button className="w-full mt-4" size="lg">
                Purchase License
              </Button>
            </div>
          </div>

          {/* License Information */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">License:</strong> Standard royalty-free license. 
              Use in unlimited projects. No attribution required.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
