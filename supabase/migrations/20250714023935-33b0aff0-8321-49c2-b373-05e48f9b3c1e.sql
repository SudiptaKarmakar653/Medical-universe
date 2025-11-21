
-- Fix the RLS policy for bed_bookings to allow authenticated users to create bookings
-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bed_bookings;

-- Create a new policy that allows authenticated users to create bookings
CREATE POLICY "Allow authenticated users to create bookings" ON public.bed_bookings
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure the SELECT policy works correctly for viewing bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bed_bookings;

CREATE POLICY "Users can view their own bookings" ON public.bed_bookings
  FOR SELECT 
  USING (
    patient_user_id = (auth.jwt() ->> 'sub')::text OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
