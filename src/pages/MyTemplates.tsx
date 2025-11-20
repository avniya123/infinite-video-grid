import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { FilterDrawer } from '@/components/FilterDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Search, X, List, Columns3, ArrowUpDown, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useVideoFilters } from '@/hooks/useVideoFilters';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { VideoItem, VideoCategory } from '@/types/video';

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

type ViewMode = 'masonry' | 'list';

const sortOptions: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export default function MyTemplates() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [columnCount, setColumnCount] = useState(3);

  // Convert templates to VideoItem format for filtering
  const videosFromTemplates: VideoItem[] = templates.map(template => ({
    id: template.video_variations.video_id,
    title: template.custom_title || template.video_variations.title,
    image: template.video_variations.thumbnail_url || '',
    category: 'All' as VideoCategory,
    subcategory: '',
    duration: template.video_variations.duration,
    aspectRatio: parseFloat(template.video_variations.aspect_ratio.split(':')[0]) / parseFloat(template.video_variations.aspect_ratio.split(':')[1]),
    price: '0',
    mrp: '0',
    discount: '0%',
    orientation: 'Landscape' as const,
    trending: false,
    resolution: 'HD' as const,
    mainCategory: 'Personal Celebrations' as const,
    videoUrl: template.video_variations.video_url || '',
  }));

  // Use filter hook
  const {
    selectedMainCategory,
    selectedSubcategory,
    selectedDurations,
    selectedAspectRatios,
    selectedPriceRanges,
    searchQuery,
    sortBy,
    filteredVideos,
    hasActiveFilters,
    setSearchQuery,
    setSortBy,
    handleDurationToggle,
    handleAspectRatioToggle,
    handlePriceRangeToggle,
    handleSubcategorySelect,
    handleMainCategorySelect,
    handleSelectAllDurations,
    handleClearDurations,
    handleSelectAllAspectRatios,
    handleClearAspectRatios,
    handleSelectAllPriceRanges,
    handleClearPriceRanges,
    handleResetFilters,
  } = useVideoFilters(videosFromTemplates);

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

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columnCount] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">My Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredVideos.length} {filteredVideos.length === 1 ? 'template' : 'templates'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Videos
          </Button>
        </div>

        {/* Search and View Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('masonry')}
                  className="gap-2"
                >
                  <Columns3 className="h-4 w-4" />
                  Masonry
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
              </div>

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

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value as any)}
                    className={sortBy === option.value ? 'bg-accent' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Column Count Slider (only for masonry view) */}
          {viewMode === 'masonry' && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Columns: {columnCount}</span>
              <Slider
                value={[columnCount]}
                onValueChange={(value) => setColumnCount(value[0])}
                min={2}
                max={4}
                step={1}
                className="w-32"
              />
            </div>
          )}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {templates.length === 0 ? "You haven't saved any templates yet" : "No templates match your search"}
            </p>
            {templates.length === 0 && (
              <Button onClick={() => navigate('/')}>
                Browse Videos
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'masonry' ? `grid ${gridCols} gap-6` : 'space-y-4'}>
            {filteredVideos.map((video) => {
              const template = templates.find(t => t.video_variations.video_id === video.id);
              if (!template) return null;

              return (
                <div key={template.id}>
                  <VideoCard
                    video={video}
                    onPlay={(v) => handlePlayVideo(v)}
                    onClick={(v) => handlePlayVideo(v)}
                    showTemplateActions
                    templateId={template.id}
                    onEditTemplate={() => navigate(`/template-editor/${template.variation_id}`)}
                    onDeleteTemplate={() => handleDeleteTemplate(template.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <VideoPlayerDrawer
        video={selectedVideo}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}