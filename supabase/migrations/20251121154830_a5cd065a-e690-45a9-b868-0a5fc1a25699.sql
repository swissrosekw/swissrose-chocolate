-- Create orders table to store completed orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  governorate text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  notes text,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  total_amount numeric NOT NULL,
  items jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create payment_settings table
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_on_delivery_enabled boolean DEFAULT true,
  online_payment_enabled boolean DEFAULT false,
  tap_payments_enabled boolean DEFAULT false,
  tap_payments_api_key text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default payment settings
INSERT INTO public.payment_settings (cash_on_delivery_enabled, online_payment_enabled, tap_payments_enabled)
VALUES (true, false, false);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Payment settings policies
CREATE POLICY "Anyone can view payment settings"
ON public.payment_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage payment settings"
ON public.payment_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for payment_settings updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();