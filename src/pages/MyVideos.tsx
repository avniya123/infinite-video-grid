import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import type { VideoItem } from '@/types/video';

interface UserVideo {
  id: string;
  variation_id: string;
  custom_title: string | null;
  published: boolean | null;
  created_at: string;
  variation: {
    id: string;
    title: string;
    duration: string;
    aspect_ratio: string;
    thumbnail_url: string | null;
    video_url: string | null;
    video_id: number;
  };
}

type VideoStatus = 'all' | 'completed' | 'generating' | 'pending' | 'failed';

export default function MyVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VideoStatus>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    checkAuthAndLoadVideos();
  }, []);

  const checkAuthAndLoadVideos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to view your videos');
        navigate('/videos');
        return;
      }

      await loadVideos(session.user.id);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_templates')
      .select(`
        id,
        variation_id,
        custom_title,
        published,
        created_at,
        variation:video_variations (
          id,
          title,
          duration,
          aspect_ratio,
          thumbnail_url,
          video_url,
          video_id
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
      return;
    }

    setVideos(data as any || []);
  };

  const getVideoStatus = (video: UserVideo): VideoStatus => {
    // Derive status from existing data
    if (!video.variation.video_url && !video.variation.thumbnail_url) {
      return 'generating';
    }
    if (video.published) {
      return 'completed';
    }
    if (!video.published && video.variation.video_url) {
      return 'pending';
    }
    return 'failed';
  };

  const getStatusBadge = (status: VideoStatus) => {
    const badges = {
      completed: <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>,
      generating: <Badge className="bg-blue-500 hover:bg-blue-600">Generating</Badge>,
      pending: <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>,
      failed: <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>,
      all: null
    };
    return badges[status];
  };

  const getStatusCount = (status: VideoStatus) => {
    if (status === 'all') return videos.length;
    return videos.filter(v => getVideoStatus(v) === status).length;
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchQuery === '' || 
      (video.custom_title || video.variation.title).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || getVideoStatus(video) === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleVideoClick = (video: UserVideo) => {
    // Convert to VideoItem format for player
    const videoItem: VideoItem = {
      id: video.variation.video_id,
      title: video.custom_title || video.variation.title,
      duration: video.variation.duration,
      price: '0',
      mrp: '0',
      discount: '0',
      orientation: video.variation.aspect_ratio === '16:9' ? 'Landscape' : 
                   video.variation.aspect_ratio === '9:16' ? 'Portrait' : 'Square',
      trending: false,
      image: video.variation.thumbnail_url || '/placeholder.svg',
      videoUrl: video.variation.video_url || undefined,
      aspectRatio: video.variation.aspect_ratio === '16:9' ? 16/9 : 
                   video.variation.aspect_ratio === '9:16' ? 9/16 : 1,
      category: 'All',
      resolution: 'HD',
      mainCategory: 'Personal Celebrations',
      subcategory: ''
    };
    
    setSelectedVideo(videoItem);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/videos')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">My Videos</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-6">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VideoStatus)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all" className="relative">
              All
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
                {getStatusCount('all')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Completed
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
                {getStatusCount('completed')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="generating" className="relative">
              Generating
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
                {getStatusCount('generating')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
                {getStatusCount('pending')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="failed" className="relative">
              Failed
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
                {getStatusCount('failed')}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search' : 'Start creating videos from templates'}
                </p>
                <Button onClick={() => navigate('/videos')}>
                  Browse Templates
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <Card 
                    key={video.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative aspect-video bg-muted">
                      {video.variation.thumbnail_url ? (
                        <img
                          src={video.variation.thumbnail_url}
                          alt={video.custom_title || video.variation.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(getVideoStatus(video))}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.variation.duration}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-2">
                        {video.custom_title || video.variation.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {video.variation.aspect_ratio}
                        </Badge>
                        <span className="text-xs">
                          {new Date(video.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Video Player Drawer */}
      <VideoPlayerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        video={selectedVideo}
        startTime={0}
      />
    </div>
  );
}
