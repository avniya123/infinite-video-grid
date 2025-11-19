import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TemplateCard } from "./TemplateCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TemplateEditorLayoutProps {
  variationId?: string;
}

export interface Layer {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "text";
  required: boolean;
  content?: any;
}

export interface Card {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  required: boolean;
  layers: Layer[];
}

export const TemplateEditorLayout = ({ variationId }: TemplateEditorLayoutProps) => {
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<string>("card-1");
  
  // Sample template data
  const [cards] = useState<Card[]>([
    {
      id: "card-1",
      name: "Card 01",
      startTime: 1,
      endTime: 120,
      duration: 5,
      required: true,
      layers: [
        { id: "layer-1", name: "Layer Name 01", type: "image", required: true },
        { id: "layer-2", name: "Layer Name 02", type: "video", required: true },
        { id: "layer-3", name: "Layer Name 03", type: "audio", required: true },
        { id: "layer-4", name: "Layer Name 04", type: "text", required: true },
      ],
    },
    {
      id: "card-2",
      name: "Card 02",
      startTime: 120,
      endTime: 240,
      duration: 5,
      required: true,
      layers: [
        { id: "layer-5", name: "Layer Name 01", type: "image", required: true },
        { id: "layer-6", name: "Layer Name 02", type: "video", required: true },
        { id: "layer-7", name: "Layer Name 03", type: "audio", required: true },
        { id: "layer-8", name: "Layer Name 04", type: "text", required: true },
      ],
    },
    {
      id: "card-3",
      name: "Card 03",
      startTime: 240,
      endTime: 360,
      duration: 5,
      required: true,
      layers: [
        { id: "layer-9", name: "Layer Name 01", type: "image", required: true },
        { id: "layer-10", name: "Layer Name 02", type: "video", required: true },
        { id: "layer-11", name: "Layer Name 03", type: "audio", required: true },
        { id: "layer-12", name: "Layer Name 04", type: "text", required: true },
      ],
    },
    {
      id: "card-4",
      name: "Card 04",
      startTime: 360,
      endTime: 480,
      duration: 5,
      required: true,
      layers: [
        { id: "layer-13", name: "Layer Name 01", type: "image", required: true },
        { id: "layer-14", name: "Layer Name 02", type: "video", required: true },
        { id: "layer-15", name: "Layer Name 03", type: "audio", required: true },
        { id: "layer-16", name: "Layer Name 04", type: "text", required: true },
      ],
    },
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Template Design 000001</h1>
                <p className="text-sm text-muted-foreground">Video Generate - Editable Cards</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Full Preview
              </Button>
              <Button>Save Template</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Compositing / Card Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  activeCard === card.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50"
                }`}
                onClick={() => setActiveCard(card.id)}
              >
                <h3 className="font-semibold mb-2">{card.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  SEC {card.duration} - Start {card.startTime}, End {card.endTime}
                </p>
                <span className="text-xs text-destructive">
                  {card.required && "Required"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Card Editor */}
        <div className="bg-card rounded-lg border p-6">
          {cards
            .filter((card) => card.id === activeCard)
            .map((card) => (
              <TemplateCard key={card.id} card={card} />
            ))}
        </div>
      </div>
    </div>
  );
};
