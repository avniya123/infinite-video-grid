import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Template", description: "Review templates" },
  { id: 2, name: "Users", description: "Add shared users" },
  { id: 3, name: "Payment", description: "Choose method" },
  { id: 4, name: "Confirm", description: "Complete order" }
];

export const CheckoutProgress = ({ currentStep }: CheckoutProgressProps) => {
  return (
    <div className="w-full py-6 px-4 bg-gradient-to-r from-background via-muted/10 to-background rounded-xl border border-border/50 shadow-lg mb-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-border/30">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20",
                    isCurrent && "bg-background border-primary text-primary scale-110 shadow-lg",
                    isUpcoming && "bg-muted/50 border-border/50 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-foreground",
                      isCompleted && "text-foreground/80",
                      isUpcoming && "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
