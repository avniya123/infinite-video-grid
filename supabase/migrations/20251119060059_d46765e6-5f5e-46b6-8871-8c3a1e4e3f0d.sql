-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create video_variations table
CREATE TABLE public.video_variations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id integer NOT NULL,
  title text NOT NULL,
  duration text NOT NULL,
  aspect_ratio text NOT NULL,
  quality text,
  thumbnail_url text,
  video_url text,
  platforms text[] DEFAULT ARRAY[]::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.video_variations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (video listings are public)
CREATE POLICY "Video variations are viewable by everyone" 
ON public.video_variations 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_video_variations_updated_at
BEFORE UPDATE ON public.video_variations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.video_variations (video_id, title, duration, aspect_ratio, quality, platforms) VALUES
(1, 'Teaser 30 SEC', '30 SEC', 'LandScape 16:9', '', ARRAY['Youtube', 'Facebook']),
(1, 'Teaser 10 SEC', '10 SEC', 'Portrait 9:16', '', ARRAY['Reels', 'Instagram']),
(1, '30 SEC Full HD', '30 SEC', '16:9', 'Full hd', ARRAY['Youtube', 'Facebook', 'Instagram']),
(2, 'Teaser 30 SEC', '30 SEC', 'LandScape 16:9', '', ARRAY['Youtube', 'Facebook']),
(2, '30 SEC Full HD', '30 SEC', '16:9', 'Full hd', ARRAY['Youtube', 'Facebook', 'Instagram']),
(3, 'Teaser 15 SEC', '15 SEC', 'Portrait 9:16', '', ARRAY['Reels', 'TikTok', 'Instagram']);