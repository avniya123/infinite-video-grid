import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

export function VideoCardSkeleton({ aspectRatio = 16 / 9 }) {
  return (
    <article className="relative overflow-hidden rounded-lg bg-card shadow-[var(--shadow-card)] break-inside-avoid mb-5 animate-fade-in">
      <AspectRatio ratio={aspectRatio}>
        <div className="relative w-full h-full">
          {/* Image Skeleton with shimmer */}
          <Skeleton className="w-full h-full bg-muted/60" />
          
          {/* Bottom Overlay Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-3 space-y-2">
            {/* Title Skeleton */}
            <Skeleton className="h-4 w-3/4 bg-white/30" />
            
            {/* Metadata Row Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 bg-white/30 rounded-full" />
                <Skeleton className="h-5 w-20 bg-white/30 rounded-full" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-3 w-16 bg-white/30" />
                <Skeleton className="h-4 w-12 bg-white/30 font-semibold" />
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </article>
  );
}
