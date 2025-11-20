import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Header } from '@/components/Header';
import { FilterDrawer } from '@/components/FilterDrawer';
import { VariationsDrawer } from '@/components/VariationsDrawer';
import { AuthDrawer } from '@/components/AuthDrawer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { VideoItem } from '@/types/video';
import { fetchVideos } from '@/utils/mockData';
import { toast } from 'sonner';
import { useVideoFilters } from '@/hooks/useVideoFilters';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { VideoGrid } from '@/features/videos/VideoGrid';
import { VideoListView } from '@/features/videos/VideoListView';
import { VideoHeader } from '@/features/videos/VideoHeader';

const PAGE_SIZE = 12;

type ViewMode = 'masonry' | 'list';

const Index = () => {
  const [searchParams] = useSearchParams();
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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [listVariationsOpen, setListVariationsOpen] = useState<VideoItem | null>(null);
  const [listAuthDrawerOpen, setListAuthDrawerOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const imagesToPreload = filteredVideos.slice(0, 12).map(video => video.image);
  useImagePreloader(imagesToPreload, { 
    enabled: true, 
    preloadDistance: 8 
  });

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      handleMainCategorySelect(category);
    }
  }, [searchParams]);

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
      
      if (result.items.length < PAGE_SIZE) {
        setFinished(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [currentPage, loading, finished]);

  useEffect(() => {
    loadNextPage();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !finished) {
          loadNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loading, finished, loadNextPage]);

  useKeyboardShortcuts({
    onEscape: () => {
      if (drawerOpen) setDrawerOpen(false);
      if (listVariationsOpen) setListVariationsOpen(null);
    },
  });

  const handlePlayVideo = (video: VideoItem, startTime: number = 0) => {
    setSelectedVideo(video);
    setVideoStartTime(startTime);
    setDrawerOpen(true);
  };

  const handleVariationsClick = (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setListVariationsOpen(video);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedMainCategory={selectedMainCategory}
        selectedSubcategory={selectedSubcategory}
        onMainCategorySelect={handleMainCategorySelect}
        onSubcategorySelect={handleSubcategorySelect}
      />

      <VideoHeader
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
        totalResults={filteredVideos.length}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchQuery}
        onSortChange={(sort) => setSortBy(sort as any)}
        onViewModeChange={setViewMode}
        onFilterDrawerOpen={() => setFilterDrawerOpen(true)}
        onResetFilters={handleResetFilters}
      />

      <div className="flex">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {viewMode === 'masonry' ? (
            <VideoGrid 
              videos={filteredVideos}
              loading={loading}
              columnCount={columnCount}
              onPlayVideo={handlePlayVideo}
            />
          ) : (
            <VideoListView 
              videos={filteredVideos}
              onPlayVideo={handlePlayVideo}
              onViewVariations={handleVariationsClick}
              onAuthRequired={() => setListAuthDrawerOpen(true)}
            />
          )}

          <div ref={sentinelRef} className="h-20 flex items-center justify-center">
            {loading && (
              <div className="text-muted-foreground">Loading more templates...</div>
            )}
            {finished && filteredVideos.length > 0 && (
              <div className="text-muted-foreground">No more templates</div>
            )}
          </div>

          {!loading && filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-primary hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      <VideoPlayerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        video={selectedVideo}
        startTime={videoStartTime}
      />

      <FilterDrawer
        selectedMainCategory={selectedMainCategory}
        selectedSubcategory={selectedSubcategory}
        selectedDurations={selectedDurations}
        selectedAspectRatios={selectedAspectRatios}
        selectedPriceRanges={selectedPriceRanges}
        hasActiveFilters={hasActiveFilters}
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
      />

      {listVariationsOpen && (
        <VariationsDrawer
          video={listVariationsOpen}
          open={!!listVariationsOpen}
          onOpenChange={(open) => !open && setListVariationsOpen(null)}
          onRequestAuth={() => setListAuthDrawerOpen(true)}
        />
      )}

      <AuthDrawer
        open={listAuthDrawerOpen}
        onOpenChange={setListAuthDrawerOpen}
      />

      <ScrollToTop />
    </div>
  );
};

export default Index;
