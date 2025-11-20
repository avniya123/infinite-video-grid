import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { TemplateEditorLayout } from '@/components/template-editor/TemplateEditorLayout';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface TemplateEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variationId: string;
}

export function TemplateEditorDrawer({ open, onOpenChange, variationId }: TemplateEditorDrawerProps) {
  const [variationData, setVariationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && variationId) {
      loadVariationData();
    }
  }, [open, variationId]);

  const loadVariationData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('video_variations')
        .select('id, title, video_id, thumbnail_url, aspect_ratio, duration')
        .eq('id', variationId)
        .single();

      if (error) throw error;
      setVariationData(data);
    } catch (error) {
      console.error('Error loading variation data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95vh] max-w-full">
        <DrawerHeader className="border-b">
          <DrawerTitle>Edit Template</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : variationData ? (
            <TemplateEditorLayout 
              variationId={variationId} 
              variationData={variationData}
              onClose={() => onOpenChange(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Failed to load template data
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
