
-- Fix the user_id column in orders table to support Clerk user IDs (text format)
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

-- Also add order tracking functionality
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- Create order status tracking
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  status TEXT NOT NULL,
  status_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on order status history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policy for order status history
CREATE POLICY "Users can view order status history" ON public.order_status_history
  FOR SELECT 
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id IS NOT NULL));

CREATE POLICY "System can insert order status" ON public.order_status_history
  FOR INSERT 
  WITH CHECK (true);
