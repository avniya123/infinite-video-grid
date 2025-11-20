import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShoppingCart, Trash2, X } from 'lucide-react';
import { VideoControls } from '@/features/videos/VideoControls';
import { FilterDrawer } from '@/components/FilterDrawer';
import { FilterChips } from '@/components/FilterChips';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { VideoItem } from '@/types/video';

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

type ViewMode = 'masonry' | 'list';

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'title', label: 'Title A-Z' },
];

const aspectRatioFilters = [
  { value: '16:9', label: '16:9 (Landscape)', category: 'landscape' },
  { value: '9:16', label: '9:16 (Portrait)', category: 'portrait' },
  { value: '1:1', label: '1:1 (Square)', category: 'square' },
  { value: '4:3', label: '4:3', category: 'landscape' },
  { value: '21:9', label: '21:9 (Ultrawide)', category: 'landscape' },
];

const durationFilters = [
  { value: '0-30', label: 'Under 30 seconds' },
  { value: '30-60', label: '30-60 seconds' },
  { value: '60-120', label: '1-2 minutes' },
  { value: '120+', label: 'Over 2 minutes' },
];

export default function PublishCart() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishedTemplates, setPublishedTemplates] = useState<PublishedTemplate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // View controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [columnCount, setColumnCount] = useState(3);
  const [sortBy, setSortBy] = useState('newest');
  
  // Filter states
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

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

  const handleRemoveFromCart = async (templateId: string) => {
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

  // Parse duration from "MM:SS" format to seconds
  const parseDuration = (duration: string): number => {
    const [minutes, seconds] = duration.split(':').map(Number);
    return (minutes * 60) + seconds;
  };

  // Filter handlers
  const handleAspectRatioToggle = useCallback((ratio: string) => {
    setSelectedAspectRatios(prev =>
      prev.includes(ratio) ? prev.filter(r => r !== ratio) : [...prev, ratio]
    );
  }, []);

  const handleDurationToggle = useCallback((duration: string) => {
    setSelectedDurations(prev =>
      prev.includes(duration) ? prev.filter(d => d !== duration) : [...prev, duration]
    );
  }, []);

  const handleSelectAllAspectRatios = useCallback(() => {
    setSelectedAspectRatios(aspectRatioFilters.map(f => f.value));
  }, []);

  const handleClearAspectRatios = useCallback(() => {
    setSelectedAspectRatios([]);
  }, []);

  const handleSelectAllDurations = useCallback(() => {
    setSelectedDurations(durationFilters.map(f => f.value));
  }, []);

  const handleClearDurations = useCallback(() => {
    setSelectedDurations([]);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedAspectRatios([]);
    setSelectedDurations([]);
    setSelectedMainCategory(null);
    setSelectedSubcategory(null);
    toast.success('Filters reset');
  }, []);

  const hasActiveFilters = Boolean(searchQuery || selectedAspectRatios.length > 0 || 
    selectedDurations.length > 0 || selectedMainCategory || selectedSubcategory);

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = publishedTemplates;

    // Search by title or ID prefix
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => {
        const title = (template.custom_title || template.video_variations.title).toLowerCase();
        const idPrefix = template.video_variations.video_id.toString();
        return title.includes(query) || idPrefix.startsWith(query);
      });
    }

    // Filter by aspect ratio
    if (selectedAspectRatios.length > 0) {
      filtered = filtered.filter(template =>
        selectedAspectRatios.includes(template.video_variations.aspect_ratio)
      );
    }

    // Filter by duration
    if (selectedDurations.length > 0) {
      filtered = filtered.filter(template => {
        const seconds = parseDuration(template.video_variations.duration);
        return selectedDurations.some(range => {
          if (range === '0-30') return seconds < 30;
          if (range === '30-60') return seconds >= 30 && seconds < 60;
          if (range === '60-120') return seconds >= 60 && seconds < 120;
          if (range === '120+') return seconds >= 120;
          return false;
        });
      });
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
        case 'oldest':
          return new Date(a.published_at || 0).getTime() - new Date(b.published_at || 0).getTime();
        case 'price-high': {
          const priceA = calculateTemplatePrice(a, 1).price;
          const priceB = calculateTemplatePrice(b, 1).price;
          return priceB - priceA;
        }
        case 'price-low': {
          const priceA = calculateTemplatePrice(a, 1).price;
          const priceB = calculateTemplatePrice(b, 1).price;
          return priceA - priceB;
        }
        case 'title':
          const titleA = (a.custom_title || a.video_variations.title).toLowerCase();
          const titleB = (b.custom_title || b.video_variations.title).toLowerCase();
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });

    return sorted;
  }, [publishedTemplates, searchQuery, sortBy, selectedAspectRatios, selectedDurations]);

  const calculateTotalPrice = () => {
    return filteredAndSortedTemplates.reduce((total, template) => {
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
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-templates')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Templates
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Publish Cart</h1>
              </div>
              <p className="text-muted-foreground mt-2">
                Review and manage your templates ready for publishing
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">
                {filteredAndSortedTemplates.length} of {publishedTemplates.length} {publishedTemplates.length === 1 ? 'template' : 'templates'}
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{calculateTotalPrice().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        {publishedTemplates.length > 0 && (
          <div className="mb-6 space-y-4">
            <VideoControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              columnCount={columnCount}
              onColumnCountChange={setColumnCount}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOptions={sortOptions}
            />

            {/* Filters */}
            <div className="flex gap-3 items-center flex-wrap">
              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 whitespace-nowrap transition-all duration-200 hover:scale-105"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              )}

              {/* Filter Drawer */}
              <FilterDrawer
                selectedMainCategory={selectedMainCategory}
                selectedSubcategory={selectedSubcategory}
                selectedDurations={selectedDurations}
                selectedAspectRatios={selectedAspectRatios}
                selectedPriceRanges={[]}
                onMainCategorySelect={setSelectedMainCategory}
                onSubcategorySelect={setSelectedSubcategory}
                onDurationToggle={handleDurationToggle}
                onAspectRatioToggle={handleAspectRatioToggle}
                onPriceRangeToggle={() => {}}
                onSelectAllDurations={handleSelectAllDurations}
                onClearDurations={handleClearDurations}
                onSelectAllAspectRatios={handleSelectAllAspectRatios}
                onClearAspectRatios={handleClearAspectRatios}
                onSelectAllPriceRanges={() => {}}
                onClearPriceRanges={() => {}}
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
                selectedPriceRanges={[]}
                searchQuery={searchQuery}
                onMainCategorySelect={setSelectedMainCategory}
                onSubcategorySelect={setSelectedSubcategory}
                onDurationToggle={handleDurationToggle}
                onAspectRatioToggle={handleAspectRatioToggle}
                onPriceRangeToggle={() => {}}
                onClearSearch={() => setSearchQuery('')}
              />
            )}
          </div>
        )}

        {publishedTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your publish cart is empty
              </h3>
              <p className="text-muted-foreground mb-6">
                Go to My Templates and publish your templates to add them to your cart.
              </p>
              <Button onClick={() => navigate('/my-templates')}>
                Go to My Templates
              </Button>
            </div>
          </div>
        ) : filteredAndSortedTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No templates found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search query.
              </p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Masonry View */}
            {viewMode === 'masonry' && (
              <div 
                className="gap-5 [column-fill:balance] mb-8"
                style={{ columnCount }}
              >
                {filteredAndSortedTemplates.map((template) => {
                  const variationCount = 1;
                  const pricing = calculateTemplatePrice(template, variationCount);
                  const video: VideoItem = {
                    id: template.video_variations.video_id,
                    title: template.custom_title || template.video_variations.title,
                    image: template.video_variations.thumbnail_url || '/placeholder.svg',
                    duration: template.video_variations.duration,
                    category: 'Nature',
                    mainCategory: 'Personal Celebrations',
                    subcategory: '',
                    orientation: template.video_variations.aspect_ratio === '16:9' ? 'Landscape' : 
                                template.video_variations.aspect_ratio === '9:16' ? 'Portrait' : 'Square',
                    price: `₹${pricing.price}`,
                    mrp: `₹${pricing.mrp}`,
                    discount: pricing.discount,
                    trending: false,
                    resolution: 'HD',
                    videoUrl: template.video_variations.video_url || undefined,
                  };

                  return (
                    <div key={template.id} className="relative group mb-5">
                      <VideoCard
                        video={video}
                        onPlay={handlePlayVideo}
                        onClick={handlePlayVideo}
                        showShareButton={false}
                        showPrice={true}
                      />
                      {/* Remove from cart button */}
                      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromCart(template.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="flex flex-col gap-4 mb-8">
                {filteredAndSortedTemplates.map((template) => {
                  const variationCount = 1;
                  const pricing = calculateTemplatePrice(template, variationCount);
                  const video: VideoItem = {
                    id: template.video_variations.video_id,
                    title: template.custom_title || template.video_variations.title,
                    image: template.video_variations.thumbnail_url || '/placeholder.svg',
                    duration: template.video_variations.duration,
                    category: 'Nature',
                    mainCategory: 'Personal Celebrations',
                    subcategory: '',
                    orientation: template.video_variations.aspect_ratio === '16:9' ? 'Landscape' : 
                                template.video_variations.aspect_ratio === '9:16' ? 'Portrait' : 'Square',
                    price: `₹${pricing.price}`,
                    mrp: `₹${pricing.mrp}`,
                    discount: pricing.discount,
                    trending: false,
                    resolution: 'HD',
                    videoUrl: template.video_variations.video_url || undefined,
                  };

                  return (
                    <div 
                      key={template.id} 
                      className="group flex gap-4 bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => handlePlayVideo(video)}
                    >
                      <div className="relative w-64 flex-shrink-0">
                        <img
                          src={video.image}
                          alt={video.title}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {video.duration} • {video.orientation} • {video.resolution}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCart(template.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <span className="text-xl font-bold text-primary">₹{pricing.price}</span>
                          <span className="text-sm text-muted-foreground line-through">₹{pricing.mrp}</span>
                          <span className="text-sm font-semibold text-green-600">{pricing.discount}</span>
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
                  if (filteredAndSortedTemplates.length > 0) {
                    const template = filteredAndSortedTemplates[0];
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
