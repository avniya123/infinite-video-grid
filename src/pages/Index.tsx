import { useEffect, useRef, useState } from 'react';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { VideoItem, VideoCategory } from '@/types/video';
import { fetchVideos } from '@/utils/mockData';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Briefcase, Building2, Users, LayoutGrid, List, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 8;

const categories: { value: VideoCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'All', label: 'All Videos', icon: null },
  { value: 'Nature', label: 'Nature', icon: <Leaf className="w-4 h-4" /> },
  { value: 'Business', label: 'Business', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'Urban', label: 'Urban', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Lifestyle', label: 'Lifestyle', icon: <Users className="w-4 h-4" /> },
];

type ViewMode = 'masonry' | 'grid' | 'list';

const Index = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadNextPage = async () => {
    if (loading || finished) return;

    setLoading(true);
    try {
      const result = await fetchVideos(currentPage, PAGE_SIZE);
      
      if (result.items.length === 0) {
        setFinished(true);
        return;
      }

      setVideos(prev => [...prev, ...result.items]);
      setTotal(result.total);
      setCurrentPage(prev => prev + 1);

      // Check if we've loaded everything
      if (result.total && videos.length + result.items.length >= result.total) {
        setFinished(true);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNextPage();
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !finished) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0,
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loading, finished, currentPage]);

  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setDrawerOpen(true);
  };

  const handleVideoClick = (video: VideoItem) => {
    toast.info(`Video Details: ${video.title}`, {
      description: `Duration: ${video.duration} • ${video.orientation} • Price: $${video.price}`,
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category as VideoCategory);
    setVideos([]);
    setCurrentPage(1);
    setFinished(false);
  };

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Professional stock video footage with real thumbnails • Infinite scroll • Click to preview
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('masonry')}
              className="h-8 px-3"
            >
              <Columns3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {category.icon}
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Masonry Layout */}
        {viewMode === 'masonry' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={handlePlayVideo}
                onClick={handleVideoClick}
              />
            ))}
          </div>
        )}
        
        {/* Grid Layout */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={handlePlayVideo}
                onClick={handleVideoClick}
              />
            ))}
          </div>
        )}
        
        {/* List Layout */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {filteredVideos.map((video) => (
              <div key={video.id} className="flex gap-4 bg-card p-4 rounded-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
                <div className="relative w-64 flex-shrink-0">
                  <img
                    src={video.image}
                    alt={video.title}
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                  <div 
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-l-8 border-l-primary border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{video.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-muted rounded text-xs">{video.orientation}</span>
                      <span className="flex items-center gap-1">⏱ {video.duration}</span>
                      {video.trending && (
                        <span className="px-2 py-1 bg-trending text-trending-foreground rounded text-xs font-semibold">TRENDING</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-foreground">${video.price}</span>
                      <span className="text-sm line-through text-muted-foreground">MRP ${video.mrp}</span>
                      <span className="text-sm text-discount-foreground font-bold">{video.discount}</span>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleVideoClick(video)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading Sentinel */}
        {!finished && (
          <div
            ref={sentinelRef}
            className="h-16 flex items-center justify-center text-sm text-muted-foreground mt-8"
          >
            {loading ? 'Loading...' : ''}
          </div>
        )}

        {/* End Message */}
        {finished && (
          <div className="py-8 text-center text-muted-foreground">
            {filteredVideos.length > 0 ? (
              <>
                <p className="font-medium">No more videos</p>
                <p className="text-sm mt-1">
                  {selectedCategory === 'All' 
                    ? `Showing all ${total} items` 
                    : `Showing ${filteredVideos.length} ${selectedCategory} videos`}
                </p>
              </>
            ) : (
              <p>No videos available in this category</p>
            )}
          </div>
        )}
      </main>

      <VideoPlayerDrawer
        video={selectedVideo}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

export default Index;
