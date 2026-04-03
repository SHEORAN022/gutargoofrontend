-- Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL CHECK (duration IN ('monthly', 'yearly', 'lifetime')),
  features JSONB NOT NULL DEFAULT '[]',
  max_devices INTEGER NOT NULL DEFAULT 1,
  max_downloads INTEGER,
  has_ads BOOLEAN NOT NULL DEFAULT true,
  quality TEXT NOT NULL DEFAULT 'HD' CHECK (quality IN ('SD', 'HD', '4K', '4K_HDR')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ads settings table
CREATE TABLE public.ads_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'google' CHECK (provider IN ('google', 'facebook', 'custom')),
  ad_unit_id TEXT,
  app_id TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'interstitial', 'rewarded', 'native')),
  placement TEXT NOT NULL,
  frequency_cap INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
('Action', 'action', 'High-energy movies with exciting stunts and battles', 'Swords', 1),
('Comedy', 'comedy', 'Funny and entertaining content', 'Laugh', 2),
('Drama', 'drama', 'Emotional and compelling stories', 'Drama', 3),
('Horror', 'horror', 'Scary and thrilling content', 'Ghost', 4),
('Romance', 'romance', 'Love stories and romantic content', 'Heart', 5),
('Sci-Fi', 'sci-fi', 'Science fiction and futuristic content', 'Rocket', 6),
('Thriller', 'thriller', 'Suspenseful and gripping stories', 'AlertTriangle', 7),
('Documentary', 'documentary', 'Real-life stories and educational content', 'Film', 8);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, duration, features, max_devices, has_ads, quality, sort_order) VALUES
('Basic', 4.99, 'monthly', '["HD Streaming", "Watch on 1 device", "Limited content library", "Ads included"]', 1, true, 'HD', 1),
('Premium', 9.99, 'monthly', '["4K Ultra HD", "Watch on 2 devices", "Full content library", "Ad-free experience", "Download for offline"]', 2, false, '4K', 2),
('Enterprise', 19.99, 'monthly', '["4K Ultra HD + HDR", "Watch on 5 devices", "Full content library", "Ad-free experience", "Download for offline", "Early access to new content", "Exclusive behind-the-scenes"]', 5, false, '4K_HDR', 3);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and plans (needed for app display)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Plans are viewable by everyone" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Ads settings are viewable by everyone" ON public.ads_settings FOR SELECT USING (true);

-- For now, allow all operations (admin functionality - will add proper auth later)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on plans" ON public.subscription_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ads" ON public.ads_settings FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ads_settings_updated_at BEFORE UPDATE ON public.ads_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();