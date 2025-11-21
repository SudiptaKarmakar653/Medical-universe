
-- First, let's check if we need to modify the existing prescriptions table structure
-- The table already exists but we need to ensure it has the right columns for our use case

-- Add any missing columns that might be needed for email prescriptions
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS patient_name TEXT,
ADD COLUMN IF NOT EXISTS patient_email TEXT,
ADD COLUMN IF NOT EXISTS prescription_file_name TEXT,
ADD COLUMN IF NOT EXISTS prescription_notes TEXT,
ADD COLUMN IF NOT EXISTS sent_via_email BOOLEAN DEFAULT FALSE;

-- Update the RLS policies to ensure doctors can view all their prescriptions
-- The existing policies should already cover this, but let's make sure

-- Add an index for better performance when querying by doctor_id
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions(created_at DESC);
