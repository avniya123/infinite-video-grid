import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { variationId, videoTitle, variationTitle, aspectRatio } = await req.json();

    if (!variationId || !videoTitle || !variationTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating thumbnail for:', { variationId, videoTitle, variationTitle });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create a detailed prompt for thumbnail generation
    const prompt = `Create a professional video thumbnail for "${videoTitle} - ${variationTitle}". 
    The thumbnail should be eye-catching, modern, and suitable for a video streaming platform. 
    Include dynamic elements, vibrant colors, and make it look like a high-quality video preview. 
    Style: cinematic, professional, engaging. Aspect ratio: ${aspectRatio || '16:9'}.`;

    console.log('Sending request to AI gateway...');

    // Generate image using Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI Gateway error: ${aiResponse.status}` }),
        { status: aiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract the base64 image
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(aiData));
      throw new Error('No image generated');
    }

    // Extract base64 data from data URL
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    console.log('Uploading to storage...');

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `${variationId}-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('video-thumbnails')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('video-thumbnails')
      .getPublicUrl(fileName);

    console.log('Thumbnail uploaded:', publicUrl);

    // Update variation with thumbnail URL
    const { error: updateError } = await supabase
      .from('video_variations')
      .update({ thumbnail_url: publicUrl })
      .eq('id', variationId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        thumbnailUrl: publicUrl,
        variationId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-variation-thumbnail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
