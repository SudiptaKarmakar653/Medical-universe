
-- Create a database function to update blood donor status
CREATE OR REPLACE FUNCTION public.admin_update_blood_donor_status(donor_id uuid, new_status text, admin_response text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Update the blood donor status
    UPDATE public.blood_donors 
    SET 
        status = new_status,
        is_approved = (new_status = 'approved'),
        admin_response = COALESCE(admin_update_blood_donor_status.admin_response, blood_donors.admin_response),
        updated_at = now()
    WHERE id = donor_id;
    
    -- Check if any rows were affected
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Blood donor with ID % not found', donor_id;
    END IF;
    
    -- Log the update for debugging
    RAISE NOTICE 'Blood donor % status updated to %', donor_id, new_status;
END;
$function$
