import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface Category {
  id: number;
  title: string;
  icon: LucideIcon;
  count: string;
  gradient: string;
}

interface CategoriesSectionProps {
  title: string;
  description: string;
  categories: Category[];
}

export const CategoriesSection = ({ title, description, categories }: CategoriesSectionProps) => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold mb-1 text-sm">{category.title}</h3>
                <p className="text-xs text-muted-foreground">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/videos">Explore Templates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
