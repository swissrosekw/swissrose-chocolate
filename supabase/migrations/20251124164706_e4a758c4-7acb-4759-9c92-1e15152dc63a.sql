-- Create site_settings table for admin-controlled site configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (key, value, category) VALUES
('whatsapp_enabled', 'true', 'social'),
('whatsapp_number', '"+96522280123"', 'social'),
('instagram_enabled', 'true', 'social'),
('instagram_url', '"https://www.instagram.com/swissrosekw"', 'social'),
('hero_layout', '"split"', 'design'),
('site_name', '"Swiss Rose"', 'content'),
('site_tagline', '"Flowers & Chocolates"', 'content');

-- Add governorate and city to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS governorate text,
ADD COLUMN IF NOT EXISTS city text;

-- Create otp_verifications table for phone authentication
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_verifications(phone, verified, expires_at);

-- Enable RLS
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert OTP requests"
  ON public.otp_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can verify OTP"
  ON public.otp_verifications FOR SELECT
  USING (true);

-- Trigger to update updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();