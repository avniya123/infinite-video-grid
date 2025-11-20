import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Star } from "lucide-react";

interface Deal {
  id: number;
  title: string;
  originalPrice: string;
  discountPrice: string;
  discount: string;
  image: string;
  timeLeft: string;
  rating: number;
}

const FLASH_DEALS: Deal[] = [
  {
    id: 1,
    title: "Birthday Celebration Pack",
    originalPrice: "₹999",
    discountPrice: "₹499",
    discount: "50% OFF",
    image: "/placeholder.svg",
    timeLeft: "2h 30m",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Diwali Special Bundle",
    originalPrice: "₹1499",
    discountPrice: "₹799",
    discount: "47% OFF",
    image: "/placeholder.svg",
    timeLeft: "5h 15m",
    rating: 4.9,
  },
  {
    id: 3,
    title: "Corporate Event Templates",
    originalPrice: "₹1999",
    discountPrice: "₹999",
    discount: "50% OFF",
    image: "/placeholder.svg",
    timeLeft: "1h 45m",
    rating: 4.7,
  },
];

export const FlashDealsSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">⚡ Flash Deals</h2>
            <p className="text-muted-foreground">Limited time offers - grab them before they're gone!</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/videos">View All</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FLASH_DEALS.map((deal) => (
            <Card key={deal.id} className="group hover:shadow-lg transition-all overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                    {deal.discount}
                  </Badge>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Clock className="h-3 w-3 text-destructive" />
                    <span className="text-xs font-medium">{deal.timeLeft}</span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold line-clamp-1">{deal.title}</h3>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{deal.rating}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{deal.discountPrice}</span>
                    <span className="text-sm text-muted-foreground line-through">{deal.originalPrice}</span>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to="/videos">Get Deal</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
