import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoItem } from "@/types/video";
import { ShoppingCart, Edit, Share2, Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";

interface VideoVariation {
  id: string;
  thumbnail: string;
  duration: string;
  aspectRatio: string;
  quality: string;
  platforms: string[];
}

interface VariationsDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockVariations: VideoVariation[] = [
  {
    id: "1",
    thumbnail: "",
    duration: "Teaser 30 SEC",
    aspectRatio: "LandScape 16:9",
    quality: "",
    platforms: ["Youtube", "Facebook"]
  },
  {
    id: "2",
    thumbnail: "",
    duration: "Teaser 10 SEC",
    aspectRatio: "Portrait 9:16",
    quality: "",
    platforms: ["Reels", "Instamgram"]
  },
  {
    id: "3",
    thumbnail: "",
    duration: "30 SEC",
    aspectRatio: "16:9",
    quality: "Full hd",
    platforms: ["Youtube", "Facebook", "Instamgram"]
  },
  {
    id: "4",
    thumbnail: "",
    duration: "30 SEC",
    aspectRatio: "16:9",
    quality: "Full hd",
    platforms: ["Youtube", "Facebook", "Instamgram"]
  },
  {
    id: "5",
    thumbnail: "",
    duration: "30 SEC",
    aspectRatio: "Full hd",
    quality: "16:9",
    platforms: ["Youtube", "Facebook", "Instamgram"]
  },
  {
    id: "6",
    thumbnail: "",
    duration: "30 SEC",
    aspectRatio: "16:9",
    quality: "Full hd",
    platforms: ["Youtube", "Facebook", "Instamgram"]
  },
  {
    id: "7",
    thumbnail: "",
    duration: "30 SEC",
    aspectRatio: "16:9",
    quality: "",
    platforms: []
  }
];

export const VariationsDrawer = ({ video, open, onOpenChange }: VariationsDrawerProps) => {
  const [variations] = useState<VideoVariation[]>(mockVariations);

  if (!video) return null;

  const handleShare = (variationId: string) => {
    console.log("Share variation:", variationId);
  };

  const handlePlay = (variationId: string) => {
    console.log("Play variation:", variationId);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl">Template Variations Details</SheetTitle>
          <p className="text-sm text-muted-foreground">Template Variations list informations</p>
        </SheetHeader>

        <div className="px-6 space-y-6">
          {/* Video Player */}
          <div className="w-full rounded-lg overflow-hidden bg-muted">
            <AspectRatio ratio={16 / 9}>
              <video
                src={video.videoUrl}
                poster={video.image}
                controls
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>

          {/* Video Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">₹ {video.price}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Teaser 30 SEC
              </Badge>
              <Badge variant="outline" className="text-xs">
                Standred
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="line-through">MRP: ₹ {video.mrp}</span>
                <span className="text-destructive font-medium">( {video.discount} Off )</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                <ShoppingCart className="h-4 w-4" />
                Share Cart
              </Button>
              <Button className="flex-1 gap-2">
                <Edit className="h-4 w-4" />
                Edit Template
              </Button>
            </div>
          </div>

          {/* Variations List */}
          <div className="space-y-3 pb-6">
            {variations.map((variation) => (
              <div
                key={variation.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={video.image}
                    alt={variation.duration}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Variation Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-medium">{variation.duration}</span>
                    {variation.aspectRatio && (
                      <span className="text-muted-foreground">{variation.aspectRatio}</span>
                    )}
                    {variation.quality && (
                      <span className="text-muted-foreground">{variation.quality}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {variation.platforms.map((platform) => (
                      <Badge
                        key={platform}
                        variant="secondary"
                        className="text-xs px-2 py-0"
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleShare(variation.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handlePlay(variation.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
