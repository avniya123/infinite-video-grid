import { VideoItem } from '@/types/video';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, Maximize2, Monitor } from 'lucide-react';

interface PublishConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: VideoItem;
  onConfirm: () => void;
}

export function PublishConfirmDialog({ open, onOpenChange, video, onConfirm }: PublishConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">Publish Template</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Review your template details before publishing
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Template Image */}
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
            <img 
              src={video.image} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Template Details */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Template Title</h3>
              <p className="text-sm text-muted-foreground">
                {video.title.replace(/\s*-\s*Stock Video #\d+.*$/i, '')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Duration</p>
                  <p className="text-sm font-semibold text-foreground">{video.duration}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Maximize2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Orientation</p>
                  <p className="text-sm font-semibold text-foreground">{video.orientation}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Resolution</p>
                  <p className="text-sm font-semibold text-foreground">{video.resolution}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="h-4 w-4 flex items-center justify-center mt-0.5">
                  <span className="text-lg">₹</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Price</p>
                  <p className="text-sm font-semibold text-foreground">₹{video.price}</p>
                </div>
              </div>
            </div>

            {video.category && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Category</p>
                <Badge variant="secondary" className="text-xs">
                  {video.category}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Publish Template
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
