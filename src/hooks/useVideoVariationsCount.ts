import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useVideoVariationsCount = (videoId: number) => {
  return useQuery({
    queryKey: ['video-variations-count', videoId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('video_variations')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', videoId)
        .not('video_url', 'is', null)
        .neq('video_url', '');

      if (error) {
        console.error('Error fetching variations count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
