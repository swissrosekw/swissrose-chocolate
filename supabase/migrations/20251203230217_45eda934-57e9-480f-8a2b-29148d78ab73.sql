-- Add tracking columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_code TEXT UNIQUE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_password TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS driver_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_photo_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Create driver_locations table for live tracking
CREATE TABLE IF NOT EXISTS public.driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  tracking_code TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'out_for_delivery',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_driver_locations_tracking_code ON public.driver_locations(tracking_code);
CREATE INDEX IF NOT EXISTS idx_driver_locations_order_id ON public.driver_locations(order_id);

-- Enable RLS on driver_locations
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driver_locations
-- Anyone can view locations by tracking code (for customer tracking page)
CREATE POLICY "Anyone can view driver locations by tracking code"
ON public.driver_locations
FOR SELECT
USING (true);

-- Anyone can insert/update driver locations (drivers don't have auth)
CREATE POLICY "Anyone can insert driver locations"
ON public.driver_locations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update driver locations"
ON public.driver_locations
FOR UPDATE
USING (true);

-- Admins can delete driver locations
CREATE POLICY "Admins can delete driver locations"
ON public.driver_locations
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;

-- Create storage bucket for delivery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-photos', 'delivery-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for delivery photos
CREATE POLICY "Anyone can upload delivery photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'delivery-photos');

CREATE POLICY "Anyone can view delivery photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'delivery-photos');

-- Function to update updated_at on driver_locations
CREATE OR REPLACE FUNCTION public.update_driver_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS update_driver_locations_timestamp ON public.driver_locations;
CREATE TRIGGER update_driver_locations_timestamp
BEFORE UPDATE ON public.driver_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_driver_location_timestamp();