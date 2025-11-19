import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VideoItem } from '@/types/video';
import { toast } from 'sonner';

export default function EditVideo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [videoData, setVideoData] = useState<VideoItem | null>(null);

  useEffect(() => {
    const data = location.state?.video as VideoItem;
    if (data) {
      setVideoData(data);
      toast.success(`${data.duration} • ${data.category} • ${data.price}`, {
        description: data.title,
      });
    } else {
      toast.error('No video data found');
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!videoData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Edit Video</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Video Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Thumbnail */}
              <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <img
                  src={videoData.image}
                  alt={videoData.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Video Information */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="text-lg font-semibold mt-1">{videoData.title}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duration</label>
                    <p className="text-base font-medium mt-1">{videoData.duration}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="mt-1">
                      <Badge variant="secondary">{videoData.category}</Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resolution</label>
                    <p className="mt-1">
                      <Badge variant="outline">{videoData.resolution}</Badge>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Orientation</label>
                    <p className="mt-1">
                      <Badge variant="outline">{videoData.orientation}</Badge>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Price</label>
                    <p className="text-lg font-bold mt-1 text-primary">{videoData.price}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">MRP</label>
                    <p className="text-base line-through text-muted-foreground mt-1">{videoData.mrp}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Discount</label>
                    <p className="text-base font-semibold text-green-600 mt-1">{videoData.discount}</p>
                  </div>
                </div>

                {videoData.trending && (
                  <div>
                    <Badge className="bg-gradient-to-r from-orange-500 to-pink-500">
                      🔥 Trending
                    </Badge>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
