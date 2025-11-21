
-- Add clerk_user_id column to doctor_profiles table to link with Clerk authentication
ALTER TABLE public.doctor_profiles 
ADD COLUMN clerk_user_id TEXT;

-- Create an index for faster lookups
CREATE INDEX idx_doctor_profiles_clerk_user_id ON public.doctor_profiles(clerk_user_id);

-- Update existing doctor profiles to have a clerk_user_id (you may need to manually map these)
-- For now, we'll leave them NULL and handle this in the application logic
