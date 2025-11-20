import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
          
          <div className="relative z-10 text-center py-16 px-4">
            <Sparkles className="h-12 w-12 mx-auto mb-6 text-primary-foreground" />
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Ready to Create Amazing Videos?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust our platform for their video needs.
              Start creating professional videos today!
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/videos">
                Start Creating Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
