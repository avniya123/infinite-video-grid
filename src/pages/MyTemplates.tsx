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
import { Loader2, ArrowLeft, Trash2, Edit, ArrowUpDown, ChevronDown, List, Columns3, Search, X } from 'lucide-react';
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

interface UserTemplate {
  id: string;
  variation_id: string;
  custom_title: string | null;
  notes: string | null;
  created_at: string;
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

export default function MyTemplates() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [columnCount, setColumnCount] = useState(3);

  // Transform templates to VideoItem format for filtering
  const videoItems = useMemo(() => {
    return templates.map((template): VideoItem => ({
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
  }, [templates]);

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
      toast.error('Please sign in to view your templates');
      navigate('/');
      return;
    }
    setUser(session.user);
    await loadTemplates(session.user.id);
  };

  const loadTemplates = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_templates')
        .select(`
          id,
          variation_id,
          custom_title,
          notes,
          created_at,
          published,
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error: any) {
      toast.error('Failed to load templates');
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (video: VideoItem) => {
    const templateId = video.templateId;
    if (!templateId) return;
    
    try {
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template removed from your collection');
    } catch (error: any) {
      toast.error('Failed to remove template');
      console.error('Error deleting template:', error);
    }
  };

  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setDrawerOpen(true);
  };

  const handlePublishConfirm = async (video: VideoItem) => {
    try {
      // Find the template in the templates array
      const template = templates.find(t => t.video_variations.video_id === video.id);
      if (!template) {
        toast.error('Template not found');
        return;
      }

      // Update the template to mark it as published
      const { error } = await supabase
        .from('user_templates')
        .update({ 
          published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('id', template.id);

      if (error) throw error;

      toast.success('Template published successfully!');
      
      // Redirect to publish cart page
      setTimeout(() => {
        navigate('/publish-cart');
      }, 1000);
    } catch (error: any) {
      toast.error('Failed to publish template');
      console.error('Error publishing template:', error);
    }
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
          <Button
            variant="ghost"
            onClick={() => navigate('/videos')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2">My Templates</h1>
          <p className="text-muted-foreground">
            Manage your saved video templates
          </p>
        </div>

        {/* Search and Controls */}
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

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredVideos.length}</span> 
              {' '}of {templates.length} templates
              {hasActiveFilters && ' with filters applied'}
            </p>
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {templates.length === 0 ? 'No templates yet' : 'No templates match your filters'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {templates.length === 0 
                  ? 'Start exploring video templates and save the ones you like to your collection.'
                  : 'Try adjusting your filters to see more results.'}
              </p>
              {templates.length === 0 ? (
                <Button onClick={() => navigate('/videos')}>
                  Browse Templates
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
                className="gap-5 [column-fill:balance]"
                style={{ columnCount }}
              >
                {filteredVideos.map((video, index) => (
                  <div 
                    key={video.templateId || video.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative group">
                      <VideoCard
                        video={video}
                        onPlay={handlePlayVideo}
                        onClick={handlePlayVideo}
                        showShareButton={false}
                      />
                      {/* Edit and Delete buttons */}
                      <div className="absolute bottom-[60px] right-3 z-30 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="default"
                          size="icon"
                          className="h-7 w-7 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/template-editor/${video.variationId}`);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 shadow-md hover:shadow-lg transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(video);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
                    key={video.templateId || video.id}
                    className="group flex gap-4 bg-card p-4 rounded-lg shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handlePlayVideo(video)}
                  >
                    <div className="relative w-64 flex-shrink-0">
                      <img
                        src={video.image}
                        alt={video.title}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {/* Action buttons */}
                      <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="default"
                          size="icon"
                          className="h-7 w-7 bg-primary hover:bg-primary/90 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/template-editor/${video.variationId}`);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7 shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(video);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {video.duration} • {video.category} • {video.orientation} • {video.resolution}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-xl font-bold text-primary">{video.price}</span>
                        <span className="text-sm text-muted-foreground line-through">{video.mrp}</span>
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
              </div>
            )}
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
