-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Create policy for authenticated uploads (admin)
CREATE POLICY "Anyone can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners');

-- Create policy for updates
CREATE POLICY "Anyone can update banner images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners');

-- Create policy for deletes
CREATE POLICY "Anyone can delete banner images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners');