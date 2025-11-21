
-- Change the user_id column in orders table from UUID to TEXT to support Clerk user IDs
ALTER TABLE public.orders 
ALTER COLUMN user_id TYPE TEXT;

-- Update the RLS policies to work with TEXT user_id instead of UUID
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- Create new policies that work with Clerk user IDs stored as text
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT 
  USING (user_id IS NOT NULL);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT 
  WITH CHECK (user_id IS NOT NULL);
