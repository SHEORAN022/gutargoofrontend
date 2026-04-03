-- Create app_users table for managing platform users (separate from auth.users)
CREATE TABLE public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  login_method TEXT NOT NULL DEFAULT 'email' CHECK (login_method IN ('email', 'google', 'apple', 'phone')),
  subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended', 'pending')),
  devices_count INTEGER NOT NULL DEFAULT 0,
  total_watch_time INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (public for now, will restrict with auth later)
CREATE POLICY "App users are viewable by everyone"
ON public.app_users FOR SELECT
USING (true);

CREATE POLICY "Allow all operations on app_users"
ON public.app_users FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_app_users_updated_at
BEFORE UPDATE ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_app_users_email ON public.app_users(email);
CREATE INDEX idx_app_users_status ON public.app_users(status);
CREATE INDEX idx_app_users_subscription ON public.app_users(subscription_plan);