
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can view their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can update their own carts" ON public.carts;
DROP POLICY IF EXISTS "Users can create cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;

-- Enable RLS on all relevant tables
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Cart policies - Allow all authenticated users to manage carts
CREATE POLICY "Authenticated users can create carts" 
  ON public.carts 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all carts" 
  ON public.carts 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all carts" 
  ON public.carts 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Cart items policies - Allow all authenticated users to manage cart items
CREATE POLICY "Authenticated users can create cart items" 
  ON public.cart_items 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all cart items" 
  ON public.cart_items 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all cart items" 
  ON public.cart_items 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete all cart items" 
  ON public.cart_items 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Order policies - Allow all authenticated users to manage orders
CREATE POLICY "Authenticated users can create orders" 
  ON public.orders 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders" 
  ON public.orders 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Order items policies - Allow all authenticated users to manage order items
CREATE POLICY "Authenticated users can create order items" 
  ON public.order_items 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all order items" 
  ON public.order_items 
  FOR SELECT 
  TO authenticated
  USING (true);
