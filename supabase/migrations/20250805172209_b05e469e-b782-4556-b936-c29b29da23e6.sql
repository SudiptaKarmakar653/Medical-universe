
CREATE OR REPLACE FUNCTION public.admin_update_blood_request_status(
    request_id uuid,
    new_status text,
    admin_response_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the blood request status
    UPDATE public.blood_requests 
    SET 
        status = new_status,
        admin_response = COALESCE(admin_response_param, 'Request ' || new_status || ' by admin'),
        updated_at = now()
    WHERE id = request_id;
    
    -- Check if any rows were affected
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Blood request with ID % not found', request_id;
    END IF;
    
    -- Log the update for debugging
    RAISE NOTICE 'Blood request % status updated to %', request_id, new_status;
END;
$$;
