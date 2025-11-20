import { Card as CardType } from "@/components/template-editor/TemplateEditorLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface CardsListProps {
  cards: CardType[];
  activeCard: string | null;
  onSelectCard: (cardId: string) => void;
}

export const CardsList = ({ cards, activeCard, onSelectCard }: CardsListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cards Timeline</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`cursor-pointer transition-all ${
              activeCard === card.id
                ? "ring-2 ring-primary shadow-lg"
                : "hover:shadow-md"
            }`}
            onClick={() => onSelectCard(card.id)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{card.name}</h3>
                {activeCard === card.id && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{card.startTime}s - {card.endTime}s</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {card.layers.slice(0, 3).map((layer) => (
                  <Badge key={layer.id} variant="secondary" className="text-xs">
                    {layer.type}
                  </Badge>
                ))}
                {card.layers.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{card.layers.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
