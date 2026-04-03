-- Create content tables with vendor tracking

-- Movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi',
  duration TEXT,
  rating TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'pending', 'draft')),
  subscription_required BOOLEAN NOT NULL DEFAULT false,
  ads_enabled BOOLEAN NOT NULL DEFAULT true,
  thumbnail_url TEXT,
  video_url TEXT,
  description TEXT,
  tagline TEXT,
  release_date DATE,
  age_rating TEXT,
  genres JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  cast_crew JSONB DEFAULT '[]'::jsonb,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Web Series table
CREATE TABLE public.web_series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi',
  rating TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'pending', 'draft')),
  subscription_required BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  description TEXT,
  tagline TEXT,
  release_date DATE,
  age_rating TEXT,
  genres JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  cast_crew JSONB DEFAULT '[]'::jsonb,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  total_episodes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Web Series Seasons table
CREATE TABLE public.web_series_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  web_series_id UUID NOT NULL REFERENCES public.web_series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(web_series_id, season_number)
);

-- Web Series Episodes table
CREATE TABLE public.web_series_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.web_series_seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(season_id, episode_number)
);

-- TV Shows table
CREATE TABLE public.tv_shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi',
  rating TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'pending', 'draft')),
  subscription_required BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  description TEXT,
  tagline TEXT,
  release_date DATE,
  age_rating TEXT,
  channel TEXT,
  air_time TEXT,
  genres JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  cast_crew JSONB DEFAULT '[]'::jsonb,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  total_episodes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TV Show Seasons table
CREATE TABLE public.tv_show_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tv_show_id UUID NOT NULL REFERENCES public.tv_shows(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tv_show_id, season_number)
);

-- TV Show Episodes table
CREATE TABLE public.tv_show_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.tv_show_seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration TEXT,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(season_id, episode_number)
);

-- Short Movies table
CREATE TABLE public.short_movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'Hindi',
  duration TEXT,
  rating TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'pending', 'draft')),
  subscription_required BOOLEAN NOT NULL DEFAULT false,
  ads_enabled BOOLEAN NOT NULL DEFAULT true,
  thumbnail_url TEXT,
  video_url TEXT,
  description TEXT,
  tagline TEXT,
  release_date DATE,
  age_rating TEXT,
  director TEXT,
  genres JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  cast_crew JSONB DEFAULT '[]'::jsonb,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all content tables
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_series_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_series_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_show_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_show_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_movies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Movies
CREATE POLICY "Movies are viewable by everyone" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Allow all operations on movies" ON public.movies FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for Web Series
CREATE POLICY "Web series are viewable by everyone" ON public.web_series FOR SELECT USING (true);
CREATE POLICY "Allow all operations on web_series" ON public.web_series FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for Web Series Seasons
CREATE POLICY "Web series seasons are viewable by everyone" ON public.web_series_seasons FOR SELECT USING (true);
CREATE POLICY "Allow all operations on web_series_seasons" ON public.web_series_seasons FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for Web Series Episodes
CREATE POLICY "Web series episodes are viewable by everyone" ON public.web_series_episodes FOR SELECT USING (true);
CREATE POLICY "Allow all operations on web_series_episodes" ON public.web_series_episodes FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for TV Shows
CREATE POLICY "TV shows are viewable by everyone" ON public.tv_shows FOR SELECT USING (true);
CREATE POLICY "Allow all operations on tv_shows" ON public.tv_shows FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for TV Show Seasons
CREATE POLICY "TV show seasons are viewable by everyone" ON public.tv_show_seasons FOR SELECT USING (true);
CREATE POLICY "Allow all operations on tv_show_seasons" ON public.tv_show_seasons FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for TV Show Episodes
CREATE POLICY "TV show episodes are viewable by everyone" ON public.tv_show_episodes FOR SELECT USING (true);
CREATE POLICY "Allow all operations on tv_show_episodes" ON public.tv_show_episodes FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for Short Movies
CREATE POLICY "Short movies are viewable by everyone" ON public.short_movies FOR SELECT USING (true);
CREATE POLICY "Allow all operations on short_movies" ON public.short_movies FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_web_series_updated_at BEFORE UPDATE ON public.web_series FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_web_series_seasons_updated_at BEFORE UPDATE ON public.web_series_seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_web_series_episodes_updated_at BEFORE UPDATE ON public.web_series_episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tv_shows_updated_at BEFORE UPDATE ON public.tv_shows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tv_show_seasons_updated_at BEFORE UPDATE ON public.tv_show_seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tv_show_episodes_updated_at BEFORE UPDATE ON public.tv_show_episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_short_movies_updated_at BEFORE UPDATE ON public.short_movies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();