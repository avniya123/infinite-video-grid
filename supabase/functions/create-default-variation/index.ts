import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoData {
  id: number;
  title: string;
  duration: string;
  resolution: string;
  videoUrl: string;
  image: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { videoData } = await req.json() as { videoData: VideoData };

    console.log('Creating default variation for video:', videoData.id);

    // Check if variations already exist
    const { data: existingVariations, error: checkError } = await supabaseClient
      .from('video_variations')
      .select('id')
      .eq('video_id', videoData.id);

    if (checkError) {
      console.error('Error checking variations:', checkError);
      throw checkError;
    }

    // If variations already exist, return them
    if (existingVariations && existingVariations.length > 0) {
      console.log('Variations already exist, skipping creation');
      return new Response(
        JSON.stringify({ message: 'Variations already exist', count: existingVariations.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Parse aspect ratio from resolution (e.g., "1920x1080" -> "16:9")
    const getAspectRatio = (resolution: string): string => {
      if (resolution.includes('1920x1080') || resolution.includes('1080')) return '16:9';
      if (resolution.includes('1280x720') || resolution.includes('720')) return '16:9';
      if (resolution.includes('1080x1920')) return '9:16';
      if (resolution.includes('1080x1080')) return '1:1';
      return '16:9'; // default
    };

    // Create default variation
    const { data: newVariation, error: insertError } = await supabaseClient
      .from('video_variations')
      .insert({
        video_id: videoData.id,
        title: 'Original',
        duration: videoData.duration,
        aspect_ratio: getAspectRatio(videoData.resolution),
        quality: videoData.resolution,
        thumbnail_url: videoData.image,
        video_url: videoData.videoUrl,
        platforms: ['YouTube', 'Instagram', 'Facebook'],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating default variation:', insertError);
      throw insertError;
    }

    console.log('Default variation created successfully:', newVariation.id);

    return new Response(
      JSON.stringify({ variation: newVariation, message: 'Default variation created' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );

  } catch (error) {
    console.error('Error in create-default-variation function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
