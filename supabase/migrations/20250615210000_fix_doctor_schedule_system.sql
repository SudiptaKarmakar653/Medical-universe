
-- Drop the doctor_availability table if it exists (clean slate)
DROP TABLE IF EXISTS doctor_availability;

-- Ensure doctor_profiles has the correct availability columns
ALTER TABLE doctor_profiles 
DROP COLUMN IF EXISTS is_available CASCADE,
DROP COLUMN IF EXISTS availability_status CASCADE,
DROP COLUMN IF EXISTS availability_message CASCADE,
DROP COLUMN IF EXISTS last_availability_update CASCADE;

-- Add the availability columns fresh
ALTER TABLE doctor_profiles 
ADD COLUMN is_available BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN availability_status TEXT DEFAULT 'Available' NOT NULL,
ADD COLUMN availability_message TEXT,
ADD COLUMN last_availability_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update all existing records to have default values
UPDATE doctor_profiles 
SET 
  is_available = true,
  availability_status = 'Available',
  last_availability_update = NOW()
WHERE is_available IS NULL OR availability_status IS NULL;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
