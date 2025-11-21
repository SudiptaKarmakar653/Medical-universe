
-- Create a table for product reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  medicine_id UUID NOT NULL,
  user_phone TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to insert their own reviews
CREATE POLICY "Users can create reviews for their delivered orders" 
  ON public.product_reviews 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.phone_number = user_phone 
      AND orders.status = 'delivered'
    )
  );

-- Create policy that allows users to view their own reviews
CREATE POLICY "Users can view their own reviews" 
  ON public.product_reviews 
  FOR SELECT 
  USING (user_phone IS NOT NULL);

-- Create policy that allows users to update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.product_reviews 
  FOR UPDATE 
  USING (user_phone IS NOT NULL);

-- Allow everyone to view reviews (for the medicine store dashboard)
CREATE POLICY "Everyone can view all reviews" 
  ON public.product_reviews 
  FOR SELECT 
  USING (true);

-- Enable realtime for the reviews table
ALTER TABLE public.product_reviews REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
