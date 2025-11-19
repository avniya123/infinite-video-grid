import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = () => (
  <div className="space-y-3 animate-fade-in">
    {Array.from({ length: 5 }).map((_, i) => (
      <div 
        key={i} 
        className="flex items-center gap-4 p-4 rounded-lg border bg-card"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <Skeleton className="h-12 w-12 rounded-full bg-muted/60" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3 bg-muted/60" />
          <Skeleton className="h-3 w-1/2 bg-muted/60" />
        </div>
        <Skeleton className="h-8 w-20 bg-muted/60" />
      </div>
    ))}
  </div>
);

export const GridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="rounded-lg border bg-card p-4 space-y-3 animate-fade-in"
        style={{ animationDelay: `${i * 75}ms` }}
      >
        <Skeleton className="h-40 w-full rounded-md bg-muted/60" />
        <Skeleton className="h-5 w-3/4 bg-muted/60" />
        <Skeleton className="h-3 w-full bg-muted/60" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-full bg-muted/60" />
          <Skeleton className="h-4 w-20 rounded-full bg-muted/60" />
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 4 }) => (
  <div className="space-y-2 animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
        style={{ animationDelay: `${i * 50}ms` }}
      >
        <Skeleton className="h-10 w-10 rounded-md bg-muted/60" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/3 bg-muted/60" />
          <Skeleton className="h-3 w-1/2 bg-muted/60" />
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2" style={{ animationDelay: `${i * 100}ms` }}>
        <Skeleton className="h-4 w-24 bg-muted/60" />
        <Skeleton className="h-10 w-full bg-muted/60 rounded-md" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 w-24 bg-muted/60 rounded-md" />
      <Skeleton className="h-10 w-24 bg-muted/60 rounded-md" />
    </div>
  </div>
);

export const CardContentSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    <Skeleton className="h-6 w-1/3 bg-muted/60" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full bg-muted/60" />
      <Skeleton className="h-4 w-5/6 bg-muted/60" />
      <Skeleton className="h-4 w-4/6 bg-muted/60" />
    </div>
  </div>
);
