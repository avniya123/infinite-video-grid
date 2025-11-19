-- Create storage bucket for video thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-thumbnails', 'video-thumbnails', true);

-- Create storage policies for public access
CREATE POLICY "Thumbnails are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'video-thumbnails');