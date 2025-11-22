import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VideoVariation {
  id: string;
  video_id: number;
  title: string;
  duration: string;
  aspect_ratio: string;
  quality: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  platforms: string[];
}

export const useVideoVariations = (videoId: number) => {
  return useQuery({
    queryKey: ['video-variations', videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_variations')
        .select('*')
        .eq('video_id', videoId)
        .not('video_url', 'is', null)
        .neq('video_url', '')
        .order('created_at', { ascending: true });

      if (error) {
        // Handle JWT expired error gracefully
        if (error.code === 'PGRST303' || error.message?.includes('JWT expired')) {
          console.error('Session expired, please refresh the page');
          return [];
        }
        console.error('Error fetching variations:', error);
        throw error;
      }

      return data as VideoVariation[];
    },
    enabled: !!videoId,
    retry: false, // Don't retry on JWT errors
  });
};
