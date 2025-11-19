import { useState } from "react";
import { Card as CardType } from "./TemplateEditorLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Image, Video, Music, Type } from "lucide-react";
import { ImageLayerEditor } from "./ImageLayerEditor";
import { VideoLayerEditor } from "./VideoLayerEditor";
import { AudioLayerEditor } from "./AudioLayerEditor";
import { TextLayerEditor } from "./TextLayerEditor";

interface TemplateCardProps {
  card: CardType;
}

export const TemplateCard = ({ card }: TemplateCardProps) => {
  const [activeLayer, setActiveLayer] = useState(card.layers[0]?.id);

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      case "text":
        return <Type className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderLayerEditor = (layer: any) => {
    switch (layer.type) {
      case "image":
        return <ImageLayerEditor layer={layer} />;
      case "video":
        return <VideoLayerEditor layer={layer} />;
      case "audio":
        return <AudioLayerEditor layer={layer} />;
      case "text":
        return <TextLayerEditor layer={layer} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{card.name} [Card View]</h2>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-4">Layers Editable</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {card.layers.map((layer) => (
            <div
              key={layer.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                activeLayer === layer.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-muted/30 hover:border-primary/50"
              }`}
              onClick={() => setActiveLayer(layer.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                {getLayerIcon(layer.type)}
                <span className="font-medium text-sm">{layer.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {layer.type}
              </Badge>
              {layer.required && (
                <p className="text-xs text-destructive mt-2">Required</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Layer Editor */}
      <div className="border-t pt-6">
        {card.layers
          .filter((layer) => layer.id === activeLayer)
          .map((layer) => (
            <div key={layer.id}>{renderLayerEditor(layer)}</div>
          ))}
      </div>
    </div>
  );
};
