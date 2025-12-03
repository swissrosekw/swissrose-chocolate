-- Allow drivers to view orders that have a driver_code assigned
-- This enables the driver portal to authenticate and access order details
CREATE POLICY "Drivers can view orders by driver code" 
ON public.orders 
FOR SELECT
USING (driver_code IS NOT NULL);

-- Allow drivers to update orders with driver codes (for setting driver_name, driver_phone, delivered_at, etc.)
CREATE POLICY "Drivers can update orders by driver code"
ON public.orders
FOR UPDATE
USING (driver_code IS NOT NULL)
WITH CHECK (driver_code IS NOT NULL);