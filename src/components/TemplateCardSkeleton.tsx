import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const TemplateCardSkeleton = () => {
  return (
    <div className="group relative p-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm animate-pulse">
      <div className="flex gap-3 items-start">
        <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateDetailsSkeleton = () => {
  return (
    <Card className="p-5 shadow-sm border-border/50 bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-1 w-8 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        <TemplateCardSkeleton />
        <TemplateCardSkeleton />
      </div>
    </Card>
  );
};
