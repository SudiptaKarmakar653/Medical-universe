
-- Create admin functions to bypass RLS for hospital management
CREATE OR REPLACE FUNCTION admin_update_bed_count(
    bed_id UUID,
    field_name TEXT,
    new_value INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF field_name = 'total_beds' THEN
        UPDATE hospital_beds 
        SET total_beds = new_value, updated_at = now()
        WHERE id = bed_id;
    ELSIF field_name = 'available_beds' THEN
        UPDATE hospital_beds 
        SET available_beds = new_value, updated_at = now()
        WHERE id = bed_id;
    END IF;
END;
$$;

-- Create admin function to update operation theater status
CREATE OR REPLACE FUNCTION admin_update_ot_status(
    ot_id UUID,
    new_status BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE operation_theater 
    SET is_available = new_status, updated_at = now()
    WHERE id = ot_id;
END;
$$;

-- Ensure there's an admin profile for the system
INSERT INTO profiles (
    id,
    name,
    email,
    role,
    full_name,
    is_approved
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'SUBHODEEP PAL',
    'admin@hospital.com',
    'admin',
    'SUBHODEEP PAL',
    true
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_approved = true;
