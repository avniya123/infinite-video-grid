import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Trash2, Edit } from 'lucide-react';
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

export default function MyTemplates() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
            onClick={() => navigate('/videos')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Templates</h1>
              <p className="text-muted-foreground mt-2">
                Manage your saved video templates
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </div>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => {
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
                <div key={template.id} className="relative group">
                  <VideoCard
                    video={video}
                    onPlay={handlePlayVideo}
                    onClick={handlePlayVideo}
                    showShareButton={false}
                    publishMode={true}
                  />
                  {/* Edit and Delete buttons positioned above Variations button */}
                  <div className="absolute bottom-[52px] right-3 z-30 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
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
              );
            })}
          </div>
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
