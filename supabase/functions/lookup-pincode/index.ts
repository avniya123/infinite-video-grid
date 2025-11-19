import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.83.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LocationData {
  city: string;
  state: string;
  country: string;
  district?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode, countryCode = 'US' } = await req.json();

    if (!pincode) {
      return new Response(
        JSON.stringify({ error: 'Pincode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Looking up pincode: ${pincode} for country: ${countryCode}`);

    // Using Zippopotam.us API (free, no API key needed)
    const response = await fetch(`https://api.zippopotam.us/${countryCode}/${pincode}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Pincode not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract location information
    const place = data.places?.[0];
    if (!place) {
      return new Response(
        JSON.stringify({ error: 'No location data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const locationData: LocationData = {
      city: place['place name'] || '',
      state: place['state'] || '',
      country: data.country || '',
      district: place['state abbreviation'] || '',
    };

    console.log('Location data found:', locationData);

    return new Response(
      JSON.stringify(locationData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lookup-pincode function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
