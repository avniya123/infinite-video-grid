import { useEffect, useRef, useState } from 'react';
import { VideoCard } from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/VideoCardSkeleton';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { VideoItem, VideoCategory } from '@/types/video';
import { fetchVideos } from '@/utils/mockData';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf, Briefcase, Building2, Users, LayoutGrid, List, Columns3, Clock, Search, ChevronDown, X, Filter, DollarSign, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

const PAGE_SIZE = 8;

type DurationFilter = 'All' | 'Teaser' | 'Trailer' | 'Gimbel' | 'Document';
type AspectRatioFilter = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9' | '9:21' | '2:3' | '3:2';
type PriceRangeFilter = 'Under $50' | '$50-$100' | '$100-$200' | 'Over $200';

const categories: { value: VideoCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'All', label: 'All Videos', icon: null },
  { value: 'Nature', label: 'Nature', icon: <Leaf className="w-4 h-4" /> },
  { value: 'Business', label: 'Business', icon: <Briefcase className="w-4 h-4" /> },
  { value: 'Urban', label: 'Urban', icon: <Building2 className="w-4 h-4" /> },
  { value: 'Lifestyle', label: 'Lifestyle', icon: <Users className="w-4 h-4" /> },
];

const durationFilters: { value: DurationFilter; label: string; range: string }[] = [
  { value: 'Teaser', label: 'Teaser', range: '0-1 min' },
  { value: 'Trailer', label: 'Trailer', range: '1-3 min' },
  { value: 'Gimbel', label: 'Gimbel', range: '3-5 min' },
  { value: 'Document', label: 'Document', range: '5+ min' },
];

const aspectRatioFilters: { value: AspectRatioFilter; label: string; category: 'Landscape' | 'Portrait' | 'Square' }[] = [
  { value: '16:9', label: 'Landscape 16:9', category: 'Landscape' },
  { value: '21:9', label: 'Ultrawide 21:9', category: 'Landscape' },
  { value: '4:3', label: 'Standard 4:3', category: 'Landscape' },
  { value: '3:2', label: 'Classic 3:2', category: 'Landscape' },
  { value: '9:16', label: 'Portrait 9:16', category: 'Portrait' },
  { value: '9:21', label: 'Tall 9:21', category: 'Portrait' },
  { value: '3:4', label: 'Portrait 3:4', category: 'Portrait' },
  { value: '2:3', label: 'Portrait 2:3', category: 'Portrait' },
  { value: '1:1', label: 'Square 1:1', category: 'Square' },
];

const priceRangeFilters: { value: PriceRangeFilter; label: string; range: [number, number] }[] = [
  { value: 'Under $50', label: 'Under $50', range: [0, 50] },
  { value: '$50-$100', label: '$50 - $100', range: [50, 100] },
  { value: '$100-$200', label: '$100 - $200', range: [100, 200] },
  { value: 'Over $200', label: 'Over $200', range: [200, Infinity] },
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
  const [selectedCategories, setSelectedCategories] = useState<VideoCategory[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<DurationFilter[]>([]);
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<AspectRatioFilter[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRangeFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleCategoryToggle = (category: VideoCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleSelectAllCategories = () => {
    const allCategories = categories.filter(cat => cat.value !== 'All').map(cat => cat.value);
    setSelectedCategories(allCategories);
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  const handleDurationToggle = (duration: DurationFilter) => {
    setSelectedDurations(prev => {
      if (prev.includes(duration)) {
        return prev.filter(d => d !== duration);
      } else {
        return [...prev, duration];
      }
    });
  };

  const handleSelectAllDurations = () => {
    const allDurations = durationFilters.filter(filter => filter.value !== 'All').map(filter => filter.value);
    setSelectedDurations(allDurations);
  };

  const handleClearDurations = () => {
    setSelectedDurations([]);
  };

  const handleAspectRatioToggle = (ratio: AspectRatioFilter) => {
    setSelectedAspectRatios(prev => {
      if (prev.includes(ratio)) {
        return prev.filter(r => r !== ratio);
      } else {
        return [...prev, ratio];
      }
    });
  };

  const handleSelectAllAspectRatios = () => {
    const allRatios = aspectRatioFilters.map(r => r.value);
    setSelectedAspectRatios(allRatios);
  };

  const handleClearAspectRatios = () => {
    setSelectedAspectRatios([]);
  };

  const handlePriceRangeToggle = (priceRange: PriceRangeFilter) => {
    setSelectedPriceRanges(prev => {
      if (prev.includes(priceRange)) {
        return prev.filter(p => p !== priceRange);
      } else {
        return [...prev, priceRange];
      }
    });
  };

  const handleSelectAllPriceRanges = () => {
    const allRanges = priceRangeFilters.map(p => p.value);
    setSelectedPriceRanges(allRanges);
  };

  const handleClearPriceRanges = () => {
    setSelectedPriceRanges([]);
  };

  const parseDuration = (durationStr: string): number => {
    // Parse "MM:SS" format to total seconds
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const filterByDuration = (video: VideoItem): boolean => {
    if (selectedDurations.length === 0) return true;
    
    const durationInSeconds = parseDuration(video.duration);
    
    return selectedDurations.some(duration => {
      switch (duration) {
        case 'Teaser': // 0-1 min
          return durationInSeconds <= 60;
        case 'Trailer': // 1-3 min
          return durationInSeconds > 60 && durationInSeconds <= 180;
        case 'Gimbel': // 3-5 min
          return durationInSeconds > 180 && durationInSeconds <= 300;
        case 'Document': // 5+ min
          return durationInSeconds > 300;
        default:
          return true;
      }
    });
  };

  const filteredVideos = videos
    .filter(video => selectedCategories.length === 0 || selectedCategories.includes(video.category))
    .filter(filterByDuration)
    .filter(video => {
      if (selectedAspectRatios.length === 0) return true;
      // Map selected aspect ratios to their orientation categories
      const selectedOrientations = selectedAspectRatios.map(ratio => 
        aspectRatioFilters.find(f => f.value === ratio)?.category
      );
      return selectedOrientations.includes(video.orientation);
    })
    .filter(video => {
      if (selectedPriceRanges.length === 0) return true;
      const price = parseFloat(video.price.replace('$', ''));
      return selectedPriceRanges.some(range => {
        const [min, max] = priceRangeFilters.find(f => f.value === range)!.range;
        return price >= min && price < max;
      });
    })
    .filter(video => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return video.title.toLowerCase().includes(query);
    });

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedDurations([]);
    setSelectedAspectRatios([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
    toast.success('All filters cleared');
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedDurations.length > 0 || selectedAspectRatios.length > 0 || selectedPriceRanges.length > 0 || searchQuery !== '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Video Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Professional stock video footage with real thumbnails • Infinite scroll • Click to preview
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search videos by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.slice(0, 100))}
              className="pl-10 pr-4 h-9"
            />
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9"
            >
              <X className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          )}
          
          <div className="flex items-center gap-2">
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
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-3 items-center flex-wrap">
          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-2 hover:bg-accent">
                <Filter className="w-4 h-4 mr-2" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {selectedCategories.length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
              <DropdownMenuLabel className="font-semibold">Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Quick Actions */}
              <div className="flex gap-1 px-2 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleSelectAllCategories}
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleClearCategories}
                >
                  Clear
                </Button>
              </div>
              <DropdownMenuSeparator />
              
              {categories.filter(cat => cat.value !== 'All').map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.value}
                  checked={selectedCategories.includes(category.value)}
                  onCheckedChange={() => handleCategoryToggle(category.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {category.icon}
                  <span>{category.label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Duration Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-2 hover:bg-accent">
                <Clock className="w-4 h-4 mr-2" />
                Duration
                {selectedDurations.length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {selectedDurations.length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
              <DropdownMenuLabel className="font-semibold">Filter by Duration</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Quick Actions */}
              <div className="flex gap-1 px-2 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleSelectAllDurations}
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleClearDurations}
                >
                  Clear
                </Button>
              </div>
              <DropdownMenuSeparator />
              
              {durationFilters.filter(filter => filter.value !== 'All').map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.value}
                  checked={selectedDurations.includes(filter.value)}
                  onCheckedChange={() => handleDurationToggle(filter.value)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{filter.label}</span>
                  <span className="text-xs text-muted-foreground">{filter.range}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Aspect Ratio Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-2 hover:bg-accent">
                <Maximize className="w-4 h-4 mr-2" />
                Aspect Ratio
                {selectedAspectRatios.length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {selectedAspectRatios.length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
              <DropdownMenuLabel className="font-semibold">Filter by Aspect Ratio</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Quick Actions */}
              <div className="flex gap-1 px-2 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleSelectAllAspectRatios}
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleClearAspectRatios}
                >
                  Clear
                </Button>
              </div>
              <DropdownMenuSeparator />
              
              {aspectRatioFilters.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.value}
                  checked={selectedAspectRatios.includes(filter.value)}
                  onCheckedChange={() => handleAspectRatioToggle(filter.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>{filter.label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-2 hover:bg-accent">
                <DollarSign className="w-4 h-4 mr-2" />
                Price
                {selectedPriceRanges.length > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {selectedPriceRanges.length}
                  </Badge>
                )}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur-sm border-2">
              <DropdownMenuLabel className="font-semibold">Filter by Price Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Quick Actions */}
              <div className="flex gap-1 px-2 py-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleSelectAllPriceRanges}
                >
                  Select All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 flex-1 text-xs"
                  onClick={handleClearPriceRanges}
                >
                  Clear
                </Button>
              </div>
              <DropdownMenuSeparator />
              
              {priceRangeFilters.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.value}
                  checked={selectedPriceRanges.includes(filter.value)}
                  onCheckedChange={() => handlePriceRangeToggle(filter.value)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span>{filter.label}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Masonry Layout */}
        {viewMode === 'masonry' && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 [column-fill:balance]">
            {filteredVideos.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={handlePlayVideo}
                onClick={handleVideoClick}
              />
            ))}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <VideoCardSkeleton key={`skeleton-masonry-${i}`} />
            ))}
          </div>
        )}
        
        {/* Grid Layout */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
              <VideoCardSkeleton key={`skeleton-grid-${i}`} />
            ))}
          </div>
        )}
        
        {/* List Layout */}
        {viewMode === 'list' && (
          <div className="flex flex-col gap-4">
            {filteredVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="flex gap-4 bg-card p-4 rounded-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
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
            {loading && Array.from({ length: 2 }).map((_, i) => (
              <div key={`skeleton-list-${i}`} className="flex gap-4 bg-card p-4 rounded-none shadow-[var(--shadow-card)] animate-pulse">
                <div className="w-64 h-36 bg-muted flex-shrink-0" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-5 w-3/4 bg-muted mb-2 rounded" />
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-20 bg-muted rounded" />
                      <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                    <div className="h-9 w-28 bg-muted rounded" />
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
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
};

export default Index;
