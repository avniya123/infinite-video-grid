import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
import { VideoCardSkeleton } from '@/components/VideoCardSkeleton';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Trash2, Edit, FileVideo, X, Search, Columns3, List } from 'lucide-react';
import { FilterDrawer } from '@/components/FilterDrawer';
import { FilterChips } from '@/components/FilterChips';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { VideoItem } from '@/types/video';

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

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
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

export default function MyTemplates() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
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
    // Optimistic update - immediately remove from UI
    const templateToDelete = templates.find(t => t.id === templateId);
    const previousTemplates = [...templates];
    
    // Update UI immediately
    setTemplates(templates.filter(t => t.id !== templateId));
    
    // Show optimistic feedback
    toast.success('Removing template...', { duration: 1000 });
    
    try {
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      // Confirm success
      toast.success('Template removed from your collection');
    } catch (error: any) {
      // Revert on failure
      setTemplates(previousTemplates);
      toast.error('Failed to remove template');
      console.error('Error deleting template:', error);
    }
  };

  const handlePlayVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setDrawerOpen(true);
  };

  const handlePublishConfirm = async (video: VideoItem) => {
    // Find the template
    const template = templates.find(t => t.video_variations.video_id === video.id);
    if (!template) {
      toast.error('Template not found');
      return;
    }

    // Optimistic update - show publishing feedback
    toast.success('Publishing template...', { duration: 1000 });

    try {
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
    let filtered = templates;

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
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title':
          const titleA = (a.custom_title || a.video_variations.title).toLowerCase();
          const titleB = (b.custom_title || b.video_variations.title).toLowerCase();
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });

    return sorted;
  }, [templates, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <Header 
          selectedMainCategory={null}
          selectedSubcategory={null}
          onMainCategorySelect={() => {}}
          onSubcategorySelect={() => {}}
        />
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileVideo className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Templates</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Loading your templates...
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        <main className="max-w-7xl mx-auto px-4 pb-8">
          <div 
            className="gap-5 [column-fill:balance]"
            style={{ columnCount: 3 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="mb-5">
                <VideoCardSkeleton index={i} />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header 
        selectedMainCategory={null}
        selectedSubcategory={null}
        onMainCategorySelect={() => {}}
        onSubcategorySelect={() => {}}
      />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileVideo className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                My Templates {templates.length > 0 && `(${templates.length})`}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your saved video templates
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/videos')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Videos
          </Button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <FileVideo className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No templates yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring video templates and save the ones you like to your collection.
              </p>
              <Button onClick={() => navigate('/videos')}>
                Browse Templates
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Controls - matching /videos page exactly */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search templates by title..."
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
                    <List className="w-4 w-4" />
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

            {/* Sort and Filters - matching /videos page exactly */}
            <div className="flex gap-3 items-center flex-wrap">
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

              {/* Results count */}
              <div className="ml-auto text-sm text-muted-foreground">
                {filteredAndSortedTemplates.length} of {templates.length} templates
              </div>
            </div>

            {/* Active Filters Chips - matching /videos page */}
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
          </>
        )}
      </div>

      {/* Main Content Area */}
      {templates.length > 0 && filteredAndSortedTemplates.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No templates found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search query or filters.
              </p>
              <Button onClick={handleResetFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      ) : templates.length > 0 && (
        <main className="max-w-7xl mx-auto px-4 pb-8">
          {/* Masonry View */}
          {viewMode === 'masonry' && (
            <div 
              className="gap-5 [column-fill:balance]"
              style={{ columnCount }}
            >
              {filteredAndSortedTemplates.map((template, index) => {
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
                  price: '$0',
                  mrp: '$0',
                  discount: '0%',
                  trending: false,
                  resolution: 'HD',
                  videoUrl: template.video_variations.video_url || undefined,
                };

                return (
                  <div 
                    key={template.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative group mb-5">
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
                            navigate(`/template-editor/${template.variation_id}`);
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
                            handleDeleteTemplate(template.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="flex flex-col gap-4">
              {filteredAndSortedTemplates.map((template, index) => {
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
                  price: '$0',
                  mrp: '$0',
                  discount: '0%',
                  trending: false,
                  resolution: 'HD',
                  videoUrl: template.video_variations.video_url || undefined,
                };

                return (
                  <div 
                    key={template.id} 
                    className="group flex gap-4 bg-card p-4 rounded-lg shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 animate-fade-in cursor-pointer"
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
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 transition-transform hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/template-editor/${template.variation_id}`);
                            }}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 transition-transform hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            title="Delete template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

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
