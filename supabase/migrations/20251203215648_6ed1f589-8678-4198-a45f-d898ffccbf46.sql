-- Make phone column nullable for email-based OTP
ALTER TABLE public.otp_verifications ALTER COLUMN phone DROP NOT NULL;