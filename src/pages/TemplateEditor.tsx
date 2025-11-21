import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TemplateEditorLayout } from "@/components/template-editor/TemplateEditorLayout";
import { toast } from "sonner";

interface VariationData {
  id: string;
  title: string;
  video_id: number;
  thumbnail_url: string | null;
  aspect_ratio: string;
  duration: string;
}

export default function TemplateEditor() {
  const { variationId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [variationData, setVariationData] = useState<VariationData | null>(null);
  const [referrer, setReferrer] = useState<string>('/my-templates');

  useEffect(() => {
    // Get the referrer from URL params
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    if (from === 'videos') {
      setReferrer('/videos');
    } else {
      setReferrer('/my-templates');
    }

    const initializeEditor = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Please sign in to edit templates");
        navigate("/");
        return;
      }
      
      setUser(session.user);

      // Load variation data
      if (variationId) {
        const { data: variation, error } = await supabase
          .from('video_variations')
          .select('*')
          .eq('id', variationId)
          .single();

        if (error) {
          console.error('Error loading variation:', error);
          toast.error('Failed to load template');
          navigate('/videos');
          return;
        }

        setVariationData(variation);

        // Automatically save to My Templates
        const { error: saveError } = await supabase
          .from('user_templates')
          .upsert({
            user_id: session.user.id,
            variation_id: variationId,
            custom_title: variation.title,
          }, {
            onConflict: 'user_id,variation_id',
            ignoreDuplicates: false
          });

        if (saveError) {
          console.error('Error saving to templates:', saveError);
        } else {
          toast.success('Template saved to My Templates');
        }
      }

      setLoading(false);
    };

    initializeEditor();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        toast.error("Please sign in to edit templates");
        navigate("/");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate, variationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!user || !variationData) return null;

  return <TemplateEditorLayout variationId={variationId} variationData={variationData} referrer={referrer} />;
}
