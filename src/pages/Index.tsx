import { useEffect, useRef, useState, useCallback } from 'react';
import { VideoCard } from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/VideoCardSkeleton';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Header } from '@/components/Header';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FilterChips } from '@/components/FilterChips';
import { FilterDrawer } from '@/components/FilterDrawer';
import { VariationsDrawer } from '@/components/VariationsDrawer';
import { AuthDrawer } from '@/components/AuthDrawer';
import { ArrowUpDown, ChevronDown, List, Columns3, Search, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ShareButton } from '@/components/ShareButton';
import { VideoItem, VideoCategory } from '@/types/video';
import { fetchVideos } from '@/utils/mockData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useVideoFilters } from '@/hooks/useVideoFilters';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useImagePreloader } from '@/hooks/useImagePreloader';

const PAGE_SIZE = 8;

const sortOptions: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

type ViewMode = 'masonry' | 'list';

const Index = () => {
  // State
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [columnCount, setColumnCount] = useState(3);
  const [listVariationsOpen, setListVariationsOpen] = useState<string | null>(null);
  const [listAuthDrawerOpen, setListAuthDrawerOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Use custom filter hook
  const {
    selectedCategories,
    selectedDurations,
    selectedAspectRatios,
    selectedPriceRanges,
    selectedSubcategory,
    selectedMainCategory,
    searchQuery,
    sortBy,
    filteredVideos,
    hasActiveFilters,
    setSearchQuery,
    setSortBy,
    handleCategoryToggle,
    handleDurationToggle,
    handleAspectRatioToggle,
    handlePriceRangeToggle,
    handleSubcategorySelect,
    handleMainCategorySelect,
    handleSelectAllCategories,
    handleClearCategories,
    handleSelectAllDurations,
    handleClearDurations,
    handleSelectAllAspectRatios,
    handleClearAspectRatios,
    handleSelectAllPriceRanges,
    handleClearPriceRanges,
    handleResetFilters,
  } = useVideoFilters(videos);

  // Preload images for smoother scrolling - optimized
  const imagesToPreload = filteredVideos.slice(0, 6).map(video => video.image);
  useImagePreloader(imagesToPreload, { 
    enabled: true, 
    preloadDistance: 4 
  });

  // Load next page of videos
  const loadNextPage = useCallback(async () => {
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

      if (result.total && videos.length + result.items.length >= result.total) {
        setFinished(true);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, finished, currentPage, videos.length]);

  // Initial load
  useEffect(() => {
    loadNextPage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll observer
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
  }, [loading, finished, loadNextPage]);

  // Event handlers
  const handlePlayVideo = useCallback((video: VideoItem, seekTime?: number) => {
    setSelectedVideo(video);
    setVideoStartTime(seekTime || 0);
    setDrawerOpen(true);
  }, []);

  const handleDrawerChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      setVideoStartTime(0); // Reset seek time when closing
    }
  }, []);

  const handleVideoClick = useCallback((video: VideoItem) => {
    toast.info(`${video.title}`, {
      description: `${video.duration} • ${video.category} • ${video.price}`,
    });
  }, []);

  // Navigate between videos with arrow keys
  const navigateToVideo = useCallback((direction: 'prev' | 'next') => {
    if (!selectedVideo || !drawerOpen) return;
    
    const currentIndex = filteredVideos.findIndex(v => v.id === selectedVideo.id);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(filteredVideos.length - 1, currentIndex + 1);
    
    if (newIndex !== currentIndex) {
      setSelectedVideo(filteredVideos[newIndex]);
      setVideoStartTime(0);
    }
  }, [selectedVideo, drawerOpen, filteredVideos]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEscape: () => {
      if (drawerOpen) {
        handleDrawerChange(false);
      }
    },
    onArrowLeft: () => navigateToVideo('prev'),
    onArrowRight: () => navigateToVideo('next'),
    enabled: true,
  });

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <Header 
        selectedSubcategory={selectedSubcategory}
        selectedMainCategory={selectedMainCategory}
        onSubcategorySelect={handleSubcategorySelect}
        onMainCategorySelect={handleMainCategorySelect}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
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
              className="pl-10 pr-4 h-10 w-full transition-all duration-200 focus:ring-2"
            />

          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 whitespace-nowrap transition-all duration-200 hover:scale-105"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            
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
                  max={6}
                  step={1}
                  className="w-24"
                />
              </div>
            )}
          </div>
        </div>

        {/* Sort and Filters */}
        <div className="flex gap-3 items-center flex-wrap">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-2 hover:bg-accent transition-all duration-200">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
              <DropdownMenuLabel className="font-semibold">Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`cursor-pointer transition-colors ${sortBy === option.value ? 'bg-accent' : ''}`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Drawer */}
          <FilterDrawer
            selectedMainCategory={selectedMainCategory}
            selectedSubcategory={selectedSubcategory}
            selectedDurations={selectedDurations}
            selectedAspectRatios={selectedAspectRatios}
            selectedPriceRanges={selectedPriceRanges}
            onMainCategorySelect={handleMainCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            onDurationToggle={handleDurationToggle}
            onAspectRatioToggle={handleAspectRatioToggle}
            onPriceRangeToggle={handlePriceRangeToggle}
            onSelectAllDurations={handleSelectAllDurations}
            onClearDurations={handleClearDurations}
            onSelectAllAspectRatios={handleSelectAllAspectRatios}
            onClearAspectRatios={handleClearAspectRatios}
            onSelectAllPriceRanges={handleSelectAllPriceRanges}
            onClearPriceRanges={handleClearPriceRanges}
            onResetFilters={handleResetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <FilterChips
            selectedMainCategory={selectedMainCategory}
            selectedSubcategory={selectedSubcategory}
            selectedDurations={selectedDurations}
            selectedAspectRatios={selectedAspectRatios}
            selectedPriceRanges={selectedPriceRanges}
            searchQuery={searchQuery}
            onMainCategorySelect={handleMainCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            onDurationToggle={handleDurationToggle}
            onAspectRatioToggle={handleAspectRatioToggle}
            onPriceRangeToggle={handlePriceRangeToggle}
            onClearSearch={() => setSearchQuery('')}
          />
        )}

      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Masonry Layout */}
        {viewMode === 'masonry' && (
          <div 
            className="gap-5 [column-fill:balance]"
            style={{ columnCount }}
          >
            {filteredVideos.map((video, index) => (
              <div 
                key={video.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <VideoCard
                  video={video}
                  onPlay={handlePlayVideo}
                  onClick={handleVideoClick}
                />
              </div>
            ))}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <VideoCardSkeleton key={`skeleton-masonry-${i}`} index={i} />
            ))}
          </div>
        )}
        
        {/* List Layout */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {filteredVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="group flex gap-4 bg-card p-4 rounded-lg shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleVideoClick(video)}
              >
                <div className="relative w-64 flex-shrink-0">
                  <img
                    src={video.image}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setListVariationsOpen(video.id.toString());
                    }}
                    className="absolute bottom-2 right-2 gap-1.5 bg-background/95 backdrop-blur-sm hover:bg-background transition-all duration-200 hover:scale-110"
                  >
                    <List className="h-3.5 w-3.5" />
                    Variations
                  </Button>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {video.duration} • {video.category} • {video.orientation} • {video.resolution}
                      </p>
                    </div>
                    {/* Share Button - visible on hover */}
                    <div 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ShareButton video={video} variant="outline" size="icon" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-xl font-bold text-primary">${video.price}</span>
                    <span className="text-sm text-muted-foreground line-through">${video.mrp}</span>
                    <span className="text-sm text-discount font-semibold">{video.discount}</span>
                    {video.trending && (
                      <span className="ml-2 px-2 py-0.5 bg-trending text-trending-foreground text-xs font-semibold rounded">
                        TRENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && Array.from({ length: 2 }).map((_, i) => (
              <VideoCardSkeleton key={`skeleton-list-${i}`} index={i} />
            ))}
          </div>
        )}

        {/* Variations Drawer for List View */}
        {listVariationsOpen && (
          <VariationsDrawer
            video={filteredVideos.find(v => v.id.toString() === listVariationsOpen)!}
            open={!!listVariationsOpen}
            onOpenChange={(open) => !open && setListVariationsOpen(null)}
            onRequestAuth={() => setListAuthDrawerOpen(true)}
          />
        )}

        {/* Auth Drawer for List View */}
        <AuthDrawer 
          open={listAuthDrawerOpen} 
          onOpenChange={setListAuthDrawerOpen} 
        />

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
          <div className="py-8 text-center text-muted-foreground animate-fade-in">
            {filteredVideos.length > 0 ? (
              <>
                <p className="font-medium">No more videos</p>
                <p className="text-sm mt-1">
                  {selectedCategories.length === 0 
                    ? `Showing all ${total} items` 
                    : `Showing ${filteredVideos.length} filtered videos`}
                </p>
              </>
            ) : (
              <p>No videos match your filters</p>
            )}
          </div>
        )}
      </main>

      <VideoPlayerDrawer
        video={selectedVideo}
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        startTime={videoStartTime}
      />

      <ScrollToTop />
    </div>
  );
};

export default Index;
