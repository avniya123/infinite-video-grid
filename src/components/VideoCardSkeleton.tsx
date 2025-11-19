import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoCardSkeletonProps {
  aspectRatio?: number;
}

export function VideoCardSkeleton({ aspectRatio = 16 / 9 }: VideoCardSkeletonProps) {
  return (
    <article className="relative overflow-hidden rounded-none bg-card shadow-[var(--shadow-card)] break-inside-avoid mb-5">
      <AspectRatio ratio={aspectRatio}>
        <div className="relative w-full h-full">
          {/* Image Skeleton */}
          <Skeleton className="w-full h-full bg-muted" />
          
          {/* Bottom Overlay Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 py-3">
            {/* Title Skeleton */}
            <Skeleton className="h-4 w-3/4 bg-white/20 mb-2" />
            
            {/* Metadata Row Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 bg-white/20" />
                <Skeleton className="h-5 w-16 bg-white/20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3 w-16 bg-white/20 mb-1" />
                <Skeleton className="h-3 w-12 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </article>
  );
}
