import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFirstVariation = (videoId: number) => {
  return useQuery({
    queryKey: ['first-variation', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_variations')
        .select('id, title, thumbnail_url, video_url, aspect_ratio, duration')
        .eq('video_id', videoId)
        .not('video_url', 'is', null)
        .neq('video_url', '')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        // Handle JWT expired error gracefully
        if (error.code === 'PGRST303' || error.message?.includes('JWT expired')) {
          return null;
        }
        console.error('Error fetching first variation:', error);
        return null;
      }

      return data;
    },
    enabled: !!videoId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on JWT errors
  });
};
