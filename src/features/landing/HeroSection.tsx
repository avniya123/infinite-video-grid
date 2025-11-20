import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/50 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Professional Video Templates</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Create Stunning Videos in{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Minutes
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from thousands of professional templates, customize with ease, and
            export in any format. Perfect for social media, marketing, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/videos">
                Browse Videos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/videos">View Templates</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
