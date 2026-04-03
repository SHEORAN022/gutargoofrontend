-- Create vendors table
CREATE TABLE public.vendors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    company_name TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    total_content INTEGER NOT NULL DEFAULT 0,
    pending_content INTEGER NOT NULL DEFAULT 0,
    commission_rate NUMERIC(5,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor access (admin access pattern - public for now, will secure with auth later)
CREATE POLICY "Vendors are viewable by everyone" 
ON public.vendors 
FOR SELECT 
USING (true);

CREATE POLICY "Allow all operations on vendors" 
ON public.vendors 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.vendors (name, email, phone, company_name, status, total_content, pending_content, commission_rate) VALUES
('Studio Alpha Productions', 'contact@studioalpha.com', '+91 98765 43210', 'Alpha Media Pvt Ltd', 'active', 45, 3, 15.00),
('Comedy Central Studios', 'hello@comedycentral.com', '+91 98765 43211', 'Comedy Central India', 'active', 28, 0, 12.50),
('Sci-Fi Unlimited', 'info@scifiunlimited.com', '+91 98765 43212', 'SciFi Media House', 'pending', 0, 5, 10.00),
('Romance Films Inc', 'contact@romancefilms.com', '+91 98765 43213', 'Romance Productions', 'suspended', 12, 0, 18.00),
('Documentary Hub', 'docs@documentaryhub.com', '+91 98765 43214', 'Doc Hub Entertainment', 'inactive', 67, 2, 20.00);