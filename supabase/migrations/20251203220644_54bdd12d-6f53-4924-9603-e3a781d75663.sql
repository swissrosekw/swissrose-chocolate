-- Create CMS pages table for content management
CREATE TABLE public.cms_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL,
  meta_description text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can view published pages
CREATE POLICY "Anyone can view published pages"
ON public.cms_pages
FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all pages
CREATE POLICY "Admins can manage pages"
ON public.cms_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_cms_pages_updated_at
BEFORE UPDATE ON public.cms_pages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default pages with content
INSERT INTO public.cms_pages (slug, title, content, meta_description) VALUES
('terms-conditions', 'Terms & Conditions', E'Last Updated: 2025\n\nWelcome to Swiss Rose. By using our website, you agree to the following terms:\n\n• All orders are confirmed after payment or customer approval.\n\n• Prices may change without prior notice.\n\n• Photos represent the general design; slight variations may occur depending on flower availability.\n\n• Incorrect or unclear delivery addresses may result in additional delivery charges.\n\n• We are not responsible for delays caused by factors beyond our control (traffic, weather, restricted areas).\n\n• Proceeding with your order means you agree to our delivery, refund, and privacy policies.', 'Terms and conditions for Swiss Rose Kuwait flower delivery service'),

('privacy-policy', 'Privacy Policy', E'We value your privacy and are committed to protecting your personal data.\n\nWe only collect the information necessary to complete your order:\n\n• Name\n• Phone number\n• Delivery address\n• Order details\n• Payment information (processed securely — we do not store card details)\n\nYour data is used solely for delivery, communication, and customer service.\n\nWe do not share your information with third parties except trusted delivery and payment partners.', 'Privacy policy for Swiss Rose Kuwait'),

('refund-return-policy', 'Refund & Return Policy', E'Because our products include fresh flowers, returns are not accepted after delivery.\n\nRefunds are available only in the following cases:\n\n• The order arrives damaged\n• The product significantly differs from the agreed design\n• The wrong product was delivered\n\nRefund requests must be submitted within 1 hour of receiving the order, along with a clear photo.', 'Refund and return policy for Swiss Rose Kuwait'),

('delivery-information', 'Delivery Information', E'We deliver to all areas across Kuwait.\n\n**Delivery Hours:**\n10:00 AM – 11:00 PM\n\n**Delivery Time:**\nTypically 2–4 hours depending on area and traffic.\n\n**Delivery Charges:**\nCalculated based on the delivery area and shown at checkout.\n\n**Express Delivery:**\nAvailable for select products at an additional charge.', 'Delivery information for Swiss Rose Kuwait flower delivery'),

('faq', 'Frequently Asked Questions', E'**What is the delivery time?**\n2–4 hours on average.\n\n**Can I request a specific time?**\nYes, if available. You will be notified during checkout.\n\n**Do you accept custom bouquet designs?**\nYes, contact us on WhatsApp to create a personalized bouquet.\n\n**Can I cancel my order?**\nOrders may be canceled before preparation begins.\n\n**What if my delivery address is incorrect?**\nContact us immediately. Additional charges may apply if the driver has already dispatched.', 'Frequently asked questions about Swiss Rose Kuwait'),

('contact-us', 'Contact Us', E'We''re here to assist you:\n\n**WhatsApp:** +965 2228 0123\n**Instagram:** @swissrosekw\n**Phone:** +965 2228 0123\n**Email:** info@swissrosekw.com\n\n**Business hours:** 10 AM – 11 PM', 'Contact Swiss Rose Kuwait for flower delivery'),

('gift-message-ideas', 'Gift Message Ideas', E'Choose a message to add a personal touch to your gift:\n\n🎉 **Celebration:**\n"Congratulations! You deserve all the happiness."\n\n❤️ **Love:**\n"From my heart to yours — I love you more every day."\n\n🌹 **Appreciation:**\n"Thank you for being someone truly special."\n\n🎓 **Graduation:**\n"So proud of you and your achievement — onwards and upwards."\n\nYou may also write your own custom message at checkout.', 'Gift message ideas for flower delivery in Kuwait'),

('occasions', 'Occasions', E'Shop by occasion:\n\n• Mother''s Day\n• Teacher''s Day\n• Valentine''s Day\n• Graduation\n• New Baby\n• Congratulations\n• Apology\n• Friendship\n\nEach occasion features carefully curated arrangements.', 'Shop flowers by occasion at Swiss Rose Kuwait'),

('custom-bouquet', 'Custom Bouquet', E'Design your own bouquet with Swiss Rose.\n\n**Choose:**\n• Flower type\n• Color palette\n• Bouquet size\n• Style\n• Budget\n\nYou may upload an inspiration photo, and we will recreate the style for you.\n\nOnce submitted, the request will be sent directly to WhatsApp.', 'Create custom flower bouquets at Swiss Rose Kuwait'),

('gallery', 'Gallery', E'Explore our curated showcase:\n\n• Hand-tied bouquets\n• Luxury boxes\n• Event arrangements\n• Gift sets\n• Chocolate & flower combinations\n\nUpdated regularly with new designs.', 'Gallery of flower arrangements at Swiss Rose Kuwait'),

('payment-information', 'Payment Information', E'Available payment methods:\n\n• Apple Pay\n• Visa / Mastercard\n• KNET\n• Cash on Delivery (if enabled)\n\nAll payments are processed securely through trusted gateways.', 'Payment methods at Swiss Rose Kuwait');