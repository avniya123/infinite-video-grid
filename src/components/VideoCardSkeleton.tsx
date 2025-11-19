import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoCardSkeletonProps {
  aspectRatio?: number;
}

export function VideoCardSkeleton({ aspectRatio = 16 / 9 }: VideoCardSkeletonProps) {
  return (
    <article className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-[var(--shadow-card)] break-inside-avoid mb-5 animate-fade-in">
      <AspectRatio ratio={aspectRatio}>
        <div className="relative w-full h-full">
          {/* Main Image Skeleton with enhanced shimmer */}
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
          </div>
          
          {/* Variations Count Badge Skeleton */}
          <div className="absolute top-3 left-3 z-10">
            <Skeleton className="h-6 w-14 rounded bg-gray-300/80 dark:bg-gray-700/80" />
          </div>

          {/* Price Badge Skeleton */}
          <div className="absolute top-3 right-3 z-10">
            <Skeleton className="h-8 w-16 rounded-md bg-gray-300/80 dark:bg-gray-700/80" />
          </div>

          {/* Play Button Skeleton */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Skeleton className="w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90" />
          </div>
          
          {/* Bottom Overlay Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-4 space-y-2">
            {/* Title Skeleton */}
            <Skeleton className="h-3 w-3/4 bg-white/40 dark:bg-white/30" />
            
            {/* Caption Skeleton */}
            <Skeleton className="h-2 w-1/3 bg-white/30 dark:bg-white/20" />
          </div>

          {/* Variations Button Skeleton */}
          <div className="absolute bottom-3 right-3 z-20">
            <Skeleton className="h-8 w-24 rounded bg-gray-900/80 dark:bg-white/80" />
          </div>
        </div>
      </AspectRatio>
    </article>
  );
}
