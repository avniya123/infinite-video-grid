import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DRAWER_PRESETS, getDrawerHeaderClassName } from '@/config/drawer';
import { DrawerCloseButton } from '@/components/DrawerCloseButton';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoItem } from "@/types/video";
import { ShoppingCart, Edit, Play, Bookmark, Search } from "lucide-react";
import { useVideoVariations } from "@/hooks/useVideoVariations";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { VariationCard } from "@/components/VariationCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { AspectRatioPreview } from "@/components/AspectRatioPreview";

// Price calculation based on duration (seconds)
const calculateVariationPrice = (duration: string, basePricePerSecond: number = 10) => {
  // Parse duration string (formats: "00:30", "30s", "1:30", etc.)
  const parseSeconds = (dur: string): number => {
    // Remove 's' suffix if present
    const cleaned = dur.replace(/s$/i, '').trim();
    
    // Check if it's in MM:SS or HH:MM:SS format
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':').map(p => parseInt(p) || 0);
      if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
    
    // Otherwise assume it's just seconds
    return parseInt(cleaned) || 0;
  };
  
  const seconds = parseSeconds(duration);
  const mrp = Math.round(seconds * basePricePerSecond);
  const discount = 30; // 30% discount
  const price = Math.round(mrp * (1 - discount / 100));
  
  return { price, mrp, discount: `${discount}%` };
};

type PageContext = 'videos' | 'my-templates' | 'publish-cart';

interface VariationsDrawerProps {
  video: VideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestAuth?: () => void;
  pageContext?: PageContext;
  onVariationDeleted?: (variationId: string) => void;
  onVariationAddedToCart?: (variationId: string) => void;
}

export const VariationsDrawer = ({ 
  video, 
  open, 
  onOpenChange, 
  onRequestAuth, 
  pageContext = 'videos',
  onVariationDeleted,
  onVariationAddedToCart 
}: VariationsDrawerProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: variations, isLoading, refetch } = useVideoVariations(video?.id || 0);
  const [user, setUser] = useState<any>(null);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [isCreatingDefault, setIsCreatingDefault] = useState(false);
  const [savedVariationIds, setSavedVariationIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState("");
  const [aspectRatioPreviewOpen, setAspectRatioPreviewOpen] = useState(false);
  const [previewingVariation, setPreviewingVariation] = useState<any>(null);
  
  const {
    videoRef,
    currentVideo,
    isPlaying,
    isMuted,
    progress,
    isVideoLoading,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
    playVideo,
    setCurrentVideo,
  } = useVideoPlayer();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch saved variations when user is available and drawer is open
  useEffect(() => {
    const fetchSavedVariations = async () => {
      if (!user || !open || !variations) return;

      const variationIds = variations.map(v => v.id);
      const { data } = await supabase
        .from('user_templates')
        .select('variation_id')
        .eq('user_id', user.id)
        .in('variation_id', variationIds);

      if (data) {
        setSavedVariationIds(new Set(data.map(t => t.variation_id)));
      }
    };

    fetchSavedVariations();
  }, [user, open, variations]);

  // Real-time subscription for user_templates changes
  useEffect(() => {
    if (!user || !open) return;

    const channel = supabase
      .channel('user-templates-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_templates',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const newVariationId = payload.new.variation_id;
          setSavedVariationIds(prev => new Set([...prev, newVariationId]));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_templates',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          const deletedVariationId = payload.old.variation_id;
          setSavedVariationIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(deletedVariationId);
            return newSet;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, open]);

  // Set first variation as default when drawer opens
  useEffect(() => {
    if (open && variations && variations.length > 0 && !isLoading) {
      const firstVariation = variations[0];
      setSelectedVariation(firstVariation);
      setCurrentVideo({
        url: firstVariation.video_url || '',
        title: `${video.title} - ${firstVariation.title}`,
        thumbnail: firstVariation.thumbnail_url || video.image,
        id: firstVariation.id
      });
    }
  }, [open, variations, isLoading, video, setCurrentVideo]);

  // Auto-create default variation if none exist
  useEffect(() => {
    const createDefaultVariation = async () => {
      if (!isLoading && variations && variations.length === 0 && !isCreatingDefault && open) {
        setIsCreatingDefault(true);
        try {
          const { error } = await supabase.functions.invoke('create-default-variation', {
            body: {
              videoData: {
                id: video.id,
                title: video.title,
                duration: video.duration,
                resolution: video.resolution,
                videoUrl: video.videoUrl,
                image: video.image,
              }
            }
          });

          if (error) {
            console.error('Error creating default variation:', error);
          } else {
            // Refetch variations to show the newly created one
            await refetch();
          }
        } catch (error) {
          console.error('Failed to create default variation:', error);
        } finally {
          setIsCreatingDefault(false);
        }
      }
    };

    createDefaultVariation();
  }, [isLoading, variations, open, video, isCreatingDefault, refetch]);

  const handlePlayVariation = (variation: any) => {
    // Only play variations with valid video_url (already filtered by useVideoVariations)
    if (!variation.video_url) {
      toast.error('Video not available for this variation');
      return;
    }
    
    setSelectedVariation(variation);
    playVideo({
      url: variation.video_url,
      title: `${video.title} - ${variation.title}`,
      thumbnail: variation.thumbnail_url || video.image,
      id: variation.id
    });
  };

  const handleQuickCart = () => {
    if (!user) {
      toast.error('Please sign in to proceed');
      onRequestAuth?.();
      return;
    }
    
    // Get the first variation or selected variation
    const variationId = selectedVariation?.id || (variations && variations.length > 0 ? variations[0].id : null);
    
    if (!variationId) {
      toast.error('No variation available');
      return;
    }
    
    // Navigate to Quick Cart payment page with variation data
    navigate(`/share-cart-checkout?mode=quick&variationId=${variationId}`);
  };

  const handleEdit = async (variationId?: string) => {
    // Require authentication
    if (!user) {
      toast.error('Please sign in to edit templates');
      onRequestAuth?.();
      return;
    }
    
    // Get the target variation ID
    const targetVariationId = variationId || selectedVariation?.id;
    
    if (!targetVariationId) {
      toast.error('No variation available to edit');
      return;
    }
    
    const loadingToast = toast.loading('Opening editor...');
    
    try {
      // For videos page, ensure the variation is saved to user_templates before navigating
      if (pageContext === 'videos') {
        const { data: existingTemplate } = await supabase
          .from('user_templates')
          .select('id')
          .eq('user_id', user.id)
          .eq('variation_id', targetVariationId)
          .maybeSingle();
        
        // Create template entry if it doesn't exist
        if (!existingTemplate) {
          const variation = variations?.find(v => v.id === targetVariationId);
          
          const { error } = await supabase
            .from('user_templates')
            .insert({
              user_id: user.id,
              variation_id: targetVariationId,
              custom_title: variation?.title || 'Untitled Template',
              published: false
            });
          
          if (error) throw error;
          
          // Update saved variations state
          setSavedVariationIds(prev => new Set([...prev, targetVariationId]));
        }
      }
      
      toast.dismiss(loadingToast);
      
      // Navigate to template editor with referrer context
      navigate(`/template-editor/${targetVariationId}?from=${pageContext}`);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Error opening editor:', error);
      toast.error(error.message || 'Failed to open editor');
    }
  };


  const handlePreviewAspectRatio = (variation: any) => {
    setPreviewingVariation(variation);
    setAspectRatioPreviewOpen(true);
  };

  const handleAspectRatioSelect = async (newRatio: string) => {
    if (!previewingVariation) return;

    const loadingToast = toast.loading('Updating aspect ratio...');

    try {
      const { error } = await supabase
        .from('video_variations')
        .update({ aspect_ratio: newRatio })
        .eq('id', previewingVariation.id);

      if (error) throw error;

      // Refetch variations
      await refetch();

      // Invalidate first variation query
      if (video?.id) {
        queryClient.invalidateQueries({ queryKey: ['first-variation', video.id] });
      }

      toast.dismiss(loadingToast);
      toast.success('Aspect ratio updated successfully');
      setAspectRatioPreviewOpen(false);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Failed to update aspect ratio');
      console.error('Error updating aspect ratio:', error);
    }
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (!user) {
      toast.error('Please sign in to delete');
      onRequestAuth?.();
      return;
    }

    const loadingToast = toast.loading('Deleting variation...');

    try {
      const { error } = await supabase
        .from('user_templates')
        .delete()
        .eq('user_id', user.id)
        .eq('variation_id', variationId);

      if (error) throw error;

      // Update saved variations list
      setSavedVariationIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(variationId);
        return newSet;
      });

      toast.dismiss(loadingToast);
      toast.success('Variation removed from templates');
      onVariationDeleted?.(variationId);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Failed to delete variation');
      console.error('Error deleting variation:', error);
    }
  };

  const handleAddToCart = async (variationId: string) => {
    if (!user) {
      toast.error('Please sign in to add to cart');
      onRequestAuth?.();
      return;
    }

    const loadingToast = toast.loading('Adding to publish cart...');

    try {
      const { error } = await supabase
        .from('user_templates')
        .update({ 
          published: true,
          published_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('variation_id', variationId);

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success('Added to publish cart', {
        duration: 4000,
        action: {
          label: 'View Cart',
          onClick: () => navigate('/publish-cart')
        }
      });
      onVariationAddedToCart?.(variationId);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error('Failed to add to cart');
      console.error('Error adding to cart:', error);
    }
  };

  // Don't render if no video
  if (!video) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={`${DRAWER_PRESETS.content} flex flex-col`}>
        <SheetHeader className={getDrawerHeaderClassName('compact')}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-bold">Video Variations</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Explore different versions and formats of this video
              </SheetDescription>
            </div>
            <DrawerCloseButton variant="standard" />
          </div>
        </SheetHeader>

        {/* Fixed Top Section */}
        <div className="px-6 py-5 space-y-5 flex-shrink-0 border-b border-border/50">
          {/* Video Player */}
          {currentVideo && (
            <VideoPlayer
              videoRef={videoRef}
              videoUrl={currentVideo.url}
              posterUrl={currentVideo.thumbnail}
              isPlaying={isPlaying}
              isMuted={isMuted}
              progress={progress}
              isLoading={isVideoLoading}
              onTogglePlayPause={togglePlayPause}
              onToggleMute={toggleMute}
              onToggleFullscreen={toggleFullscreen}
            />
          )}

          {/* Video Info */}
          {selectedVariation && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {selectedVariation.title}
                  </h3>
                  <div className="space-y-0.5 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Stock Video #{video.id}
                    </p>
                    {(video.mainCategory || video.subcategory) && (
                      <p className="text-xs text-muted-foreground">
                        {video.mainCategory}{video.subcategory && ` • ${video.subcategory}`}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-foreground">
                    ₹ {calculateVariationPrice(selectedVariation.duration).price}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground line-through">
                      ₹ {calculateVariationPrice(selectedVariation.duration).mrp}
                    </span>
                    <span className="text-xs text-destructive font-semibold">
                      ( {calculateVariationPrice(selectedVariation.duration).discount} Off )
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground font-medium">
                  {selectedVariation.duration}
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground border-muted font-medium">
                  {selectedVariation.aspect_ratio}
                </Badge>
                {selectedVariation.platforms && selectedVariation.platforms.length > 0 && (
                  <>
                    {selectedVariation.platforms.map((platform: string) => (
                      <Badge key={platform} variant="secondary" className="text-xs bg-muted/30 text-muted-foreground font-medium">
                        {platform}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
              
              {/* Action Buttons - Context Aware */}
              <div className="flex gap-2 pt-1">
                {pageContext === 'videos' && (
                  <Button size="sm" onClick={() => handleEdit()} variant="default" className="gap-2 flex-1">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
                
                {pageContext === 'my-templates' && (
                  <>
                    <Button size="sm" onClick={() => handleEdit()} variant="outline" className="gap-2 flex-1">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => handleAddToCart(selectedVariation.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 flex-1">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </Button>
                  </>
                )}
                
                {pageContext === 'publish-cart' && (
                  <Button size="sm" onClick={handleQuickCart} className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 flex-1">
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Proceed to Checkout
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Variations List */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-3">
            {isLoading || isCreatingDefault ? (
              <>
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm font-semibold text-muted-foreground">Loading variations...</p>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Skeleton className="w-[120px] h-[90px] rounded-md bg-muted/60 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-muted/60" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-14 rounded-full bg-muted/60" />
                        <Skeleton className="h-5 w-14 rounded-full bg-muted/60" />
                      </div>
                      <Skeleton className="h-3 w-full bg-muted/60" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md bg-muted/60" />
                  </div>
                ))}
              </>
            ) : variations && variations.length > 0 ? (
              <>
                {/* Search/Filter Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by platform, aspect ratio, or title..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      className="pl-9 h-9 bg-background border-border"
                    />
                  </div>
                </div>

                {/* Variations Header */}
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {(() => {
                      const filtered = variations.filter((variation) => {
                        if (!filterText) return true;
                        const searchLower = filterText.toLowerCase();
                        return (
                          variation.title.toLowerCase().includes(searchLower) ||
                          variation.aspect_ratio.toLowerCase().includes(searchLower) ||
                          variation.platforms?.some((p) => p.toLowerCase().includes(searchLower))
                        );
                      });
                      return `${filtered.length} ${filtered.length === 1 ? 'variation' : 'variations'} ${filterText ? 'found' : 'available'}`;
                    })()}
                  </p>
                  <div className="flex items-center gap-2">
                    {savedVariationIds.size > 0 && (
                      <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-medium gap-1">
                        <Bookmark className="h-3 w-3 fill-white" />
                        {savedVariationIds.size} Saved
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground font-medium">
                      {variations.filter(v => v.thumbnail_url).length} / {variations.length} thumbnails
                    </Badge>
                  </div>
                </div>

                {/* Variations */}
                <div className="space-y-2">
                {(() => {
                  const filteredVariations = variations.filter((variation) => {
                    if (!filterText) return true;
                    const searchLower = filterText.toLowerCase();
                    return (
                      variation.title.toLowerCase().includes(searchLower) ||
                      variation.aspect_ratio.toLowerCase().includes(searchLower) ||
                      variation.platforms?.some((p) => p.toLowerCase().includes(searchLower))
                    );
                  });

                  if (filteredVariations.length === 0) {
                    return (
                      <div className="text-center py-12 px-4">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                          <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h5 className="font-semibold text-sm mb-1">No matches found</h5>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Try adjusting your search terms or filters
                        </p>
                      </div>
                    );
                  }

                   return filteredVariations.map((variation) => {
                  const pricing = calculateVariationPrice(variation.duration);
                  const isSaved = savedVariationIds.has(variation.id);
                   return (
                    <VariationCard
                      key={variation.id}
                      variation={variation}
                      videoTitle={video.title}
                      videoImage={video.image}
                      isCurrentlyPlaying={currentVideo?.id === variation.id}
                      onPlay={handlePlayVariation}
                      onEdit={pageContext === 'videos' || pageContext === 'my-templates' ? handleEdit : undefined}
                      onDelete={pageContext === 'my-templates' ? handleDeleteVariation : undefined}
                      onAddToCart={pageContext === 'my-templates' ? handleAddToCart : undefined}
                      hideShareButtons={true}
                      isSaved={isSaved}
                      price={pricing.price}
                      mrp={pricing.mrp}
                      discount={pricing.discount}
                      videoId={video.id}
                      hidePrice={true}
                      pageContext={pageContext}
                      onPreviewAspectRatio={handlePreviewAspectRatio}
                    />
                  );
                })})()}
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <h5 className="font-semibold text-base mb-2">No Variations Available</h5>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  This video doesn't have any variations yet. Check back later for different formats and versions.
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>

      <AspectRatioPreview
        videoUrl={previewingVariation?.video_url || ''}
        thumbnailUrl={previewingVariation?.thumbnail_url || video?.image}
        currentAspectRatio={previewingVariation?.aspect_ratio || '16:9'}
        open={aspectRatioPreviewOpen}
        onOpenChange={setAspectRatioPreviewOpen}
        onSelect={handleAspectRatioSelect}
      />
    </Sheet>
  );
};
