-- Create enum for tab visibility
CREATE TYPE public.app_tab AS ENUM ('home', 'originals', 'movies', 'tv_shows', 'web_series', 'short_movies');

-- Create enum for section types
CREATE TYPE public.section_type AS ENUM ('continue_watching', 'trending_now', 'latest_releases', 'top_rated', 'recommended', 'category_based', 'custom_collection');

-- Create enum for content source
CREATE TYPE public.content_source AS ENUM ('most_viewed', 'recently_added', 'watch_time_based', 'admin_selected', 'auto');

-- Create enum for display style
CREATE TYPE public.display_style AS ENUM ('horizontal_scroll', 'grid');

-- Create enum for CTA redirect type
CREATE TYPE public.cta_redirect_type AS ENUM ('movie', 'web_series', 'tv_show', 'short_movie', 'external_url');

-- =============================================
-- HOME BANNERS TABLE
-- =============================================
CREATE TABLE public.home_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  genre_text TEXT,
  background_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  logo_image_url TEXT,
  cta_text TEXT DEFAULT 'Watch Now',
  cta_redirect_type cta_redirect_type NOT NULL DEFAULT 'movie',
  content_id UUID,
  external_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  auto_slide_duration INTEGER DEFAULT 5,
  allow_swipe BOOLEAN DEFAULT true,
  visible_tabs app_tab[] NOT NULL DEFAULT '{home}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners are viewable by everyone" 
ON public.home_banners FOR SELECT USING (true);

CREATE POLICY "Allow all operations on banners" 
ON public.home_banners FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_home_banners_updated_at
BEFORE UPDATE ON public.home_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- HOME SECTIONS TABLE
-- =============================================
CREATE TABLE public.home_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  section_type section_type NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'all', -- movies, web_series, tv_shows, short_movies, all
  content_source content_source NOT NULL DEFAULT 'auto',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_style display_style NOT NULL DEFAULT 'horizontal_scroll',
  item_limit INTEGER DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible_tabs app_tab[] NOT NULL DEFAULT '{home}',
  trending_period_days INTEGER DEFAULT 7, -- For trending: 7, 14, or 30 days
  is_original_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections are viewable by everyone" 
ON public.home_sections FOR SELECT USING (true);

CREATE POLICY "Allow all operations on sections" 
ON public.home_sections FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_home_sections_updated_at
BEFORE UPDATE ON public.home_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SECTION ITEMS (For manual collections)
-- =============================================
CREATE TABLE public.section_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.home_sections(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- movie, web_series, tv_show, short_movie
  content_id UUID NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.section_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Section items are viewable by everyone" 
ON public.section_items FOR SELECT USING (true);

CREATE POLICY "Allow all operations on section_items" 
ON public.section_items FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- USER WATCH PROGRESS (Continue Watching)
-- =============================================
CREATE TABLE public.user_watch_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- movie, web_series, tv_show, short_movie
  content_id UUID NOT NULL,
  episode_id UUID,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id, episode_id)
);

-- Enable RLS
ALTER TABLE public.user_watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Watch progress is viewable by everyone" 
ON public.user_watch_progress FOR SELECT USING (true);

CREATE POLICY "Allow all operations on watch_progress" 
ON public.user_watch_progress FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_watch_progress_updated_at
BEFORE UPDATE ON public.user_watch_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_watch_progress_user ON public.user_watch_progress(user_id, last_watched_at DESC);

-- =============================================
-- HOME SETTINGS (Global configuration)
-- =============================================
CREATE TABLE public.home_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Home settings are viewable by everyone" 
ON public.home_settings FOR SELECT USING (true);

CREATE POLICY "Allow all operations on home_settings" 
ON public.home_settings FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_home_settings_updated_at
BEFORE UPDATE ON public.home_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.home_settings (setting_key, setting_value, description) VALUES
('banner_limit', '{"value": 8}', 'Maximum banners to display on mobile'),
('continue_watching_enabled', '{"value": true}', 'Enable/disable continue watching section'),
('trending_auto_mode', '{"value": true}', 'Auto-calculate trending vs manual selection'),
('originals_show_movies', '{"value": true}', 'Show movies in Originals tab'),
('originals_show_web_series', '{"value": true}', 'Show web series in Originals tab');

-- =============================================
-- Add is_original column to content tables
-- =============================================
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT false;
ALTER TABLE public.web_series ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT false;
ALTER TABLE public.tv_shows ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT false;
ALTER TABLE public.short_movies ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT false;