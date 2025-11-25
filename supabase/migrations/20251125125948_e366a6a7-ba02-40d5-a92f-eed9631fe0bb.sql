-- Add foreign key from product_reviews to profiles
-- First, ensure all user_ids in product_reviews exist in profiles
INSERT INTO public.profiles (id, full_name)
SELECT DISTINCT user_id, 'User'
FROM public.product_reviews
WHERE user_id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Now add the foreign key constraint
ALTER TABLE public.product_reviews
DROP CONSTRAINT IF EXISTS product_reviews_user_id_fkey;

ALTER TABLE public.product_reviews
ADD CONSTRAINT product_reviews_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;