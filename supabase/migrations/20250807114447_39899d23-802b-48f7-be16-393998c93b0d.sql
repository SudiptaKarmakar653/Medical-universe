
-- Remove the foreign key constraint on patient_id in prescriptions table
-- Since we're storing patient information directly in the prescriptions table
-- and not maintaining separate patient profiles, we don't need this constraint

ALTER TABLE prescriptions DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;

-- Make patient_id nullable since we're storing patient info in other fields
ALTER TABLE prescriptions ALTER COLUMN patient_id DROP NOT NULL;
