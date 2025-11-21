
-- Add clerk_user_id column to blood_donors table
ALTER TABLE public.blood_donors 
ADD COLUMN clerk_user_id text;

-- Update the RLS policy to work with clerk_user_id as well
DROP POLICY IF EXISTS "Users can view their own donor applications" ON public.blood_donors;

CREATE POLICY "Users can view their own donor applications"
ON public.blood_donors
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (clerk_user_id IS NOT NULL) OR
  (is_approved = true)
);

-- Add policy for users to create applications with clerk_user_id
DROP POLICY IF EXISTS "Users can create donor applications with clerk_user_id" ON public.blood_donors;

CREATE POLICY "Users can create donor applications with clerk_user_id"
ON public.blood_donors
FOR INSERT
WITH CHECK (
  (clerk_user_id IS NOT NULL) OR 
  (auth.uid() = user_id)
);
