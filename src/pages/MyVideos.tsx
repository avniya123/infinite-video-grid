import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Search, X, Columns3, List, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { VideoCardSkeleton } from '@/components/VideoCardSkeleton';
import { Header } from '@/components/Header';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ProgressiveImage } from '@/components/ProgressiveImage';
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
type ViewMode = 'masonry' | 'list';

export default function MyVideos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<UserVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VideoStatus>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [columnCount, setColumnCount] = useState(3);

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

  const handleVideoClick = useCallback((video: UserVideo) => {
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
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <Video className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Videos</h1>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search videos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.slice(0, 100))}
              className="pl-10 pr-10 h-10 w-full transition-all duration-200 focus:ring-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('masonry')}
                className="h-8 px-3 transition-all duration-200"
                title="Masonry View"
              >
                <Columns3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3 transition-all duration-200"
                title="List View"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Column Count Slider (only visible in masonry view) */}
            {viewMode === 'masonry' && (
              <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-lg min-w-[180px]">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Columns: {columnCount}</span>
                <Slider
                  value={[columnCount]}
                  onValueChange={(value) => setColumnCount(value[0])}
                  min={2}
                  max={4}
                  step={1}
                  className="w-24"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status Filters */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as VideoStatus)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                {getStatusCount('all')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                {getStatusCount('completed')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="generating" className="flex items-center gap-2">
              Generating
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                {getStatusCount('generating')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                {getStatusCount('pending')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              Failed
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                {getStatusCount('failed')}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Video Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className={`grid gap-5 ${viewMode === 'masonry' ? '[column-fill:balance]' : 'grid-cols-1'}`}
            style={viewMode === 'masonry' ? { columnCount } : undefined}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={`skeleton-${i}`} index={i} />
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
          <>
            {/* Masonry Layout */}
            {viewMode === 'masonry' && (
              <div 
                className="gap-5 [column-fill:balance]"
                style={{ columnCount }}
              >
                {filteredVideos.map((video, index) => (
                  <div 
                    key={video.id}
                    className="animate-fade-in mb-5 break-inside-avoid"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 bg-card"
                      onClick={() => handleVideoClick(video)}
                    >
                      <AspectRatio ratio={video.variation.aspect_ratio === '16:9' ? 16/9 : video.variation.aspect_ratio === '9:16' ? 9/16 : 1}>
                        {video.variation.thumbnail_url ? (
                          <ProgressiveImage
                            src={video.variation.thumbnail_url}
                            alt={video.custom_title || video.variation.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Video className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2 z-10">
                          {getStatusBadge(getVideoStatus(video))}
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                            <Play className="h-8 w-8" fill="currentColor" />
                          </div>
                        </div>
                      </AspectRatio>

                      {/* Video Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          {video.custom_title || video.variation.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {video.variation.aspect_ratio}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {video.variation.duration}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* List Layout */}
            {viewMode === 'list' && (
              <div className="flex flex-col gap-4">
                {filteredVideos.map((video, index) => (
                  <div 
                    key={video.id} 
                    className="group flex flex-col md:flex-row gap-4 bg-card p-4 rounded-lg shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="relative w-full md:w-64 flex-shrink-0 rounded-lg overflow-hidden">
                      {video.variation.thumbnail_url ? (
                        <img
                          src={video.variation.thumbnail_url}
                          alt={video.custom_title || video.variation.title}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-muted">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                          <Play className="h-6 w-6" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(getVideoStatus(video))}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {video.custom_title || video.variation.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className="text-xs">
                            {video.variation.aspect_ratio}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {video.variation.duration}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(video.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

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
