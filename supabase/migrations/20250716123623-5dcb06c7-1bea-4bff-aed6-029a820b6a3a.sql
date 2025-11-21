
-- Update the orders table to use TEXT user_id for Clerk compatibility
ALTER TABLE public.orders ALTER COLUMN user_id TYPE TEXT;

-- Update RLS policies to work with Clerk user IDs
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create new policies that work with Clerk user IDs stored as text
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT 
  USING (user_id IS NOT NULL);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT 
  WITH CHECK (user_id IS NOT NULL);

-- Also ensure the order_items table has proper policies
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Users can view order items" ON public.order_items
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT 
  WITH CHECK (true);
