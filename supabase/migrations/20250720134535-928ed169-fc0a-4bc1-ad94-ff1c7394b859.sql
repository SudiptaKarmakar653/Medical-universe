
-- Create a function to handle order status updates with proper admin privileges
CREATE OR REPLACE FUNCTION public.admin_update_order_status(order_id uuid, new_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the order status
    UPDATE public.orders 
    SET 
        status = new_status,
        updated_at = now()
    WHERE id = order_id;
    
    -- Check if any rows were affected
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order with ID % not found', order_id;
    END IF;
    
    -- Log the update for debugging
    RAISE NOTICE 'Order % status updated to %', order_id, new_status;
END;
$$;
