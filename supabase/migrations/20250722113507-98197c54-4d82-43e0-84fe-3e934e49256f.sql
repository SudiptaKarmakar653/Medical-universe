
-- Update the medicines table RLS policies to work with the admin authentication system
-- First, drop the existing restrictive admin policies
DROP POLICY IF EXISTS "Admins can insert medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can update medicines" ON public.medicines;
DROP POLICY IF EXISTS "Admins can delete medicines" ON public.medicines;

-- Create new policies that allow authenticated users to manage medicines
-- This will work with the admin session created during login
CREATE POLICY "Allow authenticated users to insert medicines" ON public.medicines
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update medicines" ON public.medicines
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete medicines" ON public.medicines
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Keep the existing SELECT policy for everyone to view medicines
-- CREATE POLICY "Everyone can view medicines" ON public.medicines
--   FOR SELECT 
--   USING (true);
