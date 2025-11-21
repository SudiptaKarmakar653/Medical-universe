
-- Add the missing tracking_number and estimated_delivery columns to the orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- Create order_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  status TEXT NOT NULL,
  status_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for order_status_history
DROP POLICY IF EXISTS "Users can view order status history" ON public.order_status_history;
DROP POLICY IF EXISTS "System can insert order status" ON public.order_status_history;

CREATE POLICY "Users can view order status history" ON public.order_status_history
  FOR SELECT 
  USING (user_id IS NOT NULL OR true);

CREATE POLICY "System can insert order status" ON public.order_status_history
  FOR INSERT 
  WITH CHECK (true);
