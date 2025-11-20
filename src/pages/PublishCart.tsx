import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerDrawer } from '@/components/VideoPlayerDrawer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react';
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

export default function PublishCart() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishedTemplates, setPublishedTemplates] = useState<PublishedTemplate[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
                {publishedTemplates.length} {publishedTemplates.length === 1 ? 'template' : 'templates'}
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{calculateTotalPrice().toLocaleString()}
              </div>
            </div>
          </div>
        </div>

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
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {publishedTemplates.map((template) => {
                // Get variation count - default to 1 if not available
                const variationCount = 1; // This would ideally come from a query
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
                  <div key={template.id} className="relative group">
                    <VideoCard
                      video={video}
                      onPlay={handlePlayVideo}
                      onClick={handlePlayVideo}
                      showShareButton={false}
                      showSaveButton={false}
                      showPrice={true}
                      publishMode={false}
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
