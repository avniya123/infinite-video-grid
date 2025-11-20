import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FilterChips } from '@/components/FilterChips';
import { FilterDrawer } from '@/components/FilterDrawer';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShoppingCart, Trash2, ArrowUpDown, ChevronDown, List, Columns3, Search, X } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { VideoItem } from '@/types/video';
import { useVideoFilters } from '@/hooks/useVideoFilters';

type ViewMode = 'masonry' | 'list';

const sortOptions: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

interface PublishedTemplate {
  id: string;
  variation_id: string;
  custom_title: string | null;
  notes: string | null;
  published_at: string | null;
  video_variations: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    video_url: string | null;
    duration: string;
    aspect_ratio: string;
    platforms: string[] | null;
    video_id: number;
  };
}

export default function PublishCart() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishedTemplates, setPublishedTemplates] = useState<PublishedTemplate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [columnCount, setColumnCount] = useState(3);

  // Transform published templates to VideoItem format for filtering
  const videoItems = useMemo(() => {
    return publishedTemplates.map((template): VideoItem => ({
      id: template.video_variations.video_id,
      title: template.custom_title || template.video_variations.title,
      image: template.video_variations.thumbnail_url || '/placeholder.svg',
      duration: template.video_variations.duration,
      category: 'Nature',
      mainCategory: 'Personal Celebrations',
      subcategory: '',
      orientation: template.video_variations.aspect_ratio === '16:9' ? 'Landscape' : 
                  template.video_variations.aspect_ratio === '9:16' ? 'Portrait' : 'Square',
      price: '$0',
      mrp: '$0',
      discount: '0%',
      trending: false,
      resolution: 'HD',
      videoUrl: template.video_variations.video_url || undefined,
      templateId: template.id,
      variationId: template.variation_id,
    }));
  }, [publishedTemplates]);

  // Use filter hook
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
  } = useVideoFilters(videoItems);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please sign in to view your publish cart');
      navigate('/');
      return;
    }
    setUser(session.user);
    await loadPublishedTemplates(session.user.id);
  };

  const loadPublishedTemplates = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_templates')
        .select(`
          id,
          variation_id,
          custom_title,
          notes,
          published_at,
          video_variations (
            id,
            title,
            thumbnail_url,
            video_url,
            duration,
            aspect_ratio,
            platforms,
            video_id
          )
        `)
        .eq('user_id', userId)
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;

      setPublishedTemplates(data || []);
    } catch (error: any) {
      toast.error('Failed to load published templates');
      console.error('Error loading published templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (video: VideoItem) => {
    const templateId = video.templateId;
    if (!templateId) return;
    
    try {
      const { error } = await supabase
        .from('user_templates')
        .update({ published: false, published_at: null })
        .eq('id', templateId);

      if (error) throw error;

      setPublishedTemplates(publishedTemplates.filter(t => t.id !== templateId));
      toast.success('Template removed from publish cart');
    } catch (error: any) {
      toast.error('Failed to remove template from cart');
      console.error('Error removing from cart:', error);
    }
  };

  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setDrawerOpen(true);
  };

  const getSubcategoryPriceMultiplier = (subcategory: string): number => {
    // Premium categories (higher prices)
    const premiumCategories = ['Wedding', 'Anniversary', 'Concert', 'Award Ceremony', 'Product Launch'];
    const highCategories = ['Engagement', 'Birthday', 'Team Building', 'Conference', 'Film Festival'];
    const standardCategories = ['Diwali', 'Christmas', 'Eid', 'New Year', 'Independence Day'];
    
    if (premiumCategories.some(cat => subcategory.includes(cat))) {
      return 1.5; // 50% premium
    } else if (highCategories.some(cat => subcategory.includes(cat))) {
      return 1.25; // 25% premium
    } else if (standardCategories.some(cat => subcategory.includes(cat))) {
      return 1.1; // 10% premium
    }
    return 1.0; // Base price
  };

  const calculateTemplatePrice = (template: PublishedTemplate, variationCount: number = 1) => {
    // Base price starting point
    let basePrice = 300;
    
    // 1. Aspect ratio pricing
    const aspectRatio = template.video_variations.aspect_ratio;
    if (aspectRatio === '16:9') {
      basePrice += 100; // Landscape (YouTube, presentations)
    } else if (aspectRatio === '9:16') {
      basePrice += 150; // Portrait (Instagram Stories, TikTok) - Premium
    } else if (aspectRatio === '1:1') {
      basePrice += 75; // Square (Instagram Posts)
    }
    
    // 2. Duration-based pricing (parse duration like "0:30" or "1:45")
    const duration = template.video_variations.duration;
    const [minutes, seconds] = duration.split(':').map(Number);
    const totalSeconds = (minutes * 60) + seconds;
    
    if (totalSeconds > 120) {
      basePrice += 200; // 2+ minutes
    } else if (totalSeconds > 60) {
      basePrice += 120; // 1-2 minutes
    } else if (totalSeconds > 30) {
      basePrice += 60; // 30-60 seconds
    } else {
      basePrice += 30; // Under 30 seconds
    }
    
    // 3. Platform count multiplier
    const platforms = template.video_variations.platforms || [];
    if (platforms.length >= 5) {
      basePrice += 150; // Multi-platform support (5+)
    } else if (platforms.length >= 3) {
      basePrice += 80; // Good platform coverage (3-4)
    } else if (platforms.length >= 2) {
      basePrice += 40; // Basic multi-platform (2)
    }
    
    // 4. Variation count bonus (more variations = more value)
    if (variationCount > 5) {
      basePrice += 100; // Extensive variations
    } else if (variationCount > 3) {
      basePrice += 60; // Good variation options
    } else if (variationCount > 1) {
      basePrice += 30; // Some variations
    }
    
    // 5. Subcategory multiplier (applied at the end)
    // We'll use a default subcategory since it's not in the current data structure
    // In a real implementation, this would come from the video data
    const subcategoryMultiplier = getSubcategoryPriceMultiplier(template.custom_title || '');
    basePrice = Math.round(basePrice * subcategoryMultiplier);
    
    // Calculate MRP (base price + 100-150% markup depending on final price)
    const markupPercent = basePrice > 600 ? 1.8 : basePrice > 400 ? 2.0 : 2.2;
    const mrp = Math.round(basePrice * markupPercent);
    
    // Calculate discount percentage
    const discountPercent = Math.round(((mrp - basePrice) / mrp) * 100);
    
    return {
      price: basePrice,
      mrp: mrp,
      discount: `${discountPercent}% Off`
    };
  };

  const calculateTotalPrice = () => {
    return publishedTemplates.reduce((total, template) => {
      // For now, we'll use 1 as variation count since we can't easily get it here
      // In a real implementation, this would be fetched along with the template data
      const pricing = calculateTemplatePrice(template, 1);
      return total + pricing.price;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          selectedMainCategory={null}
          selectedSubcategory={null}
          onMainCategorySelect={() => {}}
          onSubcategorySelect={() => {}}
        />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedMainCategory={null}
        selectedSubcategory={null}
        onMainCategorySelect={() => {}}
        onSubcategorySelect={() => {}}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Publish Cart ({publishedTemplates.length})
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/my-templates')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Templates
            </Button>
          </div>
        </div>

        {/* Search and Controls */}
        {publishedTemplates.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 w-full"
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
                    className="h-10 whitespace-nowrap"
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
                    className="h-8 px-3"
                    title="Masonry View"
                  >
                    <Columns3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3"
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Column Count Slider */}
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
                  <Button variant="outline" className="h-10 border-2">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`cursor-pointer ${sortBy === option.value ? 'bg-accent' : ''}`}
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
        )}

        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {publishedTemplates.length === 0 ? 'Your publish cart is empty' : 'No templates match your filters'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {publishedTemplates.length === 0 
                  ? 'Go to My Templates and publish your templates to add them to your cart.'
                  : 'Try adjusting your filters to see more results.'}
              </p>
              {publishedTemplates.length === 0 ? (
                <Button onClick={() => navigate('/my-templates')}>
                  Go to My Templates
                </Button>
              ) : (
                <Button onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Masonry Layout */}
            {viewMode === 'masonry' && (
              <div 
                className="gap-5 [column-fill:balance] mb-8"
                style={{ columnCount }}
              >
                {filteredVideos.map((video, index) => {
                  const template = publishedTemplates.find(t => t.id === video.templateId);
                  if (!template) return null;
                  
                  const variationCount = 1;
                  const pricing = calculateTemplatePrice(template, variationCount);
                  const videoWithPricing: VideoItem = {
                    ...video,
                    price: `₹${pricing.price}`,
                    mrp: `₹${pricing.mrp}`,
                    discount: pricing.discount,
                  };

                  return (
                    <div 
                      key={video.templateId}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative group">
                        <VideoCard
                          video={videoWithPricing}
                          onPlay={handlePlayVideo}
                          onClick={handlePlayVideo}
                          showShareButton={false}
                          showPrice={true}
                        />
                        <div className="absolute top-16 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCart(video);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* List Layout */}
            {viewMode === 'list' && (
              <div className="flex flex-col gap-4 mb-8">
                {filteredVideos.map((video, index) => {
                  const template = publishedTemplates.find(t => t.id === video.templateId);
                  if (!template) return null;
                  
                  const variationCount = 1;
                  const pricing = calculateTemplatePrice(template, variationCount);
                  const videoWithPricing: VideoItem = {
                    ...video,
                    price: `₹${pricing.price}`,
                    mrp: `₹${pricing.mrp}`,
                    discount: pricing.discount,
                  };

                  return (
                    <div 
                      key={video.templateId}
                      className="group flex gap-4 bg-card p-4 rounded-lg shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-fade-in cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => handlePlayVideo(videoWithPricing)}
                    >
                      <div className="relative w-64 flex-shrink-0">
                        <img
                          src={videoWithPricing.image}
                          alt={videoWithPricing.title}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        {/* Remove button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCart(video);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{videoWithPricing.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {videoWithPricing.duration} • {videoWithPricing.category} • {videoWithPricing.orientation} • {videoWithPricing.resolution}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-xl font-bold text-primary">{videoWithPricing.price}</span>
                          <span className="text-sm text-muted-foreground line-through">{videoWithPricing.mrp}</span>
                          <span className="text-sm text-discount font-semibold">{videoWithPricing.discount}</span>
                          {videoWithPricing.trending && (
                            <span className="ml-2 px-2 py-0.5 bg-trending text-trending-foreground text-xs font-semibold rounded">
                              TRENDING
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Proceed to Checkout Button */}
            <div className="mt-16 mb-12 flex justify-center">
              <Button 
                size="lg"
                className="px-16 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                onClick={() => {
                  if (publishedTemplates.length > 0) {
                    const template = publishedTemplates[0];
                    const pricing = calculateTemplatePrice(template, 1);
                    navigate('/share-cart-checkout', {
                      state: {
                        template: {
                          id: template.id,
                          title: template.video_variations.title,
                          price: pricing.price,
                          mrp: pricing.mrp,
                          discount: pricing.discount,
                          duration: template.video_variations.duration,
                          orientation: template.video_variations.aspect_ratio === '16:9' ? 'Landscape' : 'Portrait',
                          resolution: 'HD',
                          thumbnailUrl: template.video_variations.thumbnail_url,
                        }
                      }
                    });
                  }
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>

      {selectedVideo && (
        <VideoPlayerDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          video={selectedVideo}
        />
      )}
    </div>
  );
}
