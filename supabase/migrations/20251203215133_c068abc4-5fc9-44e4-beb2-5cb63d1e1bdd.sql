-- Add email column to otp_verifications table
ALTER TABLE public.otp_verifications ADD COLUMN IF NOT EXISTS email TEXT;

-- Add email column to profiles table if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;