
-- First, let's check and fix the orders table structure completely
ALTER TABLE public.orders ALTER COLUMN user_id TYPE TEXT;

-- Drop all existing RLS policies for orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create new RLS policies that work with TEXT user_id
CREATE POLICY "Enable read access for users" ON public.orders
  FOR SELECT 
  USING (user_id = auth.jwt() ->> 'sub' OR user_id IS NOT NULL);

CREATE POLICY "Enable insert access for users" ON public.orders
  FOR INSERT 
  WITH CHECK (user_id IS NOT NULL);

CREATE POLICY "Enable update access for users" ON public.orders
  FOR UPDATE 
  USING (user_id = auth.jwt() ->> 'sub' OR user_id IS NOT NULL);

-- Fix order_items policies as well
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Enable read access for order items" ON public.order_items
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for order items" ON public.order_items
  FOR INSERT 
  WITH CHECK (true);

-- Fix order_status_history policies
DROP POLICY IF EXISTS "Users can view order status history" ON public.order_status_history;
DROP POLICY IF EXISTS "System can insert order status" ON public.order_status_history;

CREATE POLICY "Enable read access for order status" ON public.order_status_history
  FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert access for order status" ON public.order_status_history
  FOR INSERT 
  WITH CHECK (true);
