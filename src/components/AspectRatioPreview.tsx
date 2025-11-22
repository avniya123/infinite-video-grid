import { useState, useRef, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Monitor, Smartphone, Square, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AspectRatioOption {
  label: string;
  ratio: string;
  numeric: number;
  icon: typeof Monitor;
  platforms: string[];
}

const aspectRatioOptions: AspectRatioOption[] = [
  { 
    label: "Landscape", 
    ratio: "16:9", 
    numeric: 16/9, 
    icon: Monitor,
    platforms: ["YouTube", "Facebook", "Twitter"]
  },
  { 
    label: "Portrait", 
    ratio: "9:16", 
    numeric: 9/16, 
    icon: Smartphone,
    platforms: ["Instagram Reels", "TikTok", "YouTube Shorts"]
  },
  { 
    label: "Square", 
    ratio: "1:1", 
    numeric: 1, 
    icon: Square,
    platforms: ["Instagram Feed", "Facebook", "LinkedIn"]
  },
  { 
    label: "Widescreen", 
    ratio: "21:9", 
    numeric: 21/9, 
    icon: Monitor,
    platforms: ["Cinematic", "Presentations"]
  },
  { 
    label: "Standard", 
    ratio: "4:3", 
    numeric: 4/3, 
    icon: Monitor,
    platforms: ["Classic Video", "Presentations"]
  },
];

interface AspectRatioPreviewProps {
  videoUrl: string;
  thumbnailUrl?: string;
  currentAspectRatio?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ratio: string) => void;
}

export const AspectRatioPreview = ({
  videoUrl,
  thumbnailUrl,
  currentAspectRatio = "16:9",
  open,
  onOpenChange,
  onSelect,
}: AspectRatioPreviewProps) => {
  const [selectedRatio, setSelectedRatio] = useState(currentAspectRatio);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    setSelectedRatio(currentAspectRatio);
  }, [currentAspectRatio]);

  const handleRatioSelect = (ratio: string) => {
    setSelectedRatio(ratio);
    // Play video in selected ratio
    const videoRef = videoRefs.current[ratio];
    if (videoRef) {
      videoRef.play();
      setIsPlaying(true);
    }
  };

  const handleApply = () => {
    onSelect(selectedRatio);
    onOpenChange(false);
  };

  const selectedOption = aspectRatioOptions.find(opt => opt.ratio === selectedRatio);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Preview Aspect Ratios</DialogTitle>
          <DialogDescription>
            Select an aspect ratio to see how your video will look on different platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Large Preview of Selected Ratio */}
          {selectedOption && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <selectedOption.icon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedOption.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedOption.ratio} aspect ratio
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {selectedOption.platforms.map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              <Card className="p-4 bg-muted/30">
                <div className="max-w-3xl mx-auto">
                  <AspectRatio ratio={selectedOption.numeric}>
                    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                      <video
                        ref={(ref) => {
                          videoRefs.current[selectedOption.ratio] = ref;
                        }}
                        src={videoUrl}
                        poster={thumbnailUrl}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                        controls
                      />
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-black/60 text-white backdrop-blur-sm">
                          {selectedOption.ratio}
                        </Badge>
                      </div>
                    </div>
                  </AspectRatio>
                </div>
              </Card>
            </div>
          )}

          {/* Grid of All Aspect Ratios */}
          <div>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
              Select Aspect Ratio
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {aspectRatioOptions.map((option) => {
                const isSelected = selectedRatio === option.ratio;
                const Icon = option.icon;

                return (
                  <Card
                    key={option.ratio}
                    className={`relative cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "ring-2 ring-primary shadow-lg bg-primary/5"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleRatioSelect(option.ratio)}
                  >
                    <div className="p-3 space-y-2">
                      {/* Selected Check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}

                      {/* Preview */}
                      <AspectRatio ratio={option.numeric}>
                        <div className="relative w-full h-full bg-muted rounded overflow-hidden">
                          <video
                            ref={(ref) => {
                              videoRefs.current[option.ratio] = ref;
                            }}
                            src={videoUrl}
                            poster={thumbnailUrl}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                        </div>
                      </AspectRatio>

                      {/* Label */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="font-semibold text-xs">{option.label}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {option.ratio}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              Apply {selectedRatio}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
