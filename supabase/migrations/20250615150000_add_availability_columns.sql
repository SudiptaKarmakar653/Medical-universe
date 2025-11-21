
-- Add availability columns to doctor_profiles table
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'Available',
ADD COLUMN IF NOT EXISTS availability_message TEXT,
ADD COLUMN IF NOT EXISTS last_availability_update TIMESTAMP WITH TIME ZONE;

-- Update existing records to have default availability status
UPDATE doctor_profiles 
SET 
  is_available = true,
  availability_status = 'Available'
WHERE 
  is_available IS NULL 
  OR availability_status IS NULL;

-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';
