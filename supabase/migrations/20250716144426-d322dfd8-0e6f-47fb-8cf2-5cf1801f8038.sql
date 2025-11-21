
-- Remove the existing user_id column and add phone_number column
ALTER TABLE public.orders DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.orders ADD COLUMN phone_number TEXT NOT NULL DEFAULT '';

-- Update the RLS policies to work with phone_number instead of user_id
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;

-- Create new policies that work with phone_number
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT 
  WITH CHECK (phone_number IS NOT NULL AND phone_number != '');

CREATE POLICY "Users can view orders" ON public.orders
  FOR SELECT 
  USING (phone_number IS NOT NULL);

-- Allow admins to manage all orders
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));
